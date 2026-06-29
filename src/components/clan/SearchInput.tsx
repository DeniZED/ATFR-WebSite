import { Search, X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Rechercher…', className }: SearchInputProps) {
  return (
    <div className={cn('relative', className)}>
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-atfr-fog/50 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-atfr-gold/15 bg-atfr-graphite/40 py-2 pl-9 pr-8 text-sm text-atfr-bone placeholder:text-atfr-fog/40 focus:outline-none focus:border-atfr-gold/40 transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-atfr-fog/50 hover:text-atfr-bone"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
