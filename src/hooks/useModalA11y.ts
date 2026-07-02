import { useEffect, useRef } from 'react';

// Sélecteur des éléments focusables au clavier à l'intérieur d'un dialogue.
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

// Pile des dialogues ouverts : seul le dialogue au sommet réagit à
// Echap/Tab, pour gérer l'empilement (ex. AvatarCustomizer ouvert
// au-dessus d'AcademyProfilePanel).
const dialogStack: symbol[] = [];

export interface ModalA11yOptions {
  /** Appelé quand l'utilisateur presse Echap. */
  onClose: () => void;
  /** Mettre à false quand le dialogue est fermé (rendu conditionnel dans
   *  le même composant, ex. AnimatePresence). Défaut : true. */
  enabled?: boolean;
}

/**
 * Comportement de dialogue modal accessible (P0-6) : fermeture Echap,
 * piège de focus Tab/Maj+Tab, focus initial sur le conteneur et
 * restauration du focus à la fermeture.
 *
 * Le conteneur qui reçoit la ref doit aussi porter `role="dialog"`,
 * `aria-modal="true"`, un nom accessible (`aria-label` ou
 * `aria-labelledby`) et `tabIndex={-1}` — voir `ModalShell` pour les cas
 * simples sans framer-motion.
 */
export function useModalA11y<T extends HTMLElement>({
  onClose,
  enabled = true,
}: ModalA11yOptions) {
  const ref = useRef<T | null>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!enabled) return;
    const node = ref.current;
    if (!node) return;

    const id = Symbol('modal-dialog');
    dialogStack.push(id);
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    // Focus initial sur le conteneur (tabIndex=-1) plutôt que sur le premier
    // élément interactif : annonce l'ouverture au lecteur d'écran sans
    // activer visuellement un bouton arbitraire.
    node.focus();

    const isTop = () => dialogStack[dialogStack.length - 1] === id;

    function handleKeyDown(e: KeyboardEvent) {
      if (!isTop()) return;
      const current = ref.current;
      if (!current) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab') return;

      const focusables = Array.from(
        current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      if (focusables.length === 0) {
        e.preventDefault();
        current.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      const inside = active instanceof HTMLElement && current.contains(active);

      if (e.shiftKey) {
        if (!inside || active === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (!inside || active === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      const idx = dialogStack.indexOf(id);
      if (idx !== -1) dialogStack.splice(idx, 1);
      previouslyFocused?.focus();
    };
  }, [enabled]);

  return ref;
}
