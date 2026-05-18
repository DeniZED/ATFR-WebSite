import { useMemo } from 'react';
import { Map, Target, Zap, Trophy, Clock } from 'lucide-react';
import type { PlayerIdentity } from '@/features/identity/usePlayerIdentity';
import {
  usePlayerModuleScores,
  type LeaderboardEntry,
} from '@/features/leaderboard/queries';
import { registerAcademyModule } from '@/features/academy/moduleContributions';

// ── Tiny stat helpers ────────────────────────────────────────────────────
function getMeta(meta: unknown, key: string): number | null {
  if (meta && typeof meta === 'object') {
    const v = (meta as Record<string, unknown>)[key];
    return typeof v === 'number' ? v : null;
  }
  return null;
}
function getMetaStr(meta: unknown, key: string): string | null {
  if (meta && typeof meta === 'object') {
    const v = (meta as Record<string, unknown>)[key];
    return typeof v === 'string' ? v : null;
  }
  return null;
}

type GameMode = 'daily' | 'random' | 'sprint' | 'blind';
const MODE_LABEL: Record<GameMode, string> = {
  daily: 'Quotidien',
  random: 'Aléatoire',
  sprint: 'Sprint',
  blind: 'Aveugle',
};

function parseMode(entry: LeaderboardEntry): GameMode {
  const raw = getMetaStr(entry.meta, 'game_mode') ?? '';
  return (['daily', 'random', 'sprint', 'blind'] as const).includes(raw as GameMode)
    ? (raw as GameMode)
    : 'random';
}

function formatDist(m: number): string {
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
}

function summarise(entries: LeaderboardEntry[]) {
  if (!entries.length) return null;
  const week = Date.now() - 7 * 24 * 60 * 60 * 1000;
  let bestDist = Infinity;
  let totalAccuracy = 0;
  let accuracyCount = 0;
  let bestStreak = 0;
  const byMode: Record<string, number> = {};

  for (const e of entries) {
    const dist = getMeta(e.meta, 'distance_m') ?? Math.max(0, e.max_score - e.score);
    if (dist < bestDist) bestDist = dist;
    const acc = getMeta(e.meta, 'map_accuracy_pct');
    if (acc != null) { totalAccuracy += acc; accuracyCount++; }
    const streak = getMeta(e.meta, 'best_streak') ?? 0;
    if (streak > bestStreak) bestStreak = streak;
    const mode = parseMode(e);
    byMode[mode] = (byMode[mode] ?? 0) + 1;
  }

  return {
    total: entries.length,
    last7: entries.filter((e) => new Date(e.created_at).getTime() >= week).length,
    bestDist: Number.isFinite(bestDist) ? bestDist : null,
    avgAccuracy: accuracyCount > 0 ? Math.round(totalAccuracy / accuracyCount) : null,
    bestStreak,
    byMode,
  };
}

// ── Component ─────────────────────────────────────────────────────────────
export function GeoguesseurStats({ identity }: { identity: PlayerIdentity }) {
  const scores = usePlayerModuleScores({
    moduleSlug: 'wot-geoguesser',
    playerAnonId: identity.id,
    playerAccountId: identity.accountId,
  });

  const stats = useMemo(
    () => summarise(scores.data ?? []),
    [scores.data],
  );

  if (scores.isLoading) {
    return <p className="text-xs text-atfr-fog/60 py-2">Chargement…</p>;
  }

  if (!stats || stats.total === 0) {
    return (
      <p className="text-xs text-atfr-fog/60 py-2 italic">
        Aucune partie jouée — lance-toi !
      </p>
    );
  }

  const modeOrder: GameMode[] = ['daily', 'random', 'sprint', 'blind'];

  return (
    <div className="space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-2">
        <StatBox icon={<Map size={13} />} label="Parties" value={String(stats.total)} sub={`+${stats.last7} cette semaine`} />
        {stats.bestDist != null && (
          <StatBox icon={<Target size={13} />} label="Meilleur" value={formatDist(stats.bestDist)} sub="distance totale" />
        )}
        {stats.avgAccuracy != null && (
          <StatBox icon={<Zap size={13} />} label="Précision maps" value={`${stats.avgAccuracy}%`} sub="moyenne" />
        )}
        {stats.bestStreak > 0 && (
          <StatBox icon={<Trophy size={13} />} label="Meilleure série" value={`${stats.bestStreak} bonnes`} sub="consécutives" />
        )}
      </div>

      {/* Per-mode breakdown */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-atfr-fog/50 mb-2">Par mode</p>
        <div className="flex flex-wrap gap-2">
          {modeOrder.map((mode) => {
            const count = stats.byMode[mode] ?? 0;
            if (!count) return null;
            return (
              <span
                key={mode}
                className="inline-flex items-center gap-1.5 rounded-lg border border-atfr-gold/20 bg-atfr-graphite/40 px-2.5 py-1 text-xs text-atfr-fog"
              >
                <Clock size={10} className="text-atfr-gold/60" />
                <span className="text-atfr-bone font-medium">{count}</span>
                <span className="text-atfr-fog/60">{MODE_LABEL[mode]}</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className="rounded-lg border border-atfr-gold/15 bg-atfr-graphite/30 p-2.5">
      <div className="flex items-center gap-1.5 text-atfr-gold/70 mb-1">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <p className="font-display text-lg text-atfr-bone leading-none">{value}</p>
      <p className="text-[10px] text-atfr-fog/50 mt-0.5">{sub}</p>
    </div>
  );
}

// Auto-register this module's contribution when the file is imported
registerAcademyModule({
  slug: 'wot-geoguesser',
  label: 'WoT Géoguesseur',
  StatsComponent: GeoguesseurStats,
});
