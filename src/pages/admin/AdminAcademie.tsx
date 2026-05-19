import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { levelFromXp, totalXpFromScores } from '@/features/geoguesser/playerProfile';
import type { LeaderboardEntry } from '@/features/leaderboard/queries';

type ScoreRow = LeaderboardEntry;

interface PlayerSummary {
  accountId: number;
  nickname: string;
  totalXp: number;
  level: number;
  title: string;
  games: number;
  lastPlayed: string;
  modules: string[];
}

function useAcademieStats() {
  return useQuery({
    queryKey: ['admin', 'academie', 'stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('module_scores')
        .select('player_account_id, player_nickname, score, max_score, module_slug, created_at, meta, is_verified, submode')
        .eq('is_verified', true)
        .not('player_account_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(3000);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });
}

export default function AdminAcademie() {
  const { data: rows, isLoading } = useAcademieStats();

  const players = useMemo<PlayerSummary[]>(() => {
    if (!rows) return [];
    const byAccount = new Map<number, ScoreRow[]>();
    for (const row of rows) {
      const aid = row.player_account_id as number;
      if (!byAccount.has(aid)) byAccount.set(aid, []);
      byAccount.get(aid)!.push(row as ScoreRow);
    }
    return [...byAccount.entries()]
      .map(([accountId, scores]) => {
        const xp = totalXpFromScores(scores as LeaderboardEntry[]);
        const li = levelFromXp(xp);
        const modules = [...new Set(scores.map((s) => s.module_slug))];
        return {
          accountId,
          nickname: scores[0].player_nickname,
          totalXp: xp,
          level: li.level,
          title: li.title,
          games: scores.length,
          lastPlayed: scores[0].created_at,
          modules,
        };
      })
      .sort((a, b) => b.totalXp - a.totalXp);
  }, [rows]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="text-atfr-gold" size={22} />
        <div>
          <h1 className="text-2xl font-display text-atfr-bone">Académie — Joueurs</h1>
          <p className="text-sm text-atfr-fog">
            Joueurs vérifiés WG · {players.length} compte{players.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {isLoading ? (
        <p className="text-atfr-fog py-10 text-center">Chargement…</p>
      ) : players.length === 0 ? (
        <p className="text-atfr-fog py-10 text-center">Aucun joueur vérifié pour le moment.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-atfr-gold/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-atfr-gold/10 bg-atfr-carbon/60 text-atfr-fog/70 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Joueur</th>
                <th className="px-4 py-3 text-left">Niveau</th>
                <th className="px-4 py-3 text-right">XP</th>
                <th className="px-4 py-3 text-right">Parties</th>
                <th className="px-4 py-3 text-left">Modules</th>
                <th className="px-4 py-3 text-left">Dernière partie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-atfr-gold/5">
              {players.map((p, i) => (
                <tr key={p.accountId} className="bg-atfr-carbon/30 hover:bg-atfr-graphite/30 transition-colors">
                  <td className="px-4 py-3 text-atfr-fog/50 font-mono">{i + 1}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-atfr-bone">{p.nickname}</p>
                    <p className="text-[10px] text-atfr-fog/50 font-mono">{p.accountId}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-atfr-gold/10 border border-atfr-gold/30 px-2 py-0.5 text-[11px] font-semibold text-atfr-gold">
                      Niv. {p.level}
                    </span>
                    <p className="text-[10px] text-atfr-fog/60 mt-0.5">{p.title}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-atfr-bone">
                    {p.totalXp.toLocaleString('fr')}
                  </td>
                  <td className="px-4 py-3 text-right text-atfr-fog">{p.games}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.modules.map((m) => (
                        <span key={m} className="text-[10px] bg-atfr-graphite/50 border border-atfr-gold/15 rounded px-1.5 py-0.5 text-atfr-fog/70">
                          {m.replace('wot-', '')}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-atfr-fog/60 text-xs">
                    {new Date(p.lastPlayed).toLocaleDateString('fr', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
