import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type EventRow = Database['public']['Tables']['events']['Row'];

export function useEvents(options: { includePrivate?: boolean } = {}) {
  return useQuery({
    queryKey: ['events', options],
    queryFn: async () => {
      let query = supabase
        .from('events')
        .select('*')
        .gte('starts_at', new Date(Date.now() - 24 * 3600 * 1000).toISOString())
        .order('starts_at', { ascending: true });

      if (!options.includePrivate) {
        query = query.eq('is_public', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as EventRow[];
    },
  });
}

export function useAllEvents() {
  return useQuery({
    queryKey: ['events', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('starts_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as EventRow[];
    },
  });
}

export function useUpsertEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Database['public']['Tables']['events']['Insert'] & { id?: string }) => {
      if (input.id) {
        const { data, error } = await supabase
          .from('events')
          .update(input)
          .eq('id', input.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase
        .from('events')
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  });
}
