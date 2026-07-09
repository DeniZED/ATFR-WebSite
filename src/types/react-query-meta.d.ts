import '@tanstack/react-query';

// Typage du champ `meta` des mutations React Query (voir le MutationCache
// global dans main.tsx) :
// - `successToast` : message affiché en toast succès quand la mutation aboutit.
// - `silentError`  : désactive le toast d'erreur global pour les mutations
//   dont l'échec est déjà affiché en ligne par la page appelante.
declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      successToast?: string;
      silentError?: boolean;
    };
  }
}
