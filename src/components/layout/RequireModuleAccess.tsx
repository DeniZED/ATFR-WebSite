import { Navigate, Outlet } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';
import { Spinner } from '@/components/ui';

/**
 * Protège une route admin selon le module configuré pour l'utilisateur
 * (rôle + `module_access`, voir ADMIN_MODULES et /admin/utilisateurs).
 */
export function RequireModuleAccess({ moduleKey }: { moduleKey: string }) {
  const { canAccess, isLoading } = useRole();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner label="Vérification des accès…" />
      </div>
    );
  }

  if (!canAccess(moduleKey)) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}
