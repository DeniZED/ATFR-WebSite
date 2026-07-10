import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useInvalidatingMutation } from '@/lib/mutation-factory';
import { supabase } from '@/lib/supabase';
import { notifyNewApplication } from '@/lib/discord';
import type { ApplicationStatus, Database } from '@/types/database';

type ApplicationInsert = Database['public']['Tables']['applications']['Insert'];
type ApplicationRow = Database['public']['Tables']['applications']['Row'];

export function useApplications(status?: ApplicationStatus) {
  return useQuery({
    queryKey: ['applications', status ?? 'all'],
    queryFn: async () => {
      let query = supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });
      if (status) query = query.eq('status', status);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as ApplicationRow[];
    },
  });
}

export function useSubmitApplication() {
  return useMutation({
    meta: { silentError: true },
    mutationFn: async (input: ApplicationInsert) => {
      const { data, error } = await supabase
        .from('applications')
        .insert({ ...input, status: 'pending' })
        .select()
        .single();

      if (error) throw error;

      // Discord notification is best-effort — a webhook failure must not
      // make the user think their application was lost.
      try {
        await notifyNewApplication({
          playerName: input.player_name,
          discordTag: input.discord_tag,
          targetClan: input.target_clan,
          wn8: input.wn8 ?? null,
          winRate: input.win_rate ?? null,
          battles: input.battles ?? null,
          availability: input.availability,
          motivation: input.motivation,
          previousClans: input.previous_clans,
          accountId: input.account_id,
        });
      } catch (notifyErr) {
        console.error('[discord] notification failed (application saved)', notifyErr);
      }

      return data as ApplicationRow;
    },
  });
}

export function useUpdateApplicationStatus() {
  const qc = useQueryClient();
  return useMutation({
    meta: { successToast: 'Statut de la candidature mis à jour.', silentError: true },
    mutationFn: async ({
      id,
      status,
      expectedStatus,
      notes,
    }: {
      id: string;
      status: ApplicationStatus;
      /** Statut affiché au moment du clic — verrouillage optimiste (P1-3) :
       *  si un autre admin a traité la candidature entre-temps, l'UPDATE ne
       *  matche aucune ligne et on signale le conflit au lieu d'écraser
       *  silencieusement sa décision. */
      expectedStatus: ApplicationStatus;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('applications')
        .update({
          status,
          review_notes: notes,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('status', expectedStatus)
        .select('id');
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error(
          'Cette candidature a été modifiée entre-temps (autre admin ?). La liste a été rechargée — vérifie son statut avant de réessayer.',
        );
      }
    },
    // onSettled (pas onSuccess) : en cas de conflit, il faut aussi recharger
    // la liste pour afficher le statut réel.
    onSettled: () => qc.invalidateQueries({ queryKey: ['applications'] }),
  });
}

export function useDeleteApplication() {
  return useInvalidatingMutation({
    successToast: 'Candidature supprimée.',
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('applications').delete().eq('id', id);
      if (error) throw error;
    },
    invalidates: [['applications']],
  });
}

export function usePendingApplicationsCount() {
  return useQuery({
    queryKey: ['applications', 'pending_count'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('count_pending_applications');
      if (error) throw error;
      return (data as number | null) ?? 0;
    },
    staleTime: 60_000,
  });
}
