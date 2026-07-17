// Rendu générique d'un tableau comparatif à deux colonnes (A vs B), partagé
// par /compare (chars) et /versus (joueurs). Chaque ligne indique le vainqueur
// (◀ = A, ▶ = B, = égalité) et le rendu renvoie le décompte des victoires.

export interface CompareRow {
  label: string;
  a: number | null;
  b: number | null;
  better: 'high' | 'low';
  render: (n: number) => string;
}

type Winner = 'a' | 'b' | 'tie' | 'none';

function rowWinner(row: CompareRow): Winner {
  if (row.a == null || row.b == null) return 'none';
  if (row.a === row.b) return 'tie';
  const aWins = row.better === 'high' ? row.a > row.b : row.a < row.b;
  return aWins ? 'a' : 'b';
}

export function renderComparisonTable(rows: CompareRow[]): { table: string; aWins: number; bWins: number } {
  const cell = (n: number | null, render: (v: number) => string) => (n == null ? '—' : render(n));
  const labelW = Math.max(...rows.map((r) => r.label.length), 'Caractéristique'.length);
  const aCells = rows.map((r) => cell(r.a, r.render));
  const bCells = rows.map((r) => cell(r.b, r.render));
  const aW = Math.max(...aCells.map((s) => s.length), 1);
  const bW = Math.max(...bCells.map((s) => s.length), 1);

  const marker: Record<Winner, string> = { a: '◀', b: '▶', tie: '=', none: ' ' };
  let aWins = 0;
  let bWins = 0;

  const lines = [`${'Caractéristique'.padEnd(labelW)}   ${'A'.padStart(aW)}   ${'B'.padStart(bW)}`];
  rows.forEach((r, i) => {
    const w = rowWinner(r);
    if (w === 'a') aWins++;
    else if (w === 'b') bWins++;
    lines.push(`${r.label.padEnd(labelW)}   ${aCells[i].padStart(aW)} ${marker[w]} ${bCells[i].padStart(bW)}`);
  });

  return { table: lines.join('\n'), aWins, bWins };
}

export function comparisonVerdict(
  aName: string,
  bName: string,
  aWins: number,
  bWins: number,
  unit = 'ligne(s)',
): string {
  if (aWins === bWins) return `🤝 Match serré — **${aWins}** ${unit} partout.`;
  const [winner, wl, ll] = aWins > bWins ? [aName, aWins, bWins] : [bName, bWins, aWins];
  return `🏆 **${winner}** prend l'avantage (**${wl}** ${unit} à **${ll}**).`;
}

export const fmtInt = (n: number): string => Math.round(n).toLocaleString('fr-FR');
export const fmtDec =
  (digits: number) =>
  (n: number): string =>
    n.toFixed(digits);
