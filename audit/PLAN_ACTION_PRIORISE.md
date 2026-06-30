# PLAN D'ACTION PRIORISÉ — Site ATFR

Légende effort/impact : Faible / Moyen / Élevé. Légende risque de correction : Faible / Moyen / Élevé (probabilité de régression si la correction est appliquée sans précaution).

---

## P0 — Critique (à traiter avant toute mise en production avec données réelles)

### P0-1 — Score Geoguesser/quiz falsifiable côté client
- **Problème** : `submit-score.mts` insère le score envoyé par le client sans recalcul serveur ; `player_token` n'a ni nonce, ni lien à une partie, ni protection anti-rejeu.
- **Localisation** : `netlify/functions/submit-score.mts`, `netlify/functions/_player-token.ts`
- **Pourquoi** : n'importe quel visiteur peut fausser le classement public via un simple appel API direct.
- **Solution de principe** : recalcul serveur du score à partir d'événements bruts (clics, timing), ou a minima token à usage unique lié à un round précis stocké en base.
- **Risque de correction** : Élevé (refonte du flux de soumission, touche un parcours utilisateur central).
- **Effort** : Élevé. **Impact** : Élevé.

### P0-2 — Contenu clan-hub confidentiel exposé via bundle JS public
- **Problème** : doctrine/stratégies/cartes/rôles du clan codés en dur dans `src/data/clan/*.ts`, compilés dans des chunks JS publics non protégés, malgré `RequireClanAccess` qui ne protège que le rendu React.
- **Localisation** : `src/data/clan/*.ts`, `src/components/layout/RequireClanAccess.tsx`, pages `src/pages/clan/*.tsx`
- **Pourquoi** : un clan rival ou tout visiteur peut lire ce contenu sans authentification en récupérant directement l'URL du chunk.
- **Solution de principe** : migrer ce contenu en base Supabase avec RLS conditionnée au `clan_id` vérifié du joueur.
- **Risque de correction** : Élevé (migration de contenu + nouvelle politique RLS + refonte des pages concernées).
- **Effort** : Élevé. **Impact** : Élevé.

### P0-3 — Roster clan vide → départs en masse faussement enregistrés
- **Problème** : aucun garde-fou si l'API WG renvoie un roster vide ; la RPC `sync_clan_roster` interprète alors tous les membres en cache comme partis.
- **Localisation** : `discord-bot/src/clan/wgClient.ts:71-94`, `netlify/functions/discord-clan-sync.mts:93-131`, `supabase/migrations/0035_clan_tracker.sql:266-306`
- **Pourquoi** : un incident temporaire de l'API WG (timeout, panne) peut déclencher l'enregistrement erroné du départ de tout le clan, fausser les statistiques RH visibles par les admins, et potentiellement déclencher des notifications Discord en masse.
- **Solution de principe** : ajouter un garde dans `discord-bot/src/clan/scanner.ts` rejetant un roster vide avant d'appeler `syncClanRoster()`.
- **Risque de correction** : Faible (ajout d'une vérification défensive ciblée, ne change pas le comportement nominal).
- **Effort** : Faible. **Impact** : Élevé.

### P0-4 — Focus clavier invisible sur les boutons (sitewide)
- **Problème** : `Button.tsx` définit `focus-visible:ring-offset-atfr-ink` sans jamais définir l'anneau de focus lui-même.
- **Localisation** : `src/components/ui/Button.tsx:6`
- **Pourquoi** : aucune indication visuelle de focus clavier sur la quasi-totalité des boutons du site, y compris en back-office admin (WCAG 2.4.7).
- **Solution de principe** : ajouter `focus-visible:ring-2 focus-visible:ring-atfr-gold` à la définition `cva`.
- **Risque de correction** : Faible (changement centralisé d'une ligne, purement visuel/additif).
- **Effort** : Faible. **Impact** : Élevé (bénéficie à tout le site immédiatement).

### P0-5 — Élément interactif inaccessible au clavier (admin Geoguesser)
- **Problème** : `<div onClick>` sans `role`/`tabIndex`/`onKeyDown` pour placer un point sur la mini-carte.
- **Localisation** : `src/components/admin/MinimapClickPlacer.tsx:65-68`
- **Pourquoi** : fonctionnalité admin totalement bloquée pour un usage clavier (WCAG 2.1.1).
- **Solution de principe** : ajouter `role="button"`, `tabIndex={0}`, gestion `onKeyDown` (Entrée/Espace).
- **Risque de correction** : Faible.
- **Effort** : Faible. **Impact** : Moyen (périmètre admin restreint, mais bloquant pour l'utilisateur concerné).

### P0-6 — Modales custom inaccessibles (pas de `role="dialog"`, pas de piège de focus, pas d'`Echap`)
- **Problème** : 3 des 4 overlays audités (dont `AvatarCustomizer.tsx`) n'implémentent aucune des bonnes pratiques de modale accessible.
- **Localisation** : `src/components/geoguesser/AvatarCustomizer.tsx` (et overlays similaires)
- **Pourquoi** : invisible pour les lecteurs d'écran, pas de fermeture clavier standard (WCAG 4.1.2 / 2.1.1).
- **Solution de principe** : généraliser le pattern déjà correct de `Gallery.tsx` (`role="dialog"`, `aria-modal`, `Escape`) via un composant `Modal` partagé.
- **Risque de correction** : Moyen (touche le comportement interactif de composants existants).
- **Effort** : Moyen. **Impact** : Élevé.

---

## P1 — Haute priorité

| # | Problème | Localisation | Pourquoi | Solution | Risque | Effort | Impact |
|---|---|---|---|---|---|---|---|
| P1-1 | `react-router-dom`/`ws` (prod) — vulnérabilités npm audit (modérée/haute) | `package.json` | Open redirect (react-router), divulgation mémoire/DoS (ws, via supabase-js) | `npm audit fix` (sans `--force`), tester routing + realtime après coup | Moyen | Faible | Moyen |
| P1-2 | `.mts` (fonctions Netlify) hors périmètre ESLint | `eslint.config.js` | Code serveur le plus sensible jamais linté | Étendre le `content`/pattern ESLint à `netlify/functions/**/*.mts` | Faible | Faible | Moyen |
| P1-3 | Candidatures dupliquables, pas de garde d'état sur validation/refus | `supabase/migrations/0001_init.sql` (table `applications`), `src/features/applications/queries.ts:60-84` | Doublons possibles, race condition sur double-validation | Contrainte UNIQUE + `WHERE status='pending'` dans l'UPDATE | Moyen | Moyen | Moyen |
| P1-4 | 3 réimplémentations divergentes de l'éligibilité recrutement | `PlayerLookupCard.tsx:9-14`, `ClanMovementsTab.tsx:67-93`, `player-stats.mts` | Risque de décision de recrutement basée sur un seuil obsolète côté UI | Centraliser dans `features/recruitment/logic.ts`, consommer partout | Moyen | Moyen | Élevé |
| P1-5 | Logique métier dispersée dans 11 emplacements UI (badges, scoring, agrégats) | Voir `AUDIT_ARCHITECTURE.md` §6 | Non testable, source de divergences (ex. 2 systèmes de tier) | Extraction progressive vers `features/*/logic.ts`, suivre le pattern `features/rh/activity.ts` | Moyen | Élevé | Élevé |
| P1-6 | Contraste insuffisant (94 occurrences `text-atfr-fog/opacité`) | `src/pages/clan/*.tsx`, composants Geoguesser | WCAG 1.4.3, lisibilité dégradée | Relever les opacités sous le seuil 4.5:1 | Faible | Moyen | Moyen |
| P1-7 | `og-image.png` manquant | `index.html:26,37`, `public/` | Partage social sans image (Discord, Twitter...) | Ajouter le fichier image | Faible | Faible | Moyen |
| P1-8 | Carte Geoguesser inutilisable au tactile une fois zoomée | `src/components/geoguesser/FloatingMapPicker.tsx` | Module académie dégradé sur mobile | Ajouter gestion `touchstart`/`touchmove`/`touchend` | Moyen | Moyen | Élevé |
| P1-9 | Messages d'erreur techniques/anglais exposés | `Recruitment.tsx:255-259`, `Login.tsx` | Confusion utilisateurs non techniques | Traduire/mapper les erreurs Supabase vers des messages FR | Faible | Faible | Moyen |
| P1-10 | États d'erreur masqués en "liste vide" | `AdminGallery.tsx`, `AdminApplications.tsx` | Admin peut croire à tort une section vide | Distinguer `isError`/`isEmpty` (pattern déjà présent ailleurs) | Faible | Faible | Moyen |
| P1-11 | Seuils WN8 dupliqués manuellement site/bot | `discord-bot/src/clan/wn8.ts` (commentaire l'admet) | Risque de divergence silencieuse | Package partagé ou source unique exposée en API | Élevé | Élevé | Moyen |
| P1-12 | Labels d'onglets retirés de l'arbre a11y sous `sm` | `AvatarCustomizer.tsx:150-163` | Boutons icône-seule sans nom accessible sur mobile | `hidden sm:inline` → `sr-only sm:not-sr-only` | Faible | Faible | Faible |
| P1-13 | `Select.tsx` sans `aria-invalid`/`aria-describedby` | `src/components/ui/Select.tsx` | Incohérence avec `Input.tsx`, WCAG 4.1.2 | Aligner sur `Input.tsx` | Faible | Faible | Faible |

---

## P2 — Priorité moyenne

| # | Problème | Localisation | Solution | Effort | Impact |
|---|---|---|---|---|---|
| P2-1 | `Geoguesser.tsx` (3317 lignes) — monolithe, re-renders excessifs | `src/pages/modules/Geoguesser.tsx` | Découpage en sous-composants/hooks dédiés | Élevé | Moyen-élevé |
| P2-2 | 8 pages admin CRUD dupliquées + `window.confirm()` ×19 | `src/pages/admin/Admin*.tsx` | Composant `ConfirmDialog`/hook `useConfirm`, factorisation du pattern modale | Moyen | Élevé (gain sur 8+19 emplacements) |
| P2-3 | Absence de système de toast/notification unifié | Transverse | Introduire un `Toaster` centralisé | Moyen | Élevé |
| P2-4 | Zéro test sur `computeRecruitmentScore` | `netlify/functions/player-stats.mts:198-221` | Ajouter des tests unitaires (cas limites) | Faible | Élevé |
| P2-5 | Chunk `recharts`/`PieChart` (115 kB gzip) potentiellement sur-chargé | Pages avec graphiques | Lazy-load au niveau du sous-composant graphique | Faible | Moyen |
| P2-6 | Révocation d'accès clan-hub non instantanée (cache 5 min) | `src/features/clan/useClanAccess.ts:34` | Réduire le `staleTime` ou ajouter un abonnement realtime si besoin d'instantanéité | Faible | Faible-moyen |
| P2-7 | Hiérarchie de titres incohérente | `Members.tsx`, `Recruitment.tsx`, `Home.tsx` | Ajouter `h1` manquants, corriger les sauts de niveau | Faible | Moyen |
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
