import { type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface SwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: ReactNode;
  hint?: ReactNode;
  disabled?: boolean;
  className?: string;
}

/**
 * Toggle switch sized for touch (44px target). The button itself and the
 * adjacent label area are both clickable, so a tap anywhere along the
 * row toggles the state. We deliberately don't wrap the button in a
 * <label> — nesting interactive elements inside a <label> creates
 * inconsistent behavior on mobile.
 */
export function Switch({
  checked,
  onChange,
  label,
  hint,
  disabled,
  className,
}: SwitchProps) {
  function toggle() {
    if (disabled) return;
    onChange(!checked);
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 select-none',
        disabled && 'opacity-50',
        className,
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={toggle}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 mt-0.5 items-center rounded-full transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atfr-gold/60',
          checked ? 'bg-atfr-gold' : 'bg-atfr-graphite border border-atfr-gold/20',
          disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        )}
      >
        <span
          className={cn(
            'inline-block h-5 w-5 transform rounded-full bg-atfr-bone shadow transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0.5',
          )}
        />
      </button>
      {(label || hint) && (
        <button
          type="button"
          onClick={toggle}
          disabled={disabled}
          className={cn(
            'text-left text-sm text-atfr-bone leading-snug min-w-0',
            disabled ? 'cursor-not-allowed' : 'cursor-pointer',
          )}
        >
          {label && <p>{label}</p>}
          {hint && <p className="text-xs text-atfr-fog mt-0.5">{hint}</p>}
        </button>
      )}
    </div>
  );
}
