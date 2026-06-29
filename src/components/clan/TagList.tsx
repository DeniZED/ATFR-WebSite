import { cn } from '@/lib/cn';

interface TagListProps {
  tags: string[];
  active?: string;
  onToggle?: (tag: string) => void;
  className?: string;
}

export function TagList({ tags, active, onToggle, className }: TagListProps) {
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {tags.map((tag) => {
        const isActive = active === tag;
        return (
          <button
            key={tag}
            type="button"
            onClick={() => onToggle?.(tag)}
            className={cn(
              'rounded px-2 py-0.5 text-xs transition-colors',
              onToggle ? 'cursor-pointer' : 'cursor-default',
              isActive
                ? 'bg-atfr-gold/20 text-atfr-gold'
                : 'bg-atfr-graphite/60 text-atfr-fog hover:text-atfr-bone',
            )}
          >
            #{tag}
          </button>
        );
      })}
    </div>
  );
}
