// ============================================================================
//  Lance le snapshot d'activité WoT (batailles / jours actifs) — job autonome,
//  INDÉPENDANT du process atfr-api, pour une exécution quotidienne fiable.
//
//  À exécuter avec tsx (comme atfr-api). Planifié via PM2 :
//    pm2 start deploy/run-snapshot.mjs --name atfr-snapshot ^
//      --interpreter node --interpreter-args "--import tsx" ^
//      --no-autorestart --cron-restart "0 6 * * *"
//    pm2 save
//
//  Voir WINDOWS.md § Snapshots automatiques.
// ============================================================================
import { config as loadEnv } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Charge deploy/.env AVANT d'importer la fonction (elle lit process.env au
// chargement du module : SUPABASE_*, WOT_APPLICATION_ID, etc.).
loadEnv({ path: path.join(__dirname, '.env') });

const mod = await import('../netlify/functions/snapshot-player-activity.mts');
if (typeof mod.default !== 'function') {
  console.error('[run-snapshot] handler introuvable dans snapshot-player-activity.mts');
  process.exit(1);
}

console.log(`[run-snapshot] ${new Date().toISOString()} — démarrage`);
try {
  await mod.default();
  console.log('[run-snapshot] terminé.');
} catch (err) {
  console.error('[run-snapshot] échec :', err instanceof Error ? err.stack : err);
  process.exit(1);
}
