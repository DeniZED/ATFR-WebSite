# AUDIT ARCHITECTURE / MAINTENABILITÉ — Site ATFR

---

## 1. Fichiers hors gabarit (taille / complexité)

| Fichier | Taille | Constat |
|---|---|---|
| `src/pages/modules/Geoguesser.tsx` | **3317 lignes** | 22 `useState`, 6 `useEffect`, ~20 fonctions pures et ~25 sous-composants inline, tous mélangés dans un seul fichier. Le module le plus complexe du site n'a aucune décomposition. |
| `src/pages/admin/AdminPlayers.tsx` | 1030 lignes | Page de gestion RH, logique de tri/filtre/affichage mêlée |
| `src/pages/admin/AdminPlayerDetail.tsx` | 962 lignes | Idem, détail joueur |

**Pourquoi c'est un risque** : un fichier de cette taille est difficile à relire, à tester, et à faire évoluer sans régression — chaque modification a une probabilité plus élevée de toucher accidentellement un autre comportement du même fichier. C'est aussi la raison structurelle derrière plusieurs findings de logique métier (formules dupliquées/divergentes, voir point 6).

**Effort de correction** : élevé. Risque de régression non négligeable si le découpage est fait sans tests de non-régression préalables — **à ne pas entreprendre sans validation explicite**, conformément à la consigne "pas de refonte massive sans validation".

---

## 2. Duplication de code

### a) Hooks React Query (~101 occurrences)
17 dossiers `features/*/queries.ts` réimplémentent chacun un boilerplate similaire (`useQuery`/`useMutation` + `queryKey` + invalidation) sans factory commune. Impact limité individuellement, mais un changement de convention (ex. gestion d'erreur globale) doit être répété 101 fois. **P3**, effort moyen, gain principalement à long terme.

### b) 8 pages admin CRUD quasi identiques
Voir détail dans `AUDIT_UX_DESIGN.md` §7 — `AdminEvents`, `AdminGallery`, `AdminHighlights`, `AdminAchievements`, `AdminTestimonials`, `AdminQuizCategories`, `AdminClanPages`, `AdminUsers` dupliquent état de modale, confirmation, pied de formulaire, `MediaPicker`. **P2**, bon rapport effort/impact (une factorisation profite à 8 pages d'un coup).

### c) `window.confirm()` natif × 19 fichiers
Même cause que ci-dessus, traité comme un seul chantier de factorisation dans la roadmap.

### d) Seuils WN8 dupliqués manuellement entre site et bot
`discord-bot/src/clan/wn8.ts` contient un commentaire explicite : *"Mêmes paliers que `src/lib/tomato-api.ts` (web) — gardés en synchro manuellement, le bot n'a pas accès au code du site."* Confirme une duplication assumée mais fragile — tout ajustement des seuils côté site doit être répercuté manuellement côté bot, sans garde-fou automatique (pas de test croisé, pas de source unique partagée). **P2**, effort élevé pour une vraie unification (nécessiterait un package partagé entre les deux projets, qui sont déployés indépendamment).

### e) Types quasi-identiques répétés
`PlayerStats` / `PlayerExtendedStats` / `PlayerStatsPayload` redéfinis indépendamment côté site, bot, et fonction Netlify. Duplication de type uniquement (pas de logique), donc risque faible, mais source de confusion à la lecture. **P3**.

---

## 3. Code mort

- `src/components/layout/RequireMember.tsx` (56 lignes) : **zéro import** trouvé dans le reste du code — entièrement remplacé par `RequireClanAccess`. Candidat à suppression, mais conformément à la consigne ("ne supprime aucun fichier sans validation"), reste en l'état tant que non validé.
- Export de type `TimeSlotId` : inutilisé.

---

## 4. Typage TypeScript

**Point fort majeur, confirmé par recherche exhaustive** : **0 occurrence** de `any`, `as any`, `@ts-ignore` ou `@ts-expect-error` dans `src/`, `netlify/functions/`, et `discord-bot/src/`. C'est un niveau de rigueur de typage rare, à préserver activement (ex. via une règle ESLint qui interdirait explicitement leur réintroduction si ce n'est pas déjà le cas).

`src/types/database.ts` (2001 lignes, généré) est à jour avec les migrations `0040`-`0043` au moment de l'audit. **Point de vigilance** : aucun script `gen:types` n'existe dans `package.json` — la génération de ce fichier dépend donc d'une commande exécutée manuellement et non documentée dans les scripts du projet, ce qui crée un risque de dérive silencieuse si une migration future n'est pas suivie de la régénération. **P3**, effort faible (ajouter un script `"gen:types": "supabase gen types typescript ..."` au `package.json`), impact préventif important sur le long terme.

---

## 5. Recruitment score — déjà bien centralisé (point positif à confirmer)

Contrairement à une crainte initiale (le README suggérait une possible duplication), `computeRecruitmentScore` est **implémenté une seule fois**, dans `netlify/functions/player-stats.mts:198-221`, et consommé par HTTP :
- côté site via `src/lib/tomato-api.ts:36-50`
- côté bot Discord via `discord-bot/src/config.ts:53`

**Aucune réimplémentation de la formule** n'a été trouvée côté bot. Seul point faible : **zéro test** sur cette formule pourtant centrale dans les décisions de recrutement. **P2**, effort faible (ajouter des tests unitaires sur les cas limites : WN8 nul, winrate à 0%, nombre de battles très faible), impact élevé (formule qui influence directement des décisions humaines de recrutement).

---

## 6. Logique métier mêlée à l'UI (couplage React/business logic)

Liste des cas les plus significatifs, par ordre de sévérité :

1. **`src/components/geoguesser/AcademyBadge.tsx:33-48`** — `getTier()`/`getStarCount()` (seuils de niveau → tier/étoiles) codés en dur dans le composant de rendu. **P1**.
2. **`src/components/geoguesser/AcademyBadge.tsx:55-83`** — calculs de fusion de couleur, type métallique, exposant spéculaire pour le rendu du badge, également inline. **P1**.
3. **`src/components/recruitment/PlayerLookupCard.tsx:9-14`** — `meetsRecruitmentThresholds()` est une **réimplémentation partielle** de la logique d'éligibilité déjà présente côté serveur dans `computeRecruitmentScore`. Risque de divergence : un seuil ajusté côté serveur n'est pas automatiquement reflété ici. **P1**.
4. **`src/components/academy/GeoguesseurStats.tsx:45-73`** — agrégation de statistiques (fenêtre 7 jours, moyennes, séries, parsing de mode) entièrement inline, non testable isolément. **P1**.
5. **Deux systèmes de tier divergents** (`AcademyBadge.getTier` vs `scoring.ts::scoreTier`) — détaillé dans `AUDIT_UX_DESIGN.md` §9. **P1**.
6. **`src/pages/modules/Geoguesser.tsx:1156-1164`** — `getSprintTimePenalty()` (formule de pénalité temporelle) embarquée dans la page plutôt que dans `src/features/geoguesser/scoring.ts`, qui est pourtant le module dédié et testé pour ce type de calcul.
7. **`src/pages/modules/Geoguesser.tsx:1166-1180`** — `getWorstTotalForMode()` (normalisation de score), même remarque.
8. **`src/components/admin/HrTopPerformers.tsx:18-49`** — règles de classement top 5 codées dans le composant.
9. **`src/components/admin/ClanMovementsTab.tsx:67-93`** — filtrage par seuil WN8 de recrutement, **réimplémentation d'une 3e variante** de la même règle d'éligibilité que les points 1 et 3 ci-dessus.
10. Constante "7 jours" répétée à plusieurs endroits au lieu d'être centralisée.
11. Logique de fallback `parseMode()` inline.

**Pourquoi c'est le problème racine le plus rentable à corriger** : ces 11 cas expliquent à la fois (a) l'absence de tests sur ces logiques (un composant React est plus coûteux à tester unitairement qu'une fonction pure), (b) les divergences déjà observées (point 5, et `meetsRecruitmentThresholds` vs `computeRecruitmentScore`), et (c) le risque que de futures évolutions du barème de score créent de nouvelles incohérences invisibles tant qu'un utilisateur ne les remarque pas. Extraire ces fonctions vers des modules `features/*/logic.ts` (purs, testables) sans changer leur comportement est un refactor à risque faible et impact élevé.

**Bon pattern existant à répliquer** : `src/features/rh/activity.ts` sépare déjà correctement la logique métier de la récupération de données — à utiliser comme référence de style pour les extractions futures.

---

## 7. Fragilité des migrations SQL (par zone, du plus au moins fragile)

| Zone | Indicateur de fragilité | Niveau |
|---|---|---|
| **Import/synchronisation RH** | 6 migrations sur 12 numéros consécutifs, dont 2 intitulées explicitement "repair"/"patch" | **Élevé** — ne pas retoucher sans tests de non-régression au préalable |
| **Durcissement RLS** | 6 migrations sur des tables différentes — suggère une approche réactive (corrections au fil de l'eau) plutôt qu'une conception RLS proactive dès le départ | Moyen |
| **Snapshots d'activité** | 3 migrations consécutives, encore en évolution active (dernier fix en `0039`, vérifié correct dans le code actuel) | Moyen |
| **Geoguesser** | 8 migrations mais majoritairement additives (nouvelles colonnes/fonctionnalités, peu de corrections de bugs) | Faible |

---

## 8. Conventions et organisation

- Nommage des hooks et des types `*Row` cohérent à travers le projet.
- Seulement 2 des 17 dossiers `features/` séparent `schema.ts`/`types.ts` du reste — légère incohérence d'organisation, sans impact fonctionnel. **P3**.
- Dépendances : aucune dépendance totalement inutilisée détectée. `react-hook-form` + `@hookform/resolvers` ne sont utilisés que dans un seul fichier (`Recruitment.tsx`) — pas un problème en soi, mais à garder à l'œil si le poids de ces deux dépendances dans le bundle devient significatif pour un usage aussi restreint (voir `AUDIT_PERFORMANCE.md`).

---

## Résumé des findings architecture

| # | Finding | Sévérité |
|---|---|---|
| 1 | `Geoguesser.tsx` (3317 lignes) — monolithe difficile à maintenir et tester | P2 |
| 2 | Logique métier dispersée dans 11 emplacements UI (badges, scoring, agrégats) | **P1** |
| 3 | 3 réimplémentations divergentes de la règle d'éligibilité recrutement | **P1** |
| 4 | 8 pages admin CRUD dupliquées + `window.confirm()` × 19 | P2 |
| 5 | Seuils WN8 dupliqués manuellement site/bot | P2 |
| 6 | Zéro test sur `computeRecruitmentScore` | P2 |
| 7 | Pas de script `gen:types` — risque de dérive de `database.ts` | P3 |
| 8 | Code mort (`RequireMember.tsx`, `TimeSlotId`) | P3 |
| 9 | Migrations RH/RLS historiquement fragiles — prudence sur modifications futures | Information (pas un bug actuel) |
