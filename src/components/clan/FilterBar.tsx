import { cn } from '@/lib/cn';

interface FilterOption {
  id: string;
  label: string;
}

interface FilterBarProps {
  options: readonly FilterOption[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export function FilterBar({ options, active, onChange, className }: FilterBarProps) {
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={cn(
            'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
            opt.id === active
              ? 'border-atfr-gold/40 bg-atfr-gold/10 text-atfr-gold'
              : 'border-atfr-gold/10 bg-atfr-graphite/40 text-atfr-fog hover:text-atfr-bone',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
