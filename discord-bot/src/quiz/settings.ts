import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Réglages du quiz, modifiables par les admins via /quiz-admin settings et
// persistés localement (data/quiz-settings.json, ignoré par git).
const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', '..', 'data');
const SETTINGS_FILE = join(DATA_DIR, 'quiz-settings.json');

export interface QuizSettings {
  roundSeconds: number;
  minTier: number;
  optionCount: number;
}

export const DEFAULT_SETTINGS: QuizSettings = {
  roundSeconds: 25,
  minTier: 4,
  optionCount: 4,
};

export const LIMITS = {
  roundSeconds: { min: 5, max: 120 },
  minTier: { min: 1, max: 10 },
  optionCount: { min: 2, max: 4 },
} as const;

let settings: QuizSettings = { ...DEFAULT_SETTINGS };
let loaded = false;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function sanitize(raw: Partial<QuizSettings>): QuizSettings {
  return {
    roundSeconds:
      raw.roundSeconds != null
        ? clamp(raw.roundSeconds, LIMITS.roundSeconds.min, LIMITS.roundSeconds.max)
        : DEFAULT_SETTINGS.roundSeconds,
    minTier:
      raw.minTier != null ? clamp(raw.minTier, LIMITS.minTier.min, LIMITS.minTier.max) : DEFAULT_SETTINGS.minTier,
    optionCount:
      raw.optionCount != null
        ? clamp(raw.optionCount, LIMITS.optionCount.min, LIMITS.optionCount.max)
        : DEFAULT_SETTINGS.optionCount,
  };
}

function load(): void {
  if (loaded) return;
  loaded = true;
  try {
    if (existsSync(SETTINGS_FILE)) {
      const raw = JSON.parse(readFileSync(SETTINGS_FILE, 'utf8')) as Partial<QuizSettings>;
      settings = sanitize(raw);
    }
  } catch {
    settings = { ...DEFAULT_SETTINGS };
  }
}

function persist(): void {
  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(SETTINGS_FILE, JSON.stringify(settings), 'utf8');
  } catch {
    /* disque indisponible — on continue en mémoire */
  }
}

export function getSettings(): QuizSettings {
  load();
  return { ...settings };
}

/** Applique les champs fournis (les autres restent inchangés) et renvoie l'état final. */
export function updateSettings(patch: Partial<QuizSettings>): QuizSettings {
  load();
  settings = sanitize({ ...settings, ...patch });
  persist();
  return { ...settings };
}
