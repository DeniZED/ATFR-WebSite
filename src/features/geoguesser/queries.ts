import { useQuery } from '@tanstack/react-query';
import { useInvalidatingMutation } from '@/lib/mutation-factory';
import { supabase } from '@/lib/supabase';
import type { Database, QuizDifficulty } from '@/types/database';

type MapRow = Database['public']['Tables']['wot_maps']['Row'];
type MapInsert = Database['public']['Tables']['wot_maps']['Insert'];
type ShotRow = Database['public']['Tables']['geoguesser_shots']['Row'];
type ShotInsert = Database['public']['Tables']['geoguesser_shots']['Insert'];

export interface ShotWithMap extends ShotRow {
  map: MapRow | null;
}

// Vue publique sans x_pct/y_pct (P0-1) : la position correcte n'est révélée
// qu'après soumission d'une manche, via geoguesser-submit-round.
export type PublicShot = Database['public']['Views']['geoguesser_shots_public']['Row'];

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
  return useInvalidatingMutation({
    successToast: 'Carte enregistrée.',
    mutationFn: async (input: MapInsert) => {
      const { error } = await supabase
        .from('wot_maps')
        .upsert(input, { onConflict: 'id' });
      if (error) throw error;
    },
    invalidates: [['geo_maps']],
  });
}

export function useBulkUpsertMaps() {
  return useInvalidatingMutation({
    silentError: true,
    mutationFn: async (maps: MapInsert[]) => {
      if (maps.length === 0) return { inserted: 0 };
      const { error } = await supabase
        .from('wot_maps')
        .upsert(maps, { onConflict: 'id', ignoreDuplicates: false });
      if (error) throw error;
      return { inserted: maps.length };
    },
    invalidates: [['geo_maps']],
  });
}

export function useDeleteMap() {
  return useInvalidatingMutation({
    successToast: 'Carte supprimée.',
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('wot_maps').delete().eq('id', id);
      if (error) throw error;
    },
    invalidates: [['geo_maps'], ['geo_shots']],
  });
}

export interface WgMapPayload {
  id: string;
  name: string;
  description: string | null;
  image_url: string;
  size_m: number;
}

export async function fetchWgMaps(): Promise<WgMapPayload[]> {
  const res = await fetch('/.netlify/functions/wg-maps');
  const json = (await res.json().catch(() => ({}))) as {
    maps?: WgMapPayload[];
    error?: string;
    body?: string;
    wg?: { message?: string; field?: string; value?: string };
  };
  if (!res.ok) {
    const wgMsg = json.wg
      ? `${json.wg.message ?? '?'}${json.wg.field ? ` (field=${json.wg.field})` : ''}${json.wg.value ? ` value=${json.wg.value}` : ''}`
      : null;
    const detail = wgMsg ?? json.error ?? json.body ?? `HTTP ${res.status}`;
    throw new Error(`WG sync failed: ${detail}`);
  }
  return json.maps ?? [];
}

// ----------------------------------------------------------------------
// Shots
// ----------------------------------------------------------------------
export function useGeoShots(opts: {
  mapId?: string;
  publishedOnly?: boolean;
  enabled?: boolean;
} = {}) {
  const { mapId, publishedOnly, enabled = true } = opts;
  return useQuery({
    queryKey: ['geo_shots', { mapId, publishedOnly }],
    enabled,
    queryFn: async (): Promise<ShotWithMap[]> => {
      let q = supabase
        .from('geoguesser_shots')
        .select('*, map:wot_maps(*)')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (mapId) q = q.eq('map_id', mapId);
      if (publishedOnly) q = q.eq('is_published', true);
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
  return useInvalidatingMutation({
    successToast: 'Screenshot enregistré.',
    silentError: true,
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
    invalidates: [['geo_shots']],
  });
}

export function useDeleteShot() {
  return useInvalidatingMutation({
    successToast: 'Screenshot supprimé.',
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('geoguesser_shots')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    invalidates: [['geo_shots']],
  });
}

export function useDuplicateShot() {
  return useInvalidatingMutation({
    successToast: 'Screenshot dupliqué.',
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
    invalidates: [['geo_shots']],
  });
}

// ----------------------------------------------------------------------
// Public game data
// ----------------------------------------------------------------------
// Coordonnées (x_pct/y_pct) volontairement absentes : cette vue alimente
// uniquement l'écran d'intro (disponibilité par difficulté). Le tirage du
// pool de manches et le scoring se font côté serveur (geoguesser-start-session
// / -submit-round), qui seuls ont accès aux coordonnées réelles.
export function usePublicGeoShots(opts: { difficulty?: string } = {}) {
  return useQuery({
    queryKey: ['geo_shots', 'public', opts.difficulty ?? 'all'],
    queryFn: async (): Promise<PublicShot[]> => {
      let q = supabase.from('geoguesser_shots_public').select('*');
      if (opts.difficulty && opts.difficulty !== 'all') {
        q = q.eq('difficulty', opts.difficulty as QuizDifficulty);
      }
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });
}

// ----------------------------------------------------------------------
// Settings (round timer, malus values) — single-row config table.
// ----------------------------------------------------------------------
type SettingsRow = Database['public']['Tables']['geoguesser_settings']['Row'];
type SettingsUpdate =
  Database['public']['Tables']['geoguesser_settings']['Update'];

export const DEFAULT_GEO_SETTINGS: SettingsRow = {
  id: 1,
  round_time_s: 45,
  wrong_map_malus_m: 2000,
  timeout_malus_m: 2000,
  daily_challenge_rounds: 5,
  random_rounds: 5,
  sprint_rounds: 10,
  sprint_round_time_s: 20,
  sprint_time_penalty_m: 12,
  blind_rounds: 5,
  blind_preview_seconds: 5,
  min_maps_daily: 5,
  min_maps_random: 5,
  min_maps_sprint: 10,
  min_maps_blind: 5,
  updated_at: new Date(0).toISOString(),
};

export function useGeoSettings() {
  return useQuery({
    queryKey: ['geoguesser_settings'],
    queryFn: async (): Promise<SettingsRow> => {
      const { data, error } = await supabase
        .from('geoguesser_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();
      if (error) throw error;
      return data ?? DEFAULT_GEO_SETTINGS;
    },
    staleTime: 60_000,
  });
}

export function useUpdateGeoSettings() {
  return useInvalidatingMutation({
    silentError: true,
    mutationFn: async (patch: SettingsUpdate) => {
      const { error } = await supabase
        .from('geoguesser_settings')
        .update(patch)
        .eq('id', 1);
      if (error) throw error;
    },
    invalidates: [['geoguesser_settings']],
  });
}

export function useResetShotStats() {
  return useInvalidatingMutation({
    silentError: true,
    mutationFn: async (shotId: string): Promise<number> => {
      const { data, error } = await supabase.rpc(
        'reset_geoguesser_shot_stats',
        {
          p_shot_id: shotId,
        },
      );
      if (error) throw error;
      return data ?? 0;
    },
    invalidates: [['geo_shots']],
  });
}

export function useResetMapShotStats() {
  return useInvalidatingMutation({
    silentError: true,
    mutationFn: async (mapId: string): Promise<number> => {
      const { data, error } = await supabase.rpc(
        'reset_geoguesser_map_stats',
        {
          p_map_id: mapId,
        },
      );
      if (error) throw error;
      return data ?? 0;
    },
    invalidates: [['geo_shots']],
  });
}

export function useResetAllShotStats() {
  return useInvalidatingMutation({
    silentError: true,
    mutationFn: async (): Promise<number> => {
      const { data, error } = await supabase.rpc(
        'reset_geoguesser_all_stats',
      );
      if (error) throw error;
      return data ?? 0;
    },
    invalidates: [['geo_shots']],
  });
}
