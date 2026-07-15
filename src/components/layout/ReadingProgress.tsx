import { motion, useScroll, useSpring } from 'framer-motion';

/**
 * Barre de progression de lecture (v2) : un fin liseré doré en haut de page
 * qui suit l'avancée du scroll. Piloté par le scroll (pas une animation
 * autonome) — le lissage `useSpring` reste doux et discret.
 */
export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-atfr-gold-dark via-atfr-gold to-atfr-gold-light"
    />
  );
}
