import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Active le halo doré qui suit le curseur au survol (effet `.spotlight-card`
   * partagé, piloté par useSpotlight). Opt-in : sans effet sur les cartes
   * admin, dont le layout ne monte pas l'écouteur.
   */
  spotlight?: boolean;
}

export function Card({ className, spotlight, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-atfr-gold/10 bg-atfr-carbon/80 backdrop-blur-sm',
        'hover:border-atfr-gold/30 transition-colors duration-300',
        spotlight && 'spotlight-card',
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-6 pt-6 pb-3', className)} {...props} />;
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-6 py-3', className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('px-6 py-4 border-t border-atfr-gold/10', className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('font-display text-xl text-atfr-bone', className)}
      {...props}
    />
  );
}
