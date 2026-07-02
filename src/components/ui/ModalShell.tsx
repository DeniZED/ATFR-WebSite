import type { ReactNode } from 'react';
import { useModalA11y } from '@/hooks/useModalA11y';

interface ModalShellProps {
  /** Nom accessible du dialogue (aria-label). */
  label: string;
  /** Appelé à la fermeture (Echap). */
  onClose: () => void;
  /** Classes du conteneur (typiquement l'overlay fixed inset-0). */
  className?: string;
  children: ReactNode;
}

/**
 * Conteneur de dialogue modal accessible (P0-6) : `role="dialog"`,
 * `aria-modal`, fermeture Echap, piège de focus et restauration du focus
 * via `useModalA11y`. Le style (overlay, centrage, z-index) reste à la
 * charge de l'appelant via `className`.
 *
 * Pour les dialogues animés par framer-motion (drawers), utiliser
 * directement `useModalA11y` sur le conteneur motion.div.
 */
export function ModalShell({
  label,
  onClose,
  className,
  children,
}: ModalShellProps) {
  const ref = useModalA11y<HTMLDivElement>({ onClose });

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      tabIndex={-1}
      className={className}
    >
      {children}
    </div>
  );
}
