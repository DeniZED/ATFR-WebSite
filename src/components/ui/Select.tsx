import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string | null;
  hint?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, id, children, ...props }, ref) => {
    const selectId = id ?? props.name;
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-medium uppercase tracking-wider text-atfr-fog"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full rounded-md bg-atfr-ink/80 border border-atfr-gold/15 text-atfr-bone px-3 py-2 transition-colors focus:border-atfr-gold/60 focus:outline-none',
            error && 'border-atfr-danger',
            className,
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error && selectId ? `${selectId}-error` : hint && selectId ? `${selectId}-hint` : undefined}
          {...props}
        >
          {children}
        </select>
        {hint && !error && <p id={selectId ? `${selectId}-hint` : undefined} className="text-xs text-atfr-fog/85">{hint}</p>}
        {error && <p id={selectId ? `${selectId}-error` : undefined} className="text-xs text-atfr-danger">{error}</p>}
      </div>
    );
  },
);
Select.displayName = 'Select';
