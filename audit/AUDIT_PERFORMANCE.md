# AUDIT PERFORMANCE — Site ATFR

Sources : exécution réelle de `npm run build` (build de production, non modifié), inspection de la configuration Vite/React Query, et relecture ciblée des composants à fort volume de rendu.

---

## 1. Build de production — analyse des chunks

Build exécuté avec succès en 7.09s. Découpage déjà en place via `vite.config.ts` (`manualChunks`: react / supabase / query / motion / forms) + lazy-loading systématique des pages dans `router.tsx`.

**Chunks les plus lourds (gzip)** :

| Chunk | Taille (brute) | Taille (gzip) | Origine |
|---|---|---|---|
| `PieChart-*.js` | 399.10 kB | **115.48 kB** | `recharts` (graphiques admin) |
| `react-*.js` | 207.01 kB | 67.61 kB | react + react-dom + react-router-dom |
| `supabase-*.js` | 194.35 kB | 51.52 kB | `@supabase/supabase-js` |
| `index-*.js` (entrée) | 139.95 kB | 39.14 kB | bundle d'entrée |
| `motion-*.js` | 115.07 kB | 38.06 kB | `framer-motion` |
| `forms-*.js` | 82.23 kB | 22.63 kB | react-hook-form + zod + resolvers |
| `Geoguesser-*.js` | 79.36 kB | 22.99 kB | page Geoguesser (cohérent avec ses 3317 lignes) |
| `Home-*.js` | 39.98 kB | 9.94 kB | page d'accueil |
| `AdminHome-*.js` | 39.96 kB | 11.75 kB | dashboard admin |

**Constat principal** : `recharts` (chunk `PieChart`) est, à lui seul, le plus gros chunk du site — **plus lourd que React lui-même**. Il faut vérifier qu'il n'est chargé que lorsqu'un graphique est réellement affiché (ex. `AdminQuizStats`, `HrStatusBreakdown`, `CwEventDetail`), et jamais sur le chemin critique des pages publiques. Le code-splitting par route (`React.lazy`) limite déjà ce risque pour la zone admin, mais `CwEventDetail.tsx` est accessible en zone "clan" — à vérifier que son usage de graphique ne pénalise pas le temps de chargement initial de cette page pour un usage qui peut être occasionnel.

**Recommandation (non implémentée)** : envisager de charger `recharts`/`PieChart` via un second niveau de lazy-loading (`React.lazy` sur le sous-composant graphique lui-même, pas seulement sur la page), pour les pages où le graphique n'est qu'une partie secondaire du contenu. Effort faible, gain potentiellement significatif sur le temps de chargement des pages concernées.

---

## 2. Cache React Query — configuration globale

`src/main.tsx:12-16` :
```
staleTime: 60_000   (1 min, par défaut global)
gcTime: 5 * 60_000  (5 min)
```

Configuration raisonnable par défaut. Certains hooks définissent un `staleTime` plus long localement (`useClanAccess.ts`, `clanQuery` : 5 min) — cohérent avec une donnée qui change rarement (clan d'un joueur), mais cela a un effet de bord sécurité documenté dans `AUDIT_SECURITE.md` (révocation d'accès non instantanée).

**Pas de finding de performance négatif ici** — la stratégie de cache est cohérente, pas de sur-fetching ni de sous-fetching évident détecté dans les fichiers examinés.

---

## 3. Images / médias

- 24 fichiers utilisent `<img>`, dont 26 occurrences avec `loading="lazy"` (le ratio suggère un bon réflexe de lazy-loading déjà appliqué sur la majorité des images, notamment galerie et avatars).
- Les médias utilisateur (galerie, avatars) passent par Cloudinary avec upload signé côté serveur (`cloudinary-sign.mts`) — Cloudinary permet nativement le redimensionnement/format automatique à la volée via les paramètres d'URL, mais l'audit n'a pas vérifié si ces transformations (ex. `f_auto,q_auto`) sont systématiquement appliquées aux URLs générées côté client. **Point à vérifier** (non confirmé en l'état, ni positif ni négatif) avant de le considérer comme un finding.

---

## 4. Composant `Geoguesser.tsx` — risque de re-render

**Constat** : 3317 lignes, 22 `useState` distincts dans un seul composant. Un grand nombre de `useState` dans un même composant signifie que **toute mise à jour d'un seul state déclenche un re-render de l'intégralité de l'arbre du composant**, y compris les ~25 sous-composants inline qui y sont définis (ce qui empêche en plus React de les mémoiser efficacement, puisqu'un composant défini inline dans le corps d'un autre composant est recréé à chaque rendu).

**Impact concret** : pendant une partie de Geoguesser (changements fréquents d'état : position du curseur, temps écoulé, score provisoire), c'est précisément le moment où la fluidité de l'interface compte le plus pour l'expérience de jeu.

**Effort de correction** : élevé — nécessite le même refactor de découpage évoqué dans `AUDIT_ARCHITECTURE.md` §1 (extraction des sous-composants en fichiers séparés, regroupement des states liés via `useReducer` ou des hooks dédiés). **À ne pas entreprendre sans validation**, risque de régression sur le module le plus utilisé du site académie.

---

## 5. Fonctions Netlify / cold starts

Non mesuré directement (pas d'environnement de prod accessible pour ce test), mais à noter pour la suite : 18 fonctions `.mts`, dont des crons (`snapshot-player-activity`, `purge-old-data`, `rh-weekly-digest`). Le cron `snapshot-player-activity.mts` fait des appels à l'API Wargaming par lot avec gestion d'erreur par lot (`continue` en cas d'échec, voir `AUDIT_SECURITE.md`/architecture) — bon réflexe pour éviter qu'une erreur API isolée ne bloque tout le job, mais le volume d'appels n'a pas été mesuré (dépend du nombre de membres actifs suivis).

---

## Résumé des findings performance

| # | Finding | Sévérité | Effort | Impact |
|---|---|---|---|---|
| 1 | Chunk `recharts`/`PieChart` (115 kB gzip) potentiellement chargé plus largement que nécessaire | P2 | Faible | Moyen |
| 2 | `Geoguesser.tsx` — 22 `useState` + sous-composants inline non mémoïsables, risque de re-render excessif pendant le jeu | P2 | Élevé | Moyen-élevé (UX en jeu) |
| 3 | Transformations Cloudinary (`f_auto`/`q_auto`) à vérifier systématiquement | P3 (à confirmer) | Faible | Moyen |

**Points positifs** : code-splitting par route déjà en place, configuration de cache React Query cohérente, build de production fonctionnel sans erreur, lazy-loading déjà appliqué sur la majorité des images.
