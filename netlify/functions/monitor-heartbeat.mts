import type { Config } from '@netlify/functions';

/**
 * Surveillance légère de la stack auto-hébergée, avec alerte Discord.
 *
 * Vérifie à chaque tick DEUX composants :
 *   - Supabase (dépendance données) via son endpoint de santé GoTrue ;
 *   - le site servi par Caddy (le serveur web lui-même) via une requête locale.
 *
 * Deux niveaux de détection complémentaires :
 *
 *  1. Panne d'un composant (Supabase injoignable, OU Caddy à terre) alors que
 *     l'API tourne encore : détectée ICI et signalée sur Discord **au changement
 *     d'état seulement** (🔴 panne / 🟢 rétablissement), jamais en boucle.
 *
 *  2. Panne TOTALE (VPS/API à terre — ex. après un reboot sans redémarrage) :
 *     un process mort ne peut pas s'alerter lui-même. On envoie donc un
 *     « heartbeat » à un service dead-man externe (ex. Healthchecks.io, gratuit,
 *     intégration Discord native) : tant que l'API vit ET que tout est sain, elle
 *     ping ; si les pings s'arrêtent, le service externe alerte. C'est le SEUL
 *     moyen de couvrir une panne totale.
 *
 * Variables (toutes optionnelles — chaque volet se désactive proprement s'il
 * manque sa config, comme les autres fonctions) :
 *   - DISCORD_MONITOR_WEBHOOK_URL (repli : DISCORD_RH_ALERTS_WEBHOOK_URL)
 *   - MONITOR_HEARTBEAT_URL  (URL de ping Healthchecks.io ou équivalent)
 *   - MONITOR_SITE_URL  (défaut http://localhost — Caddy en local, sans DNS ni
 *     certificat. Peut pointer vers l'URL HTTPS publique pour un test plus profond.)
 */

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const WEBHOOK_URL =
  process.env.DISCORD_MONITOR_WEBHOOK_URL ||
  process.env.DISCORD_RH_ALERTS_WEBHOOK_URL;
const HEARTBEAT_URL = process.env.MONITOR_HEARTBEAT_URL;
const SITE_URL = process.env.VITE_SITE_URL || process.env.SITE_URL;
// Cible du test « le site répond-il ? ». Par défaut Caddy en local (port 80) :
// n'importe quelle réponse HTTP (y compris la redirection 80→443) prouve que
// Caddy écoute. Aucune dépendance au DNS ni au certificat.
const SITE_CHECK_URL = process.env.MONITOR_SITE_URL || 'http://localhost';

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

async function checkSite(): Promise<boolean> {
  try {
    const res = await fetch(SITE_CHECK_URL, {
      method: 'GET',
      redirect: 'manual', // une redirection 80→443 suffit à prouver Caddy vivant
      signal: AbortSignal.timeout(10_000),
    });
    // status 0 = redirection opaque (Caddy répond) ; < 500 = serveur OK.
    return res.status < 500;
  } catch {
    return false; // connexion refusée / timeout → Caddy injoignable
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

async function notifyDiscord(healthy: boolean, reason: string): Promise<void> {
  if (!WEBHOOK_URL) return;
  const suffix = SITE_URL ? ` (${SITE_URL})` : '';
  const content = healthy
    ? `🟢 **Site rétabli** — tout répond de nouveau (site + Supabase).${suffix}`
    : `🔴 **Alerte site** — ${reason}. Vérifie le VPS (Caddy / API) et Supabase.${suffix}`;
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
  const [supabaseOk, siteOk] = await Promise.all([checkSupabase(), checkSite()]);
  const healthy = supabaseOk && siteOk;

  const reasons: string[] = [];
  if (!siteOk) reasons.push('le site est injoignable (Caddy à terre ?)');
  if (!supabaseOk) reasons.push('Supabase est injoignable');
  const reason = reasons.join(' + ');

  // Dead-man : ping à chaque exécution (succès/échec).
  await pingHeartbeat(healthy);

  // Discord : uniquement au changement d'état (pas de spam).
  if (lastHealthy !== null && healthy !== lastHealthy) {
    await notifyDiscord(healthy, reason);
  } else if (lastHealthy === null && !healthy) {
    // Premier tick déjà en panne → on prévient d'emblée.
    await notifyDiscord(false, reason);
  }

  lastHealthy = healthy;
}

// Toutes les 5 minutes.
export const config: Config = {
  schedule: '*/5 * * * *',
};
