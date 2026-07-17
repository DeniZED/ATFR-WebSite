import { useEffect, useRef } from 'react';

/**
 * Révélation au scroll robuste, indépendante de framer-motion.
 *
 * On applique la classe CSS `reveal-on-scroll` (contenu masqué + transition)
 * sur l'élément retourné ; dès que le haut de l'élément franchit ~90 % de la
 * hauteur du viewport, on ajoute `is-revealed`, ce qui déclenche la
 * transition CSS.
 *
 * Implémenté avec un seul écouteur de scroll partagé (throttlé en
 * requestAnimationFrame) plutôt qu'un IntersectionObserver : ça garantit la
 * révélation même sur les scrolls très rapides ou les sauts d'ancre (l'IO
 * peut « rater » un transit rapide entre deux échantillons). Coût quasi nul :
 * l'écouteur n'existe que tant qu'il reste des éléments à révéler.
 *
 * Accessibilité : si l'utilisateur préfère moins d'animations, on révèle
 * immédiatement (le CSS neutralise déjà la transition).
 */

const pending = new Set<HTMLElement>();
const REVEAL_RATIO = 0.9; // révèle quand le haut passe sous 90 % du viewport
let ticking = false;
let bound = false;

function process(): void {
  ticking = false;
  const vh = window.innerHeight || document.documentElement.clientHeight;
  for (const el of pending) {
    if (el.getBoundingClientRect().top < vh * REVEAL_RATIO) {
      el.classList.add('is-revealed');
      pending.delete(el);
    }
  }
  if (pending.size === 0) teardown();
}

function onScroll(): void {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(process);
}

function ensureBound(): void {
  if (bound || typeof window === 'undefined') return;
  bound = true;
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
}

function teardown(): void {
  if (!bound) return;
  bound = false;
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('resize', onScroll);
}

export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      el.classList.add('is-revealed');
      return;
    }

    pending.add(el);
    ensureBound();
    // Révèle immédiatement ce qui est déjà à l'écran au montage.
    requestAnimationFrame(process);

    return () => {
      pending.delete(el);
      if (pending.size === 0) teardown();
    };
  }, []);

  return ref;
}
