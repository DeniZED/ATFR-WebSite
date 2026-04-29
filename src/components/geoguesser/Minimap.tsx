import { useRef, type MouseEvent } from 'react';
import { motion } from 'framer-motion';
import { Crosshair, MapPin, Target } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Point {
  x: number;
  y: number;
}

interface MinimapProps {
  imageUrl: string;
  /** Player's chosen point (gold). */
  player?: Point | null;
  /** Correct answer (green). Only set in reveal mode. */
  correct?: Point | null;
  /** When set, clicks fire this with normalized 0..1 coords. */
  onPlace?: (x: number, y: number) => void;
  /** Visual size hint for sm/md/lg. */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASS: Record<NonNullable<MinimapProps['size']>, string> = {
  sm: 'aspect-square w-full max-w-xs',
  md: 'aspect-square w-full max-w-md',
  lg: 'aspect-square w-full max-w-2xl',
};

export function Minimap({
  imageUrl,
  player,
  correct,
  onPlace,
  size = 'md',
  className,
}: MinimapProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  function handleClick(e: MouseEvent<HTMLDivElement>) {
    if (!onPlace) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    onPlace(Math.max(0, Math.min(1, x)), Math.max(0, Math.min(1, y)));
  }

  return (
    <div className={cn(SIZE_CLASS[size], 'mx-auto', className)}>
      <div
        ref={ref}
        onClick={handleClick}
        className={cn(
          'relative h-full w-full overflow-hidden rounded-lg border border-atfr-gold/20 bg-atfr-ink select-none',
          onPlace && 'cursor-crosshair',
        )}
      >
        <img
          src={imageUrl}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover pointer-events-none"
        />
        <div
          className="absolute inset-0 bg-grid pointer-events-none opacity-15"
          style={{ backgroundSize: '20px 20px' }}
          aria-hidden
        />

        {/* Line between the two points (reveal). */}
        {player && correct && (
          <svg
            className="absolute inset-0 h-full w-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <motion.line
              x1={player.x * 100}
              y1={player.y * 100}
              x2={correct.x * 100}
              y2={correct.y * 100}
              stroke="rgba(232,176,67,0.7)"
              strokeWidth={0.4}
              strokeDasharray="1.5 1.2"
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
            />
          </svg>
        )}

        {/* Player marker */}
        {player && (
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ left: `${player.x * 100}%`, top: `${player.y * 100}%` }}
          >
            <div className="relative">
              <div className="absolute inset-0 -m-3 rounded-full bg-atfr-gold/30 blur-md" />
              <div className="relative h-7 w-7 rounded-full border-2 border-atfr-ink bg-atfr-gold flex items-center justify-center text-atfr-ink shadow-lg">
                <MapPin size={14} strokeWidth={2.5} />
              </div>
            </div>
          </motion.div>
        )}

        {/* Correct marker (reveal only) */}
        {correct && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.15, ease: [0.2, 0.8, 0.2, 1] }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ left: `${correct.x * 100}%`, top: `${correct.y * 100}%` }}
          >
            <div className="relative">
              <div className="absolute inset-0 -m-3 rounded-full bg-emerald-400/40 blur-md" />
              <div className="relative h-7 w-7 rounded-full border-2 border-atfr-ink bg-emerald-400 flex items-center justify-center text-atfr-ink shadow-lg">
                <Target size={14} strokeWidth={2.5} />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {onPlace && (
        <p className="mt-2 flex items-center gap-2 text-xs text-atfr-fog">
          <Crosshair size={12} className="text-atfr-gold" />
          {player
            ? `Position : (${(player.x * 100).toFixed(1)}% , ${(player.y * 100).toFixed(1)}%) — clique ailleurs pour repositionner.`
            : 'Clique sur la minimap pour placer ton estimation.'}
        </p>
      )}
    </div>
  );
}
