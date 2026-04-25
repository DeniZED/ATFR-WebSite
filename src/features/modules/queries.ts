import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { MODULE_REGISTRY, type ModuleDefinition } from './registry';

type ModuleRow = Database['public']['Tables']['learning_modules']['Row'];

export interface AdminModuleEntry {
  registry: ModuleDefinition;
  row: ModuleRow | null;
}

export interface PublicModuleEntry {
  registry: ModuleDefinition;
  row: ModuleRow;
}

export function useModuleRows() {
  return useQuery({
    queryKey: ['learning_modules'],
    queryFn: async (): Promise<ModuleRow[]> => {
      const { data, error } = await supabase
        .from('learning_modules')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });
}

/**
 * For the public hub: only modules registered in code AND marked
 * `is_published = true` in the DB.
 */
export function usePublishedModules() {
  const rowsQuery = useModuleRows();
  const data: PublicModuleEntry[] | undefined = rowsQuery.data
    ? rowsQuery.data
        .map((row) => {
          const registry = MODULE_REGISTRY.find((m) => m.slug === row.slug);
          if (!registry) return null;
          if (!row.is_published) return null;
          return { registry, row } as PublicModuleEntry;
        })
        .filter((v): v is PublicModuleEntry => !!v)
        .sort((a, b) => a.row.sort_order - b.row.sort_order)
    : undefined;
  return { ...rowsQuery, data };
}

/**
 * For the admin page: every code-registered module joined with its DB row
 * (or null if missing). Lets the admin toggle visibility, change order,
 * set a badge, etc.
 */
export function useAdminModules() {
  const rowsQuery = useModuleRows();
  const data: AdminModuleEntry[] | undefined = rowsQuery.data
    ? MODULE_REGISTRY.map((registry) => ({
        registry,
        row: rowsQuery.data!.find((r) => r.slug === registry.slug) ?? null,
      })).sort((a, b) => {
        const ao = a.row?.sort_order ?? 0;
        const bo = b.row?.sort_order ?? 0;
        return ao - bo;
      })
    : undefined;
  return { ...rowsQuery, data };
}

export function useUpsertModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Database['public']['Tables']['learning_modules']['Insert']) => {
      const { error } = await supabase
        .from('learning_modules')
        .upsert(input, { onConflict: 'slug' });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['learning_modules'] }),
  });
}
