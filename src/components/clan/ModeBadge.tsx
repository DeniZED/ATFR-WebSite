import { cn } from '@/lib/cn';
import type { GameMode } from '@/features/clan/types';

const CONFIG: Record<GameMode, { label: string; className: string }> = {
  cw:        { label: 'CW',        className: 'bg-red-500/10 text-red-400 border-red-500/20' },
  bastion:   { label: 'Bastion',   className: 'bg-purple-500/10 text-purple-300 border-purple-500/20' },
  offensive: { label: 'Offensive', className: 'bg-orange-500/10 text-orange-300 border-orange-500/20' },
  peloton:   { label: 'Peloton',   className: 'bg-blue-500/10 text-blue-300 border-blue-500/20' },
  random:    { label: 'Random',    className: 'bg-atfr-fog/10 text-atfr-fog border-atfr-fog/20' },
};

export function ModeBadge({ mode, className }: { mode: GameMode; className?: string }) {
  const cfg = CONFIG[mode];
  return (
    <span className={cn('inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium', cfg.className, className)}>
      {cfg.label}
    </span>
  );
}
