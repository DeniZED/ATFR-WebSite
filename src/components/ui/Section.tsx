import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface SectionProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  description?: ReactNode;
  headerAction?: ReactNode;
  /** 'default' = transparent, 'tinted' = subtle carbon overlay with gold borders */
  variant?: 'default' | 'tinted';
  children: ReactNode;
}

export function Section({
  id,
  eyebrow,
  title,
  description,
  headerAction,
  variant = 'default',
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        'relative py-20 sm:py-28',
        variant === 'tinted' && 'bg-atfr-carbon/25',
        className,
      )}
      {...props}
    >
      {variant === 'tinted' && (
        <>
          <div
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-atfr-gold/15 to-transparent"
            aria-hidden
          />
          <div
            className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-atfr-gold/10 to-transparent"
            aria-hidden
          />
        </>
      )}
      <div className="container">
        {(eyebrow || title || description || headerAction) && (
          <div className="relative mb-12 sm:mb-16">
            {headerAction && (
              <div className="absolute top-0 right-0 z-10">{headerAction}</div>
            )}
            <header className="max-w-3xl mx-auto text-center">
              {eyebrow && (
                <div className="inline-flex items-center gap-3 mb-5">
                  <div className="h-px w-10 bg-gradient-to-r from-transparent to-atfr-gold/50" />
                  <p className="text-[10px] uppercase tracking-[0.4em] text-atfr-gold/80">
                    {eyebrow}
                  </p>
                  <div className="h-px w-10 bg-gradient-to-l from-transparent to-atfr-gold/50" />
                </div>
              )}
              {title && (
                <h2 className="text-4xl sm:text-5xl font-display font-semibold text-atfr-bone leading-tight">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-5 text-atfr-fog text-base sm:text-lg leading-relaxed">
                  {description}
                </p>
              )}
            </header>
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
