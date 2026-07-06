import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';

import { router } from '@/router';
import { AuthProvider } from '@/hooks/useAuth';
import { ClanMembershipProvider } from '@/features/clan/ClanMembershipContext';
import { IntroLoader } from '@/components/layout/IntroLoader';
import '@/styles/index.css';

const queryClient = new QueryClient({
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
    <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ClanMembershipProvider>
          <IntroLoader />
          <RouterProvider router={router} />
        </ClanMembershipProvider>
      </AuthProvider>
    </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>,
);
