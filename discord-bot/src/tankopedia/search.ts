import type { VehicleSummary } from './client.js';

/** Minuscule + suppression des accents/diacritiques. */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

/** Forme compacte : normalisée puis sans rien d'autre que lettres/chiffres. */
export function compact(s: string): string {
  return normalize(s).replace(/[^a-z0-9]/g, '');
}

/** Distance de Levenshtein (édition) entre deux chaînes courtes. */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  let curr = new Array<number>(b.length + 1);
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[b.length];
}

interface Scored {
  v: VehicleSummary;
  bucket: number; // 0 = meilleur
  dist: number;
  nameLen: number;
}

/**
 * Classe les véhicules par pertinence pour une requête, en tolérant les
 * accents, la ponctuation, les espaces et les petites fautes de frappe.
 * Buckets : short exact → nom exact → préfixe → sous-chaîne → approché (fuzzy).
 */
export function rankVehicles(index: VehicleSummary[], query: string): VehicleSummary[] {
  const cq = compact(query);
  if (cq.length === 0) return [];
  const fuzzyThreshold = cq.length <= 4 ? 1 : 2;

  const scored: Scored[] = [];
  for (const v of index) {
    const cs = compact(v.shortName);
    const cn = compact(v.name);

    let bucket = Number.POSITIVE_INFINITY;
    let dist = 0;
    if (cq === cs) bucket = 0;
    else if (cq === cn) bucket = 1;
    else if (cs.startsWith(cq) || cn.startsWith(cq)) bucket = 2;
    else if (cs.includes(cq) || cn.includes(cq)) bucket = 3;
    else if (cq.length >= 3) {
      const d = Math.min(levenshtein(cq, cs), levenshtein(cq, cn));
      if (d <= fuzzyThreshold) {
        bucket = 4;
        dist = d;
      }
    }

    if (Number.isFinite(bucket)) scored.push({ v, bucket, dist, nameLen: v.name.length });
  }

  scored.sort(
    (a, b) => a.bucket - b.bucket || a.dist - b.dist || a.nameLen - b.nameLen || b.v.tier - a.v.tier,
  );
  return scored.map((s) => s.v);
}

export const TANKS_GG_LIST_URL = 'https://tanks.gg/list';

/**
 * Message d'échec de recherche, avec suggestions « tu voulais dire… ? » et un
 * lien vers la liste tanks.gg (utile pour les chars absents de l'API WG mais
 * présents sur tanks.gg, qui lit les fichiers du jeu).
 */
export function notFoundMessage(query: string, suggestions: VehicleSummary[]): string {
  const base = `❌ Aucun char trouvé pour **${query}**.`;
  const hint = suggestions.length
    ? `\n💡 Tu voulais dire : ${suggestions.map((v) => `**${v.name}**`).join(' · ')} ?`
    : '';
  return `${base}${hint}\n🔎 Voir la liste complète (dont chars absents de l’API WG) : <${TANKS_GG_LIST_URL}>`;
}

/**
 * Renvoie les N chars dont le nom est le plus proche de la requête, sans seuil
 * — utilisé pour proposer « tu voulais dire… ? » quand aucune correspondance
 * n'est trouvée.
 */
export function nearestVehicles(index: VehicleSummary[], query: string, limit = 3): VehicleSummary[] {
  const cq = compact(query);
  if (cq.length === 0) return [];
  return index
    .map((v) => ({
      v,
      d: Math.min(levenshtein(cq, compact(v.shortName)), levenshtein(cq, compact(v.name))),
    }))
    .sort((a, b) => a.d - b.d || b.v.tier - a.v.tier)
    .slice(0, limit)
    .map((x) => x.v);
}
