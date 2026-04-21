# ATFR — Clan World of Tanks

Site officiel du clan **ATFR** (World of Tanks, serveur EU) : vitrine publique,
formulaire de recrutement avec vérification WoT / tomato.gg, dashboard admin
(candidatures, événements, membres).

Refonte complète — React 18 · Vite · TypeScript · Tailwind · Supabase.

---

## Stack

| Domaine        | Techno                                                    |
| -------------- | --------------------------------------------------------- |
| Framework      | React 18 + Vite                                           |
| Langage        | TypeScript strict                                         |
| UI             | Tailwind CSS, lucide-react, framer-motion, CVA            |
| Formulaires    | react-hook-form + zod                                     |
| Data-fetching  | TanStack Query                                            |
| Auth + DB      | Supabase (Postgres + Row Level Security)                  |
| Stats joueurs  | API Wargaming WoT EU + wrapper tomato.gg                  |
| Notifications  | Webhook Discord                                           |
| Déploiement    | Netlify                                                   |
| CI             | GitHub Actions (lint / typecheck / build)                 |

---

## Démarrage rapide

```bash
npm install
cp .env.example .env   # puis remplissez vos valeurs
npm run dev
```

Scripts :

- `npm run dev` — serveur de dev (http://localhost:5173)
- `npm run build` — build de production
- `npm run preview` — servir le build local
- `npm run lint` / `npm run typecheck` — contrôle qualité
- `npm run format` — Prettier

---

## Configuration de Supabase

Le site utilise Supabase comme base de données + fournisseur d'authentification
à la place de l'ancien Firebase Realtime Database.

### 1. Créer le projet

1. Créez un projet sur https://supabase.com.
2. Dans **Project Settings → API**, récupérez :
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`

⚠️ **Ne mettez jamais la `service_role` key dans `.env`** : elle bypass RLS.

### 2. Appliquer les migrations

Dans **SQL Editor**, exécutez dans l'ordre :

1. `supabase/migrations/0001_init.sql` — crée les tables `applications`,
   `events`, `members`, `members_history`, `activity_logs`, plus les triggers
   `updated_at`.
2. `supabase/migrations/0002_rls.sql` — active Row Level Security et crée les
   policies :
   - `applications` : insertion anonyme (formulaire ouvert), lecture/update/delete
     réservés aux utilisateurs authentifiés.
   - `events` : lecture publique des événements `is_public = true`, lecture
     complète + écriture pour les admins.
   - `members` / `members_history` : lecture publique, écriture admin.
   - `activity_logs` : admin uniquement.

Vous pouvez aussi utiliser la Supabase CLI :

```bash
supabase link --project-ref <your-ref>
supabase db push
```

### 3. Créer un compte admin

Dans **Authentication → Users → Add user**, créez l'utilisateur qui accédera
au dashboard `/admin`. Toute personne authentifiée a les droits admin dans
cette v1 — si vous en voulez plusieurs niveaux, ajoutez une table `profiles`
avec un rôle et modifiez les policies RLS.

### 4. Regénérer les types (optionnel)

Si vous modifiez le schéma, regénérez les types :

```bash
supabase gen types typescript --project-id <your-id> > src/types/database.ts
```

---

## Configuration de l'API Wargaming WoT

1. Créez une application sur https://developers.wargaming.net/applications/.
2. Récupérez `application_id` → `VITE_WOT_APPLICATION_ID`.
3. Restreignez l'application à votre domaine de production (anti-abus).

Le wrapper WoT utilise l'endpoint EU (`api.worldoftanks.eu`). Pour un autre
cluster, éditez `src/lib/wot-api.ts`.

---

## Stats tomato.gg

Les stats étendues (WN8, tank stats, recents) sont tirées d'un wrapper
best-effort autour de l'API publique de tomato.gg
(`src/lib/tomato-api.ts`). Si l'endpoint change ou est indisponible, le site
retombe proprement sur les données Wargaming et garde le lien direct vers le
profil tomato.gg en CTA externe.

---

## Notifications Discord

Le webhook est appelé côté client à la soumission d'une candidature, via
`src/lib/discord.ts`. **Pour masquer totalement l'URL du webhook**, créez
une Supabase Edge Function (`supabase/functions/notify-application/index.ts`)
qui se charge d'appeler Discord — une fonction simple prenant le payload
applique-side de la candidature est suffisante.

---

## Structure

```
src/
├── main.tsx              # Bootstrap React + Router + React Query
├── router.tsx            # Routes publiques + admin (lazy)
├── components/
│   ├── ui/               # Design system (Button, Card, Section, Input, …)
│   ├── layout/           # Navbar, Footer, PublicLayout, AdminLayout
│   ├── sections/         # Hero, LiveStats, About, Activities, TopPlayers, JoinCta
│   └── recruitment/      # AvailabilityPicker, PlayerLookupCard
├── features/
│   ├── applications/     # queries + schema zod
│   ├── clan/             # infos clan WoT
│   ├── events/           # CRUD événements
│   ├── members/          # membres synchronisés
│   └── stats/            # agrégations WoT + tomato.gg
├── pages/
│   ├── Home.tsx / Members.tsx / Events.tsx / Recruitment.tsx / NotFound.tsx
│   └── admin/            # Login, AdminHome, AdminApplications, AdminMembers,
│                         # AdminEvents, AdminSettings
├── lib/                  # cn, env, supabase, wot-api, tomato-api, discord, constants
├── hooks/                # useAuth (Supabase)
├── types/                # database.ts (typage Supabase)
└── styles/               # index.css (Tailwind + tokens)
```

---

## Déploiement (Netlify)

`netlify.toml` est pré-configuré : build `npm run build`, publish `dist/`,
headers de sécurité (X-Frame-Options, etc.), cache agressif sur `/assets/*`,
SPA fallback.

À faire côté Netlify :

- Ajouter les variables d'environnement listées dans `.env.example`.
- Pointer le domaine (`atfr-clan.netlify.app` ou perso).

---

## Idées d'extensions

- **Supabase Edge Function** pour masquer le webhook Discord et ajouter
  un rate-limit sur les candidatures.
- **Cron tomato.gg** pour peupler la table `members` avec les stats et
  historiser l'évolution.
- **Graphes** (recharts) : évolution des candidatures, WN8 moyen du clan,
  activité hebdo.
- **Calendrier** des événements avec `react-day-picker` ou `rfc5545` export
  (iCal).
- **Twitch / Discord widgets** pour voir qui stream / qui est en vocal.
- **Multi-rôles admin** (profiles + policies RLS différenciées).
- **i18n** si un jour vous voulez ouvrir à des joueurs non-FR.
