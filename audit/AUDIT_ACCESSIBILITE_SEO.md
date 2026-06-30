# AUDIT ACCESSIBILITÉ (WCAG 2.1 AA) & SEO / PARTAGE — Site ATFR

---

## Partie A — Accessibilité

### 1. P0 — Indicateur de focus clavier invisible sur (quasi) tous les boutons du site

**Fichier** : `src/components/ui/Button.tsx:6`

```
'inline-flex items-center justify-center gap-2 font-medium tracking-wide transition-all duration-200
 ease-emphasized disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-offset-atfr-ink rounded-md'
```

**Constat (vérifié ligne par ligne)** : la classe définit `focus-visible:ring-offset-atfr-ink` (la couleur de l'espace *autour* de l'anneau de focus) **mais ne définit jamais l'anneau lui-même** (`ring-2`/`ring-atfr-gold` ou équivalent). Sans largeur d'anneau définie, `ring-offset` seul ne produit **aucun effet visuel**. Résultat : naviguer au clavier (Tab) à travers le site ne fait apparaître **aucune indication visuelle** de l'élément actuellement focalisé sur la quasi-totalité des boutons — y compris dans le back-office admin.

**Contre-exemple positif à répliquer** : `src/components/ui/Switch.tsx:13-19` définit correctement l'anneau de focus complet.

**Violation WCAG** : critère 2.4.7 (Focus visible), niveau AA.

**Impact** : tout utilisateur naviguant au clavier (accessibilité motrice, mais aussi power-users du back-office admin) perd le repère visuel de sa position dans l'interface — particulièrement problématique sur les pages admin avec de nombreux boutons d'action côte à côte (suppression, édition...).

**Correction de principe (non implémentée)** : ajouter `focus-visible:ring-2 focus-visible:ring-atfr-gold` (ou équivalent) à la définition `cva` du bouton — correction d'une seule ligne mais à fort effet de bord positif puisque centralisée dans le composant `Button` partagé par tout le site.

---

### 2. P0 — Élément interactif totalement inaccessible au clavier

**Fichier** : `src/components/admin/MinimapClickPlacer.tsx:65-68`

```tsx
<div
  ref={containerRef}
  onClick={handleClick}
  className="relative aspect-square w-full overflow-hidden rounded-lg border ... cursor-crosshair select-none"
>
```

**Constat** : ce `<div>` est l'unique moyen de placer un point sur la mini-carte (fonctionnalité admin pour le module Geoguesser), mais il n'a ni `role="button"`, ni `tabIndex`, ni gestionnaire `onKeyDown` — **aucun utilisateur clavier ne peut l'atteindre ni l'activer**.

**Violation WCAG** : critère 2.1.1 (Keyboard), niveau A.

**Impact** : un administrateur ne pouvant/voulant pas utiliser la souris ne peut pas configurer les points de carte Geoguesser — fonctionnalité admin bloquée intégralement pour cet usage.

---

### 3. P0 — Modales custom sans `role="dialog"`, sans piège de focus, sans fermeture `Echap`

**Fichier principal** : `src/components/geoguesser/AvatarCustomizer.tsx` (462 lignes)

**Constat** : sur 4 overlays/modales audités dans le projet, un seul (`src/pages/Gallery.tsx:118-168`) implémente correctement `role="dialog"`, `aria-modal="true"` et la fermeture au clavier via `Escape`. Les 3 autres, dont `AvatarCustomizer`, n'ont :
- aucun rôle ARIA de dialogue (invisible comme tel pour un lecteur d'écran, qui ne signale pas l'ouverture d'une boîte de dialogue modale),
- aucun piège de focus (le focus clavier peut "s'échapper" de la modale vers le contenu de la page sous-jacente),
- aucune gestion de la touche `Echap`.

**Violation WCAG** : critère 4.1.2 (Name, Role, Value), niveau A ; critère 2.1.1 (Keyboard), niveau A.

---

### 4. P1 — Contraste de texte insuffisant (94 occurrences cumulées)

**Constat** : la couleur `text-atfr-fog` (`#9CA0AA`) combinée à des opacités réduites (`/70` et en dessous, jusqu'à `/25`-`/30`) échoue systématiquement au ratio de contraste 4.5:1 requis pour le texte normal en WCAG AA. Concentration la plus forte dans `src/pages/clan/*.tsx` (zone réservée aux membres) et les composants Geoguesser. Occurrences les plus extrêmes relevées : `src/components/geoguesser/FloatingMapPicker.tsx:365` et `:463` (opacité `/25`-`/30`).

**Violation WCAG** : critère 1.4.3 (Contrast minimum), niveau AA.

**Impact** : lisibilité dégradée pour tout utilisateur, amplifiée pour les personnes malvoyantes — sur des pages utilisées quotidiennement par les membres du clan (zone clan-hub).

---

### 5. P1 — Champs de formulaire sans attributs ARIA d'erreur cohérents

**Fichier** : `src/components/ui/Select.tsx` (comparé à `src/components/ui/Input.tsx`)

**Constat** : `Input.tsx` expose correctement `aria-invalid`/`aria-describedby` pour lier visuellement et pour lecteur d'écran un message d'erreur à son champ. `Select.tsx` ne le fait pas — incohérence entre deux composants de formulaire du même design system.

**Violation WCAG** : critère 4.1.2 (Name, Role, Value), niveau A (partiel — selon le contexte d'usage du `Select`).

---

### 6. P1 — Labels d'onglets retirés de l'arbre d'accessibilité sous le breakpoint `sm`

**Fichier** : `src/components/geoguesser/AvatarCustomizer.tsx:150-163`

**Constat** : `hidden sm:inline` masque le texte des onglets sous 640px de largeur. `hidden` (équivalent `display:none`) retire l'élément de l'arbre d'accessibilité, pas seulement de l'affichage visuel — un lecteur d'écran ne lira jamais ce label sur mobile, laissant des boutons icône-seule sans nom accessible.

**Violation WCAG** : critère 4.1.2 (Name, Role, Value), niveau A.

**Correction de principe (non implémentée)** : remplacer par `sr-only sm:not-sr-only` pour garder le texte lisible par un lecteur d'écran tout en conservant le compactage visuel.

---

### 7. P2 — Hiérarchie de titres incohérente

**Constat** :
- `Members.tsx` et `Recruitment.tsx` n'ont pas de `<h1>`.
- `Home.tsx` saute des niveaux de titre dans la plupart de ses sections (passage direct de `h1` à `h3`, sans `h2` intermédiaire).

**Violation WCAG** : critère 1.3.1 (Info and Relationships), niveau A — la hiérarchie de titres est un repère de navigation essentiel pour les utilisateurs de lecteurs d'écran (navigation par titres).

---

### 8. Points positifs (accessibilité)

- `Switch.tsx` implémente correctement le focus visible — bon modèle à dupliquer sur `Button.tsx`.
- `Gallery.tsx` est la seule modale correctement accessible du site — bon modèle à dupliquer.
- `Input.tsx` implémente correctement `aria-invalid`/`aria-describedby` — bon modèle à dupliquer sur `Select.tsx`.
- `lang="fr"` correctement défini sur `<html>` (`index.html:2`).

---

## Partie B — SEO / Partage social

### 9. P1 — Image Open Graph référencée mais absente du dossier public

**Fichier** : `index.html:26,37` référence `https://atfr-clan.netlify.app/og-image.png` pour `og:image` et `twitter:image`. **Vérifié** : ce fichier **n'existe pas** dans `public/` (qui contient uniquement `favicon.svg`, `manifest.webmanifest`, `robots.txt`, `sitemap.xml`).

**Impact** : tout partage du site sur Discord, Twitter/X, Facebook, etc. affichera un aperçu **sans image** (ou une icône d'erreur selon la plateforme) — pour un clan dont le recrutement et la visibilité communautaire passent largement par le partage de liens (Discord notamment), c'est un manque à gagner direct en visibilité.

**Correction de principe (non implémentée)** : ajouter un fichier `og-image.png` (1200×630px recommandé) dans `public/`. Effort très faible, impact direct sur l'image renvoyée à chaque partage.

---

### 10. P2 — Métadonnées statiques, identiques sur toutes les pages

**Constat** : `index.html` définit un unique jeu de balises `<title>`, `description`, `og:*`, `twitter:*` pour toute l'application (SPA sans `react-helmet-async` ni équivalent — confirmé, aucune occurrence de `Helmet`/`document.title` trouvée dans `src/`). Toutes les pages (Accueil, Membres, Événements, Recrutement, Galerie, pages admin) partagent donc le même titre et la même description lors d'un partage de lien ou dans les résultats de moteur de recherche.

**Impact** : un lien partagé vers `/recrutement` ou `/evenements` affichera toujours "ATFR — Clan World of Tanks" / la description générique de la page d'accueil, jamais un titre spécifique à la page partagée — perte de pertinence SEO et de clarté lors du partage ciblé d'une page précise (ex. partager une annonce de recrutement sur Discord).

**Correction de principe (non implémentée)** : introduire une gestion de balises par route (ex. `react-helmet-async`), au minimum sur les pages publiques à fort enjeu de partage (`Recruitment.tsx`, `Events.tsx`).

---

### 11. Points positifs (SEO)

- `index.html` est déjà bien doté : `lang="fr"`, `meta description`, OG complet (hormis l'image manquante), Twitter Card, `canonical`, `manifest.webmanifest`, preconnect sur les polices.
- `robots.txt` et `sitemap.xml` présents dans `public/`.
- CSP et headers de sécurité n'entravent pas l'indexation (pas de `X-Robots-Tag: noindex` trouvé).

---

## Résumé des findings accessibilité/SEO

| # | Finding | Sévérité |
|---|---|---|
| 1 | Focus clavier invisible sur les boutons (`Button.tsx`) | **P0** |
| 2 | `MinimapClickPlacer` inaccessible au clavier | **P0** |
| 3 | Modales custom sans `role="dialog"`/piège de focus/`Echap` | **P0** |
| 4 | Contraste insuffisant (94 occurrences, `text-atfr-fog/opacité`) | P1 |
| 5 | `Select.tsx` sans `aria-invalid`/`aria-describedby` | P1 |
| 6 | Labels d'onglets retirés de l'arbre a11y sous `sm` | P1 |
| 7 | `og-image.png` manquant — partage social sans image | P1 |
| 8 | Hiérarchie de titres incohérente (`h1` manquant, sauts de niveau) | P2 |
| 9 | Métadonnées identiques sur toutes les routes (pas de SEO par page) | P2 |
