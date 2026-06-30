# AUDIT UX / DESIGN / ERGONOMIE — Site ATFR

Sources : audit dédié (agent UX/Design/Accessibilité), recoupé avec l'architecture (couplage logique métier/UI). Les findings purement accessibilité (contraste, focus clavier, ARIA) sont détaillés dans `AUDIT_ACCESSIBILITE_SEO.md` — ce document se concentre sur l'ergonomie, la cohérence d'interface et les parcours utilisateurs.

---

## 1. Absence de système de notification/toast unifié (P1)

**Constat** : aucune librairie de toast/notification n'existe dans le projet. Le feedback utilisateur après une action (sauvegarde, suppression, erreur) repose uniquement sur le composant `Alert`, utilisé de façon incohérente :
- Certaines pages admin empilent jusqu'à **6 `Alert` non auto-dismissibles** après plusieurs actions successives, qui restent affichées tant que l'utilisateur ne recharge pas la page.
- D'autres pages ne donnent **aucun feedback de succès** après une sauvegarde — l'utilisateur ne sait pas si l'action a abouti.

**Impact** : confusion utilisateur, perte de confiance dans l'interface admin (utilisée quotidiennement par les responsables du clan), risque de double-soumission par incertitude ("ça n'a pas marché, je réessaie").

**Effort de correction** : moyen (introduire un système de toast centralisé — ex. contexte React + composant `Toaster`, ou librairie légère type `sonner`) — mais touche potentiellement de nombreuses pages, donc à planifier comme un chantier dédié plutôt qu'un patch ponctuel.

---

## 2. Messages d'erreur techniques/anglais exposés à l'utilisateur final (P1)

**Fichiers concernés** : `src/pages/Recruitment.tsx:255-259`, `src/pages/admin/Login.tsx`

**Constat** : en cas d'erreur Supabase, le message brut retourné par la librairie (souvent en anglais, technique) est affiché tel quel à l'utilisateur final, au lieu d'un message français compréhensible.

**Contre-exemple positif à répliquer** : `src/components/recruitment/PlayerLookupCard.tsx` gère ses états d'erreur proprement, avec des messages français clairs, sans fuite technique — c'est le pattern à généraliser.

**Impact** : confusion pour des utilisateurs non techniques (candidats au recrutement, notamment), image moins professionnelle.

---

## 3. États d'erreur masqués en "liste vide" (P1)

**Fichiers concernés** : `src/pages/admin/AdminGallery.tsx`, `src/pages/admin/AdminApplications.tsx`

**Constat** : ces pages ne distinguent pas un état "chargement réussi, aucune donnée" d'un état "la requête a échoué" — une erreur réseau ou une erreur RLS produit le même rendu qu'une liste réellement vide ("Aucun élément").

**Contre-exemple positif à répliquer** : `AdminQuizList.tsx` et `AdminPlayers.tsx` gèrent correctement `isError` séparément de `isEmpty` — pattern déjà présent dans le code, à étendre aux pages qui ne le font pas.

**Impact** : un admin peut croire à tort qu'une section est vide alors que les données existent mais que la requête échoue silencieusement (ex. policy RLS mal configurée après une migration) — risque de mauvaise décision basée sur une fausse information.

---

## 4. Carte Geoguesser inutilisable au tactile une fois zoomée (P1, mobile)

**Fichier concerné** : `src/components/geoguesser/FloatingMapPicker.tsx`

**Constat** : la carte de placement (cœur du jeu Geoguesser) ne gère **aucun événement tactile** (pas de `touchstart`/`touchmove`/`touchend`) — seuls les événements souris sont câblés pour le pan/zoom. Sur mobile, dès que l'utilisateur zoome, il devient impossible de déplacer la vue pour viser précisément.

**Impact** : le module Académie "Geoguesser" — une fonctionnalité de gamification centrale — est dégradé voire inutilisable sur mobile au-delà du zoom initial, alors qu'une bonne part du trafic d'un site de clan gaming se fait probablement depuis mobile (vérification du classement, partie rapide entre deux sessions).

---

## 5. Modales custom sans cohérence ni fermeture clavier (P0 — recoupe accessibilité)

**Fichier concerné** : `src/components/geoguesser/AvatarCustomizer.tsx` (462 lignes), comparé à `src/pages/Gallery.tsx:118-168`

**Constat ergonomique (au-delà de l'aspect accessibilité)** : sur les 4 overlays/modales audités, un seul (`Gallery.tsx`) implémente une fermeture par `Escape` et un piège de focus correct. Les autres, dont `AvatarCustomizer`, ne se ferment qu'au clic sur un bouton dédié — ce qui est une régression d'ergonomie standard (tout utilisateur s'attend à pouvoir fermer une modale avec `Echap`).

**Détail technique** : voir `AUDIT_ACCESSIBILITE_SEO.md` §2.

---

## 6. Utilisation systématique de `window.confirm()` natif pour les suppressions (P2)

**Constat** : 19 fichiers utilisent `window.confirm()` (boîte de dialogue navigateur native, non stylée, bloquante) pour confirmer des actions destructives (suppression d'événements, de membres, de contenus...), au lieu d'un composant de confirmation cohérent avec le design system ATFR.

**Impact** : rupture visuelle nette avec le reste de l'interface soignée (palette `atfr-*`, `Inter`/`Oswald`), expérience perçue comme "low-budget" sur des actions pourtant sensibles (suppression de données), pas de personnalisation du message ni de variante "danger" visuelle.

**Bénéfice d'une factorisation** : un seul composant `ConfirmDialog`/hook `useConfirm` réutilisé sur 19 emplacements — rapport effort/impact très favorable (voir `AUDIT_ARCHITECTURE.md` §2, c'est aussi un finding de duplication de code).

---

## 7. Duplication de patterns sur 8 pages d'administration CRUD (P2)

**Pages concernées** : `AdminEvents`, `AdminGallery`, `AdminHighlights`, `AdminAchievements`, `AdminTestimonials`, `AdminQuizCategories`, `AdminClanPages`, `AdminUsers`.

**Constat** : ces 8 pages réimplémentent chacune, de façon quasi identique, la gestion d'état de modale, la confirmation de suppression, le pied de formulaire (boutons Annuler/Enregistrer), la gestion de cases à cocher, et l'intégration au sélecteur de médias (`MediaPicker`). Aucune n'est factorisée.

**Impact ergonomie** : risque de divergence silencieuse entre ces pages au fil des évolutions (un correctif UX appliqué sur l'une n'est pas automatiquement répercuté sur les 7 autres) — déjà visible avec l'incohérence du feedback de sauvegarde (point 1).

---

## 8. Labels d'onglets illisibles en dessous du breakpoint `sm` (P1 — accessibilité ET ergonomie)

**Fichier concerné** : `src/components/geoguesser/AvatarCustomizer.tsx:150-163`

**Constat** : utilisation de `hidden sm:inline` pour masquer le texte des onglets sur petit écran, ne laissant qu'une icône. Or `hidden` retire l'élément de l'arbre d'accessibilité (pas seulement visuellement) — un lecteur d'écran ne lira jamais le label. Mais c'est aussi un problème ergonomique pur : sur mobile (l'écran le plus contraint), l'utilisateur ne voit que des icônes sans légende, ce qui augmente la charge cognitive pour deviner la fonction de chaque onglet.

**Correction recommandée (à valider, pas implémentée)** : remplacer `hidden sm:inline` par `sr-only sm:not-sr-only` pour garder le label accessible aux lecteurs d'écran tout en conservant le compactage visuel voulu sur mobile.

---

## 9. Divergence de système de "tier" entre deux composants (P1 — UX + cohérence métier)

**Fichiers concernés** : `src/components/geoguesser/AcademyBadge.tsx` (fonction `getTier`, paliers 1-6/3-9) vs `src/features/geoguesser/scoring.ts:89-116` (fonction `scoreTier`, paliers 80m/200m/600m).

**Constat** : deux systèmes de classification ("tier"/niveau de réussite) coexistent pour le même module Geoguesser, avec des seuils totalement différents et aucun lien entre eux. Un joueur peut voir un badge "tier 4" sur son profil et un résultat de manche classé différemment dans l'historique de score, sans logique de correspondance visible.

**Impact ergonomie** : confusion pour le joueur ("pourquoi mon badge ne correspond pas à mon dernier résultat ?"), et risque de divergence croissante si l'un des deux systèmes est ajusté sans toucher l'autre (déjà constaté pour les seuils WN8 site/bot, voir `AUDIT_ARCHITECTURE.md`).

---

## 10. Points positifs (UX/Design)

- Design system cohérent : palette `atfr-*` bien structurée (gold/ink/carbon/graphite/steel/fog/bone), typographie `Inter`/`Oswald`/`JetBrains Mono` appliquée de façon homogène, animations `shimmer`/`float`/`pulse-glow`/`fade-in` réutilisables via Tailwind config.
- `PlayerLookupCard.tsx` : bon exemple de gestion d'erreur en français, à généraliser.
- `AdminQuizList.tsx`/`AdminPlayers.tsx` : bon exemple de séparation erreur/vide, à généraliser.
- `Gallery.tsx` : seule modale du site correctement accessible (`role="dialog"`, `aria-modal`, fermeture `Escape`) — bon modèle à dupliquer pour les autres overlays.
- Code-splitting par route déjà en place, ce qui limite le temps de chargement initial perçu malgré la taille du projet (29 pages admin, 17 features).
