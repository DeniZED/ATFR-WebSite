import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { config as loadEnv } from 'dotenv';
import {
  Client,
  GatewayIntentBits,
  Events,
  type VoiceState,
  type GuildMember,
} from 'discord.js';
import cron from 'node-cron';

// Charge le .env situé à la racine du projet (dist/bot.js → ../.env)
const __dirname = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: join(__dirname, '..', '.env') });

// ── Config ──────────────────────────────────────────────────────────────────

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILD_ID;
const SITE_URL = (process.env.SITE_URL ?? '').replace(/\/$/, '');
const SYNC_SECRET = process.env.DISCORD_SYNC_SECRET;
const SYNC_CRON = process.env.SYNC_CRON ?? '0 3 * * *';
const DEBUG = process.env.DEBUG === 'true';

if (!BOT_TOKEN) throw new Error('DISCORD_BOT_TOKEN is required');
if (!SITE_URL) throw new Error('SITE_URL is required');
if (!SYNC_SECRET) throw new Error('DISCORD_SYNC_SECRET is required');

const VOICE_EVENT_URL = `${SITE_URL}/.netlify/functions/discord-voice-event`;
const SYNC_URL = `${SITE_URL}/.netlify/functions/discord-sync-members`;

// ── Helpers ─────────────────────────────────────────────────────────────────

function log(...args: unknown[]): void {
  console.log(`[${new Date().toISOString()}]`, ...args);
}

function debug(...args: unknown[]): void {
  if (DEBUG) log('[DEBUG]', ...args);
}

async function postJson(url: string, body: unknown, retries = 3): Promise<void> {
  for (let attempt = 0; attempt < retries; attempt++) {
    if (attempt > 0) await sleep(500 * 2 ** (attempt - 1));
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-sync-secret': SYNC_SECRET!,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15_000),
      });
      if (res.ok) return;
      const text = await res.text().catch(() => '');
      log(`[WARN] POST ${url} → ${res.status}${text ? `: ${text}` : ''}`);
      if (res.status < 500) return; // 4xx — no retry
    } catch (err) {
      if (attempt === retries - 1) log('[ERROR] POST failed after retries:', err);
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Voice event handler ──────────────────────────────────────────────────────

function detectVoiceEvent(
  oldState: VoiceState,
  newState: VoiceState,
): 'join' | 'leave' | 'move' | null {
  const wasIn = oldState.channelId !== null;
  const isIn = newState.channelId !== null;
  if (!wasIn && isIn) return 'join';
  if (wasIn && !isIn) return 'leave';
  if (wasIn && isIn && oldState.channelId !== newState.channelId) return 'move';
  return null; // mute/deafen/stream — ignore
}

async function handleVoiceStateUpdate(
  oldState: VoiceState,
  newState: VoiceState,
): Promise<void> {
  const eventType = detectVoiceEvent(oldState, newState);
  if (!eventType) return;

  const userId = newState.member?.id ?? oldState.member?.id;
  if (!userId) return;

  const activeState = eventType === 'leave' ? oldState : newState;
  const payload = {
    discord_user_id: userId,
    guild_id: newState.guild.id,
    channel_id: activeState.channelId,
    channel_name: activeState.channel?.name ?? null,
    event: eventType,
    occurred_at: new Date().toISOString(),
  };

  debug(`Voice ${eventType}: ${newState.member?.user.username} → ${activeState.channel?.name ?? 'none'}`);
  await postJson(VOICE_EVENT_URL, payload);
}

// ── Member join/leave → trigger a fresh sync ────────────────────────────────

let syncDebounceTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleMemberSync(reason: string): void {
  if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
  // Debounce: wait 10 s in case several members join/leave at once
  syncDebounceTimer = setTimeout(() => {
    syncDebounceTimer = null;
    log(`[SYNC] Triggering member sync (reason: ${reason})`);
    triggerFullSync().catch((err) => log('[ERROR] Sync failed:', err));
  }, 10_000);
}

async function triggerFullSync(): Promise<void> {
  const url = new URL(SYNC_URL);
  if (GUILD_ID) url.searchParams.set('guild_id', GUILD_ID);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'x-sync-secret': SYNC_SECRET! },
    signal: AbortSignal.timeout(60_000),
  });
  if (res.ok) {
    const data = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    log(`[SYNC] Done:`, data ?? '(no body)');
  } else {
    const text = await res.text().catch(() => '');
    log(`[SYNC] Failed (${res.status}):`, text);
  }
}

// ── Bot setup ────────────────────────────────────────────────────────────────

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.once(Events.ClientReady, (c) => {
  log(`Bot connecté : ${c.user.tag}`);
  log(`Serveur cible : ${GUILD_ID ?? '(tous)'}`);
  log(`Cron sync membres : ${SYNC_CRON}`);

  // Scheduled full sync (configure via SYNC_CRON env var)
  cron.schedule(SYNC_CRON, () => {
    log('[CRON] Lancement sync membres planifiée');
    triggerFullSync().catch((err) => log('[ERROR] Cron sync failed:', err));
  });
});

client.on(Events.VoiceStateUpdate, (oldState, newState) => {
  if (GUILD_ID && newState.guild.id !== GUILD_ID) return;
  handleVoiceStateUpdate(oldState, newState).catch((err) =>
    log('[ERROR] VoiceStateUpdate failed:', err),
  );
});

client.on(Events.GuildMemberAdd, (member: GuildMember) => {
  if (GUILD_ID && member.guild.id !== GUILD_ID) return;
  log(`[MEMBER] Arrivée : ${member.user.username}`);
  scheduleMemberSync(`${member.user.username} a rejoint`);
});

client.on(Events.GuildMemberRemove, (member) => {
  if (GUILD_ID && member.guild.id !== GUILD_ID) return;
  log(`[MEMBER] Départ : ${member.user.username}`);
  scheduleMemberSync(`${member.user.username} a quitté`);
});

// Graceful shutdown
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    log(`Arrêt du bot (${signal})`);
    client.destroy();
    process.exit(0);
  });
}

process.on('unhandledRejection', (err) => {
  log('[ERROR] unhandledRejection:', err);
});

client.login(BOT_TOKEN);
