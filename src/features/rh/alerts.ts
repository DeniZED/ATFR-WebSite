// Phase 6 — Workflow d'alertes (overlay d'état).
//
// Les alertes RH sont calculées à la volée (computeAlerts, activity.ts) et ne
// sont pas persistées. La table player_alert_actions persiste UNIQUEMENT la
// décision de traitement du staff, indexée par (player_id, kind). Ce module
// fusionne une alerte calculée avec sa décision persistée pour obtenir son
// statut « effectif », et distingue les alertes qui doivent encore alerter
// (open / in_progress) de celles mises en sourdine (snoozed / ignored /
// resolved) — ces dernières ne comptent plus dans les compteurs.

import type { PlayerAlertActionRow, PlayerAlertStatus } from '@/types/database';
import type { StaffAlert } from './activity';

type BadgeVariant = 'neutral' | 'gold' | 'success' | 'warning' | 'danger' | 'outline';

export const ALERT_STATUS_LABELS: Record<PlayerAlertStatus, string> = {
  open: 'À traiter',
  in_progress: 'En cours',
  snoozed: 'En veille',
  ignored: 'Ignorée',
  resolved: 'Résolue',
};

export const ALERT_STATUS_BADGE: Record<PlayerAlertStatus, BadgeVariant> = {
  open: 'warning',
  in_progress: 'gold',
  snoozed: 'outline',
  ignored: 'neutral',
  resolved: 'success',
};

/** Une alerte « en sourdine » ne relance plus (exclue des compteurs actifs). */
const MUTED_STATUSES: ReadonlySet<PlayerAlertStatus> = new Set([
  'snoozed',
  'ignored',
  'resolved',
]);

/**
 * Statut effectif d'une alerte : sans décision persistée, elle est « open ».
 * Une mise en veille (snoozed) dont l'échéance est passée redevient « open »
 * automatiquement — la sourdine est temporaire, l'alerte doit ressortir.
 */
export function effectiveAlertStatus(
  action: PlayerAlertActionRow | null | undefined,
  now: number = Date.now(),
): PlayerAlertStatus {
  if (!action) return 'open';
  if (
    action.status === 'snoozed' &&
    action.snooze_until &&
    new Date(action.snooze_until).getTime() <= now
  ) {
    return 'open';
  }
  return action.status;
}

export function isAlertMuted(
  action: PlayerAlertActionRow | null | undefined,
  now: number = Date.now(),
): boolean {
  return MUTED_STATUSES.has(effectiveAlertStatus(action, now));
}

export interface ResolvedAlert {
  alert: StaffAlert;
  action: PlayerAlertActionRow | null;
  status: PlayerAlertStatus;
  muted: boolean;
}

/** Indexe les décisions persistées d'un joueur par type d'alerte. */
export function indexAlertActions(
  actions: readonly PlayerAlertActionRow[],
): Map<string, PlayerAlertActionRow> {
  const map = new Map<string, PlayerAlertActionRow>();
  for (const action of actions) map.set(action.kind, action);
  return map;
}

/** Fusionne les alertes calculées avec leurs décisions persistées. */
export function resolveAlerts(
  alerts: readonly StaffAlert[],
  actionsByKind: Map<string, PlayerAlertActionRow>,
  now: number = Date.now(),
): ResolvedAlert[] {
  return alerts.map((alert) => {
    const action = actionsByKind.get(alert.kind) ?? null;
    const status = effectiveAlertStatus(action, now);
    return { alert, action, status, muted: MUTED_STATUSES.has(status) };
  });
}

/**
 * Alertes encore « actives » (non mises en sourdine) — celles qui doivent
 * compter dans les badges/compteurs et relancer le staff.
 */
export function activeAlerts(
  alerts: readonly StaffAlert[],
  actionsByKind: Map<string, PlayerAlertActionRow>,
  now: number = Date.now(),
): StaffAlert[] {
  return resolveAlerts(alerts, actionsByKind, now)
    .filter((r) => !r.muted)
    .map((r) => r.alert);
}
