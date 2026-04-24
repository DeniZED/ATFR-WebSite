import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types/database';
import { canManageAdmin, hasRole } from '@/types/database';

export function useRole() {
  const { user, loading: authLoading } = useAuth();

  const query = useQuery<UserRole | null>({
    queryKey: ['user_role', user?.id ?? 'anon'],
    enabled: !!user && !authLoading,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return (data?.role as UserRole | undefined) ?? null;
    },
    staleTime: 60_000,
  });

  const role = query.data ?? null;
  // While auth is still resolving OR the role query is in-flight, we're
  // "loading". Components that gate on the role should wait for this flag
  // before deciding to redirect.
  const isLoading = authLoading || (!!user && query.isLoading);

  return {
    role,
    isLoading,
    isSuperAdmin: role === 'super_admin',
    isAdmin: hasRole(role, 'admin'),
    isModerator: hasRole(role, 'moderator'),
    isEditor: hasRole(role, 'editor'),
    can: (area: Parameters<typeof canManageAdmin>[1]) =>
      canManageAdmin(role, area),
  };
}
