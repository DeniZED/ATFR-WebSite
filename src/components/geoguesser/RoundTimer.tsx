import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/cn';

interface RoundTimerProps {
  /** Seconds remaining (0..total). */
  secondsLeft: number;
  total: number;
  className?: string;
}

export function RoundTimer({ secondsLeft, total, className }: RoundTimerProps) {
  const pct = Math.max(0, Math.min(1, secondsLeft / Math.max(1, total)));
  const danger = secondsLeft <= 5;
  const warn = secondsLeft <= 10 && !danger;

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-md border bg-atfr-ink/85 backdrop-blur px-2.5 py-1.5 shadow-xl',
        danger
          ? 'border-atfr-danger/60'
          : warn
            ? 'border-atfr-warning/60'
            : 'border-atfr-gold/40',
        className,
      )}
    >
      <Clock
        size={14}
        className={cn(
          danger
            ? 'text-atfr-danger'
            : warn
              ? 'text-atfr-warning'
              : 'text-atfr-gold',
        )}
      />
      <div className="text-right">
        <p
          className={cn(
            'font-display text-base leading-none tabular-nums',
            danger
              ? 'text-atfr-danger'
              : warn
                ? 'text-atfr-warning'
                : 'text-atfr-bone',
          )}
        >
          {secondsLeft}s
        </p>
      </div>
      <div className="h-1 w-12 rounded-full bg-atfr-graphite overflow-hidden">
        <motion.div
          className={cn(
            'h-full',
            danger
              ? 'bg-atfr-danger'
              : warn
                ? 'bg-atfr-warning'
                : 'bg-atfr-gold',
          )}
          initial={false}
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 0.3, ease: 'linear' }}
        />
      </div>
    </div>
  );
}
