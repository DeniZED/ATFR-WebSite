import type { QueryKey } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useInvalidatingMutation } from '@/lib/mutation-factory';

// Réordonnancement visuel des listes admin triées par `sort_order`.
// Les listes historiques ont beaucoup d'égalités (tout à 0, départage par
// date) : plutôt que d'échanger deux valeurs, on renumérote la liste telle
// qu'affichée (0..n-1) en n'écrivant que les lignes qui changent — le
// déplacement devient déterministe et normalise les égalités au passage.

type SortableTable = 'highlights' | 'achievements' | 'testimonials' | 'quiz_categories';

export interface SortOrderUpdate {
  id: string;
  sort_order: number;
}

/**
 * Calcule les écritures nécessaires pour déplacer l'élément `index` d'un cran
 * (`direction` -1 = monter, 1 = descendre) dans la liste affichée.
 * Retourne null si le déplacement sort des bornes.
 */
export function planReorder(
  items: ReadonlyArray<{ id: string; sort_order: number }>,
  index: number,
  direction: -1 | 1,
): SortOrderUpdate[] | null {
  const target = index + direction;
  if (index < 0 || index >= items.length || target < 0 || target >= items.length) {
    return null;
  }
  const next = [...items];
  const [moved] = next.splice(index, 1);
  next.splice(target, 0, moved);
  return next
    .map((item, i) => ({ id: item.id, previous: item.sort_order, sort_order: i }))
    .filter((u) => u.previous !== u.sort_order)
    .map(({ id, sort_order }) => ({ id, sort_order }));
}

export function useReorderRows(table: SortableTable, invalidateKey: QueryKey) {
  return useInvalidatingMutation({
    mutationFn: async (updates: SortOrderUpdate[]) => {
      for (const { id, sort_order } of updates) {
        const { error } = await supabase
          .from(table)
          .update({ sort_order })
          .eq('id', id);
        if (error) throw error;
      }
    },
    invalidates: [invalidateKey],
  });
}
