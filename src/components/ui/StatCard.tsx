import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  loading?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  loading,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-atfr-gold/10 bg-atfr-carbon/70 p-6',
        'hover:border-atfr-gold/40 transition-colors duration-300',
        className,
      )}
    >
      {icon && (
        <div className="absolute top-4 right-4 text-atfr-gold/50">{icon}</div>
      )}
      <p className="text-xs uppercase tracking-[0.2em] text-atfr-fog mb-3">
        {label}
      </p>
      <p
        className={cn(
          'text-3xl font-display font-semibold text-atfr-bone',
          loading && 'shimmer rounded h-9 w-24',
        )}
      >
        {loading ? '' : value}
      </p>
      {hint && <p className="mt-2 text-xs text-atfr-fog/80">{hint}</p>}
    </div>
  );
}
