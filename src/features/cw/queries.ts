import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useInvalidatingMutation } from '@/lib/mutation-factory';
import { supabase } from '@/lib/supabase';
import type { Database, CwEventStatus } from '@/types/database';

type CwEventRow = Database['public']['Tables']['cw_events']['Row'];
type CwEventDayRow = Database['public']['Tables']['cw_event_days']['Row'];
type CwRegistrationRow = Database['public']['Tables']['cw_registrations']['Row'];
type CwAvailabilityRow = Database['public']['Tables']['cw_availability']['Row'];
type CwLuRow = Database['public']['Tables']['cw_lus']['Row'];
type CwLuMemberRow = Database['public']['Tables']['cw_lu_members']['Row'];
type CwLuDayResultRow = Database['public']['Tables']['cw_lu_day_results']['Row'];

export interface CwEventDetail extends CwEventRow {
  days: CwEventDayRow[];
  registrations: CwRegistrationRow[];
  availability: CwAvailabilityRow[];
  lus: CwLuRow[];
  luMembers: CwLuMemberRow[];
  luDayResults: CwLuDayResultRow[];
}

const EVENT_DETAIL_QUERY_KEY = (id: string) => ['cw_event', id];

export function useCwEvents() {
  return useQuery({
    queryKey: ['cw_events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cw_events')
        .select('*')
        .order('starts_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as CwEventRow[];
    },
  });
}

export function useCwEvent(eventId: string | undefined) {
  return useQuery({
    queryKey: EVENT_DETAIL_QUERY_KEY(eventId ?? ''),
    enabled: !!eventId,
    queryFn: async (): Promise<CwEventDetail> => {
      const [eventRes, daysRes, regsRes, lusRes] = await Promise.all([
        supabase.from('cw_events').select('*').eq('id', eventId!).single(),
        supabase.from('cw_event_days').select('*').eq('event_id', eventId!).order('position'),
        supabase.from('cw_registrations').select('*').eq('event_id', eventId!).order('created_at'),
        supabase.from('cw_lus').select('*').eq('event_id', eventId!).order('position'),
      ]);
      if (eventRes.error) throw eventRes.error;
      if (daysRes.error) throw daysRes.error;
      if (regsRes.error) throw regsRes.error;
      if (lusRes.error) throw lusRes.error;

      const registrationIds = (regsRes.data ?? []).map((r) => r.id);
      const luIds = (lusRes.data ?? []).map((l) => l.id);

      const dayIds = (daysRes.data ?? []).map((d) => d.id);

      const [availRes, luMembersRes, luDayResultsRes] = await Promise.all([
        registrationIds.length
          ? supabase.from('cw_availability').select('*').in('registration_id', registrationIds)
          : Promise.resolve({ data: [], error: null }),
        luIds.length
          ? supabase.from('cw_lu_members').select('*').in('lu_id', luIds).order('position')
          : Promise.resolve({ data: [], error: null }),
        dayIds.length
          ? supabase.from('cw_lu_day_results').select('*').in('event_day_id', dayIds)
          : Promise.resolve({ data: [], error: null }),
      ]);
      if (availRes.error) throw availRes.error;
      if (luMembersRes.error) throw luMembersRes.error;
      if (luDayResultsRes.error) throw luDayResultsRes.error;

      return {
        ...(eventRes.data as CwEventRow),
        days: (daysRes.data ?? []) as CwEventDayRow[],
        registrations: (regsRes.data ?? []) as CwRegistrationRow[],
        availability: (availRes.data ?? []) as CwAvailabilityRow[],
        lus: (lusRes.data ?? []) as CwLuRow[],
        luMembers: (luMembersRes.data ?? []) as CwLuMemberRow[],
        luDayResults: (luDayResultsRes.data ?? []) as CwLuDayResultRow[],
      };
    },
  });
}

export function useUpsertCwEvent() {
  const qc = useQueryClient();
  return useMutation({
    meta: { successToast: 'Campagne enregistrée.', silentError: true },
    mutationFn: async (
      input: Database['public']['Tables']['cw_events']['Insert'] & { id?: string },
    ) => {
      if (input.id) {
        const { data, error } = await supabase
          .from('cw_events')
          .update(input)
          .eq('id', input.id)
          .select()
          .single();
        if (error) throw error;
        await regenerateEventDays(data.id, data.starts_at, data.ends_at);
        return data as CwEventRow;
      }
      const { data, error } = await supabase.from('cw_events').insert(input).select().single();
      if (error) throw error;
      await regenerateEventDays(data.id, data.starts_at, data.ends_at);
      return data as CwEventRow;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['cw_events'] });
      qc.invalidateQueries({ queryKey: EVENT_DETAIL_QUERY_KEY(data.id) });
    },
  });
}

// On participe tous les soirs entre starts_at et ends_at (inclus) : les
// soirées sont régénérées à chaque création/modification de campagne plutôt
// que choisies manuellement.
async function regenerateEventDays(eventId: string, startsAt: string, endsAt: string) {
  const { error: delErr } = await supabase.from('cw_event_days').delete().eq('event_id', eventId);
  if (delErr) throw delErr;

  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const rows: { event_id: string; day: string; position: number }[] = [];
  let position = 0;
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    rows.push({ event_id: eventId, day: d.toISOString().slice(0, 10), position: position++ });
  }
  if (!rows.length) return;
  const { error } = await supabase.from('cw_event_days').insert(rows);
  if (error) throw error;
}

export function useSetCwEventStatus() {
  const qc = useQueryClient();
  return useMutation({
    meta: { successToast: 'Statut de la campagne mis à jour.' },
    mutationFn: async ({ id, status }: { id: string; status: CwEventStatus }) => {
      const { error } = await supabase.from('cw_events').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['cw_events'] });
      qc.invalidateQueries({ queryKey: EVENT_DETAIL_QUERY_KEY(vars.id) });
    },
  });
}

export function useDeleteCwEvent() {
  return useInvalidatingMutation({
    successToast: 'Campagne supprimée.',
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('cw_events').delete().eq('id', id);
      if (error) throw error;
    },
    invalidates: [['cw_events']],
  });
}

export function useRegisterToCwEvent() {
  const qc = useQueryClient();
  return useMutation({
    meta: { successToast: 'Inscription enregistrée.' },
    mutationFn: async (input: {
      eventId: string;
      accountId: number | null;
      pseudo: string;
      comment?: string | null;
      availability: { eventDayId: string; available: boolean }[];
    }) => {
      const { data: registration, error: regErr } = await supabase
        .from('cw_registrations')
        .upsert(
          {
            event_id: input.eventId,
            account_id: input.accountId,
            pseudo: input.pseudo,
            comment: input.comment ?? null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'event_id,account_id' },
        )
        .select()
        .single();
      if (regErr) throw regErr;

      const rows = input.availability.map((a) => ({
        registration_id: registration.id,
        event_day_id: a.eventDayId,
        available: a.available,
      }));
      if (rows.length) {
        const { error: availErr } = await supabase
          .from('cw_availability')
          .upsert(rows, { onConflict: 'registration_id,event_day_id' });
        if (availErr) throw availErr;
      }
      return registration as CwRegistrationRow;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: EVENT_DETAIL_QUERY_KEY(vars.eventId) });
    },
  });
}

export function useSetCwLus() {
  const qc = useQueryClient();
  return useMutation({
    meta: { successToast: 'LU enregistrée.' },
    mutationFn: async ({ eventId, lu }: { eventId: string; lu: { id?: string; name: string } }) => {
      if (lu.id) {
        const { error } = await supabase.from('cw_lus').update({ name: lu.name }).eq('id', lu.id);
        if (error) throw error;
        return;
      }
      const { error } = await supabase.from('cw_lus').insert({ event_id: eventId, name: lu.name });
      if (error) throw error;
    },
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: EVENT_DETAIL_QUERY_KEY(vars.eventId) }),
  });
}

export function useDeleteCwLu() {
  const qc = useQueryClient();
  return useMutation({
    meta: { successToast: 'LU supprimée.' },
    mutationFn: async ({ luId }: { luId: string; eventId: string }) => {
      const { error } = await supabase.from('cw_lus').delete().eq('id', luId);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: EVENT_DETAIL_QUERY_KEY(vars.eventId) }),
  });
}

/**
 * Un joueur n'appartient qu'à une seule LU à la fois (comme dans le tableau
 * d'inscriptions) : on retire ses éventuelles affectations précédentes avant
 * d'en poser une nouvelle. Passer `luId: null` retire le joueur de toute LU.
 */
export function useSetRegistrationLu() {
  const qc = useQueryClient();
  return useMutation({
    meta: { successToast: 'Affectation LU enregistrée.' },
    mutationFn: async (input: {
      eventId: string;
      registrationId: string;
      luId: string | null;
      role: 'titulaire' | 'remplacant';
    }) => {
      const { error: delErr } = await supabase
        .from('cw_lu_members')
        .delete()
        .eq('registration_id', input.registrationId);
      if (delErr) throw delErr;
      if (!input.luId) return;
      const { error } = await supabase
        .from('cw_lu_members')
        .insert({ lu_id: input.luId, registration_id: input.registrationId, role: input.role });
      if (error) throw error;
    },
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: EVENT_DETAIL_QUERY_KEY(vars.eventId) }),
  });
}

/**
 * Bilan victoires/défaites d'une LU pour une soirée donnée, saisi
 * manuellement par le staff dans /admin/clan-wars.
 */
export function useSetLuDayResult() {
  const qc = useQueryClient();
  return useMutation({
    meta: { successToast: 'Résultat enregistré.' },
    mutationFn: async (input: { eventId: string; eventDayId: string; luId: string; wins: number; losses: number }) => {
      const { error } = await supabase
        .from('cw_lu_day_results')
        .upsert(
          { event_day_id: input.eventDayId, lu_id: input.luId, wins: input.wins, losses: input.losses },
          { onConflict: 'event_day_id,lu_id' },
        );
      if (error) throw error;
    },
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: EVENT_DETAIL_QUERY_KEY(vars.eventId) }),
  });
}
