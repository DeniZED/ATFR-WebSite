import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Crosshair, Map as MapIcon, Minus, Plus, Search, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { Database } from '@/types/database';

type MapRow = Database['public']['Tables']['wot_maps']['Row'];

interface Pt {
  x: number;
  y: number;
}

interface FloatingMapPickerProps {
  maps: MapRow[];
  selectedMap: MapRow | null;
  onSelect: (id: string) => void;
  /** Pop the placement back to "pick a map" state. */
  onClearMap: () => void;
  /** Player's pin (placement or reveal). */
  player?: Pt | null;
  /** Correct shot point (reveal only). */
  correct?: Pt | null;
  /** Click-to-place handler (placement only). */
  onPlace?: (x: number, y: number) => void;
  /** Real distance label to show on the placement bar (reveal). */
  distanceLabel?: string | null;
  /** Disable interactions (e.g. before the round starts). */
  disabled?: boolean;
}

/**
 * GeoGuessr-style floating overlay that handles 3 states in-place,
 * pinned to the bottom-right of its relative parent:
 *  1. PICK    — small thumb, hover/tap expands a searchable grid of maps.
 *  2. PLACE   — selected map's minimap, click to drop the pin. "← Map"
 *               button to revert. Scroll to zoom, drag to pan.
 *  3. REVEAL  — same minimap with player+correct pins and dashed line.
 *
 * Search query auto-resets when the panel closes or a map is picked,
 * so the previous query never sticks across rounds.
 */
export function FloatingMapPicker({
  maps,
  selectedMap,
  onSelect,
  onClearMap,
  player,
  correct,
  onPlace,
  distanceLabel,
  disabled,
}: FloatingMapPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const placeRef = useRef<HTMLDivElement | null>(null);

  // Zoom / pan state — held in refs for event handlers, mirrored to state for re-render.
  const viewRef = useRef({ zoom: 1, offsetX: 0, offsetY: 0 });
  const [, setViewTick] = useState(0);
  const forceViewUpdate = () => setViewTick((n) => n + 1);

  // Drag tracking (not state — no re-render needed during drag).
  const dragRef = useRef<{
    active: boolean;
    startMouseX: number;
    startMouseY: number;
    startOffsetX: number;
    startOffsetY: number;
    hasMoved: boolean;
  }>({ active: false, startMouseX: 0, startMouseY: 0, startOffsetX: 0, startOffsetY: 0, hasMoved: false });

  // Pinch tracking (P1-8, tactile) — même principe que dragRef.
  const pinchRef = useRef<{ active: boolean; startDist: number; startZoom: number }>({
    active: false,
    startDist: 0,
    startZoom: 1,
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return maps;
    return maps.filter((m) => m.name.toLowerCase().includes(q));
  }, [maps, query]);

  // Close + reset search when clicking outside or pressing Esc.
  useEffect(() => {
    if (!open) return;
    function onDoc(e: globalThis.MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  // Reset search when the panel closes or a map is selected.
  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);
  useEffect(() => {
    if (selectedMap) setQuery('');
  }, [selectedMap]);

  // Reset zoom/pan when the selected map changes.
  useEffect(() => {
    viewRef.current = { zoom: 1, offsetX: 0, offsetY: 0 };
    forceViewUpdate();
  }, [selectedMap?.id]);

  // Wheel-to-zoom (must be non-passive to call preventDefault).
  useEffect(() => {
    const el = placeRef.current;
    if (!el) return;

    function handleWheel(e: WheelEvent) {
      e.preventDefault();
      const rect = el!.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const factor = e.deltaY < 0 ? 1.25 : 1 / 1.25;
      const { zoom, offsetX, offsetY } = viewRef.current;
      const newZoom = Math.max(1, Math.min(6, zoom * factor));

      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;

      // Keep the point under the cursor fixed after rescaling.
      const contentX = (cursorX - offsetX) / zoom;
      const contentY = (cursorY - offsetY) / zoom;
      const rawOffsetX = cursorX - contentX * newZoom;
      const rawOffsetY = cursorY - contentY * newZoom;

      viewRef.current = {
        zoom: newZoom,
        ...clampOffset(rawOffsetX, rawOffsetY, newZoom, rect.width, rect.height),
      };
      forceViewUpdate();
    }

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [selectedMap?.id]);

  // ---- Drag to pan ----
  function handleMouseDown(e: MouseEvent<HTMLDivElement>) {
    // Only primary button.
    if (e.button !== 0) return;
    dragRef.current = {
      active: true,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startOffsetX: viewRef.current.offsetX,
      startOffsetY: viewRef.current.offsetY,
      hasMoved: false,
    };
  }

  useEffect(() => {
    function handleMouseMove(e: globalThis.MouseEvent) {
      const dr = dragRef.current;
      if (!dr.active) return;
      const dx = e.clientX - dr.startMouseX;
      const dy = e.clientY - dr.startMouseY;
      if (!dr.hasMoved && Math.abs(dx) < 3 && Math.abs(dy) < 3) return;
      dr.hasMoved = true;

      const el = placeRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const { zoom } = viewRef.current;
      const rawOffsetX = dr.startOffsetX + dx;
      const rawOffsetY = dr.startOffsetY + dy;
      viewRef.current = {
        zoom,
        ...clampOffset(rawOffsetX, rawOffsetY, zoom, rect.width, rect.height),
      };
      forceViewUpdate();
    }

    function handleMouseUp() {
      dragRef.current.active = false;
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // ---- Tactile : pan à 1 doigt, pinch-zoom à 2 doigts (P1-8) ----
  // Le tap (sans mouvement) place le pin via le click synthétisé par le
  // navigateur : handlePlaceClick s'applique tel quel, et son garde
  // `hasMoved` absorbe le click fantôme émis après un pan/pinch.
  useEffect(() => {
    const el = placeRef.current;
    if (!el) return;

    function startPanFromTouch(t: globalThis.Touch) {
      dragRef.current = {
        active: true,
        startMouseX: t.clientX,
        startMouseY: t.clientY,
        startOffsetX: viewRef.current.offsetX,
        startOffsetY: viewRef.current.offsetY,
        hasMoved: dragRef.current.hasMoved,
      };
    }

    function handleTouchStart(e: TouchEvent) {
      // Laisse les boutons de zoom gérer leurs propres taps.
      if ((e.target as HTMLElement).closest('button')) return;
      if (e.touches.length === 1) {
        dragRef.current.hasMoved = false;
        pinchRef.current.active = false;
        startPanFromTouch(e.touches[0]);
      } else if (e.touches.length === 2) {
        e.preventDefault();
        const [a, b] = [e.touches[0], e.touches[1]];
        pinchRef.current = {
          active: true,
          startDist: Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY),
          startZoom: viewRef.current.zoom,
        };
        dragRef.current.active = false;
        // Un pinch ne doit jamais déboucher sur un placement de pin.
        dragRef.current.hasMoved = true;
      }
    }

    function handleTouchMove(e: TouchEvent) {
      const rect = el!.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      if (pinchRef.current.active && e.touches.length === 2) {
        e.preventDefault();
        const [a, b] = [e.touches[0], e.touches[1]];
        const dist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
        if (pinchRef.current.startDist === 0) return;
        const newZoom = Math.max(
          1,
          Math.min(6, pinchRef.current.startZoom * (dist / pinchRef.current.startDist)),
        );
        // Zoom ancré sur le point médian des deux doigts.
        const midX = (a.clientX + b.clientX) / 2 - rect.left;
        const midY = (a.clientY + b.clientY) / 2 - rect.top;
        const { zoom, offsetX, offsetY } = viewRef.current;
        const contentX = (midX - offsetX) / zoom;
        const contentY = (midY - offsetY) / zoom;
        const rawOffsetX = midX - contentX * newZoom;
        const rawOffsetY = midY - contentY * newZoom;
        viewRef.current = {
          zoom: newZoom,
          ...clampOffset(rawOffsetX, rawOffsetY, newZoom, rect.width, rect.height),
        };
        forceViewUpdate();
        return;
      }

      const dr = dragRef.current;
      if (!dr.active || e.touches.length !== 1) return;
      const t = e.touches[0];
      const dx = t.clientX - dr.startMouseX;
      const dy = t.clientY - dr.startMouseY;
      if (!dr.hasMoved && Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
      e.preventDefault();
      dr.hasMoved = true;
      const { zoom } = viewRef.current;
      viewRef.current = {
        zoom,
        ...clampOffset(dr.startOffsetX + dx, dr.startOffsetY + dy, zoom, rect.width, rect.height),
      };
      forceViewUpdate();
    }

    function handleTouchEnd(e: TouchEvent) {
      if (e.touches.length === 0) {
        dragRef.current.active = false;
        pinchRef.current.active = false;
      } else if (e.touches.length === 1 && pinchRef.current.active) {
        // 2 doigts → 1 : on repart en pan depuis le doigt restant,
        // sans réautoriser le placement (hasMoved reste à true).
        pinchRef.current.active = false;
        startPanFromTouch(e.touches[0]);
      }
    }

    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);
    el.addEventListener('touchcancel', handleTouchEnd);
    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [selectedMap?.id]);

  function handlePlaceClick(e: MouseEvent<HTMLDivElement>) {
    // Don't place a pin if the user was dragging.
    if (dragRef.current.hasMoved) {
      dragRef.current.hasMoved = false;
      return;
    }
    if (!onPlace || !selectedMap) return;
    const el = placeRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const { zoom, offsetX, offsetY } = viewRef.current;
    // Convert screen click → content coordinates → [0..1].
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;
    const contentX = (rawX - offsetX) / zoom;
    const contentY = (rawY - offsetY) / zoom;
    const x = Math.max(0, Math.min(1, contentX / rect.width));
    const y = Math.max(0, Math.min(1, contentY / rect.height));
    onPlace(x, y);
  }

  function adjustZoom(delta: number) {
    const el = placeRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const { zoom, offsetX, offsetY } = viewRef.current;
    const newZoom = Math.max(1, Math.min(6, zoom * delta));
    // Zoom centered on the container centre.
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const contentX = (cx - offsetX) / zoom;
    const contentY = (cy - offsetY) / zoom;
    const rawOffsetX = cx - contentX * newZoom;
    const rawOffsetY = cy - contentY * newZoom;
    viewRef.current = {
      zoom: newZoom,
      ...clampOffset(rawOffsetX, rawOffsetY, newZoom, rect.width, rect.height),
    };
    forceViewUpdate();
  }

  // ---------- PLACE / REVEAL ----------
  if (selectedMap) {
    const showCorrect = !!correct;
    const showLine = player && correct;
    const { zoom, offsetX, offsetY } = viewRef.current;
    const isZoomed = zoom > 1.01;

    return (
      <div
        ref={wrapRef}
        className={cn(
          'absolute z-20 inset-x-2 bottom-2 sm:inset-x-auto sm:right-4 sm:bottom-4',
          'sm:w-[min(56vw,620px,calc(72vh_-_7rem))] lg:w-[min(44vw,680px,calc(72vh_-_7rem))]',
          disabled && 'pointer-events-none opacity-80',
        )}
      >
        <div className="rounded-xl border border-atfr-gold/50 bg-atfr-ink/97 backdrop-blur shadow-2xl shadow-black/50 overflow-hidden">
          {/* Header bar */}
          <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-atfr-gold/15 bg-atfr-graphite/30">
            {!showCorrect ? (
              <button
                type="button"
                onClick={onClearMap}
                className="inline-flex items-center gap-1.5 text-xs text-atfr-fog hover:text-atfr-bone transition-colors rounded px-1.5 py-1 hover:bg-atfr-graphite/60"
                title="Choisir une autre map"
              >
                <ArrowLeft size={12} /> Changer
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-atfr-gold">
                <Crosshair size={12} /> Révélation
              </span>
            )}
            <p className="text-sm font-semibold text-atfr-bone truncate max-w-[55%]">
              {selectedMap.name}
            </p>
            {distanceLabel ? (
              <span className="shrink-0 text-sm font-bold rounded-lg bg-atfr-gold/20 text-atfr-gold border border-atfr-gold/40 px-2.5 py-0.5 tabular-nums">
                {distanceLabel}
              </span>
            ) : (
              <span className="text-[10px] text-atfr-fog shrink-0">
                {onPlace ? (player ? 'Replace si besoin' : 'Clique pour pointer') : ''}
              </span>
            )}
          </div>

          {/* Map canvas */}
          <div
            ref={placeRef}
            onClick={handlePlaceClick}
            onMouseDown={handleMouseDown}
            className={cn(
              'relative aspect-square w-full bg-atfr-ink select-none overflow-hidden touch-none',
              isZoomed ? 'cursor-grab active:cursor-grabbing' : onPlace ? 'cursor-crosshair' : 'cursor-default',
            )}
          >
            {/* Zoomable / pannable content layer */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                transform: `translate(${offsetX}px, ${offsetY}px) scale(${zoom})`,
                transformOrigin: '0 0',
                willChange: 'transform',
              }}
            >
              <img
                src={selectedMap.image_url}
                alt=""
                draggable={false}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div
                className="absolute inset-0 bg-grid opacity-10"
                style={{ backgroundSize: '20px 20px' }}
                aria-hidden
              />

              {showLine && (
                <svg
                  className="absolute inset-0 h-full w-full"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <motion.line
                    x1={player.x * 100}
                    y1={player.y * 100}
                    x2={correct!.x * 100}
                    y2={correct!.y * 100}
                    stroke="rgba(232,176,67,0.9)"
                    strokeWidth={0.6}
                    strokeDasharray="1.8 1.2"
                    vectorEffect="non-scaling-stroke"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                  />
                </svg>
              )}

              {player && (
                <PinAt x={player.x} y={player.y} tone="gold" zoom={zoom} label={showCorrect ? 'Moi' : undefined} />
              )}
              {correct && (
                <PinAt x={correct.x} y={correct.y} tone="emerald" zoom={zoom} label="Réponse" />
              )}
            </div>

            {/* Zoom controls */}
            <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); adjustZoom(1.25); }}
                onMouseDown={(e) => e.stopPropagation()}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-atfr-gold/30 bg-atfr-ink/90 text-atfr-fog hover:text-atfr-bone hover:border-atfr-gold/60 backdrop-blur transition-colors"
                title="Zoom +"
                aria-label="Zoom avant"
              >
                <Plus size={13} />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); adjustZoom(1 / 1.25); }}
                onMouseDown={(e) => e.stopPropagation()}
                disabled={!isZoomed}
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-lg border bg-atfr-ink/90 backdrop-blur transition-colors',
                  isZoomed
                    ? 'border-atfr-gold/30 text-atfr-fog hover:text-atfr-bone hover:border-atfr-gold/60'
                    : 'border-atfr-gold/10 text-atfr-fog/25 cursor-default',
                )}
                title="Zoom −"
                aria-label="Zoom arrière"
              >
                <Minus size={13} />
              </button>
            </div>

            {/* Zoom level */}
            {isZoomed && (
              <div className="absolute bottom-2 left-2 z-10 rounded-lg border border-atfr-gold/20 bg-atfr-ink/85 px-2 py-0.5 text-[9px] text-atfr-gold/80 backdrop-blur tabular-nums font-semibold">
                ×{zoom.toFixed(1)}
              </div>
            )}

            {/* Hint: no pin yet */}
            {onPlace && !player && !showCorrect && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="rounded-xl border border-atfr-gold/30 bg-atfr-ink/80 px-4 py-2.5 text-center backdrop-blur">
                  <Crosshair size={20} className="text-atfr-gold mx-auto mb-1" />
                  <p className="text-xs font-medium text-atfr-bone">Clique pour placer ton pin</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---------- PICK (no map selected yet) ----------
  return (
    <div
      ref={wrapRef}
      className={cn(
        'absolute z-20 inset-x-2 bottom-2 sm:inset-x-auto sm:right-4 sm:bottom-4 flex flex-col items-stretch sm:items-end gap-2',
        disabled && 'pointer-events-none opacity-70',
      )}
      onMouseEnter={() => !disabled && setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Map grid panel */}
      {open && (
        <div
          className="w-full sm:w-[min(56vw,620px)] lg:w-[min(44vw,680px)] max-h-[min(72vh,560px)] overflow-hidden rounded-xl border border-atfr-gold/35 bg-atfr-ink/97 backdrop-blur shadow-2xl shadow-black/50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 border-b border-atfr-gold/15 bg-atfr-graphite/30 px-3 py-2.5">
            <Search size={14} className="text-atfr-gold shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une map…"
              className="flex-1 bg-transparent text-sm text-atfr-bone placeholder-atfr-fog/60 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-atfr-fog/60 hover:text-atfr-bone transition-colors"
                aria-label="Effacer"
              >
                <X size={13} />
              </button>
            )}
            <span className="text-[10px] text-atfr-fog/50 tabular-nums ml-1">
              {filtered.length}
            </span>
          </div>
          <div className="overflow-y-auto p-2.5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 max-h-[min(58vh,460px)]">
            {filtered.length === 0 ? (
              <p className="col-span-full py-8 text-center text-sm text-atfr-fog">
                Aucune map trouvée.
              </p>
            ) : (
              filtered.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    onSelect(m.id);
                    setOpen(false);
                    setQuery('');
                  }}
                  className="group relative aspect-square overflow-hidden rounded-xl border-2 border-atfr-gold/15 hover:border-atfr-gold/70 hover:scale-[1.03] transition-all duration-150 bg-atfr-graphite shadow-sm"
                >
                  {m.image_url ? (
                    <img
                      src={m.image_url}
                      alt={m.name}
                      loading="lazy"
                      draggable={false}
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-atfr-graphite flex items-center justify-center">
                      <MapIcon size={18} className="text-atfr-fog/30" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-atfr-ink/95 via-atfr-ink/50 to-transparent px-1.5 pb-1.5 pt-3">
                    <p className="text-[10px] font-medium text-atfr-bone truncate leading-tight">
                      {m.name}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Collapsed button */}
      <button
        type="button"
        onClick={() => !disabled && setOpen((p) => !p)}
        className={cn(
          'flex items-center gap-3 rounded-xl border-2 bg-atfr-ink/90 backdrop-blur shadow-2xl shadow-black/40 px-3 py-2 transition-all duration-200',
          open
            ? 'border-atfr-gold/60 bg-atfr-ink/98'
            : 'border-atfr-gold/45 hover:border-atfr-gold hover:bg-atfr-ink/98',
        )}
      >
        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-lg overflow-hidden bg-atfr-graphite shrink-0 flex items-center justify-center border border-atfr-gold/20">
          <MapIcon size={22} className="text-atfr-gold opacity-80" />
        </div>
        <div className="text-left pr-1">
          <p className="text-[9px] uppercase tracking-[0.2em] text-atfr-gold font-semibold mb-0.5">
            Choisir la map
          </p>
          <p className="text-xs text-atfr-bone">
            {open ? 'Fermer le sélecteur' : 'Survole ou clique'}
          </p>
          <p className="text-[9px] text-atfr-fog/60 mt-0.5">
            {maps.length} maps disponibles
          </p>
        </div>
      </button>
    </div>
  );
}

// Clamp pan offset so the content never exposes empty space.
function clampOffset(
  ox: number,
  oy: number,
  zoom: number,
  w: number,
  h: number,
): { offsetX: number; offsetY: number } {
  const minX = Math.min(0, w * (1 - zoom));
  const minY = Math.min(0, h * (1 - zoom));
  return {
    offsetX: Math.max(minX, Math.min(0, ox)),
    offsetY: Math.max(minY, Math.min(0, oy)),
  };
}

function PinAt({
  x,
  y,
  tone,
  zoom,
  label,
}: {
  x: number;
  y: number;
  tone: 'gold' | 'emerald';
  zoom: number;
  label?: string;
}) {
  const ring = tone === 'gold' ? 'border-atfr-gold' : 'border-emerald-400';
  const halo = tone === 'gold' ? 'bg-atfr-gold/30' : 'bg-emerald-400/40';
  const dot = tone === 'gold' ? 'bg-atfr-gold' : 'bg-emerald-400';
  const labelBg = tone === 'gold' ? 'bg-atfr-gold text-atfr-ink' : 'bg-emerald-400 text-white';
  // Scale the pin down as zoom increases so it doesn't look huge.
  const pinScale = 1 / Math.sqrt(zoom);
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        transform: `translate(-50%, -50%) scale(${pinScale})`,
      }}
    >
      <div className="relative flex flex-col items-center gap-0.5">
        {label && (
          <span className={cn(
            'rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-wide whitespace-nowrap shadow-sm',
            labelBg,
          )}>
            {label}
          </span>
        )}
        <div className="relative h-5 w-5">
          <div className={cn('absolute inset-0 -m-1.5 rounded-full blur-md opacity-80', halo)} />
          <div className={cn('absolute inset-0 rounded-full border-2 bg-atfr-ink/40 shadow-lg', ring)} />
          <div className={cn('absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full', dot)} />
        </div>
      </div>
    </div>
  );
}
