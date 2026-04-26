import { useRef, type MouseEvent } from 'react';
import { Crosshair, MapPin } from 'lucide-react';
import { cn } from '@/lib/cn';

interface MinimapClickPlacerProps {
  imageUrl: string;
  /** Normalized 0..1 from top-left, or null if not yet placed. */
  x: number | null;
  y: number | null;
  onPlace: (x: number, y: number) => void;
  className?: string;
}

/**
 * Click-to-place picker on a minimap image. Stores coordinates as
 * percentages of the displayed image rect, so any later resize keeps the
 * point on the same in-game spot.
 */
export function MinimapClickPlacer({
  imageUrl,
  x,
  y,
  onPlace,
  className,
}: MinimapClickPlacerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  function handleClick(e: MouseEvent<HTMLDivElement>) {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const clampedX = Math.max(0, Math.min(1, px));
    const clampedY = Math.max(0, Math.min(1, py));
    onPlace(clampedX, clampedY);
  }

  if (!imageUrl) {
    return (
      <div
        className={cn(
          'aspect-square rounded-lg border border-dashed border-atfr-gold/30 bg-atfr-graphite/40',
          'flex items-center justify-center text-atfr-fog text-sm p-6 text-center',
          className,
        )}
      >
        Sélectionne d'abord une map pour placer le point.
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div
        ref={containerRef}
        onClick={handleClick}
        className="relative aspect-square w-full overflow-hidden rounded-lg border border-atfr-gold/20 bg-atfr-ink cursor-crosshair select-none"
      >
        <img
          src={imageUrl}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover pointer-events-none"
        />
        {x != null && y != null && (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
          >
            <div className="relative">
              <div className="absolute inset-0 -m-3 rounded-full bg-atfr-gold/30 blur-md" />
              <div className="relative h-7 w-7 rounded-full border-2 border-atfr-ink bg-atfr-gold flex items-center justify-center text-atfr-ink shadow-lg">
                <MapPin size={14} strokeWidth={2.5} />
              </div>
            </div>
          </div>
        )}
        {/* crosshair overlay */}
        <div
          className="absolute inset-0 bg-grid pointer-events-none opacity-20"
          style={{ backgroundSize: '20px 20px' }}
          aria-hidden
        />
      </div>
      <p className="flex items-center gap-2 text-xs text-atfr-fog">
        <Crosshair size={12} className="text-atfr-gold" />
        {x != null && y != null
          ? `Position : (${(x * 100).toFixed(1)}% , ${(y * 100).toFixed(1)}%) — clique ailleurs pour repositionner.`
          : 'Clique sur la minimap pour placer la position du screenshot.'}
      </p>
    </div>
  );
}
