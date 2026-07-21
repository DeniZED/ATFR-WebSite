import { Navigate, Outlet } from 'react-router-dom';
import { useNavVisibility } from '@/features/content/useNavVisibility';
import { Spinner } from '@/components/ui';

/**
 * Protège une page publique dont la visibilité dépend de la présence réelle
 * de contenu (mêmes règles que la navbar via `useNavVisibility`).
 *
 * Si la page est vide / désactivée, l'accès direct par URL est refusé et
 * l'utilisateur est renvoyé à l'accueil — impossible d'y accéder « à la main »,
 * exactement comme le lien est masqué dans la navbar et le footer.
 */
export function RequireNavVisible({
  page,
}: {
  page: 'members' | 'events' | 'gallery';
}) {
  const { data: vis, isLoading } = useNavVisibility();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner label="Chargement…" />
      </div>
    );
  }

  // Tant que la visibilité n'a pas pu être déterminée, on laisse passer
  // (comportement optimiste identique à la navbar). Sinon on applique le flag.
  if (vis && !vis[page]) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
