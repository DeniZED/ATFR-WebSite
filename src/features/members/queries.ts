import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type MemberRow = Database['public']['Tables']['members']['Row'];

export function useMembers(options: { activeOnly?: boolean } = { activeOnly: true }) {
  return useQuery({
    queryKey: ['members', options],
    queryFn: async () => {
      let query = supabase.from('members').select('*').order('account_name');
      if (options.activeOnly) {
        query = query.is('left_at', null);
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as MemberRow[];
    },
  });
}

export function useMembersHistory() {
  return useQuery({
    queryKey: ['members', 'history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('members_history')
        .select('*')
        .order('occurred_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useUpsertMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Database['public']['Tables']['members']['Insert']) => {
      const { error } = await supabase.from('members').upsert(input);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members'] }),
  });
}
