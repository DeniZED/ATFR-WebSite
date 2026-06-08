import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
const HISTORY_FILE = join(DATA_DIR, 'voice-history.json');

const RETENTION_DAYS = 30;
const RETENTION_MS = RETENTION_DAYS * 86_400_000;
const MIN_SESSION_SECONDS = 5; // ignore very short blips (accidental joins)

interface CompletedSession {
  userId: string;
  username: string;
  channelName: string;
  joinedAt: number;
  leftAt: number;
  durationSeconds: number;
}

interface OpenSession {
  username: string;
  channelName: string;
  joinedAt: number;
}

let sessions: CompletedSession[] = [];
const open = new Map<string, OpenSession>();
let dirty = false;

// ── Persistance locale (data/voice-history.json) ────────────────────────────

function load(): void {
  try {
    if (existsSync(HISTORY_FILE)) {
      sessions = JSON.parse(readFileSync(HISTORY_FILE, 'utf8')) as CompletedSession[];
      prune();
    }
  } catch {
    sessions = [];
  }
}

function persist(): void {
  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(HISTORY_FILE, JSON.stringify(sessions), 'utf8');
  } catch {
    /* disque indisponible — on continue en mémoire */
  }
}

function prune(): void {
  const cutoff = Date.now() - RETENTION_MS;
  const before = sessions.length;
  sessions = sessions.filter((s) => s.leftAt >= cutoff);
  if (sessions.length !== before) dirty = true;
}

function closeSession(userId: string, leftAt: number): void {
  const session = open.get(userId);
  if (!session) return;
  open.delete(userId);

  const durationSeconds = Math.max(0, Math.round((leftAt - session.joinedAt) / 1000));
  if (durationSeconds < MIN_SESSION_SECONDS) return;

  sessions.push({
    userId,
    username: session.username,
    channelName: session.channelName,
    joinedAt: session.joinedAt,
    leftAt,
    durationSeconds,
  });
  dirty = true;
}

// ── API d'enregistrement (appelée depuis bot.ts) ────────────────────────────

export function recordJoin(userId: string, username: string, channelName: string): void {
  open.set(userId, { username, channelName, joinedAt: Date.now() });
}

export function recordMove(userId: string, username: string, channelName: string): void {
  const now = Date.now();
  closeSession(userId, now);
  open.set(userId, { username, channelName, joinedAt: now });
}

export function recordLeave(userId: string): void {
  closeSession(userId, Date.now());
}

export function startVoiceHistory(): void {
  load();
  setInterval(() => {
    prune();
    if (dirty) {
      persist();
      dirty = false;
    }
  }, 60_000);
}

export function flushVoiceHistory(): void {
  prune();
  persist();
}

// ── Agrégations pour le tableau de bord ─────────────────────────────────────

export interface PlayerVoiceTotal {
  userId: string;
  username: string;
  totalSeconds: number;
  sessionCount: number;
}

export interface DayVoiceBreakdown {
  date: string;
  totalSeconds: number;
  players: Array<{ userId: string; username: string; seconds: number }>;
}

export function getPlayerTotals(days: number): PlayerVoiceTotal[] {
  const cutoff = Date.now() - days * 86_400_000;
  const totals = new Map<string, PlayerVoiceTotal>();
  for (const s of sessions) {
    if (s.leftAt < cutoff) continue;
    const current = totals.get(s.userId) ?? {
      userId: s.userId,
      username: s.username,
      totalSeconds: 0,
      sessionCount: 0,
    };
    current.totalSeconds += s.durationSeconds;
    current.sessionCount += 1;
    current.username = s.username;
    totals.set(s.userId, current);
  }
  return [...totals.values()].sort((a, b) => b.totalSeconds - a.totalSeconds);
}

export function getDailyBreakdown(days: number): DayVoiceBreakdown[] {
  const cutoff = Date.now() - days * 86_400_000;
  const byDay = new Map<string, Map<string, { username: string; seconds: number }>>();
  for (const s of sessions) {
    if (s.leftAt < cutoff) continue;
    const date = new Date(s.leftAt).toISOString().slice(0, 10);
    const dayMap = byDay.get(date) ?? new Map<string, { username: string; seconds: number }>();
    const current = dayMap.get(s.userId) ?? { username: s.username, seconds: 0 };
    current.seconds += s.durationSeconds;
    current.username = s.username;
    dayMap.set(s.userId, current);
    byDay.set(date, dayMap);
  }
  return [...byDay.entries()]
    .map(([date, players]) => ({
      date,
      totalSeconds: [...players.values()].reduce((sum, p) => sum + p.seconds, 0),
      players: [...players.entries()]
        .map(([userId, p]) => ({ userId, username: p.username, seconds: p.seconds }))
        .sort((a, b) => b.seconds - a.seconds),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}
