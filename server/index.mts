import { config as loadEnv } from 'dotenv';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import cron from 'node-cron';
import { readdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Charge deploy/.env s'il existe (installation native Windows/Linux). En
// Docker, les variables sont déjà injectées par env_file, et l'absence du
// fichier est simplement ignorée par dotenv. Doit s'exécuter AVANT l'import
// dynamique des fonctions (certaines lisent process.env au chargement).
loadEnv({ path: path.join(ROOT, 'deploy', '.env') });

/**
 * Serveur d'API auto-hébergé — remplace les Netlify Functions.
 *
 * Il découvre les fichiers de netlify/functions/*.mts et, pour chaque
 * fonction (signature web standard `Request -> Response`), l'expose SOIT :
 *   - en route HTTP `/.netlify/functions/<nom>` (mêmes URLs que sur Netlify,
 *     donc AUCUN changement côté front ni côté bot) ;
 *   - en tâche planifiée (cron) si la fonction exporte `config.schedule` —
 *     dans ce cas elle n'est PAS exposée en HTTP (comme sur Netlify).
 *
 * Les fichiers commençant par `_` sont des helpers partagés, jamais montés.
 * Le contenu statique (dist/) est servi par Caddy en amont, pas ici.
 */

const FUNCTIONS_DIR = path.join(ROOT, 'netlify', 'functions');
const PORT = Number(process.env.PORT ?? 8080);

type NetlifyHandler = (req: Request, ctx: unknown) => Promise<Response> | Response;
interface FnModule {
  default?: NetlifyHandler;
  config?: { schedule?: string };
}

const app = new Hono();

app.get('/healthz', (c) => c.text('ok'));

const entries = await readdir(FUNCTIONS_DIR);
const files = entries.filter(
  (f) => (f.endsWith('.mts') || f.endsWith('.ts')) && !path.basename(f).startsWith('_'),
);

let httpCount = 0;
let cronCount = 0;

for (const file of files.sort()) {
  const name = file.replace(/\.(mts|ts)$/, '');
  const mod = (await import(pathToFileURL(path.join(FUNCTIONS_DIR, file)).href)) as FnModule;
  const handler = mod.default;
  if (typeof handler !== 'function') continue;

  const schedule = mod.config?.schedule;

  if (schedule) {
    // Tâche planifiée : cron uniquement, aucune route HTTP publique
    // (identique au comportement Netlify Scheduled Functions).
    if (!cron.validate(schedule)) {
      console.warn(`⚠  ${name}: expression cron invalide « ${schedule} », ignorée`);
      continue;
    }
    cron.schedule(schedule, () => {
      const req = new Request(`http://localhost/.netlify/functions/${name}`, {
        method: 'POST',
      });
      Promise.resolve(handler(req, {})).catch((err) =>
        console.error(`[cron:${name}]`, err instanceof Error ? err.message : err),
      );
    });
    cronCount++;
    console.log(`⏲  cron  ${name}  (${schedule})`);
    continue;
  }

  app.all(`/.netlify/functions/${name}`, async (c) => {
    try {
      return await handler(c.req.raw, {});
    } catch (err) {
      console.error(`[fn:${name}]`, err instanceof Error ? err.stack : err);
      return c.json({ error: 'Internal error' }, 500);
    }
  });
  httpCount++;
}

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(
    `\n🚀 API ATFR prête sur http://0.0.0.0:${info.port}` +
      `\n   ${httpCount} fonction(s) HTTP · ${cronCount} tâche(s) planifiée(s)\n`,
  );
});
