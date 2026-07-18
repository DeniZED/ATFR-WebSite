import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';

import { router } from '@/router';
import { AuthProvider } from '@/hooks/useAuth';
import { ClanMembershipProvider } from '@/features/clan/ClanMembershipContext';
import { IntroLoader } from '@/components/layout/IntroLoader';
import { AppErrorBoundary } from '@/components/layout/ErrorScreens';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { emitToast } from '@/lib/toast-bus';
import { translateSupabaseError } from '@/lib/error-messages';
import '@/styles/index.css';

const queryClient = new QueryClient({
  // Retour utilisateur global sur les mutations (généralisation P2-3) :
  // - échec → toast d'erreur traduit, sauf `meta.silentError` (pages qui
  //   affichent déjà l'erreur en ligne, à côté du formulaire) ;
  // - succès → toast si la mutation déclare `meta.successToast`.
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.silentError) return;
      emitToast({
        tone: 'danger',
        durationMs: 6000,
        message: translateSupabaseError(
          error,
          "L'action a échoué. Réessaie ou recharge la page.",
        ),
      });
    },
    onSuccess: (_data, _variables, _context, mutation) => {
      const message = mutation.meta?.successToast;
      if (message) emitToast({ tone: 'success', message });
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
    <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ClanMembershipProvider>
          <ToastProvider>
            <MotionConfig reducedMotion="user">
              <IntroLoader />
              <RouterProvider router={router} />
            </MotionConfig>
          </ToastProvider>
        </ClanMembershipProvider>
      </AuthProvider>
    </QueryClientProvider>
    </HelmetProvider>
    </AppErrorBoundary>
  </StrictMode>,
);
