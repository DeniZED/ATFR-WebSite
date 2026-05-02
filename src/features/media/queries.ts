import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database, MediaKind } from '@/types/database';

type MediaRow = Database['public']['Tables']['media_assets']['Row'];

const BUCKET = 'public-media';

interface MediaAssetOptions {
  galleryOnly?: boolean;
}

export function useMediaAssets(kind?: MediaKind, opts: MediaAssetOptions = {}) {
  return useQuery({
    queryKey: [
      'media_assets',
      kind ?? 'all',
      opts.galleryOnly ? 'gallery' : 'all',
    ],
    queryFn: async (): Promise<MediaRow[]> => {
      let q = supabase
        .from('media_assets')
        .select('*')
        .order('created_at', { ascending: false });
      if (kind) q = q.eq('kind', kind);
      if (opts.galleryOnly) q = q.eq('is_gallery_visible', true);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 30_000,
  });
}

interface ImageDimensions {
  width: number;
  height: number;
}

function readImageDimensions(file: File): Promise<ImageDimensions | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9.-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function useUploadMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      file: File;
      caption?: string;
      tags?: string[];
    }): Promise<MediaRow> => {
      const { file, caption, tags } = args;
      const kind: MediaKind = file.type.startsWith('video/') ? 'video' : 'image';
      const ts = Date.now();
      const path = `${kind}/${ts}-${slugify(file.name)}`;

      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
          cacheControl: '31536000',
          upsert: false,
          contentType: file.type || undefined,
        });
      if (upErr) throw upErr;

      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET).getPublicUrl(path);

      const dims = kind === 'image' ? await readImageDimensions(file) : null;

      const { data: inserted, error: insErr } = await supabase
        .from('media_assets')
        .insert({
          path,
          public_url: publicUrl,
          kind,
          mime: file.type || null,
          size_bytes: file.size,
          width: dims?.width ?? null,
          height: dims?.height ?? null,
          caption: caption ?? null,
          tags: tags ?? [],
          is_gallery_visible: false,
        })
        .select()
        .single();
      if (insErr) throw insErr;
      return inserted as MediaRow;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['media_assets'] }),
  });
}

export function useUpdateMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      id: string;
      caption?: string | null;
      tags?: string[];
      is_gallery_visible?: boolean;
    }) => {
      const { id, ...rest } = args;
      const { error } = await supabase
        .from('media_assets')
        .update(rest)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['media_assets'] }),
  });
}

export function useDeleteMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (asset: Pick<MediaRow, 'id' | 'path'>) => {
      const { error: storageErr } = await supabase.storage
        .from(BUCKET)
        .remove([asset.path]);
      if (storageErr) throw storageErr;
      const { error } = await supabase
        .from('media_assets')
        .delete()
        .eq('id', asset.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['media_assets'] }),
  });
}
