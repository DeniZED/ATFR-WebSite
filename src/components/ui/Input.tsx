import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

const fieldBase =
  'w-full rounded-md bg-atfr-ink/80 border border-atfr-gold/15 text-atfr-bone placeholder-atfr-fog/60 px-3 py-2 transition-colors focus:border-atfr-gold/60 focus:outline-none disabled:opacity-60';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string | null;
  label?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, hint, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium uppercase tracking-wider text-atfr-fog"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            fieldBase,
            error && 'border-atfr-danger focus:border-atfr-danger',
            className,
          )}
          aria-invalid={error ? 'true' : undefined}
          {...props}
        />
        {hint && !error && <p className="text-xs text-atfr-fog/70">{hint}</p>}
        {error && <p className="text-xs text-atfr-danger">{error}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string | null;
  label?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, hint, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium uppercase tracking-wider text-atfr-fog"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            fieldBase,
            'resize-y min-h-[120px]',
            error && 'border-atfr-danger focus:border-atfr-danger',
            className,
          )}
          aria-invalid={error ? 'true' : undefined}
          {...props}
        />
        {hint && !error && <p className="text-xs text-atfr-fog/70">{hint}</p>}
        {error && <p className="text-xs text-atfr-danger">{error}</p>}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';
