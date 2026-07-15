import { TacticalBackground } from './TacticalBackground';
import { ReadingProgress } from './ReadingProgress';
import { useSpotlight } from '@/hooks/useSpotlight';

/**
 * Ambiance visuelle commune à tous les modules du site (public, académie,
 * clan, admin, connexion) : fond tactique + braises, barre de progression de
 * lecture et écouteur de spotlight des cartes. Monté une fois par layout pour
 * une homogénéité totale. Le calque de fond étant `fixed -z-10`, chaque layout
 * doit garder un fond transparent (pas de `bg-*` opaque sur sa racine).
 */
export function AmbientBackground() {
  useSpotlight();
  return (
    <>
      <TacticalBackground />
      <ReadingProgress />
    </>
  );
}
