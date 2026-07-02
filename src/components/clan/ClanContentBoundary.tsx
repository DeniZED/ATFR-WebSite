import type { ReactNode } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { Alert, Spinner } from '@/components/ui';
import type { ClanPageContents } from '@/features/clan/contentQueries';

interface ClanContentBoundaryProps {
  query: UseQueryResult<ClanPageContents>;
  children: (contents: ClanPageContents) => ReactNode;
}

/**
 * États chargement/erreur du contenu clan-hub (P0-2). Le contenu arrive
 * désormais du serveur (fonction clan-content) au lieu d'être compilé dans
 * le bundle — chaque page clan enveloppe son rendu dans ce boundary.
 */
export function ClanContentBoundary({
  query,
  children,
}: ClanContentBoundaryProps) {
  if (query.isPending) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }
  if (query.isError) {
    return (
      <Alert tone="danger" title="Erreur de chargement">
        {(query.error as Error).message}
      </Alert>
    );
  }
  return <>{children(query.data)}</>;
}
