import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { cn } from '@/lib/cn';
import { EmberField } from './EmberField';

/**
 * Fond ambiant global des pages publiques : une grille tactique (façon carte
 * de commandement) qui dérive lentement, deux nappes dorées en parallaxe au
 * scroll et une vignette de bords. Purement décoratif — `aria-hidden`,
 * `pointer-events-none`, monté une seule fois derrière tout le contenu.
 *
 * Sobriété garantie : la dérive et la parallaxe sont coupées sous
 * `prefers-reduced-motion`, et le rendu ne fait bouger que des transformes
 * (aucun reflow). Les fonds de section semi-opaques laissent transparaître
 * ce calque, ce qui crée le rythme visuel entre les sections.
 */
export function TacticalBackground() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const haloA = useTransform(scrollY, [0, 2400], [0, 260]);
  const haloB = useTransform(scrollY, [0, 2400], [0, -200]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-atfr-ink"
    >
      {/* Grille tactique, concentrée au centre et fondue vers les bords. */}
      <div
        className={cn(
          'absolute inset-0 bg-grid bg-[length:42px_42px]',
          !reduce && 'animate-grid-pan',
        )}
        style={{
          maskImage:
            'radial-gradient(125% 85% at 50% 15%, #000 35%, transparent 82%)',
          WebkitMaskImage:
            'radial-gradient(125% 85% at 50% 15%, #000 35%, transparent 82%)',
        }}
      />

      {/* Nappes dorées en parallaxe. */}
      <motion.div
        style={{ y: reduce ? 0 : haloA }}
        className="absolute -top-40 -left-32 h-[62vh] w-[62vh] rounded-full bg-atfr-gold/[0.07] blur-3xl"
      />
      <motion.div
        style={{ y: reduce ? 0 : haloB }}
        className="absolute top-1/3 -right-40 h-[70vh] w-[70vh] rounded-full bg-atfr-gold/[0.05] blur-3xl"
      />

      {/* Braises dorées flottantes (v2). */}
      <EmberField />

      {/* Vignette : assombrit les bords pour recentrer le regard. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(135% 100% at 50% 0%, transparent 55%, rgba(6,6,7,0.72) 100%)',
        }}
      />
    </div>
  );
}
