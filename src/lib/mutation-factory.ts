import {
  useMutation,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query';

/**
 * Fabrique des mutations CRUD standard (P3-2) : exécute `mutationFn`,
 * invalide les préfixes de clés listés dans `invalidates`, et déclare le
 * retour utilisateur global via `meta` (`successToast`/`silentError`,
 * consommés par le MutationCache de src/main.tsx).
 *
 * À réserver aux mutations mécaniques. Celles qui ont une logique propre
 * (verrouillage optimiste, `onSuccess` exploitant le résultat, invalidations
 * conditionnelles…) restent écrites à la main avec `useMutation`.
 */
export function useInvalidatingMutation<TData, TVariables = void>(options: {
  mutationFn: (variables: TVariables) => Promise<TData>;
  /** Préfixes de queryKey à invalider après succès. */
  invalidates: QueryKey[];
  successToast?: string;
  silentError?: boolean;
}) {
  const qc = useQueryClient();
  const { mutationFn, invalidates, successToast, silentError } = options;
  return useMutation({
    meta: {
      ...(successToast ? { successToast } : {}),
      ...(silentError ? { silentError } : {}),
    },
    mutationFn,
    onSuccess: () => {
      for (const queryKey of invalidates) {
        qc.invalidateQueries({ queryKey });
      }
    },
  });
}
