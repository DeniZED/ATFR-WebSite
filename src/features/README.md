# Organisation des dossiers `features/*`

Convention issue de l'audit technique (P3-3) — elle décrit l'existant et sert
de référence pour les prochains modules. Un dossier feature regroupe tout ce
qui appartient à un domaine métier (events, quiz, rh, clan…) :

| Fichier | Rôle | Quand le créer |
|---|---|---|
| `queries.ts` | Hooks React Query (lecture + mutations) et types de lignes colocalisés | Toujours — point d'entrée du domaine |
| `logic.ts` (ou nom parlant : `mode.ts`, `resultStats.ts`, `badge.ts`…) | Logique métier **pure**, sans React ni Supabase, testée unitairement | Dès qu'une règle métier dépasse le composant qui l'utilise |
| `types.ts` | Types du domaine partagés par plusieurs pages/composants | Seulement si les types débordent de `queries.ts` (ex. `clan/types.ts`) |
| `schema.ts` | Schémas de validation (zod) de formulaires | Seulement pour les formulaires validés (ex. `applications/schema.ts`) |
| `useXxx.ts` | Hooks React spécifiques au domaine (état, contexte) | Au besoin |
| `*.test.ts` | Tests colocalisés de la logique pure | Avec chaque `logic.ts` |

Règles retenues :

- **Pas de fichier vide par principe** : `types.ts`/`schema.ts` n'existent que
  dans les features qui en ont réellement besoin. C'est voulu, pas une
  incohérence.
- Les petits types restent colocalisés dans `queries.ts` tant qu'un seul
  fichier les consomme.
- Les mutations CRUD standard passent par `useInvalidatingMutation`
  (`src/lib/mutation-factory.ts`) ; les mutations à logique spécifique
  (verrouillage optimiste, `onSuccess` exploitant le résultat…) restent
  écrites à la main.
- Le retour utilisateur (toasts succès/erreur) se déclare via `meta`
  (`successToast`, `silentError`) — voir le `MutationCache` global dans
  `src/main.tsx`.
- Les types partagés avec les fonctions Netlify vivent dans `src/types/`
  (ex. `playerStats.ts`) et sont importés type-only côté fonctions.
