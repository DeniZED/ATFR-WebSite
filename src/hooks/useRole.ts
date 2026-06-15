import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types/database';
import { canAccessModule, canManageAdmin, hasRole } from '@/types/database';

interface RoleData {
  role: UserRole | null;
  moduleAccess: string[];
}

export function useRole() {
  const { user, loading: authLoading } = useAuth();

  const query = useQuery<RoleData>({
    queryKey: ['user_role', user?.id ?? 'anon'],
    enabled: !!user && !authLoading,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role, module_access')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return {
        role: (data?.role as UserRole | undefined) ?? null,
        moduleAccess: data?.module_access ?? [],
      };
    },
    staleTime: 60_000,
  });

  const role = query.data?.role ?? null;
  const moduleAccess = query.data?.moduleAccess ?? [];
  // While auth is still resolving OR the role query is in-flight, we're
  // "loading". Components that gate on the role should wait for this flag
  // before deciding to redirect.
  const isLoading = authLoading || (!!user && query.isLoading);

  return {
    role,
    moduleAccess,
    isLoading,
    isSuperAdmin: role === 'super_admin',
    isAdmin: hasRole(role, 'admin'),
    isModerator: hasRole(role, 'moderator'),
    isEditor: hasRole(role, 'editor'),
    can: (area: Parameters<typeof canManageAdmin>[1]) =>
      canManageAdmin(role, area),
    canAccess: (moduleKey: string) =>
      canAccessModule(role, moduleAccess, moduleKey),
  };
}

