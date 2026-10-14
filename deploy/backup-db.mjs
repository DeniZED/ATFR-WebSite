// ============================================================================
//  Sauvegarde de la base Supabase (pg_dump format custom) + rotation.
//
//  Lancé par PM2 en tâche planifiée (voir WINDOWS.md § Sauvegardes) ou à la
//  main :  node deploy/backup-db.mjs
//
//  Variables (dans deploy/.env) :
//    SUPABASE_DB_URL        (REQUIS) chaîne de connexion Postgres — utilise la
//                           « Session pooler » de Supabase (Settings → Database).
//    BACKUP_DIR             dossier de sortie (défaut : <repo>/backups)
//    BACKUP_RETENTION       nombre de dumps conservés (défaut : 14)
//    PG_DUMP_BIN            chemin de pg_dump.exe si pas dans le PATH
//                           (ex. C:\Program Files\PostgreSQL\17\bin\pg_dump.exe)
//
//  Copie aussi discord-bot/data/ (scores/réglages du quiz, historique vocal —
//  données locales au bot, absentes de Supabase) dans bot-data-<date>/, avec
//  la même rotation.
// ============================================================================
import { config as loadEnv } from 'dotenv';
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, readdirSync, mkdirSync, rmSync, statSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
loadEnv({ path: path.join(__dirname, '.env') });

const DB_URL = process.env.SUPABASE_DB_URL;
if (!DB_URL) {
  console.error('[backup] SUPABASE_DB_URL manquant dans deploy/.env — abandon.');
  process.exit(1);
}
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(ROOT, 'backups');
const RETENTION = Math.max(1, Number(process.env.BACKUP_RETENTION || 14));
const PG_DUMP = process.env.PG_DUMP_BIN || 'pg_dump';

mkdirSync(BACKUP_DIR, { recursive: true });

const stamp = new Date().toISOString().replace(/:/g, '-').replace('T', '_').slice(0, 19);
const outFile = path.join(BACKUP_DIR, `atfr-${stamp}.dump`);

console.log(`[backup] ${new Date().toISOString()} → ${outFile}`);

// --no-owner / --no-privileges : dump restaurable sur une base neuve sans se
// soucier des rôles Supabase. Format custom = compressé + restaurable finement.
const res = spawnSync(
  PG_DUMP,
  ['--format=custom', '--no-owner', '--no-privileges', '--file', outFile, DB_URL],
  { stdio: 'inherit' },
);

if (res.error) {
  console.error(
    `[backup] impossible de lancer pg_dump (${PG_DUMP}) : ${res.error.message}\n` +
      '        Installe le client PostgreSQL ou renseigne PG_DUMP_BIN dans deploy/.env.',
  );
  process.exit(1);
}
if (res.status !== 0) {
  console.error(`[backup] pg_dump a échoué (code ${res.status}).`);
  process.exit(1);
}

// Garde-fou : un dump anormalement petit signale un échec silencieux → on
// n'enclenche PAS la rotation (pour ne pas supprimer de vraies sauvegardes).
const size = statSync(outFile).size;
if (size < 1024) {
  console.error(`[backup] dump suspect (${size} o) — rotation annulée.`);
  process.exit(1);
}
console.log(`[backup] OK — ${(size / 1024 / 1024).toFixed(2)} Mo`);

// Données locales du bot Discord (best-effort : un échec ne bloque pas le dump).
const BOT_DATA_DIR = path.join(ROOT, 'discord-bot', 'data');
if (existsSync(BOT_DATA_DIR)) {
  try {
    cpSync(BOT_DATA_DIR, path.join(BACKUP_DIR, `bot-data-${stamp}`), { recursive: true });
    console.log('[backup] données du bot copiées');
  } catch (err) {
    console.error(`[backup] copie des données du bot échouée : ${err.message}`);
  }
}

// Rotation : conserve les RETENTION dumps les plus récents.
const dumps = readdirSync(BACKUP_DIR)
  .filter((f) => /^atfr-.*\.dump$/.test(f))
  .sort(); // tri lexicographique = chronologique (timestamp ISO)
const toDelete = dumps.slice(0, Math.max(0, dumps.length - RETENTION));
for (const f of toDelete) {
  unlinkSync(path.join(BACKUP_DIR, f));
  console.log(`[backup] rotation — supprimé ${f}`);
}

const botDataDirs = readdirSync(BACKUP_DIR)
  .filter((f) => /^bot-data-/.test(f))
  .sort();
for (const f of botDataDirs.slice(0, Math.max(0, botDataDirs.length - RETENTION))) {
  rmSync(path.join(BACKUP_DIR, f), { recursive: true, force: true });
  console.log(`[backup] rotation — supprimé ${f}`);
}
console.log(
  `[backup] terminé — ${dumps.length - toDelete.length}/${RETENTION} sauvegarde(s) conservée(s).`,
);
