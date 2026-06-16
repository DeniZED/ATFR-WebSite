import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Props {
  by: string;
  at: string;
  className?: string;
}

export function ValidatedBy({ by, at, className }: Props) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs text-atfr-fog/60', className)}>
      <ShieldCheck size={12} strokeWidth={1.6} className="text-atfr-gold/50" />
      Validé par {by} · {at}
    </span>
  );
}
