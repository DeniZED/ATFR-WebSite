import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types/database';
import { canManageAdmin, hasRole } from '@/types/database';

export function useRole() {
  const { user } = useAuth();

  const query = useQuery<UserRole | null>({
    queryKey: ['user_role', user?.id ?? 'anon'],
    enabled: !!user,
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
  return {
    role,
    isLoading: query.isLoading,
    isSuperAdmin: role === 'super_admin',
    isAdmin: hasRole(role, 'admin'),
    isModerator: hasRole(role, 'moderator'),
    isEditor: hasRole(role, 'editor'),
    can: (area: Parameters<typeof canManageAdmin>[1]) =>
      canManageAdmin(role, area),
  };
}
