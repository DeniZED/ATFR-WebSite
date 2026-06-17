# ATFR Discord Bot

Bot Discord pour le suivi RH (vocal, arrivées/départs membres, sync automatique) et le suivi des clans World of Tanks (entrées/sorties de joueurs, notifications, historique).

## Ce que fait le bot

| Événement | Action |
|-----------|--------|
| Membre rejoint un salon vocal | POST `discord-voice-event` (join) |
| Membre quitte un salon vocal | POST `discord-voice-event` (leave) |
| Membre change de salon vocal | POST `discord-voice-event` (move) |
| Nouveau membre rejoint le serveur | Déclenche une sync membres (debounce 10 s) |
| Membre quitte le serveur | Déclenche une sync membres (debounce 10 s) |
| Scan périodique des clans suivis | Diff de roster via l'API WG, notification Discord + historique Supabase |
| Cron quotidien (03:00 UTC) | Sync complète Discord → Supabase + scan de clans (filet de sécurité) |

## Commandes admin (`Gérer le serveur` requis)

| Commande | Description |
|----------|--------------|
| `/clan add <clan_id>` | Ajoute un clan WoT à la liste suivie |
| `/clan remove <clan_id>` | Retire un clan de la liste suivie |
| `/clan list` | Liste les clans actuellement suivis |
| `/clan channel <salon>` | Définit le salon de notification des mouvements |
| `/clan scan` | Force un scan immédiat de tous les clans suivis |
| `/clan movements [clan_id] [limit]` | Affiche les derniers mouvements enregistrés |
| `/voice stats` | Affiche les statistiques vocales du jour |

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
   - Scopes : `bot`, `applications.commands`
   - Bot Permissions : `View Channels`, `Connect`, `Read Message History`, `Send Messages`, `Embed Links`
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
- `WOT_APPLICATION_ID` → ID d'application Wargaming (nécessaire pour le suivi de clans, voir https://developers.wargaming.net/applications/)

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
| `SYNC_CRON` | ❌ | Cron sync membres + scan clans quotidien (défaut : `0 3 * * *`) |
| `DEBUG` | ❌ | Logs détaillés — `true`/`false` |
| `DASHBOARD_PORT` | ❌ | Port du tableau de bord local (défaut : `3000`) |
| `WOT_APPLICATION_ID` | ✅* | ID d'application Wargaming (requis pour le suivi de clans) |
| `WG_API_BASE` | ❌ | Base de l'API WG (défaut : `https://api.worldoftanks.eu/wot`) |
| `CLAN_SCAN_INTERVAL_MINUTES` | ❌ | Intervalle par défaut entre deux scans par serveur (défaut : `15`) |
| `DEFAULT_TRACKED_CLAN_IDS` | ❌ | Liste de `clan_id` (séparés par des virgules) chargée au premier démarrage |

\* requis uniquement pour utiliser le suivi de clans ; sans cette variable, le scan est simplement ignoré et le reste du bot fonctionne normalement.

---

## Tableau de bord local

Le bot expose un mini tableau de bord web accessible depuis le navigateur du VPS :

```
http://localhost:3000
```

Il affiche en temps réel (rafraîchissement toutes les 3 secondes) :
- **Statut** : connecté/déconnecté, tag du bot, serveur cible, ping, durée d'activité
- **Vocal en direct** : qui est actuellement en salon vocal et depuis combien de temps
- **Logs** : flux des derniers événements (300 lignes max conservées en mémoire)
- **Historique vocal (30 derniers jours)** : temps cumulé par membre + détail par jour, calculé localement à partir des sessions vocales complètes (join → leave). Stocké dans `discord-bot/data/voice-history.json` (ignoré par git, propre au VPS), purgé automatiquement au-delà de 30 jours.

Pratique pour vérifier d'un coup d'œil que le bot tourne correctement et consulter l'activité vocale **avant** que la sync quotidienne ne mette le site à jour, sans avoir à lancer `pm2 logs`.

> Cet historique est local au bot — il ne remplace pas les données du site (Supabase reste la source de vérité pour le RH). Il sert de consultation rapide côté VPS.

---

## Architecture

```
discord-bot/src/
  bot.ts                      ── point d'entrée : assemble tous les modules
  config.ts                   ── lecture des variables d'environnement
  logger.ts                   ── logs horodatés (console + dashboard local)
  net.ts                      ── helper HTTP générique (retry, secret partagé)
  supabaseSync.ts              ── tous les appels aux fonctions Netlify
  guildConfig.ts               ── cache de config par serveur (+ mutations)
  memberSync.ts                ── déclenche la sync membres (debounce)
  scheduler.ts                  ── tâches planifiées (cron quotidien, scan clans)
  dashboard.ts                 ── mini tableau de bord HTTP local (VPS)
  voice/
    tracker.ts                 ── détection des événements vocaux Discord
    history.ts                  ── historique vocal local (data/voice-history.json)
  clan/
    types.ts                    ── types partagés du suivi de clans
    wgClient.ts                  ── client API Wargaming (roster de clan)
    scanner.ts                   ── orchestration d'un scan (diff + notif)
  notifications/
    clanEmbeds.ts                ── construction des embeds de mouvement
  commands/
    registry.ts                  ── enregistrement des commandes slash
    clanCommands.ts               ── /clan add|remove|list|channel|scan|movements
    voiceCommands.ts              ── /voice stats
    handleInteraction.ts          ── dispatch des interactions Discord
```

### Flux vocal

```
VoiceStateUpdate ──► voice/tracker.ts ──► supabaseSync.sendVoiceEvent()
                                              └─► Netlify /discord-voice-event
                                                    ├─ record_discord_voice_event() (Supabase)
                                                    └─ Met à jour players.last_discord_voice_at
```

### Flux membres

```
GuildMemberAdd/Remove ──► memberSync.ts (debounce 10s) ──► supabaseSync.triggerMemberSync()
Cron (SYNC_CRON)       ──► scheduler.ts ────────────────►        └─► Netlify /discord-sync-members
                                                                       ├─ Upsert discord_guild_members
                                                                       ├─ auto_link_discord_members()
                                                                       └─ recompute_player_hr_statuses()
```

### Flux suivi de clans

```
scheduler.ts (intervalle par serveur + cron quotidien)
  └─► clan/scanner.ts
        ├─► clan/wgClient.ts ──► API Wargaming (/clans/info/)
        ├─► supabaseSync.syncClanRoster() ──► Netlify /discord-clan-sync
        │                                       └─ sync_clan_roster() : diff atomique + historique (Supabase)
        └─► notifications/clanEmbeds.ts ──► envoi des embeds dans le salon configuré

commands/clanCommands.ts (/clan add|remove|channel)
  └─► guildConfig.ts ──► Netlify /discord-clan-config (GET/POST)

commands/clanCommands.ts (/clan movements)
  └─► supabaseSync.getRecentMovements() ──► Netlify /discord-clan-movements (GET)
```
