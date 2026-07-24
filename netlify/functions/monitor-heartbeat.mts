import type { Config } from '@netlify/functions';

/**
 * Surveillance légère de la stack auto-hébergée, avec alerte Discord.
 *
 * Deux niveaux de détection complémentaires :
 *
 *  1. Panne de dépendance (Supabase injoignable) alors que l'API tourne :
 *     détectée ICI, et signalée sur Discord **au changement d'état seulement**
 *     (panne → 🔴, rétablissement → 🟢), jamais en boucle.
 *
 *  2. Panne TOTALE (VPS/API à terre — ex. après un reboot sans redémarrage) :
 *     un process mort ne peut pas s'alerter lui-même. On envoie donc un
 *     « heartbeat » à un service dead-man externe (ex. Healthchecks.io, gratuit,
 *     intégration Discord native) : tant que l'API vit, elle ping ; si les pings
 *     s'arrêtent, le service externe alerte. C'est le SEUL moyen de couvrir une
 *     panne totale.
 *
 * Variables (toutes optionnelles — chaque volet se désactive proprement s'il
 * manque sa config, comme les autres fonctions) :
 *   - DISCORD_MONITOR_WEBHOOK_URL (repli : DISCORD_RH_ALERTS_WEBHOOK_URL)
 *   - MONITOR_HEARTBEAT_URL  (URL de ping Healthchecks.io ou équivalent)
 */

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const WEBHOOK_URL =
  process.env.DISCORD_MONITOR_WEBHOOK_URL ||
  process.env.DISCORD_RH_ALERTS_WEBHOOK_URL;
const HEARTBEAT_URL = process.env.MONITOR_HEARTBEAT_URL;
const SITE_URL = process.env.VITE_SITE_URL || process.env.SITE_URL;

// État conservé entre deux exécutions (le serveur d'API est un process
// long-vécu : les variables de module survivent d'un tick cron au suivant).
let lastHealthy: boolean | null = null;

async function checkSupabase(): Promise<boolean> {
  if (!SUPABASE_URL) return true; // rien à vérifier
  try {
    // Endpoint de santé GoTrue — 200 sans authentification requise.
    const res = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
      signal: AbortSignal.timeout(10_000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function pingHeartbeat(healthy: boolean): Promise<void> {
  if (!HEARTBEAT_URL) return;
  // Convention Healthchecks.io : /ping en succès, /ping/fail en échec.
  const url = healthy ? HEARTBEAT_URL : `${HEARTBEAT_URL.replace(/\/$/, '')}/fail`;
  try {
    await fetch(url, { method: 'POST', signal: AbortSignal.timeout(10_000) });
  } catch {
    // best-effort : ne jamais faire échouer le monitoring sur le ping
  }
}

async function notifyDiscord(healthy: boolean): Promise<void> {
  if (!WEBHOOK_URL) return;
  const content = healthy
    ? `🟢 **Site rétabli** — l'API et Supabase répondent de nouveau.${
        SITE_URL ? ` (${SITE_URL})` : ''
      }`
    : `🔴 **Alerte site** — Supabase est injoignable depuis l'API. Le site peut être dégradé (données indisponibles). Vérifie le VPS / Supabase.${
        SITE_URL ? ` (${SITE_URL})` : ''
      }`;
  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ content }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch (err) {
    console.error('[monitor] webhook failed:', err instanceof Error ? err.message : err);
  }
}

export default async function handler(): Promise<void> {
  const healthy = await checkSupabase();

  // Dead-man : ping à chaque exécution (succès/échec).
  await pingHeartbeat(healthy);

  // Discord : uniquement au changement d'état (pas de spam).
  if (lastHealthy !== null && healthy !== lastHealthy) {
    await notifyDiscord(healthy);
  } else if (lastHealthy === null && !healthy) {
    // Premier tick déjà en panne → on prévient d'emblée.
    await notifyDiscord(false);
  }

  lastHealthy = healthy;
}

// Toutes les 5 minutes.
export const config: Config = {
  schedule: '*/5 * * * *',
};
