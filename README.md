# ATFR — Clan World of Tanks

Site officiel du clan **ATFR** (World of Tanks, serveur EU) : vitrine publique,
recrutement avec vérification WoT / tomato.gg et scoring automatique, espace
clan-hub (stratégies, doctrine, rôles), académie (quiz, mini-jeu Geoguesser),
dashboard admin complet (candidatures, RH/suivi des membres, contenu, modules)
et un **bot Discord** (suivi vocal, sync des membres, suivi des clans WoT
suivis pour le recrutement) — voir [`discord-bot/README.md`](discord-bot/README.md).

React 18 · Vite · TypeScript · Tailwind · Supabase · Netlify.

---

## Stack

| Domaine        | Techno                                                    |
| -------------- | --------------------------------------------------------- |
| Framework      | React 18 + Vite                                           |
| Langage        | TypeScript strict                                         |
| Routing        | react-router-dom                                          |
| UI             | Tailwind CSS, lucide-react, framer-motion, CVA            |
| Formulaires    | react-hook-form + zod                                     |
| Data-fetching  | TanStack Query                                            |
| Dates          | date-fns                                                   |
| Auth + DB      | Supabase (Postgres + Row Level Security)                  |
| Stats joueurs  | API Wargaming WoT EU + wrapper tomato.gg (WN8, winrate)   |
| Médias         | Cloudinary (uploads signés)                                |
| Bot Discord    | discord.js (module séparé, voir `discord-bot/`)            |
| Notifications  | Webhooks Discord (candidatures, RH, mouvements de clan)    |
| Tests          | Vitest                                                     |
| Déploiement    | Netlify (SPA + Functions planifiées)                       |
| CI             | GitHub Actions (lint / typecheck / build)                  |

---

## Démarrage rapide

```bash
npm install
cp .env.example .env   # puis remplissez vos valeurs
npm run dev
```

Scripts :

- `npm run dev` — serveur de dev (http://localhost:5173)
- `npm run build` — typecheck + build de production
- `npm run preview` — servir le build local
- `npm run lint` / `npm run typecheck` — contrôle qualité
- `npm run format` — Prettier
- `npm run test` / `npm run test:watch` — tests Vitest
- `npm run audit:deps` — `npm audit` (seuil modéré)

---

## Fonctionnalités

### Public

- **Accueil** : stats du clan en direct, prochaine opération, activités, mise en avant de l'académie, palmarès, témoignages.
- **Membres** / **Événements** / **Galerie** : annuaire du clan, calendrier, médias.
- **Recrutement** : formulaire de candidature avec vérification du pseudo WoT (API Wargaming + tomato.gg).
- **Académie** (`/modules`) : catalogue de modules avec gestion des accès, dont un quiz interactif (guide bots) et **Geoguesser** (mini-jeu d'identification de cartes WoT, scoring, classement, défi du jour).
- **Clan Hub** (`/clan-hub`, réservé aux membres) : stratégies CW, doctrine, rôles, guides de cartes, liens utiles — pages éditables depuis l'admin.

### Admin (`/admin`, auth Supabase + contrôle d'accès par module)

- **Candidatures** : revue, scoring, validation des candidatures de recrutement.
- **RH / Staff** (`AdminPlayers` / `AdminPlayerDetail`) : suivi des joueurs trackés (snapshots d'activité, statut, notes), **mouvements de clan** (entrées/sorties détectées par le bot Discord, statut de contact, conversion en prospect RH), score de recrutement configurable.
- **Réglages** : seuils et pondérations du score de recrutement (WN8, winrate, batailles, Tier X) utilisés à la fois par le filtre de l'onglet Mouvements, le score affiché côté site et les embeds Discord.
- **Contenu / Galerie / Moments / Palmarès / Témoignages** : CMS des sections publiques.
- **Modules / Quiz / Geoguesser** : publication des modules d'académie, gestion des quiz (questions, catégories, stats), gestion des cartes/captures et réglages du mini-jeu.
- **Pages clan-hub / Utilisateurs / Réglages globaux** : édition du clan-hub, gestion des comptes admin et de leurs accès par module.

### Bot Discord

Module séparé (`discord-bot/`, déployé indépendamment sur un VPS) : suivi du temps en vocal, synchronisation automatique des membres Discord ↔ Supabase, **suivi périodique des clans WoT suivis** (diff de roster via l'API WG, notifications Discord enrichies avec le score de recrutement et les stats tomato.gg, historique dans Supabase), commandes `/clan` et `/voice`, et un mini tableau de bord web local. Détails complets : [`discord-bot/README.md`](discord-bot/README.md).

---

## Configuration de Supabase

Le site utilise Supabase comme base de données + fournisseur d'authentification.

### 1. Créer le projet

1. Créez un projet sur https://supabase.com.
2. Dans **Project Settings → API**, récupérez :
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`

⚠️ **Ne mettez jamais la `service_role` key dans `.env`** : elle bypass RLS (elle n'est utilisée que côté serveur, dans les Netlify Functions, via `SUPABASE_SERVICE_ROLE_KEY`).

### 2. Appliquer les migrations

Le schéma vit entièrement dans `supabase/migrations/` (numérotées, idempotentes). Le plus simple est la CLI :

```bash
supabase link --project-ref <your-ref>
supabase db push
```

Sinon, exécutez les fichiers **dans l'ordre numérique** depuis le SQL Editor. Grandes étapes du schéma, pour s'y repérer :

| Plage | Thème |
|-------|-------|
| `0001`–`0006` | Init (tables cœur, RLS, CMS, rôles, modules) |
| `0007`–`0008` | Quiz + scores de modules |
| `0009`–`0014`, `0018`, `0025`–`0026` | Geoguesser (cartes, défi du jour, modes, profil joueur) |
| `0016`–`0017` | CMS (galerie, sections d'accueil) |
| `0019`–`0022`, `0028`–`0030`, `0038`–`0039` | RH (suivi joueurs, matching Discord, audit, historique départs, plafond durée session vocale, correctif jours actifs WoT) |
| `0023`–`0024`, `0027` | RLS quiz/scores |
| `0031`–`0034` | Contrôle d'accès par module (RLS, restrictions) |
| `0035`–`0037` | Suivi des clans WoT (mouvements, recrutement, scoring) |

> `0015` n'existe pas (numéro jamais attribué, sans incidence — la séquence reprend à `0016`).

### 3. Créer un compte admin

Dans **Authentication → Users → Add user**, créez l'utilisateur qui accédera
au dashboard `/admin`. Les droits sont ensuite affinés par module via
**Admin → Utilisateurs** (table `user_module_access`).

### 4. Regénérer les types (optionnel)

Si vous modifiez le schéma, regénérez les types :

```bash
supabase gen types typescript --project-id <your-id> > src/types/database.ts
```

---

## Configuration de l'API Wargaming WoT

1. Créez une application sur https://developers.wargaming.net/applications/.
2. Récupérez `application_id` → `VITE_WOT_APPLICATION_ID` (client) et `WOT_APPLICATION_ID` (Netlify Functions, optionnel — retombe sur la variable client si absente).
3. Restreignez l'application à votre domaine de production (anti-abus).

Le wrapper WoT utilise l'endpoint EU (`api.worldoftanks.eu`).

---

## Stats tomato.gg

Les stats étendues (WN8, winrate, tier moyen, recent stats) sont tirées de
l'API tomato.gg via `netlify/functions/player-stats.mts` et `clan-stats.mts`.
**`TOMATO_API_KEY` est requis côté Netlify** pour obtenir des WN8/winrate
réels — sans elle, ces fonctions retombent silencieusement sur des stats
vides (`wn8 = null`) plutôt que d'échouer. Si l'API tomato.gg renomme ses
champs un jour, une alerte explicite est loggée (les deux métriques WN8
connues, `wn8` et `wnx`, disparaissant en même temps).

---

## Notifications & intégrations Discord

Plusieurs Netlify Functions parlent à Discord, indépendamment du bot VPS :

- `discord-notify.mts` — webhook générique (candidatures, moments mis en avant).
- `discord-sync-members.mts` — sync membres Discord ↔ Supabase (appelée par le bot ou par cron).
- `discord-voice-event.mts` — enregistrement des événements vocaux (appelée par le bot).
- `discord-clan-sync.mts` / `discord-clan-movements.mts` / `discord-clan-config.mts` — pipeline de suivi des clans WoT (appelées par le bot, voir `discord-bot/README.md`).
- `rh-weekly-digest.mts` — rapport RH hebdomadaire (lundi 08:00 UTC) vers `DISCORD_RH_ALERTS_WEBHOOK_URL` : joueurs inactifs, nouvelles recrues, départs.

Pour masquer totalement une URL de webhook utilisée côté client, passez par une Supabase Edge Function plutôt que `src/lib/discord.ts` directement.

---

## Structure

```
src/
├── main.tsx              # Bootstrap React + Router + React Query
├── router.tsx             # 3 layouts : Public, Académie (/modules), Admin (/admin)
├── components/
│   ├── ui/                # Design system (Button, Card, Section, Input, …)
│   ├── layout/             # Navbar, Footer, PublicLayout, AdminLayout
│   ├── sections/            # Hero, LiveStats, About, Activities, TopPlayers, JoinCta
│   ├── admin/                # ClanMovementsTab, etc.
│   └── recruitment/           # AvailabilityPicker, PlayerLookupCard
├── features/                # 1 dossier par domaine : academy, applications, clan, clan-hub,
│                             # clanMovements, content, discord, events, geoguesser,
│                             # identity, leaderboard, media, members, modules, quiz,
│                             # recruitment, rh, roles, stats
├── pages/
│   ├── Home / Members / Events / Gallery / Recruitment / Modules / ModuleStub /
│   │   AuthWgCallback (retour OAuth Wargaming) / NotFound
│   ├── clan-hub/             # ClanHubHome, Chars, Roles, Strategies, Maps, Doctrine, CW, Liens
│   └── admin/                 # Login, AdminHome, AdminApplications, AdminPlayers(+Detail),
│                               # AdminMembers, AdminEvents, AdminContent, AdminGallery,
│                               # AdminHighlights, AdminAchievements, AdminTestimonials,
│                               # AdminModules, AdminAcademie, AdminQuiz*, AdminGeo*,
│                               # AdminClanPages, AdminUsers, AdminSettings
├── lib/                      # cn, env, supabase, wot-api, tomato-api, discord, constants
├── hooks/                     # useAuth (Supabase)
├── types/                      # database.ts (typage Supabase)
└── styles/                     # index.css (Tailwind + tokens)

netlify/functions/    # voir section "Notifications & intégrations Discord" + ci-dessous
discord-bot/          # bot Discord autonome (voir discord-bot/README.md)
supabase/migrations/  # schéma SQL versionné
```

### Netlify Functions (hors Discord, listées plus haut)

| Fonction | Rôle |
|----------|------|
| `player-stats.mts` / `clan-stats.mts` | Stats WoT (WG API + tomato.gg), mode batch, calcul du score de recrutement |
| `player-profile.mts` | Profil joueur, lien compte WG ↔ utilisateur Discord |
| `wg-auth-verify.mts` | Vérification du token OAuth Wargaming.net |
| `wg-maps.mts` | Liste des cartes WoT (cache pour le picker Geoguesser) |
| `snapshot-player-activity.mts` (+ `-trigger`) | Snapshots planifiés des stats de bataille (suivi d'activité RH) |
| `submit-score.mts` | Enregistrement des scores quiz/Geoguesser (token joueur signé) |
| `purge-old-data.mts` | Nettoyage planifié (vieux snapshots, tentatives de quiz) |
| `cloudinary-sign.mts` / `cloudinary-delete.mts` | Uploads/suppressions Cloudinary signés |
| `_player-token.ts` | Utilitaire interne — génération/vérification HMAC des tokens joueur |

---

## Déploiement (Netlify)

`netlify.toml` est pré-configuré : build `npm run build`, publish `dist/`,
headers de sécurité (X-Frame-Options, etc.), cache agressif sur `/assets/*`,
SPA fallback. Les fonctions planifiées (`snapshot-player-activity`,
`rh-weekly-digest`, `purge-old-data`) utilisent le scheduling natif Netlify.

À faire côté Netlify :

- Ajouter toutes les variables d'environnement listées dans `.env.example` (client **et** serveur).
- Définir `ALLOWED_ORIGINS` (sinon les Functions rejettent toutes les requêtes cross-origin).
- Pointer le domaine (`atfr-clan.netlify.app` ou perso).
- Déployer/maintenir `discord-bot/` séparément sur un VPS (PM2) — voir son README.

---

## Pistes restantes

- **Couverture de tests** : seulement 2 fichiers de tests Vitest aujourd'hui (`player-token`, scoring Geoguesser) — le reste (scoring de recrutement, sync clans, RLS) n'est validé que manuellement.
- **Multi-rôles admin plus fins** : l'accès par module existe (`user_module_access`), mais pas de rôles hiérarchiques au sein d'un même module.
- **i18n** si un jour vous voulez ouvrir à des joueurs non-FR.
