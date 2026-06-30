# AUDIT SÉCURITÉ — Site ATFR

> ⚠️ **Signalement immédiat (conformément à la consigne)** : deux problèmes de sécurité critiques (P0) ont été **confirmés par lecture directe du code source**, pas seulement suspectés. Ils sont détaillés en §1 et §2 ci-dessous. Aucune correction n'a été appliquée — ce document est uniquement diagnostique.

---

## 1. P0 — Score Geoguesser/Quiz entièrement contrôlé par le client (anti-triche absent)

**Fichiers concernés** : `netlify/functions/submit-score.mts` (118 lignes), `netlify/functions/_player-token.ts` (53 lignes)

**Constat (lu intégralement, confirmé)** :
- `submit-score.mts` reçoit `score` et `max_score` directement dans le corps de la requête HTTP envoyée par le navigateur du joueur.
- La seule validation appliquée est un test de plage numérique : `0 ≤ score ≤ max_score`, `max_score > 0`, `max_score ≤ 1 000 000`.
- **Il n'existe aucun recalcul serveur** à partir des données brutes de la partie (coordonnées cliquées, distance réelle, temps écoulé pour Geoguesser ; réponses cochées pour le quiz). Le score envoyé par le client est inséré tel quel dans `module_scores`, via une connexion **service-role qui contourne RLS**.
- Le `player_token` (HMAC-SHA256, payload `{a: accountId, e: expiry}`, TTL 6h) ne sert **qu'à vérifier l'identité Wargaming** du joueur (`is_verified`, `player_account_id`). Il ne contient :
  - **aucun nonce** lié à une partie précise,
  - **aucun identifiant de round/challenge**,
  - **aucune marque de "déjà utilisé"** (pas de table de tokens consommés).
- Conséquence : un token valide peut être **réutilisé indéfiniment pendant 6h** pour soumettre autant de scores que voulu, sans aucun lien avec une partie réellement jouée.

**Scénario d'exploitation concret** : un joueur ouvre les DevTools, intercepte ou reconstitue un appel à `submit-score.mts`, et envoie directement `{module_slug: 'wot-geoguesser', score: 1000000, max_score: 1000000, player_token: '<token valide ou absent>'}`. Le classement (leaderboard) est immédiatement faussé, avec ou sans identité WG vérifiée.

**Pourquoi c'est grave** : le leaderboard est une fonctionnalité publique, visible par tout le clan ; un classement trivialement falsifiable détruit la crédibilité de la fonctionnalité et peut être exploité par n'importe quel visiteur, pas seulement un membre malveillant.

**Tests existants** : les 5 tests de `src/__tests__/player-token.test.ts` couvrent la validité de signature et l'expiration du token — **aucun test ne couvre le rejeu ou l'absence de lien à une partie**, ce qui est cohérent avec l'absence de protection réelle.

**Risque d'une correction** : élevé en effort (nécessite de repenser le flux : soit calcul du score 100% côté serveur à partir d'événements bruts envoyés par le client, soit a minima un nonce à usage unique par round stocké en base et consommé à la soumission). À ne pas corriger sans validation explicite, car cela touche un parcours utilisateur central du module Académie.

---

## 2. P0 — Contenu "clan-hub" exposé publiquement via les bundles JS statiques

**Fichiers concernés** : `src/components/layout/RequireClanAccess.tsx`, `src/features/clan/useClanAccess.ts`, `src/data/clan/doctrine.ts`, `src/data/clan/strategies.ts`, `src/data/clan/maps.ts`, `src/data/clan/roles.ts`, `src/pages/clan/ClanDoctrine.tsx` (et les pages clan sœurs), `netlify.toml` (règles de cache).

**Constat (lu intégralement, confirmé)** :
- `RequireClanAccess` (lignes 10-56) protège l'**affichage React** des routes `/clan/*` en vérifiant côté client que le `clan_id` du joueur WG connecté figure dans `clan_pages.allowed_clans`.
- Mais le **contenu lui-même** (doctrine du clan, stratégies de clan war, cartes prioritaires, définitions de rôles) n'est **pas stocké en base avec RLS** : il est codé en dur dans des fichiers TypeScript statiques sous `src/data/clan/*.ts`, importés directement par les composants de page (`ClanDoctrine.tsx:3`, `ClanStrategies.tsx:2`, `ClanMaps.tsx:2`, `ClanRoles.tsx:1`).
- Ces fichiers sont **compilés dans les chunks JS publics** générés par Vite (ex. `ClanDoctrine-xxxx.js`, `ClanStrategies-xxxx.js`), qui sont servis par Netlify comme **fichiers statiques sans aucune authentification**, avec un cache explicite `Cache-Control: public, max-age=31536000, immutable` (`netlify.toml`, règle `/assets/*`).
- `RequireClanAccess` ne fait que retarder le *rendu* du composant — il ne fait pas obstacle à la **récupération directe du fichier JS** par son URL (visible dans le Network tab dès qu'un membre légitime charge la page, ou devinable via le manifest de build).

**Scénario d'exploitation concret** : un joueur non membre du clan (ou un clan rival) récupère l'URL du chunk `ClanStrategies-*.js` ou `ClanDoctrine-*.js` (via le code source de la page, le manifeste Vite, ou simplement en observant les requêtes réseau d'un membre du clan qui partage un lien), et lit en clair les stratégies de clan war, les cartes prioritaires et la doctrine interne — sans avoir besoin d'un compte, d'un token, ni d'appartenir au clan.

**Pourquoi c'est grave** : c'est exactement le type de contenu (stratégies, doctrine) qu'un clan rival en clan wars aurait intérêt à consulter. Le mécanisme de protection actuel donne une **fausse impression de confidentialité** aux membres qui y contribuent.

**Solution de principe (à ne pas implémenter sans validation)** : déplacer ce contenu en base Supabase, avec RLS conditionnée à l'appartenance au clan (vérifiable côté serveur, par ex. via une fonction `SECURITY DEFINER` qui interroge le `clan_id` vérifié du joueur), de façon analogue à ce qui existe déjà pour `clan_pages`. Effort élevé (migration de contenu + nouvelle politique RLS + refonte des pages pour passer d'un import statique à un fetch).

---

## 3. P0 — Roster clan vide → départs en masse faussement enregistrés

Détail technique complet dans `AUDIT_ARCHITECTURE.md` / `PLAN_ACTION_PRIORISE.md` (catégorisé "logique métier / intégrité des données", mais a un impact sécurité indirect : un faux "tout le monde a quitté le clan" peut déclencher des notifications Discord en masse et fausser les statistiques RH visibles par les admins).

**Résumé** : `discord-bot/src/clan/wgClient.ts:71-94` (`fetchClanRoster`) ne vérifie pas qu'un roster vide reçu de l'API WG est anormal ; `netlify/functions/discord-clan-sync.mts:93-131` (`isValidPayload`/`isValidMember`) accepte structurellement un tableau `members: []` ; la RPC SQL `sync_clan_roster` (migration `0035_clan_tracker.sql:266-306`) calcule alors `gone_leaves` comme l'intégralité des membres actuellement en cache, faute de correspondance avec un roster entrant vide. **Aucun garde-fou nulle part dans la chaîne.**

---

## 4. Dépendances — `npm audit`

```
11 vulnérabilités : 1 critique, 2 hautes, 7 modérées, 1 basse
```

| Paquet | Sévérité | Type | Concerné en prod ? |
|---|---|---|---|
| `vitest` (chaîne `esbuild`→`vite`→`vite-node`→`@vitest/mocker`) | **Critique** | devDependency | Non (outil de test uniquement) |
| `ws` 8.0.0–8.20.1 | **Haute** | transitif via `@supabase/supabase-js` → `@supabase/realtime-js` | **Oui** — dépendance de production (websocket realtime Supabase) |
| `react-router` 6.7.0–6.30.3 (via `react-router-dom` ^6.26.2) | Modérée | dépendance directe de production | **Oui** — open redirect via URL `//path` (GHSA-2j2x-hqr9-3h42) |
| `@babel/core` ≤7.29.0 | (non listée séparément, agrégée) | devDependency | Non |
| `brace-expansion` (via `@typescript-eslint`) | Modérée | devDependency | Non |
| `js-yaml` 4.0.0–4.1.1 | Modérée | devDependency probable | À vérifier l'usage exact |
| `esbuild` ≤0.24.2 | Modérée | devDependency (via Vite/Vitest) | Non en prod, mais affecte le serveur dev local |

**Point d'attention prioritaire** : `react-router-dom` et `ws` sont des dépendances de **production**. `npm audit fix` (sans `--force`) résout `react-router`, `js-yaml`, `brace-expansion`, `@babel/core`, `ws` sans breaking change a priori — c'est un correctif à faible risque et fort impact, mais reste un changement de dépendance à valider avant application (peut nécessiter un test de non-régression sur le routing et sur les abonnements realtime Supabase).

---

## 5. `.mts` (Netlify Functions) hors du périmètre ESLint

**Constat (vérifié)** : `eslint.config.js` ne cible que `**/*.{ts,tsx}` dans son `content`/pattern de fichiers. Un test direct (`npx eslint netlify/functions/wg-auth-verify.mts`) confirme : *"File ignored because no matching configuration was supplied"*.

**Pourquoi c'est un problème de sécurité** : les fonctions Netlify sont le code le plus sensible du projet (auth WG, soumission de score, accès service-role à Supabase qui bypass RLS) et échappent totalement au linting — donc aux règles `no-unused-vars`, détection de patterns dangereux, etc. C'est aussi le code le moins testé (0 test sur les 18 fichiers `.mts`).

---

## 6. RLS / RBAC — points positifs et points de vigilance

**Points positifs confirmés** :
- RLS activée systématiquement sur les tables examinées (`clan_pages`, `applications`, `module_scores`, etc.)
- Centralisation des contrôles via fonctions `SECURITY DEFINER` (`is_super_admin`, `is_admin`, `is_moderator`, `is_editor`) plutôt que des conditions RLS dupliquées table par table — bonne pratique
- Progression de durcissement RLS visible sur 6 migrations distinctes (signe d'une vigilance continue, même si réactive plutôt que proactive dès la conception)

**Points de vigilance** :
- `applications` (migration `0001_init.sql`) : **aucune contrainte UNIQUE** sur le joueur candidat → candidatures en doublon possibles, y compris par un joueur déjà membre (aucun cross-check contre la table `members`).
- `src/features/applications/queries.ts:60-84` (`useUpdateApplicationStatus`) : l'UPDATE ne vérifie pas `WHERE status = 'pending'` avant la transition, et la policy RLS `"auth can update applications" using (true) with check (true)` est permissive sans restriction d'état — un double-clic ou une requête concurrente peut produire une double validation/refus.
- `module_scores` : aucune contrainte limitant le nombre de tentatives — combiné au point 1, un joueur peut rejouer indéfiniment pour optimiser un score qu'il peut de toute façon falsifier.
- Accès clan-hub (`useClanAccess.ts:34`, `staleTime: 5 * 60_000`) : pas d'abonnement realtime, donc une révocation d'accès (retrait du `clan_id` autorisé) **n'est pas immédiate** — un membre exclu garde l'accès jusqu'à expiration du cache (5 min) ou rechargement complet de page. Risque limité (fenêtre courte) mais à connaître si la révocation doit être instantanée pour un cas d'usage donné (ex. exclusion disciplinaire urgente).

---

## 7. Points positifs à noter (sécurité)

- **Aucun secret en clair** trouvé dans le code source lors des explorations menées.
- `netlify.toml` configure une CSP stricte et un jeu complet de headers de sécurité (HSTS preload, X-Frame-Options DENY, COOP/CORP same-origin, Permissions-Policy restrictive) — rare d'avoir un niveau de soin aussi élevé dès le départ.
- Le flux OAuth-like Wargaming utilise un nonce CSRF en `sessionStorage` (`AuthWgCallback.tsx` + `wg-auth-verify.mts`) — bonne pratique anti-CSRF sur ce flux précis.
- `WOT_APPLICATION_ID`/`CLAN_ID` exclus du secret-scanning avec une justification documentée en commentaire — décision consciente, pas un oubli.
- Idempotence correcte de `sync_clan_roster` (upsert sur `(clan_id, account_id)`) — les retries réseau ne créent pas de doublons d'événements "rejoint le clan".

---

## Résumé des findings sécurité (voir détail chiffré dans PLAN_ACTION_PRIORISE.md)

| # | Finding | Sévérité |
|---|---|---|
| 1 | Score Geoguesser/quiz falsifiable côté client, token sans anti-rejeu | **P0** |
| 2 | Contenu clan-hub confidentiel exposé via bundle JS public | **P0** |
| 3 | Roster clan vide → départs en masse faussement enregistrés | **P0** |
| 4 | `react-router-dom`/`ws` (prod) — vulnérabilités modérée/haute via npm audit | P1 |
| 5 | `.mts` (fonctions serveur sensibles) hors périmètre ESLint | P1 |
| 6 | Candidatures dupliquables, pas de garde d'état sur validation/refus | P1 |
| 7 | Révocation d'accès clan-hub non instantanée (cache 5 min) | P2 |
