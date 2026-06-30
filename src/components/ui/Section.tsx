import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface SectionProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  /** Heading level for `title`. Use "h1" when this is the page's main heading. Defaults to "h2". */
  as?: 'h1' | 'h2';
  description?: ReactNode;
  /** Optional element rendered top-right of the header (e.g. a profile widget). */
  headerAction?: ReactNode;
  children: ReactNode;
}

export function Section({
  id,
  eyebrow,
  title,
  as: Heading = 'h2',
  description,
  headerAction,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn('relative py-20 sm:py-28', className)}
      {...props}
    >
      <div className="container">
        {(eyebrow || title || description || headerAction) && (
          <div className="relative mb-10 sm:mb-14">
            {/* Top-right action slot */}
            {headerAction && (
              <div className="absolute top-0 right-0 z-10">
                {headerAction}
              </div>
            )}
            <header className="max-w-3xl mx-auto text-center">
              {eyebrow && (
                <p className="text-xs uppercase tracking-[0.35em] text-atfr-gold/80 mb-3">
                  {eyebrow}
                </p>
              )}
              {title && (
                <Heading className="text-4xl sm:text-5xl font-display font-semibold text-atfr-bone">
                  {title}
                </Heading>
              )}
              {description && (
                <p className="mt-4 text-atfr-fog text-base sm:text-lg leading-relaxed">
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

