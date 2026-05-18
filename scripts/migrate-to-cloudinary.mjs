/**
 * Migration Supabase Storage → Cloudinary
 *
 * Ce script lit toutes les image_url des tables wot_maps et geoguesser_shots,
 * uploade chaque image sur Cloudinary (qui la fetch depuis Supabase directement),
 * puis met à jour l'URL en base.
 *
 * Usage :
 *   1. Copier .env.migration.example → .env.migration et remplir les valeurs
 *   2. npm install cloudinary   (une seule fois)
 *   3. node scripts/migrate-to-cloudinary.mjs
 *
 * Le script est idempotent : les images déjà sur Cloudinary sont ignorées.
 */

import { createClient } from '@supabase/supabase-js';
import { v2 as cloudinary } from 'cloudinary';
import { readFileSync, existsSync } from 'fs';

// ── Chargement des variables d'environnement ──────────────────────────────────

function loadEnvFile(path) {
  if (!existsSync(path)) return {};
  const result = {};
  readFileSync(path, 'utf-8')
    .split('\n')
    .forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eq = trimmed.indexOf('=');
      if (eq === -1) return;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
      result[key] = val;
    });
  return result;
}

const fileEnv = loadEnvFile(new URL('../.env.migration', import.meta.url).pathname);
const get = (k) => fileEnv[k] ?? process.env[k] ?? '';

const SUPABASE_URL            = get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE   = get('SUPABASE_SERVICE_ROLE_KEY');
const CLOUDINARY_CLOUD_NAME   = get('CLOUDINARY_CLOUD_NAME');
const CLOUDINARY_API_KEY      = get('CLOUDINARY_API_KEY');
const CLOUDINARY_API_SECRET   = get('CLOUDINARY_API_SECRET');

const missing = [
  ['SUPABASE_URL', SUPABASE_URL],
  ['SUPABASE_SERVICE_ROLE_KEY', SUPABASE_SERVICE_ROLE],
  ['CLOUDINARY_CLOUD_NAME', CLOUDINARY_CLOUD_NAME],
  ['CLOUDINARY_API_KEY', CLOUDINARY_API_KEY],
  ['CLOUDINARY_API_SECRET', CLOUDINARY_API_SECRET],
].filter(([, v]) => !v).map(([k]) => k);

if (missing.length) {
  console.error(`\n❌ Variables manquantes dans .env.migration :\n  ${missing.join('\n  ')}`);
  process.exit(1);
}

// ── Configuration ─────────────────────────────────────────────────────────────

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

function buildCloudinaryUrl(publicId) {
  // f_auto : WebP pour les navigateurs qui le supportent, AVIF si possible
  // q_auto : qualité optimale automatique (Cloudinary choisit)
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto/${publicId}`;
}

// ── Migration d'une table ─────────────────────────────────────────────────────

async function migrateTable(table, folder) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`Table : ${table}  →  dossier Cloudinary : ${folder}`);
  console.log('─'.repeat(60));

  const { data: rows, error } = await supabase
    .from(table)
    .select('id, image_url')
    .not('image_url', 'is', null);

  if (error) {
    console.error(`Impossible de lire ${table} :`, error.message);
    return;
  }

  console.log(`${rows.length} image(s) trouvée(s)`);

  let success = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of rows) {
    const url = row.image_url;

    if (url.includes('cloudinary.com')) {
      skipped++;
      process.stdout.write('·');
      continue;
    }

    try {
      const result = await cloudinary.uploader.upload(url, {
        folder,
        resource_type: 'image',
        use_filename: true,
        unique_filename: true,
        overwrite: false,
      });

      const newUrl = buildCloudinaryUrl(result.public_id);

      const { error: updateErr } = await supabase
        .from(table)
        .update({ image_url: newUrl })
        .eq('id', row.id);

      if (updateErr) throw new Error(updateErr.message);

      process.stdout.write('✓');
      success++;
    } catch (err) {
      process.stdout.write('✗');
      console.error(`\n  Erreur (id=${row.id}) : ${err.message}`);
      failed++;
    }

    // Petite pause pour ne pas saturer l'API Cloudinary (free tier : 500 req/h)
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log(`\n\nRésultat : ${success} migrée(s), ${skipped} déjà sur Cloudinary, ${failed} échec(s)`);
}

// ── Point d'entrée ────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🚀 Début de la migration Supabase → Cloudinary\n');
  console.log(`Cloud : ${CLOUDINARY_CLOUD_NAME}`);
  console.log(`Supabase : ${SUPABASE_URL}`);

  await migrateTable('wot_maps', 'atfr/maps');
  await migrateTable('geoguesser_shots', 'atfr/geoguessr');

  console.log('\n\n✅ Migration terminée !');
  console.log('Tu peux maintenant vider le bucket Supabase Storage.');
}

main().catch((err) => {
  console.error('\n💥 Erreur fatale :', err);
  process.exit(1);
});
