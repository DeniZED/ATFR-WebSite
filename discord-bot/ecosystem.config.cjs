// PM2 — configuration de déploiement pour VPS
// Démarrage : pm2 start ecosystem.config.cjs
// Sauvegarde : pm2 save && pm2 startup

module.exports = {
  apps: [
    {
      name: 'atfr-discord-bot',
      script: 'dist/bot.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '200M',
      env_file: '.env',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: 'logs/error.log',
      out_file: 'logs/out.log',
      // Redémarre si le bot plante (max 10 fois en 1 minute avant abandon)
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 3000,
    },
  ],
};
