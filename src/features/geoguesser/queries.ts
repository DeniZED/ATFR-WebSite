import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database, QuizDifficulty } from '@/types/database';

type MapRow = Database['public']['Tables']['wot_maps']['Row'];
type MapInsert = Database['public']['Tables']['wot_maps']['Insert'];
type ShotRow = Database['public']['Tables']['geoguesser_shots']['Row'];
type ShotInsert = Database['public']['Tables']['geoguesser_shots']['Insert'];

export interface ShotWithMap extends ShotRow {
  map: MapRow | null;
}

// ----------------------------------------------------------------------
// Maps
// ----------------------------------------------------------------------
export function useGeoMaps(opts: { activeOnly?: boolean } = {}) {
  return useQuery({
    queryKey: ['geo_maps', opts],
    queryFn: async (): Promise<MapRow[]> => {
      let q = supabase
        .from('wot_maps')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });
      if (opts.activeOnly) q = q.eq('is_active', true);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });
}

export function useUpsertMap() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: MapInsert) => {
      const { error } = await supabase
        .from('wot_maps')
        .upsert(input, { onConflict: 'id' });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['geo_maps'] }),
  });
}

export function useBulkUpsertMaps() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (maps: MapInsert[]) => {
      if (maps.length === 0) return { inserted: 0 };
      const { error } = await supabase
        .from('wot_maps')
        .upsert(maps, { onConflict: 'id', ignoreDuplicates: false });
      if (error) throw error;
      return { inserted: maps.length };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['geo_maps'] }),
  });
}

export function useDeleteMap() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('wot_maps').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['geo_maps'] });
      qc.invalidateQueries({ queryKey: ['geo_shots'] });
    },
  });
}

export interface WgMapPayload {
  id: string;
  name: string;
  description: string | null;
  image_url: string;
}

export async function fetchWgMaps(): Promise<WgMapPayload[]> {
  const res = await fetch('/.netlify/functions/wg-maps');
  if (!res.ok) throw new Error(`WG sync failed: ${res.status}`);
  const json = (await res.json()) as { maps?: WgMapPayload[] };
  return json.maps ?? [];
}

// ----------------------------------------------------------------------
// Shots
// ----------------------------------------------------------------------
export function useGeoShots(opts: {
  mapId?: string;
  publishedOnly?: boolean;
} = {}) {
  return useQuery({
    queryKey: ['geo_shots', opts],
    queryFn: async (): Promise<ShotWithMap[]> => {
      let q = supabase
        .from('geoguesser_shots')
        .select('*, map:wot_maps(*)')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (opts.mapId) q = q.eq('map_id', opts.mapId);
      if (opts.publishedOnly) q = q.eq('is_published', true);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as ShotWithMap[];
    },
    staleTime: 30_000,
  });
}

export function useGeoShot(id: string | null) {
  return useQuery({
    queryKey: ['geo_shots', 'detail', id],
    enabled: !!id,
    queryFn: async (): Promise<ShotWithMap | null> => {
      const { data, error } = await supabase
        .from('geoguesser_shots')
        .select('*, map:wot_maps(*)')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return (data as ShotWithMap | null) ?? null;
    },
  });
}

export function useUpsertShot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ShotInsert): Promise<string> => {
      if (input.id) {
        const { error } = await supabase
          .from('geoguesser_shots')
          .update(input)
          .eq('id', input.id);
        if (error) throw error;
        return input.id;
      }
      const { data, error } = await supabase
        .from('geoguesser_shots')
        .insert(input)
        .select('id')
        .single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['geo_shots'] }),
  });
}

export function useDeleteShot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('geoguesser_shots')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['geo_shots'] }),
  });
}

export function useDuplicateShot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      const { data: src, error } = await supabase
        .from('geoguesser_shots')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      if (!src) throw new Error('Shot introuvable');
      const insert: ShotInsert = {
        map_id: src.map_id,
        image_url: src.image_url,
        x_pct: src.x_pct,
        y_pct: src.y_pct,
        difficulty: src.difficulty,
        caption: src.caption ? `${src.caption} (copie)` : null,
        tags: src.tags,
        is_published: false,
        sort_order: src.sort_order,
      };
      const { data, error: insErr } = await supabase
        .from('geoguesser_shots')
        .insert(insert)
        .select('id')
        .single();
      if (insErr) throw insErr;
      return data.id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['geo_shots'] }),
  });
}

// ----------------------------------------------------------------------
// Public game data
// ----------------------------------------------------------------------
export function usePublicGeoShots(opts: { difficulty?: string } = {}) {
  return useQuery({
    queryKey: ['geo_shots', 'public', opts.difficulty ?? 'all'],
    queryFn: async (): Promise<ShotWithMap[]> => {
      let q = supabase
        .from('geoguesser_shots')
        .select('*, map:wot_maps(*)')
        .eq('is_published', true);
      if (opts.difficulty && opts.difficulty !== 'all') {
        q = q.eq('difficulty', opts.difficulty as QuizDifficulty);
      }
      const { data, error } = await q;
      if (error) throw error;
      // Filter out shots whose map is inactive (RLS catches this server-side
      // but we double-check client-side).
      return (data ?? []).filter(
        (s) => (s as ShotWithMap).map && (s as ShotWithMap).map?.is_active,
      ) as ShotWithMap[];
    },
    staleTime: 60_000,
  });
}
