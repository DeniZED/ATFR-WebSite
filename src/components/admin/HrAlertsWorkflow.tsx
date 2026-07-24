import { useState } from 'react';
import {
  Check,
  Clock,
  Hand,
  RotateCcw,
  TriangleAlert,
  X,
} from 'lucide-react';
import { Badge, Card, CardBody } from '@/components/ui';
import { cn } from '@/lib/cn';
import {
  formatDateTime,
  type PlayerActivitySummary,
  type StaffAlert,
} from '@/features/rh/activity';
import {
  ALERT_STATUS_BADGE,
  ALERT_STATUS_LABELS,
  effectiveAlertStatus,
  indexAlertActions,
} from '@/features/rh/alerts';
import { useSaveAlertAction } from '@/features/rh/queries';
import type { PlayerAlertActionRow } from '@/types/database';

const SNOOZE_DAYS = 7;

function severityVariant(severity: StaffAlert['severity']) {
  return severity === 'danger'
    ? 'danger'
    : severity === 'warning'
      ? 'warning'
      : 'outline';
}

/**
 * Workflow d'alertes (Phase 6). Chaque alerte calculée peut être prise en
 * charge, reportée (snooze 7 j), ignorée ou résolue. L'état est persisté dans
 * player_alert_actions (overlay) ; les alertes calculées, elles, restent la
 * source de vérité. Respecte le RBAC via `canManage` (passé par l'appelant).
 */
export function HrAlertsWorkflow({
  summary,
  actorId,
  canManage,
}: {
  summary: PlayerActivitySummary;
  actorId: string | null;
  canManage: boolean;
}) {
  if (summary.alerts.length === 0) return null;

  const actionsByKind = indexAlertActions(summary.alertActions);

  return (
    <Card>
      <CardBody className="p-5">
        <p className="font-display text-lg text-atfr-bone mb-3">Alertes staff</p>
        <div className="grid gap-3 md:grid-cols-2">
          {summary.alerts.map((alert) => (
            <AlertWorkflowRow
              key={alert.kind}
              playerId={summary.player.id}
              alert={alert}
              action={actionsByKind.get(alert.kind) ?? null}
              actorId={actorId}
              canManage={canManage}
            />
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

function AlertWorkflowRow({
  playerId,
  alert,
  action,
  actorId,
  canManage,
}: {
  playerId: string;
  alert: StaffAlert;
  action: PlayerAlertActionRow | null;
  actorId: string | null;
  canManage: boolean;
}) {
  const saveAction = useSaveAlertAction();
  const [showResolve, setShowResolve] = useState(false);
  const [note, setNote] = useState('');

  const status = effectiveAlertStatus(action);
  const muted = status === 'snoozed' || status === 'ignored' || status === 'resolved';

  function apply(
    patch: Partial<Omit<Parameters<typeof saveAction.mutateAsync>[0], 'playerId' | 'kind'>>,
  ) {
    saveAction.mutate({
      playerId,
      kind: alert.kind,
      status: 'open',
      actorId,
      ...patch,
    });
  }

  return (
    <div
      className={cn(
        'rounded-md border bg-atfr-ink/60 p-4 transition-opacity',
        muted ? 'border-atfr-gold/5 opacity-70' : 'border-atfr-gold/10',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <Badge variant={severityVariant(alert.severity)}>
          <TriangleAlert size={12} /> {alert.title}
        </Badge>
        <Badge variant={ALERT_STATUS_BADGE[status]}>
          {ALERT_STATUS_LABELS[status]}
        </Badge>
      </div>
      <p className="mt-2 text-sm text-atfr-fog">{alert.description}</p>

      {status === 'snoozed' && action?.snooze_until && (
        <p className="mt-1 text-xs text-atfr-fog">
          En veille jusqu'au {formatDateTime(action.snooze_until)}.
        </p>
      )}
      {status === 'resolved' && action?.resolution_note && (
        <p className="mt-1 text-xs text-atfr-fog italic">
          « {action.resolution_note} »
        </p>
      )}

      {canManage && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {!muted && (
            <>
              {status !== 'in_progress' && (
                <ActionButton
                  icon={<Hand size={13} />}
                  label="Prendre en charge"
                  onClick={() =>
                    apply({ status: 'in_progress', assignedTo: actorId })
                  }
                  disabled={saveAction.isPending}
                />
              )}
              <ActionButton
                icon={<Clock size={13} />}
                label={`Reporter ${SNOOZE_DAYS} j`}
                onClick={() =>
                  apply({
                    status: 'snoozed',
                    snoozeUntil: new Date(
                      Date.now() + SNOOZE_DAYS * 86_400_000,
                    ).toISOString(),
                  })
                }
                disabled={saveAction.isPending}
              />
              <ActionButton
                icon={<X size={13} />}
                label="Ignorer"
                onClick={() => apply({ status: 'ignored' })}
                disabled={saveAction.isPending}
              />
              <ActionButton
                icon={<Check size={13} />}
                label="Résoudre"
                tone="success"
                onClick={() => setShowResolve((v) => !v)}
                disabled={saveAction.isPending}
              />
            </>
          )}
          {muted && (
            <ActionButton
              icon={<RotateCcw size={13} />}
              label="Rouvrir"
              onClick={() =>
                apply({
                  status: 'open',
                  snoozeUntil: null,
                  assignedTo: null,
                  resolutionNote: null,
                })
              }
              disabled={saveAction.isPending}
            />
          )}
        </div>
      )}

      {showResolve && !muted && (
        <div className="mt-2 flex flex-col gap-2">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note de résolution (optionnel)"
            className="w-full rounded-md border border-atfr-gold/20 bg-atfr-ink px-2.5 py-1.5 text-xs text-atfr-bone placeholder:text-atfr-fog/60 focus:border-atfr-gold/50 focus:outline-none"
          />
          <div className="flex gap-1.5">
            <ActionButton
              icon={<Check size={13} />}
              label="Confirmer la résolution"
              tone="success"
              onClick={() => {
                apply({ status: 'resolved', resolutionNote: note.trim() || null });
                setShowResolve(false);
                setNote('');
              }}
              disabled={saveAction.isPending}
            />
            <ActionButton
              label="Annuler"
              onClick={() => setShowResolve(false)}
              disabled={saveAction.isPending}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  disabled,
  tone = 'default',
}: {
  icon?: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: 'default' | 'success';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors disabled:opacity-50',
        tone === 'success'
          ? 'border-atfr-success/30 text-atfr-success hover:bg-atfr-success/10'
          : 'border-atfr-fog/25 text-atfr-fog hover:border-atfr-gold/40 hover:text-atfr-gold',
      )}
    >
      {icon}
      {label}
    </button>
  );
}
