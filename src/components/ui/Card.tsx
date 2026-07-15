import type { HTMLAttributes, MouseEvent } from 'react';
import { cn } from '@/lib/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Active un halo doré qui suit le curseur au survol (position via les
   * variables CSS --mx/--my). Opt-in : sans effet sur les cartes admin.
   */
  spotlight?: boolean;
}

export function Card({
  className,
  spotlight,
  onMouseMove,
  children,
  ...props
}: CardProps) {
  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (spotlight) {
      const rect = e.currentTarget.getBoundingClientRect();
      e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
    }
    onMouseMove?.(e);
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-atfr-gold/10 bg-atfr-carbon/80 backdrop-blur-sm',
        'hover:border-atfr-gold/30 transition-colors duration-300',
        spotlight && 'group/spotlight relative overflow-hidden',
        className,
      )}
      onMouseMove={handleMouseMove}
      {...props}
    >
      {spotlight && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/spotlight:opacity-100"
          style={{
            background:
              'radial-gradient(220px circle at var(--mx, 50%) var(--my, 50%), rgba(232,176,67,0.12), transparent 70%)',
          }}
        />
      )}
      {children}
    </div>
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
