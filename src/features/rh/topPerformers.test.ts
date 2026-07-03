import { describe, it, expect } from 'vitest';
import type { PlayerActivitySummary } from './activity';
import { computeTopPerformers } from './topPerformers';

// Résumés minimaux : seuls les champs lus par computeTopPerformers sont
// renseignés (player.status, score.value, battleDelta, voiceSeconds).
function summary(over: {
  name: string;
  status?: string;
  score?: number;
  battleDelta?: number | null;
  voiceSeconds?: number;
}): PlayerActivitySummary {
  return {
    player: { id: over.name, nickname: over.name, status: over.status ?? 'active' },
    score: { value: over.score ?? 0 },
    battleDelta: over.battleDelta ?? null,
    voiceSeconds: over.voiceSeconds ?? 0,
  } as unknown as PlayerActivitySummary;
}

describe('computeTopPerformers', () => {
  it('exclut les anciens membres de tous les classements', () => {
    const rankings = computeTopPerformers([
      summary({ name: 'actif', score: 10, battleDelta: 5, voiceSeconds: 60 }),
      summary({ name: 'parti', status: 'former', score: 99, battleDelta: 99, voiceSeconds: 9999 }),
    ]);
    for (const r of rankings) {
      expect(r.rows.map((row) => row.summary.player.nickname)).toEqual(['actif']);
    }
  });

  it('trie par valeur décroissante et limite au top 5', () => {
    const players = Array.from({ length: 7 }, (_, i) =>
      summary({ name: `p${i}`, score: i, battleDelta: i + 1, voiceSeconds: (i + 1) * 60 }),
    );
    const [byScore, byBattles, byVoice] = computeTopPerformers(players);
    expect(byScore.rows).toHaveLength(5);
    expect(byScore.rows[0].summary.player.nickname).toBe('p6');
    expect(byBattles.rows[0].value).toBe('7 bataille(s)');
    expect(byVoice.rows).toHaveLength(5);
  });

  it('ignore les joueurs sans batailles ou sans vocal dans les classements dédiés', () => {
    const [byScore, byBattles, byVoice] = computeTopPerformers([
      summary({ name: 'muet', score: 5, battleDelta: 0, voiceSeconds: 0 }),
      summary({ name: 'joueur', score: 1, battleDelta: 2, voiceSeconds: 120 }),
    ]);
    expect(byScore.rows).toHaveLength(2);
    expect(byBattles.rows.map((r) => r.summary.player.nickname)).toEqual(['joueur']);
    expect(byVoice.rows.map((r) => r.summary.player.nickname)).toEqual(['joueur']);
  });
});
