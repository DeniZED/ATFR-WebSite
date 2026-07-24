import { describe, it, expect } from 'vitest';
import type { PlayerActivitySummary } from './activity';
import { computeReviewLists, reviewRowValue } from './review';

const NOW = new Date('2026-07-24T12:00:00.000Z').getTime();

function summary(over: {
  id: string;
  status?: string;
  trendPct?: number | null;
  latestWot?: string | null;
  voiceSeconds?: number;
  hasDiscord?: boolean;
  joinedAt?: string | null;
  activeDays?: number;
}): PlayerActivitySummary {
  return {
    player: {
      id: over.id,
      nickname: over.id,
      status: over.status ?? 'active',
      joined_at: over.joinedAt ?? null,
    },
    discordLink: over.hasDiscord === false ? null : { discord_user_id: 'd' },
    latestWotActivityAt: over.latestWot ?? null,
    voiceSeconds: over.voiceSeconds ?? 0,
    activeDays: over.activeDays ?? 0,
    score: { value: 10, trend: { pct: over.trendPct ?? null } },
  } as unknown as PlayerActivitySummary;
}

describe('computeReviewLists', () => {
  it('classe une forte baisse et des inactifs 14j+', () => {
    const lists = computeReviewLists(
      [
        summary({ id: 'chute', trendPct: -60, latestWot: '2026-07-23T12:00:00Z' }),
        summary({ id: 'inactif', latestWot: '2026-07-01T12:00:00Z' }),
        summary({ id: 'ok', latestWot: '2026-07-23T12:00:00Z', voiceSeconds: 3600 }),
      ],
      NOW,
    );
    const byKey = Object.fromEntries(lists.map((l) => [l.key, l.rows]));
    expect(byKey.drop?.map((r) => r.player.id)).toEqual(['chute']);
    expect(byKey.inactive?.map((r) => r.player.id)).toContain('inactif');
  });

  it('détecte joue-sans-vocal et Discord non lié', () => {
    const lists = computeReviewLists(
      [
        summary({ id: 'muet', latestWot: '2026-07-23T12:00:00Z', voiceSeconds: 0 }),
        summary({ id: 'sansDiscord', hasDiscord: false, latestWot: '2026-07-23T12:00:00Z', voiceSeconds: 60 }),
      ],
      NOW,
    );
    const byKey = Object.fromEntries(lists.map((l) => [l.key, l.rows.map((r) => r.player.id)]));
    expect(byKey.game_no_voice).toContain('muet');
    expect(byKey.no_discord).toContain('sansDiscord');
  });

  it('masque les listes vides', () => {
    const lists = computeReviewLists(
      [summary({ id: 'ok', latestWot: '2026-07-23T12:00:00Z', voiceSeconds: 3600 })],
      NOW,
    );
    expect(lists.every((l) => l.rows.length > 0)).toBe(true);
  });

  it('reviewRowValue affiche la métrique adaptée à la liste', () => {
    const s = summary({ id: 'x', trendPct: -52 });
    expect(reviewRowValue('drop', s, NOW)).toBe('-52 %');
  });
});
