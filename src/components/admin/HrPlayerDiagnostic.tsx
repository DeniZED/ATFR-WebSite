import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Lightbulb,
} from 'lucide-react';
import { Card, CardBody, Badge } from '@/components/ui';
import { cn } from '@/lib/cn';
import {
  ACTIVITY_BADGE,
  STATUS_BADGE,
  STATUS_LABELS,
  formatDate,
  formatDuration,
  type PlayerActivitySummary,
} from '@/features/rh/activity';
import { DataQualityBadge } from './DataQualityBadge';

function recommendedAction(summary: PlayerActivitySummary): string {
  const { score, dataQuality, player, alerts } = summary;
  if (dataQuality.level === 'low') {
    return 'Compléter le suivi — lier le compte WoT et/ou Discord.';
  }
  if (
    alerts.some((a) => a.kind === 'inactive' && a.severity === 'danger') &&
    player.status !== 'former'
  ) {
    return 'À contacter — inactif de longue date.';
  }
  if (score.trend.direction === 'down' && (score.trend.pct ?? 0) <= -45) {
    return "Surveiller — forte baisse d'activité.";
  }
  if (player.status === 'prospect') return 'Relancer le prospect.';
  if (score.level === 'inactive') return 'Vérifier / relancer le joueur.';
  if (score.level === 'low') return 'Encourager la participation.';
  return 'Rien à signaler — joueur actif.';
}

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-atfr-gold/12 bg-atfr-graphite/40 p-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-atfr-fog">
        {label}
      </p>
      <p className="mt-1 text-atfr-bone">{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-atfr-fog">{hint}</p>}
    </div>
  );
}

/**
 * Carte diagnostic en tête de fiche : l'essentiel d'un coup d'œil pour le staff
 * + une action conseillée dérivée de l'état du joueur.
 */
export function HrPlayerDiagnostic({
  summary,
}: {
  summary: PlayerActivitySummary;
}) {
  const { score, dataQuality, player } = summary;
  const lastNote = summary.notes[0];
  const TrendIcon =
    score.trend.direction === 'up'
      ? ArrowUpRight
      : score.trend.direction === 'down'
        ? ArrowDownRight
        : ArrowRight;

  return (
    <Card>
      <CardBody className="p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-lg text-atfr-bone">Diagnostic</h2>
            <Badge variant={STATUS_BADGE[player.status]}>
              {STATUS_LABELS[player.status]}
            </Badge>
            <DataQualityBadge quality={dataQuality} />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-display text-2xl text-atfr-bone leading-none">
              {score.value}
              <span className="text-sm text-atfr-fog">/100</span>
            </span>
            <Badge variant={ACTIVITY_BADGE[score.level]}>{score.label}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
          <Metric
            label="Tendance"
            value={
              <span className="inline-flex items-center gap-1">
                <TrendIcon
                  size={15}
                  className={cn(
                    score.trend.direction === 'up'
                      ? 'text-atfr-success'
                      : score.trend.direction === 'down'
                        ? 'text-atfr-danger'
                        : 'text-atfr-fog',
                  )}
                />
                {score.trend.pct != null
                  ? `${score.trend.pct > 0 ? '+' : ''}${Math.round(score.trend.pct)} %`
                  : '—'}
              </span>
            }
          />
          <Metric
            label="Dernière bataille"
            value={formatDate(summary.latestWotActivityAt)}
          />
          <Metric
            label="Batailles (période)"
            value={summary.battleDelta == null ? '—' : summary.battleDelta}
          />
          <Metric
            label="Vocal (période)"
            value={formatDuration(summary.voiceSeconds)}
          />
          <Metric label="Jours actifs" value={summary.activeDays} />
          <Metric
            label="Dernière note staff"
            value={
              lastNote ? (
                <span className="line-clamp-2 text-sm">{lastNote.content}</span>
              ) : (
                '—'
              )
            }
            hint={lastNote ? formatDate(lastNote.created_at) : undefined}
          />
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-atfr-gold/25 bg-atfr-gold/5 px-3 py-2.5">
          <Lightbulb size={16} className="mt-0.5 shrink-0 text-atfr-gold" />
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-atfr-gold/80">
              Action conseillée
            </p>
            <p className="text-sm text-atfr-bone">{recommendedAction(summary)}</p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
