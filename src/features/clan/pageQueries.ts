import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type {
  ClanContentKey,
  ClanPageContentRow,
  ClanPageInsert,
  ClanPageRow,
} from '@/types/database';

/**
 * Liste toutes les pages clan et leurs clans autorisés.
 * Lecture publique (RLS) — la garde d'accès se fait côté client en
 * comparant le clan_id du joueur vérifié à `allowed_clans`.
 */
export function useClanPages() {
  return useQuery({
    queryKey: ['clan_pages'],
    queryFn: async (): Promise<ClanPageRow[]> => {
      const { data, error } = await supabase
        .from('clan_pages')
        .select('*')
        .order('title', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });
}

/** Récupère une page clan par son slug (ou null si inexistante). */
export function useClanPage(slug: string) {
  return useQuery({
    queryKey: ['clan_pages', slug],
    queryFn: async (): Promise<ClanPageRow | null> => {
      const { data, error } = await supabase
        .from('clan_pages')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      if (error) throw error;
      return data ?? null;
    },
    staleTime: 60_000,
  });
}

export function useUpsertClanPage() {
  const qc = useQueryClient();
  return useMutation({
    meta: { successToast: 'Page clan enregistrée.' },
    mutationFn: async (row: ClanPageInsert & { _isNew?: boolean }) => {
      const { _isNew, ...payload } = row;
      payload.updated_at = new Date().toISOString();
      if (_isNew) {
        const { error } = await supabase.from('clan_pages').insert(payload);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('clan_pages')
          .update(payload)
          .eq('slug', payload.slug);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clan_pages'] }),
  });
}

export function useDeleteClanPage() {
  const qc = useQueryClient();
  return useMutation({
    meta: { successToast: 'Page clan supprimée.' },
    mutationFn: async (slug: string) => {
      const { error } = await supabase
        .from('clan_pages')
        .delete()
        .eq('slug', slug);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clan_pages'] }),
  });
}

// ----------------------------------------------------------------------
// Contenu des pages clan (P0-2) — édition admin.
// Lecture/écriture réservées aux éditeurs par RLS (aucune policy anon) ;
// les joueurs, eux, reçoivent ce contenu via la fonction clan-content.
// ----------------------------------------------------------------------
export function useAdminClanPageContent() {
  return useQuery({
    queryKey: ['clan_page_content', 'admin'],
    queryFn: async (): Promise<ClanPageContentRow[]> => {
      const { data, error } = await supabase
        .from('clan_page_content')
        .select('*')
        .order('page_slug', { ascending: true })
        .order('content_key', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 30_000,
  });
}

export function useUpdateClanPageContent() {
  const qc = useQueryClient();
  return useMutation({
    meta: { silentError: true },
    mutationFn: async (input: {
      page_slug: string;
      content_key: ClanContentKey;
      payload: Record<string, unknown>;
    }) => {
      const { error } = await supabase
        .from('clan_page_content')
        .update({ payload: input.payload, updated_at: new Date().toISOString() })
        .eq('page_slug', input.page_slug)
        .eq('content_key', input.content_key);
      if (error) throw error;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['clan_page_content'] }),
  });
}
