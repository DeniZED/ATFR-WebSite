import { useMemo } from 'react';
import { Card, CardBody } from '@/components/ui';
import { cn } from '@/lib/cn';
import {
  ACTIVITY_LABELS,
  type ActivityLevel,
  type PlayerActivitySummary,
} from '@/features/rh/activity';

const LEVEL_ORDER: ActivityLevel[] = [
  'very_active',
  'active',
  'low',
  'inactive',
];
const LEVEL_COLOR: Record<ActivityLevel, string> = {
  // Vert = « Très actif » (≥ 80) uniquement ; « Actif » (50-79) en doré, cohérent
  // avec la barre de score et les badges (ACTIVITY_BADGE).
  very_active: 'bg-atfr-success',
  active: 'bg-atfr-gold',
  low: 'bg-atfr-warning',
  inactive: 'bg-atfr-danger',
};

/**
 * Santé RH du clan : répartition des membres par niveau d'activité, sur le
 * périmètre passé (membres actuels par défaut). Barre segmentée + légende
 * chiffrée — une seule unité (nombre de membres), pas de mélange.
 */
export function HrHealthTrendChart({
  players,
}: {
  players: PlayerActivitySummary[];
}) {
  const { counts, total, watch } = useMemo(() => {
    const counts: Record<ActivityLevel, number> = {
      very_active: 0,
      active: 0,
      low: 0,
      inactive: 0,
    };
    let watch = 0;
    for (const s of players) {
      counts[s.score.level] += 1;
      if (s.player.status === 'watch') watch += 1;
    }
    return { counts, total: players.length, watch };
  }, [players]);

  if (total === 0) return null;

  return (
    <Card>
      <CardBody className="p-5">
        <div className="mb-4 flex items-baseline justify-between gap-2">
          <h3 className="font-display text-lg text-atfr-bone">
            Santé RH du clan
          </h3>
          <p className="text-xs text-atfr-fog">
            {total} membre(s)
            {watch > 0 ? ` · ${watch} à surveiller` : ''}
          </p>
        </div>

        <div className="flex h-3 w-full overflow-hidden rounded-full bg-atfr-graphite">
          {LEVEL_ORDER.map((lvl) =>
            counts[lvl] > 0 ? (
              <div
                key={lvl}
                className={cn('h-full', LEVEL_COLOR[lvl])}
                style={{ width: `${(counts[lvl] / total) * 100}%` }}
                title={`${ACTIVITY_LABELS[lvl]} : ${counts[lvl]}`}
              />
            ) : null,
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
          {LEVEL_ORDER.map((lvl) => (
            <div key={lvl} className="flex items-center gap-2">
              <span className={cn('h-2.5 w-2.5 rounded-full', LEVEL_COLOR[lvl])} />
              <span className="text-xs text-atfr-fog">{ACTIVITY_LABELS[lvl]}</span>
              <span className="ml-auto text-sm tabular-nums text-atfr-bone">
                {counts[lvl]}
              </span>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
