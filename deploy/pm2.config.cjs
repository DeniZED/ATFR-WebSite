// Configuration PM2 tout-en-un pour l'hébergement natif (Windows/Linux).
//   pm2 start deploy/pm2.config.cjs
//
// Démarre l'API (fonctions) + Caddy (site statique + HTTPS). Les valeurs
// viennent de deploy/.env. Variables optionnelles pour l'install native :
//   CADDY_BIN     chemin de caddy.exe (défaut: "caddy" s'il est dans le PATH)
//   API_UPSTREAM  défaut "localhost:8080"
const path = require('path');

// Charge deploy/.env pour récupérer SITE_DOMAIN, CADDY_BIN, etc.
// override: true => deploy/.env fait autorité, même si une variable de même
// nom traîne déjà dans l'environnement du shell (ex. un SITE_DOMAIN=:8090
// laissé par un test local).
require('dotenv').config({ path: path.join(__dirname, '.env'), override: true });

const ROOT = path.resolve(__dirname, '..');

module.exports = {
  apps: [
    {
      name: 'atfr-api',
      cwd: ROOT,
      script: 'server/index.mts',
      interpreter: 'node',
      interpreter_args: '--import tsx',
      env: { NODE_ENV: 'production' },
    },
    {
      name: 'atfr-caddy',
      cwd: ROOT,
      // caddy est un binaire : interpreter "none" pour que PM2 ne tente pas
      // de l'exécuter avec node.
      script: process.env.CADDY_BIN || 'caddy',
      args: ['run', '--config', path.join(ROOT, 'deploy', 'Caddyfile')],
      interpreter: 'none',
      // SITE_ROOT : chemin absolu SANS espaces vers dist (ex. un lien
      // C:/atfrsite sous Windows). Si non défini, Caddy sert "dist" relatif
      // au cwd (fonctionne en Docker, cwd = /srv).
      env: {
        SITE_DOMAIN: process.env.SITE_DOMAIN || '',
        API_UPSTREAM: process.env.API_UPSTREAM || 'localhost:8080',
        ...(process.env.SITE_ROOT ? { SITE_ROOT: process.env.SITE_ROOT } : {}),
      },
    },
  ],
};
