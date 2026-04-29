import { useRef, type MouseEvent } from 'react';
import { Crosshair } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Point {
  x: number;
  y: number;
}

interface MinimapClickPlacerProps {
  imageUrl: string;
  /** Normalized 0..1 from top-left, or null if not yet placed. */
  x: number | null;
  y: number | null;
  onPlace: (x: number, y: number) => void;
  /** Existing shots on this map, displayed faintly to highlight covered areas. */
  ghostPoints?: Point[];
  className?: string;
}

/**
 * Click-to-place picker on a minimap image. Stores coordinates as
 * percentages of the displayed image rect, so any later resize keeps the
 * point on the same in-game spot. Existing shots are shown as small dim
 * dots to give the editor a sense of the already-covered zones.
 */
export function MinimapClickPlacer({
  imageUrl,
  x,
  y,
  onPlace,
  ghostPoints,
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
        {/* crosshair overlay */}
        <div
          className="absolute inset-0 bg-grid pointer-events-none opacity-20"
          style={{ backgroundSize: '20px 20px' }}
          aria-hidden
        />

        {/* Existing shots — faint dots to show covered zones. */}
        {ghostPoints?.map((p, i) => (
          <div
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
            title="Screenshot déjà placé ici"
          >
            <div className="h-2.5 w-2.5 rounded-full border border-atfr-ink/80 bg-atfr-gold/50 shadow" />
          </div>
        ))}

        {/* Active marker — symmetric icon centered on the click point. */}
        {x != null && y != null && (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
          >
            <div className="relative">
              <div className="absolute inset-0 -m-3 rounded-full bg-atfr-gold/30 blur-md" />
              <div className="relative h-7 w-7 rounded-full border-2 border-atfr-ink bg-atfr-gold flex items-center justify-center text-atfr-ink shadow-lg">
                <Crosshair size={14} strokeWidth={2.5} />
              </div>
            </div>
          </div>
        )}
      </div>
      <p className="flex items-center gap-2 text-xs text-atfr-fog">
        <Crosshair size={12} className="text-atfr-gold" />
        {x != null && y != null
          ? 'Point placé — clique ailleurs pour repositionner.'
          : 'Clique sur la minimap pour placer la position du screenshot.'}
        {ghostPoints && ghostPoints.length > 0 && (
          <span className="text-atfr-fog/70">
            · {ghostPoints.length} screenshot(s) déjà placé(s) sur cette map
          </span>
        )}
      </p>
    </div>
  );
}
