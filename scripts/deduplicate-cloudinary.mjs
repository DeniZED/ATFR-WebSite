/**
 * Déduplication Cloudinary
 *
 * Les dossiers atfr/geoguessr et atfr/maps contiennent des doublons des images
 * déjà présentes dans atfr/media (créés par la migration qui uploadait chaque
 * table séparément).
 *
 * Ce script :
 *  1. Liste tous les assets dans atfr/geoguessr et atfr/maps
 *  2. Pour chacun, cherche le doublon dans atfr/media (même bytes + dimensions)
 *  3. Met à jour image_url en base pour pointer vers atfr/media
 *  4. Supprime le doublon de Cloudinary
 *
 * Usage :
 *   node scripts/deduplicate-cloudinary.mjs
 *
 * Prérequis : .env.migration rempli (même fichier que la migration)
 */

import { createClient } from '@supabase/supabase-js';
import { v2 as cloudinary } from 'cloudinary';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';

// ── Env ───────────────────────────────────────────────────────────────────────

function loadEnvFile(path) {
  if (!existsSync(path)) return {};
  const result = {};
  readFileSync(path, 'utf-8').split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eq = trimmed.indexOf('=');
    if (eq === -1) return;
    result[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
  });
  return result;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const fileEnv = loadEnvFile(resolve(__dirname, '../.env.migration'));
const get = (k) => fileEnv[k] ?? process.env[k] ?? '';

const SUPABASE_URL          = get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE = get('SUPABASE_SERVICE_ROLE_KEY');
const CLOUD_NAME            = get('CLOUDINARY_CLOUD_NAME');
const API_KEY               = get('CLOUDINARY_API_KEY');
const API_SECRET            = get('CLOUDINARY_API_SECRET');

cloudinary.config({ cloud_name: CLOUD_NAME, api_key: API_KEY, api_secret: API_SECRET, secure: true });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildUrl(publicId, resourceType = 'image') {
  return `https://res.cloudinary.com/${CLOUD_NAME}/${resourceType}/upload/f_auto,q_auto/${publicId}`;
}

/** Liste récursivement tous les assets d'un dossier Cloudinary. */
async function listFolder(folder, resourceType = 'image') {
  const assets = [];
  let nextCursor;
  do {
    const result = await cloudinary.api.resources({
      type: 'upload',
      resource_type: resourceType,
      prefix: folder + '/',
      max_results: 500,
      next_cursor: nextCursor,
    });
    assets.push(...result.resources);
    nextCursor = result.next_cursor;
  } while (nextCursor);
  return assets;
}

/** Clé de matching : bytes + largeur + hauteur (identiques pour deux copies du même fichier). */
function matchKey(asset) {
  return `${asset.bytes}-${asset.width ?? 0}-${asset.height ?? 0}`;
}

// ── Déduplication d'un dossier ────────────────────────────────────────────────

async function deduplicate(duplicateFolder, canonicalFolder, table, urlField = 'image_url') {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`Doublons : ${duplicateFolder}  →  Référence : ${canonicalFolder}`);
  console.log('─'.repeat(60));

  const [duplicates, canonicals] = await Promise.all([
    listFolder(duplicateFolder),
    listFolder(canonicalFolder),
  ]);

  console.log(`Assets doublons : ${duplicates.length}  |  Assets référence : ${canonicals.length}`);

  // Index des assets de référence par clé de matching
  const canonicalIndex = new Map();
  for (const a of canonicals) {
    const key = matchKey(a);
    if (!canonicalIndex.has(key)) canonicalIndex.set(key, a);
  }

  let fixed = 0, skipped = 0, failed = 0;

  for (const dup of duplicates) {
    const key = matchKey(dup);
    const canonical = canonicalIndex.get(key);

    if (!canonical) {
      console.log(`  ⚠ Pas de correspondance pour ${dup.public_id} — ignoré`);
      skipped++;
      continue;
    }

    const newUrl = buildUrl(canonical.public_id);

    try {
      // Mettre à jour la DB
      const { error } = await supabase
        .from(table)
        .update({ [urlField]: newUrl })
        .eq(urlField, buildUrl(dup.public_id));

      if (error) throw new Error(error.message);

      // Supprimer le doublon de Cloudinary
      await cloudinary.uploader.destroy(dup.public_id, { resource_type: 'image' });

      console.log(`  ✓ ${dup.public_id} → ${canonical.public_id}`);
      fixed++;
    } catch (err) {
      console.error(`  ✗ ${dup.public_id} : ${err.message}`);
      failed++;
    }

    await new Promise((r) => setTimeout(r, 300));
  }

  console.log(`\nRésultat : ${fixed} dédupliqué(s), ${skipped} sans correspondance, ${failed} échec(s)`);
}

// ── Point d'entrée ────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🔍 Déduplication Cloudinary\n');
  console.log(`Cloud : ${CLOUD_NAME}  |  Supabase : ${SUPABASE_URL}`);

  await deduplicate('atfr/geoguessr', 'atfr/media', 'geoguesser_shots');
  await deduplicate('atfr/maps',      'atfr/media', 'wot_maps');

  console.log('\n\n✅ Déduplication terminée !');
  console.log('Tu peux supprimer les dossiers atfr/geoguessr et atfr/maps dans Cloudinary.');
}

main().catch((err) => {
  console.error('\n💥 Erreur fatale :', err);
  process.exit(1);
});
