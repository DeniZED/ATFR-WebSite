import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface SectionProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
}

export function Section({
  id,
  eyebrow,
  title,
  description,
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
        {(eyebrow || title || description) && (
          <header className="max-w-3xl mx-auto text-center mb-14">
            {eyebrow && (
              <p className="text-xs uppercase tracking-[0.35em] text-atfr-gold/80 mb-3">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="text-4xl sm:text-5xl font-display font-semibold text-atfr-bone">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-4 text-atfr-fog text-base sm:text-lg leading-relaxed">
                {description}
              </p>
            )}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
