# Déploiement natif sur VPS Windows (sans Docker)

Adapté à un VPS **Windows** avec **Node ≥ 20**, **PM2** et le dépôt déjà cloné
(le bot vit dedans). On lance tout **nativement** : l'API via PM2 (comme le
bot) et **Caddy pour Windows** pour le site + HTTPS.

> Les commandes sont à taper dans **PowerShell** (Bureau à distance). Adapte
> les chemins si besoin. On avance étape par étape — rien n'est coupé côté
> Netlify tant qu'on n'a pas basculé le DNS (dernière étape).

## 0. Se placer dans le dépôt

```powershell
cd "C:\Users\Administrator\Desktop\Bot Discord - Site\ATFR-WebSite"
git pull
npm install
```

## 1. Configurer les variables

```powershell
Copy-Item deploy\.env.example deploy\.env
notepad deploy\.env
```

Remplis toutes les valeurs (depuis Netlify → Site settings → Environment).
`SITE_DOMAIN=atfr-wot.com`, `ALLOWED_ORIGINS=https://atfr-wot.com`, etc.
Le serveur charge automatiquement ce `deploy\.env`.

## 2. Construire le front

```powershell
npm run build     # génère dist\
```

## 3. Démarrer l'API (fonctions) avec PM2

```powershell
pm2 start npm --name atfr-api -- run serve
pm2 logs atfr-api --lines 20
```

Tu dois voir `🚀 API ATFR prête … 23 fonction(s) HTTP · 3 tâche(s)`.
Test local :

```powershell
curl http://localhost:8080/healthz    # -> ok
```

## 4. Installer Caddy pour Windows

Télécharge `caddy_windows_amd64.exe` depuis <https://caddyserver.com/download>
(ou `winget install CaddyServer.Caddy`), renomme-le `caddy.exe`, place-le p.ex.
dans `C:\caddy\caddy.exe`.

## 5. Démarrer Caddy avec PM2

Caddy sert `dist\` et proxifie `/.netlify/functions/*` vers l'API locale. On lui
passe les 3 variables via PM2 :

```powershell
$repo = "C:\Users\Administrator\Desktop\Bot Discord - Site\ATFR-WebSite"
pm2 start "C:\caddy\caddy.exe" --name atfr-caddy -- run --config "$repo\deploy\Caddyfile" `
  ; pm2 set atfr-caddy:SITE_DOMAIN atfr-wot.com
```

> ⚠️ Le passage des variables d'env à Caddy sous PM2 se règle ensemble à cette
> étape (PM2 ecosystem ou variables système) — on validera la bonne forme en
> direct selon ce que renvoie `pm2 logs atfr-caddy`. Les variables attendues :
> `SITE_DOMAIN=atfr-wot.com`, `SITE_ROOT=<repo>\dist`, `API_UPSTREAM=localhost:8080`.

Caddy obtient le certificat HTTPS **une fois que le DNS pointe vers le VPS**
(étape 7). Ports 80 et 443 à ouvrir dans le pare-feu Windows.

## 6. Rendre tout persistant (redémarrage VPS)

```powershell
pm2 save
pm2 startup      # suis l'instruction affichée pour relancer PM2 au boot
```

## 7. Basculer le DNS

Dans Netlify → Domains → `atfr-wot.com` → DNS : enregistrement **A** vers l'IP
du VPS (supprime les anciens enregistrements Netlify du site). Voir
`MIGRATION.md` § Étape 1.

## 8. Repointer le bot + couper Netlify

- `discord-bot\.env` → `SITE_URL=https://atfr-wot.com` (ou, plus robuste,
  `http://localhost:8080` puisque bot et API vivent sur la même machine),
  puis `pm2 restart` le bot.
- Netlify → arrêter le déploiement du site (fin de la facture).

Détails et dépannage : voir `MIGRATION.md`.

---

# Exploitation courante

## Déployer une mise à jour (1 commande)

Après un merge sur `main`, déploie avec le script fourni :

```cmd
cd "C:\Users\Administrator\Desktop\Bot Discord - Site\ATFR-WebSite"
deploy\deploy.bat
```

Il fait tout : `git pull` → `npm install` → `npm run build` → `pm2 restart atfr-api`
→ `pm2 save`. Puis **hard refresh** (Ctrl+Shift+R) dans le navigateur.

> Caddy n'a **pas** besoin d'être redémarré pour un déploiement de code (il sert
> `dist\` en direct). Ne relance `atfr-caddy` que si tu changes `deploy\Caddyfile`
> ou le domaine :
> `pm2 restart deploy\pm2.config.cjs --update-env`

## Rotation des logs PM2 (à faire une fois)

Sans ça, les logs PM2 grossissent sans limite et finissent par saturer le disque.
Installe le module de rotation **une seule fois** :

```cmd
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

→ garde 7 fichiers de 10 Mo max par process, compressés. Persistant (survit aux
redémarrages de PM2).

## Redémarrer le site après un reboot du VPS

Si `atfr-api` / `atfr-caddy` ne sont pas revenus tout seuls :

```cmd
cd "C:\Users\Administrator\Desktop\Bot Discord - Site\ATFR-WebSite"
pm2 list
pm2 start deploy\pm2.config.cjs   REM (s'ils ont disparu de la liste)
pm2 save                          REM fige les 3 process pour le prochain reboot
```

`pm2 save` est **essentiel** : le dump restauré au boot ne relancera que ce qui
était sauvegardé lors du dernier `pm2 save`.

## Option : démarrage au boot SANS ouverture de session (service Windows)

`pm2-windows-startup` relance PM2 à l'**ouverture de session** Administrator. Pour
un vrai démarrage au boot (avant tout login), utiliser **nssm** :

```cmd
REM Télécharger nssm (https://nssm.cc/download), puis :
nssm install PM2 "C:\Program Files\nodejs\node.exe" "C:\Users\Administrator\AppData\Roaming\npm\node_modules\pm2\bin\pm2" resurrect
nssm set PM2 AppDirectory "C:\Users\Administrator"
nssm set PM2 Start SERVICE_AUTO_START
nssm start PM2
```

→ PM2 relance la liste sauvegardée (`pm2 save`) dès le démarrage de Windows,
même sans session ouverte. Adapte les chemins `node.exe` / `pm2` à ton install
(`where node`, `where pm2`).

## Monitoring + alerte Discord

La tâche planifiée `monitor-heartbeat` (toutes les 5 min, dans `atfr-api`) vérifie
à chaque tick **Supabase** ET **le site servi par Caddy** (requête locale sur
`http://localhost` — surchargeable via `MONITOR_SITE_URL`), et couvre **deux**
types de panne :

**1. Dépendance ou serveur web en panne (Supabase injoignable OU Caddy à terre)
— alerte directe Discord.**
Renseigne dans `deploy\.env` :

```
DISCORD_MONITOR_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

(ou laisse vide pour réutiliser `DISCORD_RH_ALERTS_WEBHOOK_URL`.) Tu reçois un
message 🔴 quand Supabase tombe, 🟢 au rétablissement — **au changement d'état
seulement**, jamais en boucle.

**2. Panne TOTALE du VPS/API (ex. après un reboot) — dead-man externe.**
Un process mort ne peut pas s'alerter lui-même : il faut un observateur externe.

1. Crée un check gratuit sur <https://healthchecks.io> (période 5 min, grâce 5 min).
2. Ajoute son **intégration Discord** (Healthchecks → Integrations → Discord).
3. Copie l'URL de ping du check dans `deploy\.env` :
   ```
   MONITOR_HEARTBEAT_URL=https://hc-ping.com/<ton-uuid>
   ```
4. `pm2 restart deploy\pm2.config.cjs --update-env`

Tant que l'API tourne, elle ping toutes les 5 min. Si le VPS tombe, les pings
s'arrêtent → Healthchecks.io t'alerte sur Discord. C'est **le seul moyen** de
détecter une panne totale (celle qui t'a échappé au dernier reboot).

> Sans ces variables, la tâche tourne mais ne fait rien (aucune alerte) — tout
> reste optionnel et sans effet de bord.

## Sauvegardes de la base Supabase

⚠️ Toute la donnée du clan vit dans **un seul projet Supabase free tier** (rétention
de sauvegarde limitée). Un dump quotidien sur le VPS protège contre la perte.

### 1. Installer pg_dump (client PostgreSQL)

```cmd
winget install PostgreSQL.PostgreSQL.17
```

→ pg_dump se retrouve dans `C:\Program Files\PostgreSQL\17\bin\pg_dump.exe`.
La version de pg_dump doit être **≥** celle du serveur Supabase (PG 15 ou 17).

### 2. Récupérer la chaîne de connexion

Supabase → **Settings → Database → Connection string → Session pooler**. Copie
l'URI (avec le mot de passe de la base) dans `deploy\.env` :

```
SUPABASE_DB_URL=postgresql://postgres.xxxx:MOT_DE_PASSE@aws-0-eu-west-3.pooler.supabase.com:5432/postgres
PG_DUMP_BIN=C:\Program Files\PostgreSQL\17\bin\pg_dump.exe
BACKUP_DIR=C:\atfr-backups
BACKUP_RETENTION=14
```

> Prends bien le **Session pooler** (port 5432), compatible IPv4 et pg_dump.
> Le *Transaction pooler* (6543) ne convient pas.

### 3. Tester une fois à la main

```cmd
cd "C:\Users\Administrator\Desktop\Bot Discord - Site\ATFR-WebSite"
node deploy\backup-db.mjs
```

→ doit créer `C:\atfr-backups\atfr-AAAA-MM-JJ_HH-MM-SS.dump` et afficher la taille.

### 4. Planifier (quotidien, 04:00) via PM2

```cmd
pm2 start deploy\backup-db.mjs --name atfr-backup --no-autorestart --cron-restart "0 4 * * *"
pm2 save
```

`--no-autorestart` : le script s'exécute puis s'arrête jusqu'au prochain déclenchement.
`pm2 save` : la tâche revient après un reboot. (Si ta version de PM2 refuse
`--cron-restart`, utilise `--cron`.)

### Restaurer un dump (en cas de besoin)

⚠️ Destructif — restaure de préférence sur un **nouveau** projet Supabase, pas
par-dessus la prod :

```cmd
pg_restore --clean --if-exists --no-owner --no-privileges -d "<SUPABASE_DB_URL_CIBLE>" "C:\atfr-backups\atfr-....dump"
```

> Pour une vraie résilience « hors-site », copie de temps en temps le dossier
> `C:\atfr-backups` ailleurs (autre disque, cloud perso). Un backup sur le même
> VPS ne protège pas d'une perte du VPS lui-même.

## Snapshots WoT automatiques (batailles / jours actifs)

Les graphes RH « batailles/jour » et « joueurs actifs/jour » se calculent à
partir de **snapshots quotidiens** (delta d'un jour sur l'autre). Il faut donc
un snapshot **chaque jour** — sinon les valeurs restent à 0 les jours sautés,
et se cumulent d'un coup le jour où on relance.

La tâche est aussi planifiée dans `atfr-api` (cron interne), mais pour une
exécution **fiable même si `atfr-api` redémarre**, on ajoute un job PM2 dédié
qui lance le snapshot chaque jour à 06:00, indépendamment :

```cmd
cd "C:\Users\Administrator\Desktop\Bot Discord - Site\ATFR-WebSite"
pm2 start deploy\run-snapshot.mjs --name atfr-snapshot --interpreter node --interpreter-args "--import tsx" --no-autorestart --cron-restart "0 6 * * *"
pm2 save
```

Test immédiat (génère le snapshot du jour tout de suite) :

```cmd
pm2 restart atfr-snapshot
pm2 logs atfr-snapshot --lines 20
```

→ tu dois voir `[snapshot] done — N snapshot(s) inserted`. À partir de là, le
snapshot tourne **tout seul chaque jour** — plus besoin de presser le bouton.

> `--no-autorestart` : le script s'exécute puis s'arrête jusqu'au prochain
> déclenchement (06:00). `pm2 save` le rend persistant après reboot.
> (Si ta version de PM2 refuse `--cron-restart`, utilise `--cron`.)
