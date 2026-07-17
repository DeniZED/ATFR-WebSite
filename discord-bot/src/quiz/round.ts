import { getVehicleIndex, type VehicleSummary } from '../tankopedia/client.js';

export interface QuizRound {
  answer: VehicleSummary;
  options: VehicleSummary[]; // contient la réponse, mélangé
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Prépare un tour de quiz : un char à deviner + (optionCount-1) leurres.
 * Les leurres sont choisis en priorité dans le même type de char (pour que ce
 * ne soit pas trop évident), puis complétés au hasard. Tous les noms sont
 * distincts. Le pool est limité aux chars de tier ≥ 4 (plus reconnaissables).
 */
export async function buildQuizRound(optionCount = 4, minTier = 4): Promise<QuizRound | null> {
  const index = await getVehicleIndex();
  const pool = index.filter((v) => v.tier >= minTier && v.name.trim().length > 0);
  if (pool.length < optionCount) return null;

  const answer = pool[Math.floor(Math.random() * pool.length)];
  const answerName = answer.name.toLowerCase();

  const distinct = (v: VehicleSummary) =>
    v.tankId !== answer.tankId && v.name.toLowerCase() !== answerName;
  const sameType = pool.filter((v) => distinct(v) && v.type === answer.type);
  const anyOther = pool.filter(distinct);
  const decoyPool = shuffle(sameType.length >= optionCount - 1 ? sameType : anyOther);

  const usedNames = new Set<string>([answerName]);
  const decoys: VehicleSummary[] = [];
  for (const v of decoyPool) {
    if (decoys.length >= optionCount - 1) break;
    const name = v.name.toLowerCase();
    if (usedNames.has(name)) continue;
    usedNames.add(name);
    decoys.push(v);
  }
  if (decoys.length < optionCount - 1) return null;

  return { answer, options: shuffle([answer, ...decoys]) };
}
