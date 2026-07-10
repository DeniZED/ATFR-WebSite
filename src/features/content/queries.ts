import { useQuery } from '@tanstack/react-query';
import { useInvalidatingMutation } from '@/lib/mutation-factory';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type SiteContentRow = Database['public']['Tables']['site_content']['Row'];
type HighlightRow = Database['public']['Tables']['highlights']['Row'];
type HighlightInsert = Database['public']['Tables']['highlights']['Insert'];
type AchievementRow = Database['public']['Tables']['achievements']['Row'];
type AchievementInsert = Database['public']['Tables']['achievements']['Insert'];
type TestimonialRow = Database['public']['Tables']['testimonials']['Row'];
type TestimonialInsert = Database['public']['Tables']['testimonials']['Insert'];

export type ContentMap = Record<string, SiteContentRow>;

export function useSiteContent() {
  return useQuery({
    queryKey: ['site_content'],
    queryFn: async (): Promise<ContentMap> => {
      const { data, error } = await supabase.from('site_content').select('*');
      if (error) throw error;
      const map: ContentMap = {};
      for (const row of data ?? []) map[row.key] = row;
      return map;
    },
    staleTime: 60_000,
  });
}

export function useUpdateSiteContent() {
  return useInvalidatingMutation({
    successToast: 'Contenu enregistré.',
    mutationFn: async (rows: Array<{ key: string; value: string }>) => {
      const { error } = await supabase
        .from('site_content')
        .upsert(rows, { onConflict: 'key' });
      if (error) throw error;
    },
    invalidates: [['site_content']],
  });
}

export function useHighlights(opts: { visibleOnly?: boolean } = {}) {
  return useQuery({
    queryKey: ['highlights', opts],
    queryFn: async (): Promise<HighlightRow[]> => {
      let q = supabase
        .from('highlights')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (opts.visibleOnly) q = q.eq('is_visible', true);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });
}

export function useUpsertHighlight() {
  return useInvalidatingMutation({
    successToast: 'Moment fort enregistré.',
    mutationFn: async (row: HighlightInsert & { id?: string }) => {
      if (row.id) {
        const { error } = await supabase
          .from('highlights')
          .update(row)
          .eq('id', row.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('highlights').insert(row);
        if (error) throw error;
      }
    },
    invalidates: [['highlights']],
  });
}

export function useDeleteHighlight() {
  return useInvalidatingMutation({
    successToast: 'Moment fort supprimé.',
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('highlights').delete().eq('id', id);
      if (error) throw error;
    },
    invalidates: [['highlights']],
  });
}

export function useAchievements(opts: { visibleOnly?: boolean } = {}) {
  return useQuery({
    queryKey: ['achievements', opts],
    queryFn: async (): Promise<AchievementRow[]> => {
      let q = supabase
        .from('achievements')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('earned_on', { ascending: false, nullsFirst: false });
      if (opts.visibleOnly) q = q.eq('is_visible', true);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });
}

export function useUpsertAchievement() {
  return useInvalidatingMutation({
    successToast: 'Trophée enregistré.',
    mutationFn: async (row: AchievementInsert & { id?: string }) => {
      if (row.id) {
        const { error } = await supabase
          .from('achievements')
          .update(row)
          .eq('id', row.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('achievements').insert(row);
        if (error) throw error;
      }
    },
    invalidates: [['achievements']],
  });
}

export function useDeleteAchievement() {
  return useInvalidatingMutation({
    successToast: 'Trophée supprimé.',
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('achievements')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    invalidates: [['achievements']],
  });
}

export function useTestimonials(opts: { visibleOnly?: boolean } = {}) {
  return useQuery({
    queryKey: ['testimonials', opts],
    queryFn: async (): Promise<TestimonialRow[]> => {
      let q = supabase
        .from('testimonials')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (opts.visibleOnly) q = q.eq('is_visible', true);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });
}

export function useUpsertTestimonial() {
  return useInvalidatingMutation({
    successToast: 'Témoignage enregistré.',
    mutationFn: async (row: TestimonialInsert & { id?: string }) => {
      if (row.id) {
        const { error } = await supabase
          .from('testimonials')
          .update(row)
          .eq('id', row.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('testimonials').insert(row);
        if (error) throw error;
      }
    },
    invalidates: [['testimonials']],
  });
}

export function useDeleteTestimonial() {
  return useInvalidatingMutation({
    successToast: 'Témoignage supprimé.',
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    invalidates: [['testimonials']],
  });
}
