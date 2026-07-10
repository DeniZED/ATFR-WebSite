import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import { WN8_TIERS } from '../lib/wn8-scale';

// Garde anti-divergence P1-11 : le bot Discord garde une copie miroir du
// barème WN8 (`discord-bot/src/clan/wn8.ts`) car son tsconfig
// (`rootDir: "src"`) ne peut pas importer le module canonique
// `src/lib/wn8-scale.ts`. Ce test lit le fichier du bot et échoue si les
// paliers ou libellés s'écartent du barème canonique — la divergence
// silencieuse redoutée par l'audit devient une erreur de CI.

const BOT_WN8_PATH = resolve(__dirname, '../../discord-bot/src/clan/wn8.ts');

function readBotSource(): string {
  return readFileSync(BOT_WN8_PATH, 'utf8');
}

function extractPairs(source: string, arrayName: string): Array<[number, string]> {
  const block = source.match(
    new RegExp(`const ${arrayName}[^=]*=\\s*\\[([\\s\\S]*?)\\];`),
  );
  expect(block, `tableau ${arrayName} introuvable dans wn8.ts du bot`).not.toBeNull();
  return [...block![1].matchAll(/\[(\d+),\s*(?:'([^']*)'|0x[0-9a-fA-F]+)\]/g)].map(
    (m) => [Number(m[1]), m[2] ?? ''],
  );
}

describe('parité du barème WN8 site ↔ bot Discord', () => {
  const canonicalBounded = WN8_TIERS.filter(
    (tier): tier is { max: number; label: string } => tier.max != null,
  );

  it('le bot utilise les mêmes paliers de libellés et les mêmes libellés', () => {
    const botLabels = extractPairs(readBotSource(), 'LABELS');
    expect(botLabels.map(([max]) => max)).toEqual(canonicalBounded.map((t) => t.max));
    expect(botLabels.map(([, label]) => label)).toEqual(
      canonicalBounded.map((t) => t.label),
    );
  });

  it('le libellé du palier ouvert correspond', () => {
    const openLabel = WN8_TIERS[WN8_TIERS.length - 1].label;
    expect(readBotSource()).toContain(`DEFAULT_LABEL = '${openLabel}'`);
  });

  it('les couleurs du bot suivent les mêmes paliers', () => {
    const botColors = extractPairs(readBotSource(), 'COLORS');
    expect(botColors.map(([max]) => max)).toEqual(canonicalBounded.map((t) => t.max));
  });
});
