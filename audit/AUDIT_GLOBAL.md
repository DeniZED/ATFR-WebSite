# AUDIT GLOBAL — Site ATFR

**Date** : 2026-06-30
**Périmètre** : `src/`, `netlify/functions/`, `supabase/migrations/`, `discord-bot/` (lecture seule, pour contexte de couplage)
**Méthode** : lecture directe de fichiers critiques + 5 audits parallèles thématiques (Sécurité, UX/Design/Accessibilité, Architecture/Maintenabilité, Logique métier, Performance), recoupés et vérifiés par relecture manuelle du code source pour chaque finding classé P0.
**Contrainte respectée** : aucun fichier fonctionnel n'a été modifié, supprimé ou créé en dehors de `/audit`. Aucune variable d'environnement modifiée. Aucune commande destructive exécutée.

---

## 1. Vérification outillage (lint / typecheck / test / build)

Les 4 commandes existent dans `package.json` et ont été exécutées telles quelles, sans modification :

| Commande | Résultat | Détail |
|---|---|---|
| `npm run lint` (`eslint . --max-warnings 0`) | ✅ **0 erreur, 0 warning** | Codebase propre au sens ESLint strict |
| `npm run typecheck` (`tsc -b --noEmit`) | ✅ **0 erreur** | TypeScript strict respecté partout |
| `npm run test` (`vitest run`) | ✅ **23/23 tests passent** | **Mais seulement 2 fichiers de test dans tout le repo** : `src/__tests__/player-token.test.ts` (5 tests) et `src/features/geoguesser/scoring.test.ts` (18 tests). Aucun test sur les composants, les hooks métier, les fonctions Netlify, ni sur le calcul du score de recrutement. |
| `npm run build` (`tsc -b && vite build`) | ✅ build réussi (7.09s) | Voir AUDIT_PERFORMANCE.md pour le détail des chunks |
| `npm run audit:deps` (`npm audit --audit-level=moderate`) | ⚠️ **11 vulnérabilités** (1 critique, 2 hautes, 7 modérées, 1 basse) | Voir AUDIT_SECURITE.md — la plupart sont des devDependencies, mais `react-router-dom` (prod) et `ws` (transitif via `@supabase/supabase-js`, prod) sont concernés |

**Conclusion outillage** : la qualité du code "statique" (typage, lint, build) est saine — c'est un vrai point fort. Mais la couverture de test est quasi nulle (2 fichiers sur ~17 features + ~29 pages admin + ~18 fonctions Netlify), ce qui est incohérent avec un objectif de mise en production avec données sensibles et maintenance pluriannuelle.

---

## 2. Cartographie de l'architecture

### Stack
- **Frontend** : React 18 + TypeScript strict + Vite, routing via `react-router-dom` (`createBrowserRouter`, lazy-loading systématique des pages)
- **State serveur** : TanStack Query (React Query) — ~101 hooks `useQuery`/`useMutation` répartis dans `src/features/*/queries.ts`
- **Formulaires** : `react-hook-form` + `zod` (utilisé dans 1 seul fichier actuellement : `Recruitment.tsx`)
- **Style** : Tailwind CSS + design tokens custom (`tailwind.config.js`, palette `atfr-*`), `class-variance-authority` pour les variants de composants UI
- **Backend** : Supabase (Postgres + Row Level Security + Auth), 42 migrations SQL (`0001` → `0043`, sans `0015`)
- **Fonctions serveur** : Netlify Functions (`.mts`), 18 fichiers — endpoints API + crons (`snapshot-player-activity`, `purge-old-data`, `rh-weekly-digest`)
- **Médias** : Cloudinary (upload signé côté serveur via `cloudinary-sign.mts`)
- **Bot Discord** : projet Node.js séparé (`discord-bot/`), déployé indépendamment (PM2/VPS), dashboard HTTP natif (`node:http`), synchronisation avec Supabase via `supabaseSync.ts`
- **APIs externes** : Wargaming.net (WoT EU, OAuth-like via `wg-auth-verify.mts`), tomato.gg (wrapper de stats WN8/winrate)

### Arborescence `src/`
```
src/
├── components/   (academy, admin, clan, geoguesser, layout, quiz, recruitment, sections, ui)
├── data/         (contenus statiques : doctrine, strategies, maps, roles clan — voir finding P0 sécurité)
├── features/     (17 dossiers métier : academy, applications, clan, clanMovements, content, cw,
│                  discord, events, geoguesser, identity, leaderboard, media, members, modules,
│                  quiz, recruitment, rh, roles, stats — chacun avec queries.ts / hooks)
├── hooks/        (hooks transverses)
├── lib/          (clients API : supabase, wot-api, tomato-api…)
├── pages/        (pages publiques + admin/ [29 pages] + clan/ + modules/)
├── styles/
└── types/
```

### Routing (`src/router.tsx`)
- Zone publique (`PublicLayout`) : accueil, membres, événements, galerie, recrutement, callback OAuth WG
- Zone "clan" (`/clan/*`) : protégée par `RequireClanAccess` (contrôle dynamique via table `clan_pages`, voir §3 sécurité ci-dessous — **gate client-side uniquement**)
- Zone "académie" (`/modules/*`) : modules pédagogiques publics (quiz, Geoguesser)
- Zone admin (`/admin/*`) : protégée par `RequireAuth` + `RequireModuleAccess` par module (`moduleKey`), 18 modules admin distincts avec accès granulaire

### Auth / rôles / permissions
- Auth admin : Supabase Auth classique (email/password), table `user_roles` avec colonne `module_access` (array) pour le RBAC granulaire
- Fonctions `SECURITY DEFINER` en base : `is_super_admin()`, `is_admin()`, `is_moderator()`, `is_editor()` — bonne pratique de centralisation des contrôles RLS
- Auth "joueur" : flux OAuth-like Wargaming.net (`wg-auth-verify.mts` + `AuthWgCallback.tsx`), nonce CSRF via `sessionStorage`
- Accès "clan-hub" : table `clan_pages.allowed_clans` (jsonb), comparée côté client au `clan_id` du joueur WG vérifié — **pas de RLS sur le contenu lui-même, qui est statique et bundlé** (voir finding P0)

### Flux de données critiques
1. **Score Geoguesser/quiz** : `submit-score.mts` reçoit `{score, max_score, player_token, ...}` du client, vérifie seulement `0 ≤ score ≤ max_score ≤ 1 000 000`, insère via service-role (bypass RLS). **Aucun recalcul serveur** depuis les données brutes de la partie. Voir AUDIT_SECURITE.md / AUDIT_LOGIQUE_METIER (inclus dans le plan d'action).
2. **Score de recrutement** : centralisé dans `player-stats.mts::computeRecruitmentScore` (lignes 198-221), consommé en HTTP par le site (`src/lib/tomato-api.ts`) et par le bot Discord (`discord-bot/src/config.ts`) — **bon point**, pas de duplication de la formule elle-même. Seuils WN8/couleurs en revanche dupliqués manuellement (`discord-bot/src/clan/wn8.ts`, commentaire explicite dans le code admettant la synchro manuelle).
3. **Synchronisation roster clan** : bot Discord (`wgClient.fetchClanRoster`) → `discord-clan-sync.mts` → RPC SQL `sync_clan_roster` (migration `0035`) — **faille confirmée sur roster vide**, voir P0 logique métier.
4. **Snapshot d'activité joueur** : cron `snapshot-player-activity.mts`, lookback de 30 jours sur le dernier snapshot connu (fix de la migration `0039`, vérifié présent dans le code actuel) — robuste aux pannes de l'API WG (skip du batch, pas de faux "0 battles").

### Variables d'environnement
Non modifiées, non communiquées dans ce rapport. `netlify.toml` exclut explicitement `WOT_APPLICATION_ID` et `CLAN_ID` du secret-scanning car ce sont des valeurs publiques par design de l'API WG (commentaire dans le fichier le justifie correctement). Aucun secret en clair trouvé dans le code source lors des explorations.

### Sécurité réseau / headers
`netlify.toml` configure déjà : CSP stricte, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security` (preload), `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`, `Permissions-Policy` restrictive. **C'est un vrai point fort**, peu de sites de cette taille ont une CSP aussi soignée dès le départ.

### Build & performance (aperçu, détail dans AUDIT_PERFORMANCE.md)
- Code-splitting par route déjà en place (`React.lazy` systématique dans `router.tsx`)
- `manualChunks` Vite configuré (react/supabase/query/motion/forms)
- Chunk le plus lourd : `PieChart` (399 kB / 115 kB gzip) — à vérifier qu'il n'est chargé que sur les pages admin qui en ont besoin

---

## 3. Constat transversal le plus important

Le code est **structurellement sain** (typage strict, 0 `any`, lint propre, build propre, RLS + RBAC en place, CSP soignée) mais souffre de **deux classes de problèmes récurrentes** qui traversent presque tous les axes d'audit :

1. **Le contrôle d'accès client-side est confondu avec une vraie protection.** `RequireClanAccess`, `RequireModuleAccess`, et la vérification de score via `player_token` donnent l'illusion d'une protection alors que le contenu protégé (pages clan statiques) ou la donnée soumise (score) ne sont jamais réellement gardés côté serveur. C'est le fil rouge des findings P0.
2. **La logique métier fuit dans les composants React** au lieu de vivre dans des modules testables (`features/*/logic.ts` ou équivalent) — formules de score, seuils de tier, calculs d'agrégats. Cela explique à la fois la quasi-absence de tests, les divergences entre systèmes parallèles (ex. deux systèmes de "tier" différents pour Geoguesser), et le risque de divergence site/bot.

Le détail complet par axe est dans les fichiers `AUDIT_SECURITE.md`, `AUDIT_UX_DESIGN.md`, `AUDIT_ARCHITECTURE.md`, `AUDIT_PERFORMANCE.md`, `AUDIT_ACCESSIBILITE_SEO.md`. La synthèse priorisée est dans `PLAN_ACTION_PRIORISE.md` et la feuille de route dans `ROADMAP_CORRECTIONS.md`.
