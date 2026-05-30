import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { env } from '@/lib/env';
import type { Database, MediaKind } from '@/types/database';

type MediaRow = Database['public']['Tables']['media_assets']['Row'];

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

interface CloudinaryUploadResult {
  publicId: string;
  publicUrl: string;
  width: number | null;
  height: number | null;
}

async function uploadToCloudinary(
  file: File,
  folder: string,
): Promise<CloudinaryUploadResult> {
  const resourceType = file.type.startsWith('video/') ? 'video' : 'image';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', env.cloudinaryUploadPreset);
  formData.append('folder', folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${env.cloudinaryCloudName}/${resourceType}/upload`,
    { method: 'POST', body: formData },
  );

  if (!res.ok) {
    const err = await res.json() as { error?: { message?: string } };
    throw new Error(err.error?.message ?? `Cloudinary upload failed (${res.status})`);
  }

  const data = await res.json() as {
    public_id: string;
    width?: number;
    height?: number;
  };

  const publicUrl = `https://res.cloudinary.com/${env.cloudinaryCloudName}/${resourceType}/upload/f_auto,q_auto/${data.public_id}`;

  return {
    publicId: data.public_id,
    publicUrl,
    width: data.width ?? null,
    height: data.height ?? null,
  };
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

      // Détection de doublons : même taille + même type = même fichier
      // Uses maybeSingle() so a missing row returns null instead of an error.
      const { data: existing } = await supabase
        .from('media_assets')
        .select('*')
        .eq('size_bytes', file.size)
        .eq('mime', file.type)
        .limit(1)
        .maybeSingle();
      if (existing) return existing as MediaRow;

      const { publicId, publicUrl, width, height } = await uploadToCloudinary(
        file,
        'atfr/media',
      );

      const { data: inserted, error: insErr } = await supabase
        .from('media_assets')
        .insert({
          path: publicId,
          public_url: publicUrl,
          kind,
          mime: file.type || null,
          size_bytes: file.size,
          width,
          height,
          caption: caption ?? null,
          tags: tags ?? [],
          is_gallery_visible: true,
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
    mutationFn: async (asset: Pick<MediaRow, 'id' | 'path' | 'kind'>) => {
      // Suppression Cloudinary côté serveur (API secret non exposé au browser).
      // The function requires a valid editor session token to authorize the deletion.
      const { data: { session } } = await supabase.auth.getSession();
      const cdnRes = await fetch('/.netlify/functions/cloudinary-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          publicId: asset.path,
          resourceType: asset.kind,
        }),
      });
      if (!cdnRes.ok) {
        const text = await cdnRes.text().catch(() => '');
        throw new Error(`Cloudinary delete failed (${cdnRes.status}): ${text}`);
      }

      const { error } = await supabase
        .from('media_assets')
        .delete()
        .eq('id', asset.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['media_assets'] }),
  });
}
