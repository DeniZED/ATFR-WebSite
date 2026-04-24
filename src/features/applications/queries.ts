import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { notifyNewApplication } from '@/lib/discord';
import type { ApplicationStatus, Database } from '@/types/database';

type ApplicationInsert = Database['public']['Tables']['applications']['Insert'];
type ApplicationRow = Database['public']['Tables']['applications']['Row'];

export function useApplications(status?: ApplicationStatus) {
  return useQuery({
    queryKey: ['applications', status ?? 'all'],
    queryFn: async () => {
      let query = supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });
      if (status) query = query.eq('status', status);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as ApplicationRow[];
    },
  });
}

export function useSubmitApplication() {
  return useMutation({
    mutationFn: async (input: ApplicationInsert) => {
      const { data, error } = await supabase
        .from('applications')
        .insert({ ...input, status: 'pending' })
        .select()
        .single();

      if (error) throw error;

      await notifyNewApplication({
        playerName: input.player_name,
        discordTag: input.discord_tag,
        targetClan: input.target_clan,
        wn8: input.wn8 ?? null,
        winRate: input.win_rate ?? null,
        battles: input.battles ?? null,
        availability: input.availability,
        motivation: input.motivation,
        previousClans: input.previous_clans,
        accountId: input.account_id,
      });

      return data as ApplicationRow;
    },
  });
}

export function useUpdateApplicationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: ApplicationStatus;
      notes?: string;
    }) => {
      const { error } = await supabase
        .from('applications')
        .update({
          status,
          review_notes: notes,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['applications'] }),
  });
}

export function useDeleteApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('applications').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['applications'] }),
  });
}

export function usePendingApplicationsCount() {
  return useQuery({
    queryKey: ['applications', 'pending_count'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('count_pending_applications');
      if (error) throw error;
      return (data as number | null) ?? 0;
    },
    staleTime: 60_000,
  });
}
