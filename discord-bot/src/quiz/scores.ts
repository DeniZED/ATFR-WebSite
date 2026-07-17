import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Persistance locale (data/quiz-scores.json), même approche que l'historique
// vocal : propre au VPS, ignoré par git. Chargement paresseux au premier accès.
const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', '..', 'data');
const SCORES_FILE = join(DATA_DIR, 'quiz-scores.json');

interface QuizScore {
  userId: string;
  username: string;
  points: number;
}

let scores = new Map<string, QuizScore>();
let loaded = false;

function load(): void {
  if (loaded) return;
  loaded = true;
  try {
    if (existsSync(SCORES_FILE)) {
      const arr = JSON.parse(readFileSync(SCORES_FILE, 'utf8')) as QuizScore[];
      scores = new Map(arr.map((s) => [s.userId, s]));
    }
  } catch {
    scores = new Map();
  }
}

function persist(): void {
  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(SCORES_FILE, JSON.stringify([...scores.values()]), 'utf8');
  } catch {
    /* disque indisponible — on continue en mémoire */
  }
}

/** Incrémente le score d'un joueur d'un point et renvoie son nouveau total. */
export function recordWin(userId: string, username: string): number {
  load();
  const current = scores.get(userId) ?? { userId, username, points: 0 };
  current.points += 1;
  current.username = username;
  scores.set(userId, current);
  persist();
  return current.points;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  points: number;
}

export function getLeaderboard(limit = 10): LeaderboardEntry[] {
  load();
  return [...scores.values()]
    .sort((a, b) => b.points - a.points)
    .slice(0, limit)
    .map((s, i) => ({ rank: i + 1, userId: s.userId, username: s.username, points: s.points }));
}
