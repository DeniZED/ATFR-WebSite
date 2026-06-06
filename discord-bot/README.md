# ATFR Discord Bot

Bot Discord pour le suivi RH : vocal, arrivées/départs membres, sync automatique.

## Ce que fait le bot

| Événement | Action |
|-----------|--------|
| Membre rejoint un salon vocal | POST `discord-voice-event` (join) |
| Membre quitte un salon vocal | POST `discord-voice-event` (leave) |
| Membre change de salon vocal | POST `discord-voice-event` (move) |
| Nouveau membre rejoint le serveur | Déclenche une sync membres (debounce 10 s) |
| Membre quitte le serveur | Déclenche une sync membres (debounce 10 s) |
| Cron quotidien (03:00 UTC) | Sync complète Discord → Supabase |

---

## 1. Créer le bot Discord

1. Aller sur https://discord.com/developers/applications
2. **New Application** → donner un nom (ex : "ATFR Bot")
3. Onglet **Bot** → cliquer "Add Bot"
4. **Copier le Token** (à mettre dans `.env`)
5. Activer les **Privileged Gateway Intents** :
   - ✅ `SERVER MEMBERS INTENT`
   - ✅ `PRESENCE INTENT` (optionnel)
6. Onglet **OAuth2 → URL Generator** :
   - Scopes : `bot`
   - Bot Permissions : `View Channels`, `Connect`, `Read Message History`
   - Copier l'URL générée et ouvrir dans un navigateur pour inviter le bot sur le serveur

---

## 2. Configurer les variables d'environnement

```bash
cp .env.example .env
nano .env
```

Remplir :
- `DISCORD_BOT_TOKEN` → token copié à l'étape 1
- `DISCORD_GUILD_ID` → ID du serveur (clic droit sur le serveur → "Copier l'identifiant du serveur")
- `SITE_URL` → `https://atfrv2.netlify.app` (ou ton domaine Netlify)
- `DISCORD_SYNC_SECRET` → **même valeur** que `DISCORD_SYNC_SECRET` dans Netlify

---

## 3. Déployer sur VPS

### Prérequis
```bash
# Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 (gestionnaire de processus)
npm install -g pm2
```

### Installation
```bash
# Cloner le repo sur le VPS (ou juste copier le dossier discord-bot/)
git clone https://github.com/DeniZED/ATFR-WebSite.git
cd ATFR-WebSite/discord-bot

# Installer les dépendances
npm install

# Compiler TypeScript
npm run build

# Créer le fichier .env
cp .env.example .env
nano .env   # remplir les valeurs
```

### Démarrer avec PM2
```bash
mkdir -p logs

# Démarrer le bot
pm2 start ecosystem.config.cjs

# Vérifier qu'il tourne
pm2 status

# Voir les logs en temps réel
pm2 logs atfr-discord-bot

# Démarrage automatique au reboot du VPS
pm2 save
pm2 startup   # copier-coller la commande affichée
```

### Commandes utiles PM2
```bash
pm2 restart atfr-discord-bot   # redémarrer le bot
pm2 stop atfr-discord-bot      # arrêter
pm2 logs atfr-discord-bot      # logs temps réel
pm2 monit                       # dashboard CPU/mémoire
```

---

## 4. Mettre à jour le bot

```bash
cd ATFR-WebSite
git pull
cd discord-bot
npm install
npm run build
pm2 restart atfr-discord-bot
```

---

## 5. Variables d'environnement complètes

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `DISCORD_BOT_TOKEN` | ✅ | Token du bot Discord |
| `DISCORD_GUILD_ID` | ✅ | ID du serveur Discord |
| `SITE_URL` | ✅ | URL Netlify (sans slash final) |
| `DISCORD_SYNC_SECRET` | ✅ | Secret partagé avec Netlify |
| `SYNC_CRON` | ❌ | Cron sync membres (défaut : `0 3 * * *`) |
| `DEBUG` | ❌ | Logs détaillés — `true`/`false` |

---

## Architecture

```
VPS (PM2)
  └─ discord-bot/
       └─ src/bot.ts
            ├─ VoiceStateUpdate ──────────────────► Netlify /discord-voice-event
            ├─ GuildMemberAdd/Remove (debounce) ──► Netlify /discord-sync-members
            └─ Cron (SYNC_CRON) ──────────────────► Netlify /discord-sync-members

Netlify /discord-sync-members
  ├─ Récupère tous les membres Discord
  ├─ Upsert discord_guild_members (Supabase)
  ├─ auto_link_discord_members() (matching nom)
  └─ recompute_player_hr_statuses()

Netlify /discord-voice-event
  ├─ Valide l'événement
  ├─ record_discord_voice_event() (Supabase)
  └─ Met à jour players.last_discord_voice_at
```
