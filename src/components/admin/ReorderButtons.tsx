import { ChevronDown, ChevronUp } from 'lucide-react';

const BUTTON_CLASS =
  'inline-flex h-6 w-6 items-center justify-center rounded border border-atfr-gold/15 ' +
  'text-atfr-fog hover:text-atfr-bone hover:border-atfr-gold/40 transition-colors ' +
  'disabled:opacity-30 disabled:pointer-events-none';

/** Paire de boutons monter/descendre pour les listes triées par sort_order. */
export function ReorderButtons({
  onMove,
  canUp,
  canDown,
  disabled,
}: {
  onMove: (direction: -1 | 1) => void;
  canUp: boolean;
  canDown: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 shrink-0" role="group" aria-label="Réordonner">
      <button
        type="button"
        aria-label="Monter"
        className={BUTTON_CLASS}
        disabled={disabled || !canUp}
        onClick={() => onMove(-1)}
      >
        <ChevronUp size={13} />
      </button>
      <button
        type="button"
        aria-label="Descendre"
        className={BUTTON_CLASS}
        disabled={disabled || !canDown}
        onClick={() => onMove(1)}
      >
        <ChevronDown size={13} />
      </button>
    </div>
  );
}
