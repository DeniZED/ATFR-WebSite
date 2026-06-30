# ROADMAP DE CORRECTIONS — Site ATFR

Découpage en 5 lots, du plus urgent au plus structurant. Chaque lot est conçu pour être livrable indépendamment, sans bloquer les suivants.

> **Mise à jour 2026-06-30** : le porteur du projet a validé l'exécution du périmètre « Lot 1 sûr + Lot 2 » (items ne nécessitant pas de décision produit). Ce périmètre est **livré** — voir le détail ✅ ci-dessous. Le reste de la roadmap (P0-1, P0-2, P0-6, Lots 3-5) reste une proposition de séquencement à valider avant exécution, conformément à la consigne de ne pas faire de refonte sans validation.

---

## Lot 1 — Corrections critiques (sécurité & accessibilité bloquantes)
*Objectif : lever les risques P0 avant toute exposition à des utilisateurs réels avec des données sensibles.*

1. **✅ P0-4** Focus clavier sur `Button.tsx` — correction d'une ligne, risque quasi nul, bénéfice immédiat sitewide. **CORRIGÉ.**
2. **✅ P0-5** Rendre `MinimapClickPlacer` accessible au clavier — correction ciblée, risque faible. **CORRIGÉ** (flèches + Entrée/Espace, `role="button"`, `aria-label`).
3. **✅ P0-3** Garde-fou roster vide avant `syncClanRoster()` — correction défensive ciblée, risque faible, évite un incident de données potentiellement lourd à corriger après coup. **CORRIGÉ.**
4. **P0-1** Score Geoguesser/quiz falsifiable — **nécessite une décision produit** (recalcul serveur complet vs. token à usage unique lié à un round) avant tout développement ; à valider avec le porteur du projet en premier, car c'est le chantier le plus structurant du lot. *Non traité — hors périmètre de cette vague.*
5. **P0-2** Contenu clan-hub exposé via bundle public — **nécessite une décision produit** (migration du contenu vers Supabase + RLS) ; à valider également, effort de migration de contenu non négligeable. *Non traité — hors périmètre de cette vague.*
6. **P0-6** Modales accessibles (`role="dialog"`, piège de focus, `Echap`) — à traiter après validation d'un composant `Modal` partagé (évite de corriger 3-4 fois la même chose séparément). *Non traité — dépend du Lot 3.*

*Estimation* : items 1-3 sont des correctifs de quelques heures chacun, sans dépendance — **livrés**. Items 4-5 nécessitent une phase de conception avant développement (à cadrer séparément). Item 6 dépend d'une décision de factorisation (lien avec Lot 3).

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

1. **P2-2** Factoriser le pattern modale/confirmation/pied de formulaire utilisé par les 8 pages admin CRUD + remplacer les 19 `window.confirm()` par un composant `ConfirmDialog` cohérent avec le design system — **prérequis naturel pour P0-6** (modales accessibles), donc à mener conjointement.
2. **P1-4** Centraliser la règle d'éligibilité recrutement (actuellement dupliquée 3 fois) dans `features/recruitment/logic.ts`.
3. **P1-5** Extraire progressivement la logique métier des 11 emplacements UI identifiés (`AcademyBadge`, `GeoguesseurStats`, `HrTopPerformers`, `ClanMovementsTab`, fonctions inline de `Geoguesser.tsx`) vers des modules `features/*/logic.ts` purs et testables, en suivant le pattern déjà correct de `features/rh/activity.ts`.
4. **P2-4** Ajouter des tests unitaires sur `computeRecruitmentScore` (formule critique, actuellement zéro couverture).
5. **P3-1** Supprimer le code mort confirmé (`RequireMember.tsx`, export `TimeSlotId`) — **uniquement après validation explicite**, conformément à la consigne de ne supprimer aucun fichier sans accord préalable.

*Estimation* : lot le plus long en effort cumulé (plusieurs semaines selon les ressources), mais peut être découpé fichier par fichier sans bloquer les livraisons. Recommandé de traiter item 2-3 avant tout ajustement futur des seuils de recrutement, pour éviter d'ajouter une 4e divergence.

---

## Lot 4 — Performance, accessibilité approfondie, SEO, tests
*Objectif : consolider les axes transverses une fois les fondations stabilisées par les lots 1-3.*

1. **P2-5** Lazy-load ciblé du chunk `recharts`/`PieChart` au niveau sous-composant.
2. **P2-1** Découpage de `Geoguesser.tsx` (3317 lignes) en sous-composants/hooks — à mener une fois Lot 1 (P0-1, score) tranché, car le chantier touche le même fichier.
3. **P2-8** Introduire une gestion de métadonnées par route (`react-helmet-async`) sur les pages publiques à enjeu de partage (`Recruitment.tsx`, `Events.tsx`).
4. **P1-8** Ajouter le support tactile à `FloatingMapPicker.tsx` (pan/zoom Geoguesser sur mobile).
5. **P1-2** Étendre la configuration ESLint aux fichiers `.mts` (`netlify/functions/`).
6. **P1-1** Appliquer `npm audit fix` (sans `--force`) pour `react-router-dom`/`ws`/`js-yaml`/`brace-expansion`/`@babel/core`, avec test de non-régression sur le routing et les abonnements realtime Supabase.
7. **P2-9** Ajouter un script `gen:types` au `package.json`.
8. Élargir la couverture de tests au-delà des 2 fichiers actuels — prioriser les fonctions Netlify sensibles (`submit-score.mts`, `_player-token.ts` après correction P0-1) et la logique métier extraite au Lot 3.

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
Lot 1 (P0)  ──┬──> Lot 3 (item 1, modale) ──> complète P0-6
              └──> Lot 4 (item 2, Geoguesser.tsx) attend la décision P0-1

Lot 2 ──> indépendant, peut démarrer immédiatement en parallèle du Lot 1

Lot 3 (items 2-3) ──> doit précéder tout futur ajustement des seuils de recrutement

Lot 5 ──> chantiers d'arbitrage produit, pas de prérequis technique strict mais
          bénéficie d'attendre la stabilisation des Lots 1-3
```
