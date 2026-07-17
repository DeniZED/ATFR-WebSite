import type { HTMLAttributes, ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
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
  const reduce = useReducedMotion();

  // Révélation au scroll homogène : l'en-tête, puis le contenu, montent en
  // fondu à l'entrée dans le viewport. Neutralisé si l'utilisateur préfère
  // moins d'animations (accessibilité).
  const reveal = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: '-80px' as const },
          transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1], delay },
        };

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
            <motion.header className="max-w-3xl mx-auto text-center" {...reveal()}>
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
                  {/* Trait doré qui « se dessine » à l'apparition. */}
                  <motion.span
                    aria-hidden
                    className="mt-4 block h-px w-24 origin-center bg-gradient-to-r from-transparent via-atfr-gold/70 to-transparent"
                    initial={reduce ? false : { scaleX: 0, opacity: 0 }}
                    whileInView={reduce ? undefined : { scaleX: 1, opacity: 1 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
                  />
                </div>
              )}
              {description && (
                <p className="mt-4 text-atfr-fog text-base sm:text-lg leading-relaxed">
                  {description}
                </p>
              )}
            </motion.header>
          </div>
        )}
        <motion.div {...reveal(0.1)}>{children}</motion.div>
      </div>
    </section>
  );
}

