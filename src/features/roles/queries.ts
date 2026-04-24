import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { UserRole } from '@/types/database';

export interface AdminUser {
  user_id: string;
  email: string;
  created_at: string;
  role: UserRole | null;
}

export function useAdminUsers() {
  return useQuery<AdminUser[]>({
    queryKey: ['admin_users'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('list_users_with_roles');
      if (error) throw error;
      return (data as AdminUser[] | null) ?? [];
    },
    staleTime: 30_000,
  });
}

export function useAssignRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { userId: string; role: UserRole }) => {
      const { error } = await supabase
        .from('user_roles')
        .upsert(
          { user_id: args.userId, role: args.role },
          { onConflict: 'user_id' },
        );
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin_users'] });
      qc.invalidateQueries({ queryKey: ['user_role'] });
    },
  });
}

export function useRemoveRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin_users'] });
      qc.invalidateQueries({ queryKey: ['user_role'] });
    },
  });
}
