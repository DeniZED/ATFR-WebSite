import { describe, it, expect } from 'vitest';
import type { PlayerActivitySummary } from './activity';
import { playersToCsv } from './export';

function summary(over: Record<string, unknown>): PlayerActivitySummary {
  return {
    player: {
      nickname: 'Joueur;X',
      status: 'active',
      current_clan_tag: 'ATFR',
      account_id: 123,
    },
    discordLink: { discord_tag: 'user#1' },
    score: { value: 72, label: 'Actif' },
    battleDelta: 40,
    voiceSeconds: 3600,
    activeDays: 12,
    alerts: [],
    dataQuality: { label: 'Complète' },
    latestWotActivityAt: '2026-07-20T10:00:00Z',
    ...over,
  } as unknown as PlayerActivitySummary;
}

describe('playersToCsv', () => {
  it('produit un en-tête + une ligne par joueur', () => {
    const csv = playersToCsv([summary({})]);
    const lines = csv.split('\r\n');
    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain('Pseudo');
    expect(lines[0]).toContain('Fiabilite');
  });

  it('échappe les valeurs contenant le séparateur', () => {
    const csv = playersToCsv([summary({})]);
    // "Joueur;X" doit être entre guillemets pour ne pas casser les colonnes.
    expect(csv).toContain('"Joueur;X"');
  });

  it('convertit le vocal en minutes', () => {
    const csv = playersToCsv([summary({ voiceSeconds: 5400 })]); // 90 min
    expect(csv.split('\r\n')[1]).toContain(';90;');
  });
});
