import { cn } from '@/lib/cn';
import type { ClanPriority } from '@/features/clan/types';

const CONFIG: Record<ClanPriority, { label: string; className: string }> = {
  prioritaire:     { label: 'Prioritaire',      className: 'bg-atfr-gold/15 text-atfr-gold border-atfr-gold/30' },
  utile:           { label: 'Utile',             className: 'bg-blue-500/10 text-blue-300 border-blue-500/20' },
  situationnel:    { label: 'Situationnel',      className: 'bg-atfr-fog/10 text-atfr-fog border-atfr-fog/20' },
  non_recommande:  { label: 'Non recommandé',    className: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

export function PriorityBadge({ priority, className }: { priority: ClanPriority; className?: string }) {
  const cfg = CONFIG[priority];
  return (
    <span className={cn('inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium', cfg.className, className)}>
      {cfg.label}
    </span>
  );
}
