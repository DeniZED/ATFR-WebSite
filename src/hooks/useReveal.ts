import { useLayoutEffect, useRef } from 'react';

/**
 * Révélation au scroll robuste et « vivante », indépendante de framer-motion.
 *
 * Deux hooks partagent le même moteur (un seul écouteur de scroll throttlé en
 * requestAnimationFrame, actif uniquement tant qu'il reste des éléments à
 * révéler) :
 *
 *   - useReveal(variant)      : révèle un élément unique (en-tête de section).
 *   - useRevealStagger(step)  : révèle les enfants d'un conteneur EN CASCADE,
 *     avec des directions alternées (gauche / haut / droite) pour un effet
 *     « les cartes se mettent en place ».
 *
 * Le contenu est masqué dès le premier rendu via la classe CSS
 * `reveal-on-scroll` (+ variante), posée avant le paint (useLayoutEffect) —
 * donc aucun flash. Dès que le haut de l'élément franchit ~88 % du viewport,
 * on ajoute `is-revealed` et la transition CSS se déclenche.
 *
 * Accessibilité : sous prefers-reduced-motion, tout est révélé immédiatement
 * (le CSS neutralise déjà la transition et les transforms).
 */

type Variant = 'up' | 'left' | 'right' | 'scale';

const VARIANT_CLASS: Record<Variant, string> = {
  up: '',
  left: 'reveal-left',
  right: 'reveal-right',
  scale: 'reveal-scale',
};

// Directions alternées pour la cascade : gauche → haut → droite → …
const STAGGER_CYCLE: Variant[] = ['left', 'up', 'right'];

const REVEAL_RATIO = 0.88; // révèle quand le haut passe sous 88 % du viewport
const pending = new Map<HTMLElement, () => void>();
let ticking = false;
let bound = false;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Révèle un élément sous prefers-reduced-motion. On force l'affichage en
 * inline avec `important` : certains éléments sont pilotés par framer-motion
 * (motion.div/li avec whileInView) qui, sous reduced-motion, les fige à
 * `opacity: 0` en style inline — sans ce forçage ils resteraient invisibles.
 */
function forceVisible(el: HTMLElement): void {
  el.classList.add('is-revealed');
  el.style.setProperty('opacity', '1', 'important');
  el.style.setProperty('transform', 'none', 'important');
}

function process(): void {
  ticking = false;
  const vh = window.innerHeight || document.documentElement.clientHeight;
  for (const [el, reveal] of pending) {
    if (el.getBoundingClientRect().top < vh * REVEAL_RATIO) {
      reveal();
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

function register(el: HTMLElement, reveal: () => void): void {
  pending.set(el, reveal);
  ensureBound();
  requestAnimationFrame(process); // révèle ce qui est déjà à l'écran au montage
}

function unregister(el: HTMLElement): void {
  if (pending.delete(el) && pending.size === 0) teardown();
}

/** Révèle un élément unique (fondu + montée, ou variante directionnelle). */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  variant: Variant = 'up',
) {
  const ref = useRef<T>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.classList.add('reveal-on-scroll');
    const variantClass = VARIANT_CLASS[variant];
    if (variantClass) el.classList.add(variantClass);

    const reveal = () => el.classList.add('is-revealed');
    if (prefersReducedMotion()) {
      forceVisible(el);
      return;
    }
    register(el, reveal);
    return () => unregister(el);
  }, [variant]);

  return ref;
}

/**
 * Révèle les enfants d'un conteneur en cascade. Si le conteneur n'a qu'un
 * seul enfant qui est lui-même une grille/liste (plusieurs éléments), on
 * met en cascade ces petits-enfants (les cartes) plutôt que le bloc entier.
 */
export function useRevealStagger<T extends HTMLElement = HTMLDivElement>(
  step = 90,
) {
  const ref = useRef<T>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    let items = Array.from(el.children) as HTMLElement[];
    if (items.length === 1 && items[0].children.length > 1) {
      items = Array.from(items[0].children) as HTMLElement[];
    }
    if (items.length === 0) return;

    items.forEach((item, i) => {
      item.classList.add('reveal-on-scroll');
      const variant = STAGGER_CYCLE[i % STAGGER_CYCLE.length];
      const variantClass = VARIANT_CLASS[variant];
      if (variantClass) item.classList.add(variantClass);
      item.style.transitionDelay = `${i * step}ms`;
    });

    const revealAll = () => {
      for (const item of items) item.classList.add('is-revealed');
    };

    if (prefersReducedMotion()) {
      for (const item of items) forceVisible(item);
      return;
    }
    register(el, revealAll);
    return () => unregister(el);
  }, [step]);

  return ref;
}
