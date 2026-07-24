import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Info,
  TriangleAlert,
} from 'lucide-react';
import { Card, CardBody, Badge } from '@/components/ui';
import { cn } from '@/lib/cn';
import {
  ACTIVITY_BADGE,
  type PlayerActivitySummary,
} from '@/features/rh/activity';
import { DataQualityBadge } from './DataQualityBadge';

/**
 * Carte « Détail du score » — le staff comprend pourquoi un joueur est classé
 * actif / faible / inactif : décomposition par composante, raisons, tendance,
 * données manquantes, fiabilité.
 */
export function HrScoreBreakdown({
  summary,
}: {
  summary: PlayerActivitySummary;
}) {
  const { score, dataQuality } = summary;
  const TrendIcon =
    score.trend.direction === 'up'
      ? ArrowUpRight
      : score.trend.direction === 'down'
        ? ArrowDownRight
        : ArrowRight;

  return (
    <Card>
      <CardBody className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg text-atfr-bone">
              Détail du score
            </h3>
            <p className="mt-0.5 text-xs text-atfr-fog">
              Comment le score /100 est construit.
            </p>
          </div>
          <div className="text-right">
            <div className="font-display text-3xl text-atfr-bone leading-none">
              {score.value}
              <span className="text-base text-atfr-fog">/100</span>
            </div>
            <div className="mt-1.5 flex items-center justify-end gap-1.5">
              <Badge variant={ACTIVITY_BADGE[score.level]}>{score.label}</Badge>
            </div>
          </div>
        </div>

        {/* Décomposition par composante */}
        <div className="space-y-2.5">
          {score.components.map((c) => {
            const ratio = c.max > 0 ? c.points / c.max : 0;
            return (
              <div key={c.key}>
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="text-atfr-bone">{c.label}</span>
                  <span className="shrink-0 tabular-nums text-atfr-fog">
                    {c.points}/{c.max}
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-atfr-graphite">
                  <div
                    className={cn(
                      'h-full rounded-full',
                      ratio >= 0.66
                        ? 'bg-atfr-success'
                        : ratio >= 0.33
                          ? 'bg-atfr-warning'
                          : 'bg-atfr-danger',
                    )}
                    style={{ width: `${Math.round(ratio * 100)}%` }}
                  />
                </div>
                <p className="mt-0.5 text-[11px] text-atfr-fog">{c.detail}</p>
              </div>
            );
          })}
        </div>

        {/* Tendance */}
        <div className="flex items-center gap-2 rounded-lg border border-atfr-gold/12 bg-atfr-graphite/40 px-3 py-2 text-sm">
          <TrendIcon
            size={16}
            className={cn(
              score.trend.direction === 'up'
                ? 'text-atfr-success'
                : score.trend.direction === 'down'
                  ? 'text-atfr-danger'
                  : 'text-atfr-fog',
            )}
          />
          <span className="text-atfr-fog">{score.detail}</span>
        </div>

        {/* Pourquoi ce statut ? */}
        {score.reasons.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs uppercase tracking-[0.2em] text-atfr-gold/80">
              Pourquoi ce statut ?
            </p>
            <ul className="space-y-1 text-sm text-atfr-bone">
              {score.reasons.map((r) => (
                <li key={r} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-atfr-gold" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Données manquantes */}
        {score.missingData.length > 0 && (
          <div className="flex items-start gap-2 rounded-lg border border-atfr-warning/25 bg-atfr-warning/5 px-3 py-2 text-xs text-atfr-fog">
            <TriangleAlert size={14} className="mt-0.5 shrink-0 text-atfr-warning" />
            <span>Données manquantes : {score.missingData.join(' · ')}</span>
          </div>
        )}

        {/* Fiabilité */}
        <div className="flex flex-wrap items-center gap-2 border-t border-atfr-gold/10 pt-3">
          <DataQualityBadge quality={dataQuality} />
          {dataQuality.reasons.length > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] text-atfr-fog">
              <Info size={12} />
              {dataQuality.reasons.join(' · ')}
            </span>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
