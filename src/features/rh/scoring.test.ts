import { describe, it, expect } from 'vitest';
import type {
  DiscordVoiceSessionRow,
  PlayerActivitySnapshotRow,
  PlayerDiscordLinkRow,
  PlayerRow,
} from '@/types/database';
import {
  clippedVoiceSeconds,
  computeActivityScore,
  computeDataQuality,
  makeRollingPeriod,
  voiceOverlapsPeriod,
} from './activity';
import { classifyPlayer, matchesScope } from './perimeter';

const NOW = new Date('2026-07-24T12:00:00.000Z');
const period = makeRollingPeriod(30, NOW);

function session(over: Partial<DiscordVoiceSessionRow>): DiscordVoiceSessionRow {
  return {
    id: 'x',
    joined_at: '2026-07-20T10:00:00.000Z',
    left_at: '2026-07-20T11:00:00.000Z',
    duration_seconds: 3600,
    channel_id: 'c',
    channel_name: 'Salon',
    player_id: 'p',
    discord_user_id: 'd',
    ...over,
  } as unknown as DiscordVoiceSessionRow;
}

describe('computeActivityScore', () => {
  const base = {
    period,
    latestWotActivityAt: NOW.toISOString(),
    battles: 90,
    previousBattles: 90,
    voiceSeconds: 10 * 3600,
    previousVoiceSeconds: 10 * 3600,
    activeDays: 30,
    previousActiveDays: 30,
    hasSnapshots: true,
    hasDiscordLink: true,
  };

  it('reste borné 0..100 et expose 5 composantes', () => {
    const score = computeActivityScore(base);
    expect(score.value).toBeGreaterThanOrEqual(0);
    expect(score.value).toBeLessThanOrEqual(100);
    expect(score.components.map((c) => c.key)).toEqual([
      'recency',
      'battles',
      'voice',
      'regularity',
      'trend',
    ]);
    // La somme des max des composantes fait 100 (20+20+25+20+15).
    expect(score.components.reduce((s, c) => s + c.max, 0)).toBe(100);
  });

  it('signale les données manquantes sans écraser le score en silence', () => {
    const score = computeActivityScore({
      ...base,
      latestWotActivityAt: null,
      hasSnapshots: false,
      hasDiscordLink: false,
    });
    expect(score.missingData).toContain('Aucune activité WoT connue');
    expect(score.missingData).toContain('Aucun snapshot WoT sur la période');
    expect(score.missingData).toContain('Discord non lié (vocal non mesurable)');
  });

  it('note une forte baisse dans les raisons', () => {
    const score = computeActivityScore({
      ...base,
      activeDays: 2,
      voiceSeconds: 0,
      battles: 5,
    });
    expect(score.trend.direction).toBe('down');
    expect(score.reasons.some((r) => r.toLowerCase().includes('baisse'))).toBe(
      true,
    );
  });

  it('ne plafonne pas un joueur actif récemment', () => {
    // base : dernière activité = NOW, stats au max → très actif, non plafonné.
    const score = computeActivityScore(base);
    expect(score.value).toBeGreaterThanOrEqual(80);
    expect(score.level).toBe('very_active');
    expect(score.reasons.some((r) => r.includes('plafonné'))).toBe(false);
  });

  it('plafonne à « faible » un joueur inactif au-delà du seuil d’alerte', () => {
    // Dernière activité il y a ~20 j (> 14, ≤ 30) malgré un fort volume passé.
    const score = computeActivityScore({
      ...base,
      latestWotActivityAt: '2026-07-04T12:00:00.000Z',
    });
    expect(score.value).toBeLessThanOrEqual(49);
    expect(score.level).toBe('low');
    expect(score.reasons.some((r) => r.includes('plafonné'))).toBe(true);
  });

  it('plafonne à « inactif » au-delà du seuil danger', () => {
    // Dernière activité il y a ~45 j (> 30) → inactif quel que soit le volume.
    const score = computeActivityScore({
      ...base,
      latestWotActivityAt: '2026-06-09T12:00:00.000Z',
    });
    expect(score.value).toBeLessThanOrEqual(24);
    expect(score.level).toBe('inactive');
  });

  it('plafonne à « inactif » sans aucune activité connue', () => {
    const score = computeActivityScore({ ...base, latestWotActivityAt: null });
    expect(score.value).toBeLessThanOrEqual(24);
    expect(score.level).toBe('inactive');
  });
});

describe('clippedVoiceSeconds', () => {
  it('découpe une session qui déborde de la période', () => {
    // Session 2 h dont seule 1 h tombe avant `to`.
    const to = new Date('2026-07-20T10:30:00.000Z');
    const from = new Date('2026-07-01T00:00:00.000Z');
    const { seconds } = clippedVoiceSeconds(
      [session({ joined_at: '2026-07-20T10:00:00.000Z', left_at: '2026-07-20T12:00:00.000Z' })],
      from,
      to,
      NOW,
    );
    expect(seconds).toBe(1800); // 30 min de chevauchement
  });

  it('borne une session ouverte et la signale', () => {
    const from = new Date('2026-07-24T00:00:00.000Z');
    const to = new Date('2026-07-24T23:59:59.000Z');
    const { seconds, hasOpen } = clippedVoiceSeconds(
      [session({ joined_at: '2026-07-24T11:00:00.000Z', left_at: null })],
      from,
      to,
      NOW,
    );
    expect(hasOpen).toBe(true);
    expect(seconds).toBe(3600); // 11h → maintenant (12h) = 1 h
  });

  it('voiceOverlapsPeriod inclut une session commencée avant la borne', () => {
    const from = new Date('2026-07-20T10:30:00.000Z');
    const to = new Date('2026-07-20T12:00:00.000Z');
    expect(
      voiceOverlapsPeriod(
        session({ joined_at: '2026-07-20T10:00:00.000Z', left_at: '2026-07-20T11:00:00.000Z' }),
        from,
        to,
        NOW,
      ),
    ).toBe(true);
  });
});

describe('computeDataQuality', () => {
  const player = { account_id: 123 } as unknown as PlayerRow;
  const link = { discord_user_id: 'd' } as unknown as PlayerDiscordLinkRow;
  const snap = {
    snapshot_date: '2026-07-24',
    battles_delta: 3,
    active_day: true,
  } as unknown as PlayerActivitySnapshotRow;

  it('complete quand tout est présent et frais', () => {
    const q = computeDataQuality({
      player,
      discordLink: link,
      snapshots: Array.from({ length: 20 }, () => snap),
      voiceSessions: [session({})],
      period,
      now: NOW,
    });
    expect(q.level).toBe('complete');
  });

  it('low quand aucune source (ni WoT ni Discord)', () => {
    const q = computeDataQuality({
      player: { account_id: null } as unknown as PlayerRow,
      discordLink: null,
      snapshots: [],
      voiceSessions: [],
      period,
      now: NOW,
    });
    expect(q.level).toBe('low');
    expect(q.reasons).toContain('Compte WoT non lié');
  });

  it('partial quand une session vocale est restée ouverte', () => {
    const q = computeDataQuality({
      player,
      discordLink: link,
      snapshots: Array.from({ length: 20 }, () => snap),
      voiceSessions: [session({ left_at: null })],
      period,
      now: NOW,
    });
    expect(q.level).toBe('partial');
    expect(q.reasons.some((r) => r.includes('ouverte'))).toBe(true);
  });
});

describe('perimeter', () => {
  it('classe correctement current / prospect / former', () => {
    expect(classifyPlayer({ status: 'active' })).toBe('current');
    expect(classifyPlayer({ status: 'watch' })).toBe('current');
    expect(classifyPlayer({ status: 'prospect' })).toBe('prospect');
    expect(classifyPlayer({ status: 'former' })).toBe('former');
  });

  it('le scope "current" exclut prospects et anciens', () => {
    expect(matchesScope('current', 'current')).toBe(true);
    expect(matchesScope('prospect', 'current')).toBe(false);
    expect(matchesScope('former', 'current')).toBe(false);
    expect(matchesScope('former', 'all')).toBe(true);
  });
});
