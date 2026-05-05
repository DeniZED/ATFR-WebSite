import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

const SUBMIT_SCORE_URL = '/.netlify/functions/submit-score';

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

export function usePlayerModuleScores(args: {
  moduleSlug: string;
  playerAnonId: string;
  playerAccountId?: number | null;
  limit?: number;
}) {
  const { moduleSlug, playerAnonId, playerAccountId, limit = 120 } = args;
  return useQuery({
    queryKey: [
      'module_scores',
      'player',
      moduleSlug,
      playerAnonId,
      playerAccountId ?? 'anon',
      limit,
    ],
    enabled: !!playerAnonId,
    queryFn: async (): Promise<LeaderboardEntry[]> => {
      const queries = [
        supabase
          .from('module_scores')
          .select('*')
          .eq('module_slug', moduleSlug)
          .eq('player_anon_id', playerAnonId)
          .order('created_at', { ascending: false })
          .limit(limit),
      ];

      if (playerAccountId != null) {
        queries.push(
          supabase
            .from('module_scores')
            .select('*')
            .eq('module_slug', moduleSlug)
            .eq('player_account_id', playerAccountId)
            .order('created_at', { ascending: false })
            .limit(limit),
        );
      }

      const responses = await Promise.all(queries);
      const rows: ScoreRow[] = [];
      for (const { data, error } of responses) {
        if (error) throw error;
        rows.push(...(data ?? []));
      }

      const unique = new Map<string, ScoreRow>();
      for (const row of rows) unique.set(row.id, row);

      return [...unique.values()]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, limit)
        .map((row) => ({
          ...row,
          ratio: row.max_score > 0 ? row.score / row.max_score : 0,
        }));
    },
    staleTime: 30_000,
  });
}

export interface SubmitScoreInput {
  module_slug: string;
  submode?: string;
  score: number;
  max_score: number;
  player_anon_id: string;
  player_nickname: string;
  /** HMAC-signed identity token from wg-auth-verify. When provided, the
   *  submit-score function sets is_verified=true with the validated account_id.
   *  When absent the score is stored as anonymous (is_verified=false). */
  player_token?: string | null;
  meta?: Record<string, unknown>;
}

export function useSubmitScore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: SubmitScoreInput) => {
      const res = await fetch(SUBMIT_SCORE_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          module_slug: input.module_slug,
          submode: input.submode ?? 'default',
          score: input.score,
          max_score: input.max_score,
          player_anon_id: input.player_anon_id,
          player_nickname: input.player_nickname,
          player_token: input.player_token ?? null,
          meta: input.meta ?? {},
        }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `submit-score ${res.status}`);
      }
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({
        queryKey: ['module_scores', vars.module_slug],
      });
      qc.invalidateQueries({
        queryKey: ['module_scores', 'player', vars.module_slug],
      });
    },
  });
}

export function useScoreCount(moduleSlug: string) {
  return useQuery({
    queryKey: ['module_scores', 'count', moduleSlug],
    queryFn: async (): Promise<number> => {
      const { count, error } = await supabase
        .from('module_scores')
        .select('*', { count: 'exact', head: true })
        .eq('module_slug', moduleSlug);
      if (error) throw error;
      return count ?? 0;
    },
    staleTime: 30_000,
  });
}

export function useResetLeaderboard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (moduleSlug: string) => {
      const { error } = await supabase
        .from('module_scores')
        .delete()
        .eq('module_slug', moduleSlug);
      if (error) throw error;
    },
    onSuccess: (_, slug) => {
      qc.invalidateQueries({ queryKey: ['module_scores', slug] });
      qc.invalidateQueries({ queryKey: ['module_scores', 'count', slug] });
    },
  });
}
