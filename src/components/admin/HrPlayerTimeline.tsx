import { useMemo } from 'react';
import { Card, CardBody } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatDateTime } from '@/features/rh/activity';
import {
  computePlayerTimeline,
  type TimelineTone,
} from '@/features/rh/timeline';

const TONE_DOT: Record<TimelineTone, string> = {
  neutral: 'bg-atfr-fog',
  positive: 'bg-atfr-success',
  warning: 'bg-atfr-warning',
  danger: 'bg-atfr-danger',
};

type Props = Parameters<typeof computePlayerTimeline>[0];

/**
 * Timeline unifiée du joueur (arrivée/départ clan, statut, notes, alertes,
 * lien Discord). Se masque si aucun événement.
 */
export function HrPlayerTimeline({
  memberHistory,
  statusHistory,
  notes,
  alerts,
  discordLink,
}: Props) {
  const events = useMemo(
    () =>
      computePlayerTimeline({
        memberHistory,
        statusHistory,
        notes,
        alerts,
        discordLink,
      }),
    [memberHistory, statusHistory, notes, alerts, discordLink],
  );

  if (events.length === 0) return null;

  return (
    <Card>
      <CardBody className="p-5">
        <h3 className="mb-4 font-display text-lg text-atfr-bone">
          Historique du joueur
        </h3>
        <ol className="relative space-y-3 border-l border-atfr-gold/15 pl-5">
          {events.slice(0, 50).map((e, i) => (
            <li key={`${e.at}-${e.kind}-${i}`} className="relative">
              <span
                className={cn(
                  'absolute -left-[23px] top-1.5 h-2 w-2 rounded-full ring-2 ring-atfr-carbon',
                  TONE_DOT[e.tone],
                )}
              />
              <p className="text-sm text-atfr-bone">
                {e.label}
                {e.detail ? (
                  <span className="text-atfr-fog"> — {e.detail}</span>
                ) : null}
              </p>
              <p className="text-[11px] text-atfr-fog">{formatDateTime(e.at)}</p>
            </li>
          ))}
        </ol>
      </CardBody>
    </Card>
  );
}
