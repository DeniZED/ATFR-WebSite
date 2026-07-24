import { describe, it, expect } from 'vitest';
import type { PlayerAlertActionRow } from '@/types/database';
import type { StaffAlert } from './activity';
import {
  activeAlerts,
  effectiveAlertStatus,
  indexAlertActions,
  isAlertMuted,
  resolveAlerts,
} from './alerts';

const NOW = Date.parse('2026-07-24T12:00:00Z');

function action(over: Partial<PlayerAlertActionRow>): PlayerAlertActionRow {
  return {
    id: 'a1',
    player_id: 'p1',
    kind: 'inactive',
    status: 'open',
    assigned_to: null,
    snooze_until: null,
    resolution_note: null,
    updated_by: null,
    created_at: '2026-07-01T00:00:00Z',
    updated_at: '2026-07-01T00:00:00Z',
    ...over,
  };
}

const alertInactive: StaffAlert = {
  kind: 'inactive',
  severity: 'warning',
  title: 'Inactif',
  description: '',
};
const alertNoDiscord: StaffAlert = {
  kind: 'no_discord',
  severity: 'warning',
  title: 'Discord non lié',
  description: '',
};

describe('effectiveAlertStatus', () => {
  it('vaut open sans décision', () => {
    expect(effectiveAlertStatus(null, NOW)).toBe('open');
  });

  it('rend le statut persisté', () => {
    expect(effectiveAlertStatus(action({ status: 'ignored' }), NOW)).toBe('ignored');
  });

  it('rouvre un snooze expiré', () => {
    const expired = action({
      status: 'snoozed',
      snooze_until: '2026-07-20T00:00:00Z',
    });
    expect(effectiveAlertStatus(expired, NOW)).toBe('open');
  });

  it('garde un snooze encore actif', () => {
    const active = action({
      status: 'snoozed',
      snooze_until: '2026-07-30T00:00:00Z',
    });
    expect(effectiveAlertStatus(active, NOW)).toBe('snoozed');
  });
});

describe('isAlertMuted', () => {
  it('open / in_progress ne sont pas en sourdine', () => {
    expect(isAlertMuted(null, NOW)).toBe(false);
    expect(isAlertMuted(action({ status: 'in_progress' }), NOW)).toBe(false);
  });

  it('ignored / resolved / snoozed actif sont en sourdine', () => {
    expect(isAlertMuted(action({ status: 'ignored' }), NOW)).toBe(true);
    expect(isAlertMuted(action({ status: 'resolved' }), NOW)).toBe(true);
    expect(
      isAlertMuted(
        action({ status: 'snoozed', snooze_until: '2026-07-30T00:00:00Z' }),
        NOW,
      ),
    ).toBe(true);
  });
});

describe('activeAlerts', () => {
  it('exclut les alertes en sourdine, garde les actives', () => {
    const actions = indexAlertActions([
      action({ kind: 'inactive', status: 'ignored' }),
    ]);
    const active = activeAlerts([alertInactive, alertNoDiscord], actions, NOW);
    expect(active).toHaveLength(1);
    expect(active[0].kind).toBe('no_discord');
  });

  it('compte tout comme actif sans aucune décision', () => {
    const active = activeAlerts(
      [alertInactive, alertNoDiscord],
      indexAlertActions([]),
      NOW,
    );
    expect(active).toHaveLength(2);
  });
});

describe('resolveAlerts', () => {
  it('associe chaque alerte à sa décision et son statut effectif', () => {
    const resolved = resolveAlerts(
      [alertInactive],
      indexAlertActions([action({ kind: 'inactive', status: 'in_progress' })]),
      NOW,
    );
    expect(resolved[0].status).toBe('in_progress');
    expect(resolved[0].muted).toBe(false);
  });
});
