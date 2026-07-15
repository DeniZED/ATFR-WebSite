import { useEffect } from 'react';

/**
 * Écouteur délégué unique pour l'effet spotlight des cartes : au survol d'un
 * élément `.spotlight-card`, met à jour ses variables CSS `--mx`/`--my` avec
 * la position du curseur (relative à la carte). Un seul `pointermove` sur le
 * document couvre toutes les cartes, quel que soit leur nombre.
 */
export function useSpotlight(): void {
  useEffect(() => {
    function onMove(e: PointerEvent) {
      const target = e.target as Element | null;
      const card = target?.closest?.('.spotlight-card') as HTMLElement | null;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      card.style.setProperty('--my', `${e.clientY - rect.top}px`);
    }
    document.addEventListener('pointermove', onMove, { passive: true });
    return () => document.removeEventListener('pointermove', onMove);
  }, []);
}
