import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type ScoreRow = Database['public']['Tables']['module_scores']['Row'];

export interface LeaderboardEntry extends ScoreRow {
  /** 0..1 */
  ratio: number;
}

export function useLeaderboard(args: {
  moduleSlug: string;
  submode?: string;
  limit?: number;
  verifiedOnly?: boolean;
}) {
  const { moduleSlug, submode = 'default', limit = 20, verifiedOnly } = args;
  return useQuery({
    queryKey: ['module_scores', moduleSlug, submode, verifiedOnly ?? 'all', limit],
    queryFn: async (): Promise<LeaderboardEntry[]> => {
      let q = supabase
        .from('module_scores')
        .select('*')
        .eq('module_slug', moduleSlug)
        .eq('submode', submode)
        .order('score', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(limit);
      if (verifiedOnly) q = q.eq('is_verified', true);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((row) => ({
        ...row,
        ratio: row.max_score > 0 ? row.score / row.max_score : 0,
      }));
    },
    staleTime: 60_000,
  });
}

export function useSubmitScore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      input: Database['public']['Tables']['module_scores']['Insert'],
    ) => {
      const { error } = await supabase.from('module_scores').insert(input);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({
        queryKey: ['module_scores', vars.module_slug],
      });
    },
  });
}
