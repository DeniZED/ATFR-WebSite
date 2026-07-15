import { useQuery } from '@tanstack/react-query';
import { useInvalidatingMutation } from '@/lib/mutation-factory';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

export type ClanHistoryRow = Database['public']['Tables']['clan_history']['Row'];
type ClanHistoryInsert = Database['public']['Tables']['clan_history']['Insert'];

const KEY = ['clan_history'];

/** Jalons de « Notre Histoire », triés (ordre puis création). */
export function useClanHistory(opts: { visibleOnly?: boolean } = {}) {
  return useQuery({
    queryKey: [...KEY, opts],
    queryFn: async (): Promise<ClanHistoryRow[]> => {
      let q = supabase
        .from('clan_history')
        .select('*')
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

export function useUpsertClanHistory() {
  return useInvalidatingMutation({
    successToast: 'Jalon enregistré.',
    mutationFn: async (row: ClanHistoryInsert & { id?: string }) => {
      if (row.id) {
        const { error } = await supabase
          .from('clan_history')
          .update(row)
          .eq('id', row.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('clan_history').insert(row);
        if (error) throw error;
      }
    },
    invalidates: [KEY],
  });
}

export function useDeleteClanHistory() {
  return useInvalidatingMutation({
    successToast: 'Jalon supprimé.',
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('clan_history').delete().eq('id', id);
      if (error) throw error;
    },
    invalidates: [KEY],
  });
}
