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
| Scan périodique des clans suivis | Diff de roster via l'API WG, notification Discord (carte de profil enrichie) + historique Supabase |
| Cron quotidien (03:00 UTC) | Sync complète Discord → Supabase + scan de clans (filet de sécurité) |

Chaque scan (planifié, manuel via `/clan scan` ou via le bouton "Scanner maintenant" du dashboard) logue désormais une ligne par clan vérifié — y compris quand rien n'a changé — plus un résumé `[SCAN] Démarrage/Terminé`, pour pouvoir confirmer d'un coup d'œil que le scan a bien tourné.

### Embeds de mouvement de clan

Les notifications Discord d'entrée/sortie sont construites comme une carte de profil joueur (stats tomato.gg + WG) :
**score de recrutement** (/100, calculé par `player-stats.mts` côté site à partir des seuils/pondérations configurés dans **Admin → Réglages → "Recrutement — score & filtres"**), WN8 et winrate (global + 30 derniers jours), nombre de batailles, tier moyen, dégâts moyens, nombre de chars Tier X, et lien direct vers le profil Tomato.gg. Le même score alimente le filtre WN8 et la colonne "Score" de l'onglet **Mouvements** côté site (Admin → Staff → RH).

## Commandes publiques (tous les membres)

| Commande | Description |
|----------|--------------|
| `/stats <pseudo>` | Stats WoT d'un joueur : WN8, winrate, batailles, dégâts moyens, tier moyen, chars Tier X, 30 derniers jours, lien Tomato.gg. Résout le pseudo → account_id via l'API Wargaming, puis récupère les stats enrichies via la fonction `player-stats` du site (données tomato.gg). Nécessite `WOT_APPLICATION_ID`. |
| `/char <nom>` | Fiche d'un char (Tankopedia WG) : nation, type, tier, PV, dégâts/pénétration, cadence, visée, dispersion, vitesse, moteur, vue, image. Recherche par nom avec suggestions si plusieurs résultats. Nécessite `WOT_APPLICATION_ID`. |
| `/ping` | Vérifie que le bot répond (latence). |

## Commandes admin (`Gérer le serveur` requis)

| Commande | Description |
|----------|--------------|
| `/clan add <clan>` | Ajoute un clan WoT à la liste suivie (tag ou clan_id) |
| `/clan bulk-add <clans>` | Ajoute plusieurs clans en une fois (tags/IDs séparés par espace, virgule ou retour à la ligne) |
| `/clan remove <clan>` | Retire un clan de la liste suivie (tag ou clan_id) |
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
| `DASHBOARD_USERNAME` | ❌ | Identifiant pour l'authentification HTTP Basic du dashboard (voir ci-dessous) |
| `DASHBOARD_PASSWORD` | ❌ | Mot de passe pour l'authentification HTTP Basic du dashboard |
| `WOT_APPLICATION_ID` | ✅* | ID d'application Wargaming (requis pour le suivi de clans) |
| `WG_API_BASE` | ❌ | Base de l'API WG (défaut : `https://api.worldoftanks.eu/wot`) |
| `CLAN_SCAN_INTERVAL_MINUTES` | ❌ | Intervalle par défaut entre deux scans par serveur (défaut : `15`) |
| `DEFAULT_TRACKED_CLAN_IDS` | ❌ | Liste de `clan_id` numériques (séparés par des virgules) chargée au premier démarrage |

\* requis uniquement pour utiliser le suivi de clans ; sans cette variable, le scan est simplement ignoré et le reste du bot fonctionne normalement.

> `DEFAULT_TRACKED_CLAN_IDS` n'accepte que des `clan_id` numériques (chargés directement, sans appel API). Pour ajouter des clans par **tag**, utilise plutôt `/clan bulk-add` ou la section "Ajout en masse" du dashboard — les tags sont résolus via l'API Wargaming.

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
- **Suivi des clans** : section complète de gestion, sans avoir besoin de Discord :
  - Configuration : salon de notification (liste déroulante des salons textuels du serveur), intervalle de scan (5–1440 min), case "Notifier Discord uniquement pour les sorties" (réduit le bruit avec 100+ clans suivis, sans affecter l'historique Supabase qui enregistre toujours entrées et sorties), bouton "Scanner maintenant"
  - Liste des clans suivis avec retrait en un clic
  - Ajout d'un clan unique (tag ou clan_id, résolu via l'API Wargaming)
  - **Ajout en masse** : colle une liste de tags/IDs (séparés par espace, virgule ou retour à la ligne) et le dashboard les résout et les ajoute un par un, avec un résumé (ajoutés / déjà suivis / introuvables / erreurs)
  - Derniers mouvements enregistrés (entrées/sorties, 25 plus récents)

Pratique pour vérifier d'un coup d'œil que le bot tourne correctement, consulter l'activité vocale et gérer le suivi de clans **avant** que la sync quotidienne ne mette le site à jour, sans avoir à lancer `pm2 logs` ni à passer par Discord.

> Cet historique est local au bot — il ne remplace pas les données du site (Supabase reste la source de vérité pour le RH et l'historique des mouvements de clan). Il sert de consultation et de gestion rapide côté VPS.

### Sécuriser le dashboard

Par défaut, le dashboard est **ouvert** (aucune authentification), comme avant. Maintenant qu'il permet aussi de modifier la configuration (salon, intervalle, clans suivis), il est recommandé de définir `DASHBOARD_USERNAME` et `DASHBOARD_PASSWORD` dans `.env` si le port est exposé au-delà de `localhost` (ex : tunnel SSH, reverse proxy). Si l'une des deux variables est absente, le dashboard reste inchangé (pas d'authentification) et un avertissement est loggé au démarrage.

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
  dashboard/
    index.ts                    ── serveur HTTP local (VPS), assemble routes + auth
    state.ts                     ── état en mémoire (logs, sessions vocales actives)
    auth.ts                       ── authentification HTTP Basic optionnelle
    clanApi.ts                    ── routes /api/clan/* (config, add, bulk-add, remove, scan, movements)
    page.ts                       ── page HTML du dashboard (vanilla JS, polling)
  voice/
    tracker.ts                 ── détection des événements vocaux Discord
    history.ts                  ── historique vocal local (data/voice-history.json)
  clan/
    types.ts                    ── types partagés du suivi de clans
    wgClient.ts                  ── client API Wargaming (roster de clan, résolution tag→ID)
    bulkAdd.ts                    ── ajout en masse partagé (commande Discord + dashboard)
    scanner.ts                   ── orchestration d'un scan (diff + notif), logue chaque clan vérifié
    wn8.ts                        ── seuils/couleurs WN8 partagés par les embeds Discord
  notifications/
    clanEmbeds.ts                ── construction des embeds de mouvement
  commands/
    registry.ts                  ── enregistrement des commandes slash
    clanCommands.ts               ── /clan add|bulk-add|remove|list|channel|scan|movements
    voiceCommands.ts              ── /voice stats
    playerCommands.ts             ── /stats <pseudo>, /ping (commandes publiques)
    tankopediaCommands.ts         ── /char <nom> (fiche de char)
    handleInteraction.ts          ── dispatch des interactions Discord
  tankopedia/
    client.ts                     ── API WG Encyclopedia (index + recherche + fiche char)
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

commands/clanCommands.ts (/clan add|bulk-add|remove|channel)
  ├─► clan/wgClient.ts (resolveClanInput) ──► API Wargaming (/clans/info/ ou /clans/list/)
  ├─► clan/bulkAdd.ts (bulkAddTrackedClans, partagé avec le dashboard)
  └─► guildConfig.ts ──► Netlify /discord-clan-config (GET/POST, action set_interval incluse)

commands/clanCommands.ts (/clan movements)
  └─► supabaseSync.getRecentMovements() ──► Netlify /discord-clan-movements (GET)

dashboard/clanApi.ts (/api/clan/config|channel|interval|add|bulk-add|remove|scan|movements)
  └─► mêmes modules que les commandes Discord (guildConfig.ts, clan/bulkAdd.ts, scheduler.runGuildScan)
```
