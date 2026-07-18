import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { useReveal, useRevealStagger } from '@/hooks/useReveal';

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
  // Révélation au scroll « vivante » : l'en-tête monte en fondu, puis les
  // cartes/blocs du contenu entrent en cascade, avec des directions
  // alternées (gauche / haut / droite). Neutralisé sous prefers-reduced-motion.
  const headerRef = useReveal<HTMLElement>('up');
  const contentRef = useRevealStagger<HTMLDivElement>();

  return (
    <section
      id={id}
      className={cn('relative py-14 sm:py-20', className)}
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
            <header
              ref={headerRef}
              className="reveal-on-scroll max-w-3xl mx-auto text-center"
            >
              {eyebrow && (
                <p className="text-xs uppercase tracking-[0.35em] text-atfr-gold/80 mb-3">
                  {eyebrow}
                </p>
              )}
              {title && (
                <div className="inline-flex flex-col items-center">
                  <Heading className="text-4xl sm:text-5xl font-display font-semibold text-atfr-bone">
                    {title}
                  </Heading>
                  {/* Trait doré sous le titre. */}
                  <span
                    aria-hidden
                    className="mt-4 block h-px w-24 bg-gradient-to-r from-transparent via-atfr-gold/70 to-transparent"
                  />
                </div>
              )}
              {description && (
                <p className="mt-4 text-atfr-fog text-base sm:text-lg leading-relaxed">
                  {description}
                </p>
              )}
            </header>
          </div>
        )}
        {/* Le conteneur n'est pas masqué : useRevealStagger met en cascade
            ses cartes/blocs internes. */}
        <div ref={contentRef}>{children}</div>
      </div>
    </section>
  );
}
