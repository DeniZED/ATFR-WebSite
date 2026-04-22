import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

interface SpinnerProps {
  size?: number;
  className?: string;
  label?: string;
}

export function Spinner({ size = 20, className, label }: SpinnerProps) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-atfr-fog', className)}>
      <Loader2 size={size} className="animate-spin text-atfr-gold" />
      {label && <span className="text-sm">{label}</span>}
    </span>
  );
}
