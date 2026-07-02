# PLAN D'ACTION PRIORISÉ — Site ATFR

Légende effort/impact : Faible / Moyen / Élevé. Légende risque de correction : Faible / Moyen / Élevé (probabilité de régression si la correction est appliquée sans précaution).

> **Mise à jour 2026-06-30** : une première vague de corrections (« Lot 1 sûr + Lot 2 » validé par le porteur du projet) a été appliquée. 9 findings sont marqués ✅ **CORRIGÉ** ci-dessous : P0-3, P0-4, P0-5, P1-7, P1-9, P1-10, P1-12, P1-13, P2-7. `npm run lint`, `npm run typecheck`, `npm test` et `npm run build` ont tous été vérifiés au vert après ces changements. P0-1, P0-2 et P0-6 restent **intentionnellement non traités** (décision produit requise / dépendance à un composant `Modal` partagé du Lot 3) — voir `ROADMAP_CORRECTIONS.md` pour le détail.
>
> **Mise à jour 2026-06-30 (2)** : le porteur du projet a tranché P0-1 (Option A : recalcul serveur complet) et validé le périmètre **Geoguesser uniquement** pour cette passe (« Geoguesser d'abord, quiz ensuite »). Le volet Geoguesser de P0-1 est **✅ corrigé** — voir détail ci-dessous. Le volet quiz (`GuideBots.tsx` / `submit-score.mts` pour le module quiz) reste **non traité**, à planifier dans une passe ultérieure dédiée.
>
> **Mise à jour 2026-07-02** : le volet quiz de P0-1 est **✅ corrigé** (PR dédiée, même pattern serveur-autoritaire que le Geoguesser). **P0-1 est désormais entièrement corrigé.**

---

## P0 — Critique (à traiter avant toute mise en production avec données réelles)

### ✅ P0-1 — Score Geoguesser/quiz falsifiable côté client — CORRIGÉ
- **Problème** : `submit-score.mts` insère le score envoyé par le client sans recalcul serveur ; `player_token` n'a ni nonce, ni lien à une partie, ni protection anti-rejeu.
- **Localisation** : `netlify/functions/submit-score.mts`, `netlify/functions/_player-token.ts`
- **Pourquoi** : n'importe quel visiteur peut fausser le classement public via un simple appel API direct.
- **Solution de principe** : recalcul serveur du score à partir d'événements bruts (clics, timing), ou a minima token à usage unique lié à un round précis stocké en base.
- **Risque de correction** : Élevé (refonte du flux de soumission, touche un parcours utilisateur central).
- **Effort** : Élevé. **Impact** : Élevé.
- **Statut** : ✅ Corrigé en deux passes (Option A — recalcul serveur complet).
  - **Volet Geoguesser** : la session de jeu (pool de manches, paramètres de scoring figés, horloge de round) est portée par la table `geoguesser_sessions` et 3 fonctions Netlify serveur-autoritaires (`geoguesser-start-session.mts`, `geoguesser-submit-round.mts`, `geoguesser-finish-session.mts`). Les coordonnées réelles (`x_pct`/`y_pct`) ne sont plus exposées au client avant soumission d'une manche (vue publique `geoguesser_shots_public` sans coordonnées) ; le score, la distance et la pénalité de temps sont recalculés côté serveur à partir des coordonnées réelles du shot et du timestamp serveur (`round_started_at`), avec verrouillage optimiste anti-rejeu/anti-race sur `current_round`. Un test de parité (`src/__tests__/geoguesser-scoring-parity.test.ts`) garantit que la copie serveur des fonctions de scoring reste identique à l'original client.
  - **Volet quiz** : même pattern — vue publique `quiz_answers_public` **sans `is_correct`** (la bonne réponse n'était visible qu'en lisant l'onglet Réseau avant même de jouer), table `quiz_game_sessions` serveur-autoritaire, 3 fonctions Netlify (`quiz-start-session.mts`, `quiz-submit-answer.mts`, `quiz-finish-session.mts`) : ordre des questions tiré serveur, `is_correct` vérifié en base à chaque soumission avec verrouillage optimiste sur `current_index`, score agrégé et inséré dans `module_scores` côté serveur (idempotent). Les analytics `quiz_sessions`/`quiz_session_answers` ne sont plus écrites par le client (policies RLS anon retirées) mais par les fonctions serveur avec des données vérifiées — le trigger `tally_quiz_answer` n'est plus pollué par des `is_correct` forgeables.
  - **Verrouillage transversal** : `submit-score.mts` refuse désormais les slugs `wot-geoguesser` et `guide-bots` (403) — leurs scores ne passent plus que par les fonctions `*-finish-session`, fermant la porte à la soumission directe de scores forgés pour ces modules.
  - `npm run lint`, `npm run typecheck`, `npm test` et `npm run build` vérifiés au vert après chaque passe. Migrations à appliquer : `0044_geoguesser_server_sessions.sql`, `0045_quiz_server_sessions.sql`.

### ✅ P0-2 — Contenu clan-hub confidentiel exposé via bundle JS public — CORRIGÉ
- **Problème** : doctrine/stratégies/cartes/rôles du clan codés en dur dans `src/data/clan/*.ts`, compilés dans des chunks JS publics non protégés, malgré `RequireClanAccess` qui ne protège que le rendu React.
- **Localisation** : `src/data/clan/*.ts`, `src/components/layout/RequireClanAccess.tsx`, pages `src/pages/clan/*.tsx`
- **Pourquoi** : un clan rival ou tout visiteur peut lire ce contenu sans authentification en récupérant directement l'URL du chunk.
- **Solution de principe** : migrer ce contenu en base Supabase avec RLS conditionnée au `clan_id` vérifié du joueur.
- **Risque de correction** : Élevé (migration de contenu + nouvelle politique RLS + refonte des pages concernées).
- **Effort** : Élevé. **Impact** : Élevé.
- **Statut** : ✅ Corrigé — le contenu vit désormais dans la table `clan_page_content` (migration `0046_clan_content.sql`, seedée avec le snapshot des 6 fichiers TS, supprimés du dépôt). Adaptation nécessaire par rapport à la solution de principe : les joueurs n'étant pas authentifiés Supabase (identité = `player_token` HMAC Wargaming), la RLS par `clan_id` n'est pas applicable directement — la table n'a **aucune policy anon** et le contenu n'est servi que par la fonction Netlify `clan-content.mts`, qui vérifie côté serveur le token HMAC puis le `clan_id` réel du joueur (API WG, jamais déclaré par le client) contre `clan_pages.allowed_clans`. Les 7 pages clan consomment le hook `useClanContent` (+ `ClanContentBoundary` pour les états chargement/erreur) ; seuls les libellés de filtres UI, sans valeur tactique, restent côté client (`features/clan/filters.ts`). Vérifié : le contenu tactique est absent des chunks du build. Les éditeurs conservent lecture/écriture via RLS pour l'édition admin (voir note ci-dessous).
- **Suite (édition admin)** : ✅ option (b) livrée — page `/admin/pages-clan/contenu` (`AdminClanContent.tsx`, module `pages-clan`) : liste des sections avec compteur d'entrées et date de mise à jour, édition du JSON avec validation de syntaxe avant sauvegarde, via les policies éditeur RLS. L'option (c) (CRUD structuré par type de contenu) reste envisageable plus tard si la fréquence d'édition le justifie.

### ✅ P0-3 — Roster clan vide → départs en masse faussement enregistrés — CORRIGÉ
- **Problème** : aucun garde-fou si l'API WG renvoie un roster vide ; la RPC `sync_clan_roster` interprète alors tous les membres en cache comme partis.
- **Localisation** : `discord-bot/src/clan/wgClient.ts:71-94`, `netlify/functions/discord-clan-sync.mts:93-131`, `supabase/migrations/0035_clan_tracker.sql:266-306`
- **Pourquoi** : un incident temporaire de l'API WG (timeout, panne) peut déclencher l'enregistrement erroné du départ de tout le clan, fausser les statistiques RH visibles par les admins, et potentiellement déclencher des notifications Discord en masse.
- **Solution de principe** : ajouter un garde dans `discord-bot/src/clan/scanner.ts` rejetant un roster vide avant d'appeler `syncClanRoster()`.
- **Risque de correction** : Faible (ajout d'une vérification défensive ciblée, ne change pas le comportement nominal).
- **Effort** : Faible. **Impact** : Élevé.
- **Statut** : ✅ Corrigé — garde ajouté dans `discord-bot/src/clan/scanner.ts` (rejet du roster vide avant `syncClanRoster()`).

### ✅ P0-4 — Focus clavier invisible sur les boutons (sitewide) — CORRIGÉ
- **Problème** : `Button.tsx` définit `focus-visible:ring-offset-atfr-ink` sans jamais définir l'anneau de focus lui-même.
- **Localisation** : `src/components/ui/Button.tsx:6`
- **Pourquoi** : aucune indication visuelle de focus clavier sur la quasi-totalité des boutons du site, y compris en back-office admin (WCAG 2.4.7).
- **Solution de principe** : ajouter `focus-visible:ring-2 focus-visible:ring-atfr-gold` à la définition `cva`.
- **Risque de correction** : Faible (changement centralisé d'une ligne, purement visuel/additif).
- **Effort** : Faible. **Impact** : Élevé (bénéficie à tout le site immédiatement).
- **Statut** : ✅ Corrigé — `focus-visible:ring-2 focus-visible:ring-atfr-gold focus-visible:ring-offset-2` ajouté à la définition `cva`.

### ✅ P0-5 — Élément interactif inaccessible au clavier (admin Geoguesser) — CORRIGÉ
- **Problème** : `<div onClick>` sans `role`/`tabIndex`/`onKeyDown` pour placer un point sur la mini-carte.
- **Localisation** : `src/components/admin/MinimapClickPlacer.tsx:65-68`
- **Pourquoi** : fonctionnalité admin totalement bloquée pour un usage clavier (WCAG 2.1.1).
- **Solution de principe** : ajouter `role="button"`, `tabIndex={0}`, gestion `onKeyDown` (Entrée/Espace).
- **Risque de correction** : Faible.
- **Effort** : Faible. **Impact** : Moyen (périmètre admin restreint, mais bloquant pour l'utilisateur concerné).
- **Statut** : ✅ Corrigé — `role="button"`, `tabIndex={0}`, `aria-label` et `onKeyDown` ajoutés (flèches pour ajuster, Entrée/Espace pour placer au centre).

### ✅ P0-6 — Modales custom inaccessibles (pas de `role="dialog"`, pas de piège de focus, pas d'`Echap`) — CORRIGÉ
- **Problème** : 3 des 4 overlays audités (dont `AvatarCustomizer.tsx`) n'implémentent aucune des bonnes pratiques de modale accessible.
- **Localisation** : `src/components/geoguesser/AvatarCustomizer.tsx` (et overlays similaires)
- **Pourquoi** : invisible pour les lecteurs d'écran, pas de fermeture clavier standard (WCAG 4.1.2 / 2.1.1).
- **Solution de principe** : généraliser le pattern déjà correct de `Gallery.tsx` (`role="dialog"`, `aria-modal`, `Escape`) via un composant `Modal` partagé.
- **Risque de correction** : Moyen (touche le comportement interactif de composants existants).
- **Effort** : Moyen. **Impact** : Élevé.
- **Statut** : ✅ Corrigé — hook partagé `src/hooks/useModalA11y.ts` (fermeture `Echap`, piège de focus Tab/Maj+Tab, focus initial sur le conteneur, restauration du focus à la fermeture, pile de dialogues pour l'empilement `AvatarCustomizer` au-dessus d'`AcademyProfilePanel`) + composant `ModalShell` (`src/components/ui/ModalShell.tsx`) portant `role="dialog"`/`aria-modal`/`aria-label`. Appliqué aux 3 overlays non conformes : `AvatarCustomizer` (via `ModalShell`), `AcademyProfilePanel` et le panneau « Mes stats » de `Geoguesser.tsx` (via le hook sur leurs conteneurs framer-motion, + `aria-label="Fermer"` ajouté aux boutons de fermeture icône seule). `Gallery.tsx`, déjà conforme, est inchangé.

---

## P1 — Haute priorité

| # | Problème | Localisation | Pourquoi | Solution | Risque | Effort | Impact |
|---|---|---|---|---|---|---|---|
| ✅ P1-1 | `react-router-dom`/`ws` (prod) — vulnérabilités npm audit (modérée/haute) — **CORRIGÉ** (`npm audit fix` sans `--force` : react-router 6.30.4, ws 8.21.0, js-yaml 4.3.0, @babel/core, brace-expansion ; restent 5 remontées dev-only esbuild/vite/vitest nécessitant un breaking upgrade vite 8, hors périmètre) | `package.json` | Open redirect (react-router), divulgation mémoire/DoS (ws, via supabase-js) | `npm audit fix` (sans `--force`), tester routing + realtime après coup | Moyen | Faible | Moyen |
| ✅ P1-2 | `.mts` (fonctions Netlify) hors périmètre ESLint — **CORRIGÉ** (pattern étendu à `**/*.{ts,tsx,mts}` + globals Node pour `netlify/functions`, zéro remontée sur l'existant) | `eslint.config.js` | Code serveur le plus sensible jamais linté | Étendre le `content`/pattern ESLint à `netlify/functions/**/*.mts` | Faible | Faible | Moyen |
| ✅ P1-3 | Candidatures dupliquables, pas de garde d'état sur validation/refus — **CORRIGÉ** (migration `0047` : index uniques partiels — une seule candidature pending par joueur/clan cible, par `discord_tag` et par `account_id`, avec auto-archivage des doublons existants ; verrouillage optimiste `expectedStatus` sur `useUpdateApplicationStatus` au lieu d'un `WHERE status='pending'` strict qui aurait cassé les transitions légitimes depuis accepted/rejected) | `supabase/migrations/0001_init.sql` (table `applications`), `src/features/applications/queries.ts:60-84` | Doublons possibles, race condition sur double-validation | Contrainte UNIQUE + `WHERE status='pending'` dans l'UPDATE | Moyen | Moyen | Moyen |
| ✅ P1-4 | 3 réimplémentations divergentes de l'éligibilité recrutement — **CORRIGÉ** (`features/recruitment/logic.ts` : `meetsRecruitmentThresholds` + `meetsWn8Threshold`, consommés par `PlayerLookupCard` et `ClanMovementsTab` ; le serveur transmettait déjà les seuils depuis `recruitment_settings`, pas de duplication côté fonction ; 10 tests colocalisés) | `PlayerLookupCard.tsx:9-14`, `ClanMovementsTab.tsx:67-93`, `player-stats.mts` | Risque de décision de recrutement basée sur un seuil obsolète côté UI | Centraliser dans `features/recruitment/logic.ts`, consommer partout | Moyen | Moyen | Élevé |
| P1-5 | Logique métier dispersée dans 11 emplacements UI (badges, scoring, agrégats) | Voir `AUDIT_ARCHITECTURE.md` §6 | Non testable, source de divergences (ex. 2 systèmes de tier) | Extraction progressive vers `features/*/logic.ts`, suivre le pattern `features/rh/activity.ts` | Moyen | Élevé | Élevé |
| P1-6 | Contraste insuffisant (94 occurrences `text-atfr-fog/opacité`) | `src/pages/clan/*.tsx`, composants Geoguesser | WCAG 1.4.3, lisibilité dégradée | Relever les opacités sous le seuil 4.5:1 | Faible | Moyen | Moyen |
| ✅ P1-7 | `og-image.png` manquant — **CORRIGÉ** | `index.html:26,37`, `public/` | Partage social sans image (Discord, Twitter...) | Ajouter le fichier image | Faible | Faible | Moyen |
| P1-8 | Carte Geoguesser inutilisable au tactile une fois zoomée | `src/components/geoguesser/FloatingMapPicker.tsx` | Module académie dégradé sur mobile | Ajouter gestion `touchstart`/`touchmove`/`touchend` | Moyen | Moyen | Élevé |
| ✅ P1-9 | Messages d'erreur techniques/anglais exposés — **CORRIGÉ** | `Recruitment.tsx:255-259`, `Login.tsx` | Confusion utilisateurs non techniques | Traduire/mapper les erreurs Supabase vers des messages FR | Faible | Faible | Moyen |
| ✅ P1-10 | États d'erreur masqués en "liste vide" — **CORRIGÉ** | `AdminGallery.tsx`, `AdminApplications.tsx` | Admin peut croire à tort une section vide | Distinguer `isError`/`isEmpty` (pattern déjà présent ailleurs) | Faible | Faible | Moyen |
| P1-11 | Seuils WN8 dupliqués manuellement site/bot | `discord-bot/src/clan/wn8.ts` (commentaire l'admet) | Risque de divergence silencieuse | Package partagé ou source unique exposée en API | Élevé | Élevé | Moyen |
| ✅ P1-12 | Labels d'onglets retirés de l'arbre a11y sous `sm` — **CORRIGÉ** | `AvatarCustomizer.tsx:150-163` | Boutons icône-seule sans nom accessible sur mobile | `hidden sm:inline` → `sr-only sm:not-sr-only` | Faible | Faible | Faible |
| ✅ P1-13 | `Select.tsx` sans `aria-invalid`/`aria-describedby` — **CORRIGÉ** | `src/components/ui/Select.tsx` | Incohérence avec `Input.tsx`, WCAG 4.1.2 | Aligner sur `Input.tsx` | Faible | Faible | Faible |

---

## P2 — Priorité moyenne

| # | Problème | Localisation | Solution | Effort | Impact |
|---|---|---|---|---|---|
| P2-1 | `Geoguesser.tsx` (3317 lignes) — monolithe, re-renders excessifs | `src/pages/modules/Geoguesser.tsx` | Découpage en sous-composants/hooks dédiés | Élevé | Moyen-élevé |
| ✅ P2-2 | 8 pages admin CRUD dupliquées + `window.confirm()` ×19 — **CORRIGÉ (volet confirm)** : hook `useConfirm` + `ConfirmProvider` (sur base `ModalShell` : `role="dialog"`, piège de focus, Echap = annuler) monté dans `AdminLayout`, et remplacement des **22** `confirm()` natifs recensés dans 18 pages admin. La factorisation plus large du pattern CRUD (formulaires/pieds de page) reste un chantier Lot 3 séparé. | `src/pages/admin/Admin*.tsx` | Composant `ConfirmDialog`/hook `useConfirm`, factorisation du pattern modale | Moyen | Élevé (gain sur 8+19 emplacements) |
| P2-3 | Absence de système de toast/notification unifié | Transverse | Introduire un `Toaster` centralisé | Moyen | Élevé |
| ✅ P2-4 | Zéro test sur `computeRecruitmentScore` — **CORRIGÉ** (fonction extraite dans `_recruitment-score.ts` sans changement de logique, 10 tests dans `recruitment-score.test.ts`) | `netlify/functions/player-stats.mts:198-221` | Ajouter des tests unitaires (cas limites) | Faible | Élevé |
| P2-5 | Chunk `recharts`/`PieChart` (115 kB gzip) potentiellement sur-chargé | Pages avec graphiques | Lazy-load au niveau du sous-composant graphique | Faible | Moyen |
| P2-6 | Révocation d'accès clan-hub non instantanée (cache 5 min) | `src/features/clan/useClanAccess.ts:34` | Réduire le `staleTime` ou ajouter un abonnement realtime si besoin d'instantanéité | Faible | Faible-moyen |
| ✅ P2-7 | Hiérarchie de titres incohérente — **CORRIGÉ** | `Members.tsx`, `Recruitment.tsx`, `Home.tsx` | Ajouter `h1` manquants, corriger les sauts de niveau | Faible | Moyen |
| P2-8 | Métadonnées SEO statiques (identiques sur toutes les routes) | `index.html`, absence de gestion par route | Introduire `react-helmet-async` sur les pages publiques clés | Moyen | Moyen |
| P2-9 | Pas de script `gen:types` — risque de dérive de `database.ts` | `package.json` | Ajouter le script de génération | Faible | Moyen (préventif) |

---

## P3 — Faible priorité / nice-to-have

| # | Problème | Localisation | Effort | Impact |
|---|---|---|---|---|
| P3-1 | Code mort : `RequireMember.tsx` (zéro import), export `TimeSlotId` inutilisé | `src/components/layout/RequireMember.tsx` | Faible | Faible |
| P3-2 | ~101 hooks React Query sans factory commune | `src/features/*/queries.ts` | Moyen | Faible (long terme) |
| P3-3 | Incohérence d'organisation (`schema.ts`/`types.ts` dans 2/17 features seulement) | `src/features/*` | Moyen | Faible |
| P3-4 | Types `PlayerStats*` redéfinis indépendamment (site/bot/fonction) | Multi-fichiers | Moyen | Faible |

---

## Synthèse chiffrée

| Sévérité | Nombre de findings |
|---|---|
| P0 | 6 |
| P1 | 13 |
| P2 | 9 |
| P3 | 4 |
| **Total** | **32** |

**Note méthodologique** : tous les findings P0 ci-dessus ont été confirmés par lecture directe du code source (pas de suspicion non vérifiée). Les findings P1-P3 reposent soit sur une lecture directe, soit sur l'analyse convergente des audits thématiques détaillés dans les fichiers `AUDIT_*.md` associés.
