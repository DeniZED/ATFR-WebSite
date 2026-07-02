# ROADMAP DE CORRECTIONS — Site ATFR

Découpage en 5 lots, du plus urgent au plus structurant. Chaque lot est conçu pour être livrable indépendamment, sans bloquer les suivants.

> **Mise à jour 2026-06-30** : le porteur du projet a validé l'exécution du périmètre « Lot 1 sûr + Lot 2 » (items ne nécessitant pas de décision produit). Ce périmètre est **livré** — voir le détail ✅ ci-dessous. Le reste de la roadmap (P0-1, P0-2, P0-6, Lots 3-5) reste une proposition de séquencement à valider avant exécution, conformément à la consigne de ne pas faire de refonte sans validation.
>
> **Mise à jour 2026-06-30 (2)** : P0-1 a été tranché par le porteur du projet (Option A — recalcul serveur complet) et scopé au **Geoguesser uniquement** pour cette passe (« Geoguesser d'abord, quiz ensuite »). Le volet Geoguesser est **livré** : migration `0044_geoguesser_server_sessions.sql`, helper de scoring serveur `_geoguesser-scoring.ts`, 3 fonctions Netlify (`geoguesser-start-session.mts`, `geoguesser-submit-round.mts`, `geoguesser-finish-session.mts`), intégration `Geoguesser.tsx`, et test de parité client/serveur. Le volet quiz reste **non traité**, à planifier séparément.
>
> **Mise à jour 2026-07-02** : le volet quiz est **livré** à son tour : migration `0045_quiz_server_sessions.sql` (vue `quiz_answers_public` sans `is_correct`, table `quiz_game_sessions`, RLS analytics durci), 3 fonctions Netlify (`quiz-start-session.mts`, `quiz-submit-answer.mts`, `quiz-finish-session.mts`), intégration `GuideBots.tsx`, et verrouillage de `submit-score.mts` pour les slugs serveur-autoritaires. **P0-1 est entièrement corrigé.**
>
> **Mise à jour 2026-07-02 (2)** : P0-6 (modales accessibles) puis P0-2 (contenu clan-hub) ont été livrés à leur tour — voir détails ✅ ci-dessous. **Tous les findings P0 de l'audit sont désormais corrigés.**
>
> **Mise à jour 2026-07-02 (3)** : vague de consolidation post-P0 livrée — page admin d'édition du contenu clan (`/admin/pages-clan/contenu`), **P1-2** (ESLint étendu aux `.mts`) et **P2-4** (tests `computeRecruitmentScore`).
>
> **Mise à jour 2026-07-02 (5)** : **P1-4** (éligibilité recrutement centralisée dans `features/recruitment/logic.ts` + tests) et **P2-2 volet confirmation** (`useConfirm`/`ConfirmProvider` accessibles, 22 `confirm()` natifs remplacés) livrés.
>
> **Mise à jour 2026-07-02 (4)** : **P1-1** (npm audit fix — react-router/ws/js-yaml/@babel/core/brace-expansion patchés, restent des remontées dev-only vite/vitest) et **P1-3** (anti-doublons candidatures via index uniques partiels + verrouillage optimiste sur la revue, migration `0047`) livrés.

---

## Lot 1 — Corrections critiques (sécurité & accessibilité bloquantes)
*Objectif : lever les risques P0 avant toute exposition à des utilisateurs réels avec des données sensibles.*

1. **✅ P0-4** Focus clavier sur `Button.tsx` — correction d'une ligne, risque quasi nul, bénéfice immédiat sitewide. **CORRIGÉ.**
2. **✅ P0-5** Rendre `MinimapClickPlacer` accessible au clavier — correction ciblée, risque faible. **CORRIGÉ** (flèches + Entrée/Espace, `role="button"`, `aria-label`).
3. **✅ P0-3** Garde-fou roster vide avant `syncClanRoster()` — correction défensive ciblée, risque faible, évite un incident de données potentiellement lourd à corriger après coup. **CORRIGÉ.**
4. **✅ P0-1** Score Geoguesser/quiz falsifiable — décision produit tranchée (Option A, recalcul serveur complet). **CORRIGÉ en deux passes** : volet Geoguesser (sessions serveur-autoritaires + 3 fonctions Netlify + test de parité de scoring) puis volet quiz (vue sans `is_correct`, sessions serveur, analytics assainies) + verrouillage de `submit-score.mts` pour ces deux modules.
5. **✅ P0-2** Contenu clan-hub exposé via bundle public — décision produit validée, **CORRIGÉ** : contenu migré dans `clan_page_content` (migration `0046`, seed snapshot, fichiers `src/data/clan/*.ts` supprimés), servi exclusivement par la fonction Netlify `clan-content.mts` après vérification serveur du `player_token` HMAC et du `clan_id` réel (API WG) contre `clan_pages.allowed_clans`. Édition admin : ✅ page `/admin/pages-clan/contenu` livrée (édition JSON par section avec validation).
6. **✅ P0-6** Modales accessibles (`role="dialog"`, piège de focus, `Echap`) — **CORRIGÉ** via un hook partagé `useModalA11y` (pile de dialogues pour gérer l'empilement, piège de focus Tab/Maj+Tab, fermeture Echap, restauration du focus) + composant `ModalShell` pour les cas simples, appliqués aux 3 overlays non conformes (`AvatarCustomizer`, `AcademyProfilePanel`, panneau « Mes stats » de Geoguesser). Le `ConfirmDialog` du Lot 3 (item 1) pourra se construire sur `ModalShell`.

*Estimation* : **lot entièrement livré** (PR #140 à #144).

---

## Lot 2 — Gains rapides UX / Design
*Objectif : améliorations à fort impact perçu, faible risque, faible effort — livrables en parallèle du Lot 1 sans s'y substituer.*

1. **✅ P1-7** Ajouter `og-image.png` manquant. **CORRIGÉ** (image générée aux dimensions recommandées 1200×630, charte graphique ATFR).
2. **✅ P1-9** Traduire les messages d'erreur Supabase exposés en `Recruitment.tsx`/`Login.tsx`. **CORRIGÉ** via un mapper partagé `src/lib/error-messages.ts`.
3. **✅ P1-10** Distinguer `isError`/`isEmpty` dans `AdminGallery.tsx`/`AdminApplications.tsx` (pattern déjà présent ailleurs dans le code, à dupliquer). **CORRIGÉ.**
4. **✅ P1-12** Corriger `hidden sm:inline` → `sr-only sm:not-sr-only` dans `AvatarCustomizer.tsx`. **CORRIGÉ.**
5. **✅ P1-13** Aligner `Select.tsx` sur `Input.tsx` pour `aria-invalid`/`aria-describedby`. **CORRIGÉ.**
6. **✅ P2-7** Ajouter les `<h1>` manquants (`Members.tsx`, `Recruitment.tsx`), corriger les sauts de niveau de titre sur `Home.tsx`. **CORRIGÉ** — `Members.tsx`/`Recruitment.tsx` utilisent désormais `<Section as="h1">` (nouvelle prop additive, par défaut toujours `h2`) ; vérification de `Home.tsx` : la hiérarchie h1→h2→h3 était en fait déjà intacte via le composant `Section` partagé, aucun saut réel constaté.
7. **P1-6** Relever les opacités `text-atfr-fog` insuffisantes (94 occurrences) — à traiter par lot de pages plutôt qu'en une fois, en commençant par la zone clan-hub (la plus utilisée quotidiennement). *Non traité — hors périmètre de cette vague.*

*Estimation* : chaque item est de l'ordre de quelques heures, aucune dépendance entre eux, peuvent être répartis entre plusieurs personnes/sessions. Items 1-6 **livrés** ; item 7 reste à planifier séparément.

---

## Lot 3 — Nettoyage et refactor de modules ciblés
*Objectif : réduire la duplication et le couplage logique métier/UI identifiés comme cause racine de plusieurs findings.*

1. **⚠️ P2-2** Factoriser le pattern modale/confirmation/pied de formulaire des 8 pages admin CRUD + remplacer les `window.confirm()` — **volet confirmation CORRIGÉ** : `useConfirm`/`ConfirmProvider` construits sur `ModalShell`, 22 `confirm()` natifs remplacés dans 18 pages admin. La factorisation des formulaires CRUD reste ouverte.
2. **✅ P1-4** Centraliser la règle d'éligibilité recrutement — **CORRIGÉ** (`features/recruitment/logic.ts` + tests, consommé par `PlayerLookupCard` et `ClanMovementsTab`).
3. **P1-5** Extraire progressivement la logique métier des 11 emplacements UI identifiés (`AcademyBadge`, `GeoguesseurStats`, `HrTopPerformers`, `ClanMovementsTab`, fonctions inline de `Geoguesser.tsx`) vers des modules `features/*/logic.ts` purs et testables, en suivant le pattern déjà correct de `features/rh/activity.ts`.
4. **✅ P2-4** Ajouter des tests unitaires sur `computeRecruitmentScore` — **CORRIGÉ** : fonction extraite dans `netlify/functions/_recruitment-score.ts` (aucun changement de logique), 10 tests dans `src/__tests__/recruitment-score.test.ts`.
5. **P3-1** Supprimer le code mort confirmé (`RequireMember.tsx`, export `TimeSlotId`) — **uniquement après validation explicite**, conformément à la consigne de ne supprimer aucun fichier sans accord préalable.

*Estimation* : lot le plus long en effort cumulé (plusieurs semaines selon les ressources), mais peut être découpé fichier par fichier sans bloquer les livraisons. Recommandé de traiter item 2-3 avant tout ajustement futur des seuils de recrutement, pour éviter d'ajouter une 4e divergence.

---

## Lot 4 — Performance, accessibilité approfondie, SEO, tests
*Objectif : consolider les axes transverses une fois les fondations stabilisées par les lots 1-3.*

1. **P2-5** Lazy-load ciblé du chunk `recharts`/`PieChart` au niveau sous-composant.
2. **P2-1** Découpage de `Geoguesser.tsx` (désormais ~3300+ lignes après l'intégration serveur-autoritaire P0-1) en sous-composants/hooks — peut démarrer, le volet Geoguesser de P0-1 étant livré.
3. **P2-8** Introduire une gestion de métadonnées par route (`react-helmet-async`) sur les pages publiques à enjeu de partage (`Recruitment.tsx`, `Events.tsx`).
4. **P1-8** Ajouter le support tactile à `FloatingMapPicker.tsx` (pan/zoom Geoguesser sur mobile).
5. **✅ P1-2** Étendre la configuration ESLint aux fichiers `.mts` (`netlify/functions/`) — **CORRIGÉ** (pattern `**/*.{ts,tsx,mts}` + globals Node, zéro remontée sur l'existant).
6. **✅ P1-1** Appliquer `npm audit fix` (sans `--force`) — **CORRIGÉ** (react-router 6.30.4, ws 8.21.0, js-yaml 4.3.0, @babel/core, brace-expansion ; lint/typecheck/tests/build au vert, test manuel routing + realtime recommandé au déploiement).
7. **P2-9** Ajouter un script `gen:types` au `package.json`.
8. Élargir la couverture de tests au-delà des fichiers actuels (`_player-token.test.ts`, `geoguesser-scoring-parity.test.ts`, `scoring.test.ts`) — prioriser les fonctions de session quiz/geoguesser et la logique métier extraite au Lot 3.

---

## Lot 5 — Améliorations produit à plus long terme
*Objectif : chantiers structurants nécessitant arbitrage produit, pas de bug à corriger mais des choix d'architecture.*

1. **P1-11** Unifier les seuils WN8 site/bot (package partagé ou source unique exposée en API) — implique de coordonner deux déploiements indépendants (site Netlify + bot VPS/PM2).
2. **P2-3** Introduire un système de toast/notification unifié, à généraliser progressivement sur toutes les pages admin.
3. **P3-2** Factory commune pour les ~101 hooks React Query.
4. **P3-3 / P3-4** Harmonisation de l'organisation des dossiers `features/*` et déduplication des types `PlayerStats*`.
5. **P2-6** Réévaluer le besoin d'instantanéité de la révocation d'accès clan-hub (realtime vs. cache court) — dépend d'un arbitrage produit sur la criticité de ce délai.

---

## Dépendances entre lots

```
Lot 1 (P0)  ──┬──> Lot 3 (item 1, modale) : P0-6 corrigé (useModalA11y/ModalShell), ConfirmDialog peut s'appuyer dessus
              └──> Lot 4 (item 2, Geoguesser.tsx) : décision P0-1 tranchée, volet Geoguesser livré — peut démarrer

Lot 2 ──> indépendant, peut démarrer immédiatement en parallèle du Lot 1

Lot 3 (items 2-3) ──> doit précéder tout futur ajustement des seuils de recrutement

Lot 5 ──> chantiers d'arbitrage produit, pas de prérequis technique strict mais
          bénéficie d'attendre la stabilisation des Lots 1-3
```
