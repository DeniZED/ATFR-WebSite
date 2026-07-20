# Migration ATFR : Netlify → VPS (objectif : 0 € hors VPS)

Ce dossier contient tout le nécessaire pour héberger **le site + les fonctions**
sur ton VPS et **arrêter la facturation Netlify**. La base de données reste sur
**Supabase (free tier, 0 €)** — le navigateur continue de lui parler
directement, seules les fonctions déménagent.

## Ce qui change (et ce qui ne change pas)

| Composant | Avant | Après |
|---|---|---|
| Site React (statique) | Netlify | **VPS** — Caddy |
| ~26 fonctions serverless | Netlify (= la facture) | **VPS** — serveur Hono (`server/index.mts`) |
| 3 tâches planifiées | Netlify Scheduled | **VPS** — cron intégré au serveur |
| Base de données | Supabase | **Supabase (inchangé)** |
| Images | Cloudinary | **Cloudinary (inchangé)** |
| Bot Discord | ton VPS | ton VPS — repointé sur le nouveau domaine |

Les URLs des fonctions restent **identiques** (`/.netlify/functions/<nom>`), donc
**aucun changement de code** côté front ni côté bot — juste une variable à
mettre à jour.

## Architecture cible

```
              Internet
                 │  HTTPS (Let's Encrypt, gratuit)
          ┌──────▼──────┐
          │    Caddy    │  (conteneur web)
          │  sert dist/ │
          └──┬───────┬──┘
     /.netlify/functions/*   tout le reste
             │           └──► fichiers statiques (SPA)
       ┌─────▼─────┐
       │  api Hono │  (conteneur api) + cron
       └─────┬─────┘
             │
   ┌─────────┴──────────┐
   ▼                    ▼
Supabase (cloud)   Wargaming / tomato.gg / Cloudinary / Discord
```

---

## Prérequis

- Un VPS Debian/Ubuntu (le tien : 4 cœurs / 8 Go / 200 Go — largement suffisant).
- **Docker + Docker Compose** installés (voir étape 2).
- Accès à la **zone DNS** du domaine.
- Les valeurs d'environnement (récupérables dans Netlify → *Site settings →
  Environment variables*).

---

## Étape 1 — DNS (domaine → VPS)

Objectif **0 €** : tu peux garder `atfr-wot.com` sur **Netlify DNS** (l'hébergement
de la *zone* DNS est gratuit — ce n'est pas ce qui te facture, c'était les
*fonctions*). Il suffit de **repointer l'enregistrement A** vers l'IP du VPS.

1. Dans Netlify → *Domains* → `atfr-wot.com` → DNS records.
2. Mets/édite un enregistrement **A** :
   - `atfr-wot.com` → `A` → `<IP_DU_VPS>`
   - (optionnel) `www` → `CNAME` → `atfr-wot.com`
3. Supprime les anciens enregistrements qui pointaient vers Netlify (les
   `NETLIFY`/`ALIAS` vers le site) pour éviter les conflits.

> Alternative **100 % gratuite sans domaine** : un sous-domaine gratuit
> (DuckDNS, etc.) pointant vers l'IP du VPS. Renseigne-le simplement dans
> `SITE_DOMAIN`. Caddy fera le certificat HTTPS pareil.

Vérifie la propagation : `dig +short atfr-wot.com` doit renvoyer l'IP du VPS.

---

## Étape 2 — Installer Docker sur le VPS

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker "$USER"   # puis reconnecte-toi
docker compose version            # doit répondre
```

---

## Étape 3 — Récupérer le code et configurer

```bash
git clone https://github.com/DeniZED/ATFR-WebSite.git
cd ATFR-WebSite/deploy
cp .env.example .env
nano .env        # remplis TOUTES les valeurs (depuis Netlify)
```

Points importants dans `.env` :
- `SITE_DOMAIN` = ton domaine (ex. `atfr-wot.com`) — **sans** `https://`.
- `ALLOWED_ORIGINS` = `https://atfr-wot.com` (origines autorisées à appeler les
  fonctions Discord).
- Les `SUPABASE_SERVICE_ROLE_KEY`, `CLOUDINARY_API_SECRET`, `DISCORD_BOT_TOKEN`,
  `DISCORD_SYNC_SECRET` sont **secrets** — ce fichier ne doit jamais être commité
  (il est déjà dans `.gitignore` / `.dockerignore`).

---

## Étape 4 — Build et lancement

```bash
cd deploy
docker compose up -d --build
```

Caddy demande automatiquement le certificat HTTPS (le domaine doit déjà pointer
vers le VPS — étape 1). Suis les logs :

```bash
docker compose logs -f
```

Tu dois voir l'API annoncer `🚀 API ATFR prête … 23 fonction(s) HTTP · 3 tâche(s)`
et Caddy obtenir le certificat.

---

## Étape 5 — Vérifications

```bash
curl -sI https://atfr-wot.com                       # 200 + en-têtes de sécurité
curl -s  https://atfr-wot.com/.netlify/functions/clan-stats?clan_id=500197997 | head -c 300
```

Puis dans un navigateur : la home s'affiche, les stats live chargent, la section
Discord et les modules fonctionnent, l'admin se connecte.

---

## Étape 6 — Repointer le bot Discord

Le bot appelle les fonctions via `config.site.url`. Dans le `.env` **du bot**
(`discord-bot/.env`), mets :

```
SITE_URL=https://atfr-wot.com
```

Puis redéploie le bot :

```bash
cd discord-bot
git pull
npm ci
npm run build
pm2 restart atfr-bot     # ou le nom de ton process
```

---

## Étape 7 — Couper Netlify (fin de la facture)

Une fois que tout fonctionne sur le VPS **et** que le DNS pointe bien vers lui :

1. Netlify → le site du projet → *Site configuration* → **Stop auto publishing**
   (ou supprime le site). Plus de déploiement = plus d'invocations = **0 €**.
2. Garde la **zone DNS** sur Netlify si tu veux (gratuite), ou transfère-la.

> Ne supprime pas le projet **Supabase** : il reste utilisé (free tier).

---

## Mettre à jour le site plus tard

```bash
cd ATFR-WebSite
git pull
cd deploy
docker compose up -d --build     # rebuild + redéploiement, ~1 min
```

---

## Sauvegardes & résilience

- **Base de données** : gérée par Supabase (sauvegardes incluses). Pour une copie
  hors-ligne : `Supabase → Database → Backups`, ou `pg_dump` via l'URL de
  connexion.
- **Certificats HTTPS** : persistés dans le volume `caddy_data` (renouvellement
  auto par Caddy).
- **Redémarrage VPS** : `restart: unless-stopped` relance les conteneurs tout
  seuls.

---

## Dépannage rapide

| Symptôme | Piste |
|---|---|
| Caddy ne prend pas le certificat | Le DNS ne pointe pas (encore) vers le VPS, ou ports 80/443 fermés (firewall/UFW). |
| Fonctions en 500 | Variable d'env manquante dans `deploy/.env` → `docker compose logs api`. |
| Fonctions Discord en 403 | `ALLOWED_ORIGINS` ne contient pas ton domaine, ou `DISCORD_SYNC_SECRET` différent de celui du bot. |
| Front OK mais data vide | `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` mal renseignés au build → rebuild `web`. |
| Le bot n'écrit plus | `SITE_URL` du bot pas mis à jour vers le nouveau domaine. |

---

## Coût final

| Poste | Coût |
|---|---|
| VPS | ~19 €/mois (déjà payé) |
| Netlify | **0 €** (site arrêté) |
| Supabase | **0 €** (free tier) |
| Cloudinary | **0 €** (free tier) |
| HTTPS (Caddy/Let's Encrypt) | **0 €** |

**→ Seul le VPS coûte quelque chose.** Objectif atteint.
