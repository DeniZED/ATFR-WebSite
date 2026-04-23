import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/cn';

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  loading?: boolean;
  className?: string;
  /**
   * Numeric value for the count-up animation. When provided, `value` is
   * ignored and the card displays a tween from 0 to this number.
   */
  animateTo?: number | null;
  /**
   * Number of decimals shown when `animateTo` is used.
   */
  decimals?: number;
  suffix?: string;
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  loading,
  className,
  animateTo,
  decimals = 0,
  suffix = '',
}: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group relative overflow-hidden rounded-xl border border-atfr-gold/10 bg-atfr-carbon/70 p-6',
        'hover:border-atfr-gold/40 transition-colors duration-300',
        className,
      )}
    >
      <div
        className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-atfr-gold/10 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden
      />
      {icon && (
        <div className="absolute top-4 right-4 text-atfr-gold/50 transition-colors group-hover:text-atfr-gold">
          {icon}
        </div>
      )}
      <p className="text-xs uppercase tracking-[0.2em] text-atfr-fog mb-3">
        {label}
      </p>
      <p
        className={cn(
          'text-3xl font-display font-semibold text-atfr-bone relative',
          loading && 'shimmer rounded h-9 w-24',
        )}
      >
        {loading ? (
          ''
        ) : animateTo != null ? (
          <CountUp to={animateTo} decimals={decimals} suffix={suffix} />
        ) : (
          value
        )}
      </p>
      {hint && <p className="mt-2 text-xs text-atfr-fog/80">{hint}</p>}
    </motion.div>
  );
}

function CountUp({
  to,
  decimals,
  suffix,
}: {
  to: number;
  decimals: number;
  suffix: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? to : 0);

  useEffect(() => {
    if (!inView || reduce) {
      setDisplay(to);
      return;
    }
    const start = performance.now();
    const duration = 1200;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(to * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, reduce]);

  return (
    <span ref={ref}>
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}
