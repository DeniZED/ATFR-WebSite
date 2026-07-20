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

- `discord-bot\.env` → `SITE_URL=https://atfr-wot.com`, puis
  `pm2 restart` le bot.
- Netlify → arrêter le déploiement du site (fin de la facture).

Détails et dépannage : voir `MIGRATION.md`.
