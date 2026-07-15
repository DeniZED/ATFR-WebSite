import { useQuery } from '@tanstack/react-query';
import { useInvalidatingMutation } from '@/lib/mutation-factory';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

export type ClanActivityRow = Database['public']['Tables']['clan_activities']['Row'];
type ClanActivityInsert = Database['public']['Tables']['clan_activities']['Insert'];

/** Catégories d'onglets (l'onglet Clan Wars vient du Palmarès, pas d'ici). */
export const ACTIVITY_CATEGORIES = [
  'regulieres',
  'bastion',
  'entrainements',
  'fun',
] as const;
export type ActivityCategory = (typeof ACTIVITY_CATEGORIES)[number];

const KEY = ['clan_activities'];

export function useClanActivities(opts: { visibleOnly?: boolean } = {}) {
  return useQuery({
    queryKey: [...KEY, opts],
    queryFn: async (): Promise<ClanActivityRow[]> => {
      let q = supabase
        .from('clan_activities')
        .select('*')
        .order('category', { ascending: true })
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });
      if (opts.visibleOnly) q = q.eq('is_visible', true);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });
}

export function useUpsertClanActivity() {
  return useInvalidatingMutation({
    successToast: 'Activité enregistrée.',
    mutationFn: async (row: ClanActivityInsert & { id?: string }) => {
      if (row.id) {
        const { error } = await supabase
          .from('clan_activities')
          .update(row)
          .eq('id', row.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('clan_activities').insert(row);
        if (error) throw error;
      }
    },
    invalidates: [KEY],
  });
}

export function useDeleteClanActivity() {
  return useInvalidatingMutation({
    successToast: 'Activité supprimée.',
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('clan_activities').delete().eq('id', id);
      if (error) throw error;
    },
    invalidates: [KEY],
  });
}
