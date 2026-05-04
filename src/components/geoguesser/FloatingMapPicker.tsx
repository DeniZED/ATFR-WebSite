import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Crosshair, Map as MapIcon, Search, X } from 'lucide-react';
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
 *               button to revert.
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

  // Reset the search when the panel closes or a map is selected, so the
  // previous query never sticks between rounds.
  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);
  useEffect(() => {
    if (selectedMap) setQuery('');
  }, [selectedMap]);

  function handlePlaceClick(e: MouseEvent<HTMLDivElement>) {
    if (!onPlace || !selectedMap) return;
    const el = placeRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    onPlace(Math.max(0, Math.min(1, x)), Math.max(0, Math.min(1, y)));
  }

  // ---------- PLACE / REVEAL ----------
  if (selectedMap) {
    const showCorrect = !!correct;
    const showLine = player && correct;
    return (
      <div
        ref={wrapRef}
        className={cn(
          'absolute z-20 inset-x-2 bottom-2 sm:inset-x-auto sm:right-4 sm:bottom-4',
          'sm:w-[min(56vw,620px,calc(100vh_-_5rem))] lg:w-[min(44vw,680px,calc(100vh_-_5rem))]',
          disabled && 'pointer-events-none opacity-80',
        )}
      >
        <div className="rounded-lg border border-atfr-gold/40 bg-atfr-ink/95 backdrop-blur shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-atfr-gold/15">
            {!showCorrect ? (
              <button
                type="button"
                onClick={onClearMap}
                className="inline-flex items-center gap-1 text-xs text-atfr-fog hover:text-atfr-bone"
                title="Choisir une autre map"
              >
                <ArrowLeft size={12} /> Map
              </button>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-atfr-gold">
                <Crosshair size={12} /> Révélation
              </span>
            )}
            <p className="text-xs text-atfr-bone font-medium truncate max-w-[60%]">
              {selectedMap.name}
            </p>
            {distanceLabel ? (
              <span className="text-[10px] uppercase tracking-wider rounded bg-atfr-gold/15 text-atfr-gold border border-atfr-gold/30 px-1.5 py-0.5">
                {distanceLabel}
              </span>
            ) : (
              <span className="text-[10px] text-atfr-fog">
                {onPlace
                  ? player
                    ? 'Replace si besoin'
                    : 'Clique pour pointer'
                  : ''}
              </span>
            )}
          </div>

          <div
            ref={placeRef}
            onClick={handlePlaceClick}
            className={cn(
              'relative aspect-square w-full bg-atfr-ink select-none',
              onPlace ? 'cursor-crosshair' : 'cursor-default',
            )}
          >
            <img
              src={selectedMap.image_url}
              alt=""
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover pointer-events-none"
            />
            <div
              className="absolute inset-0 bg-grid pointer-events-none opacity-15"
              style={{ backgroundSize: '20px 20px' }}
              aria-hidden
            />

            {showLine && (
              <svg
                className="absolute inset-0 h-full w-full pointer-events-none"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <motion.line
                  x1={player.x * 100}
                  y1={player.y * 100}
                  x2={correct!.x * 100}
                  y2={correct!.y * 100}
                  stroke="rgba(232,176,67,0.85)"
                  strokeWidth={0.5}
                  strokeDasharray="1.5 1.2"
                  vectorEffect="non-scaling-stroke"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6 }}
                />
              </svg>
            )}

            {player && (
              <PinAt x={player.x} y={player.y} tone="gold" />
            )}
            {correct && (
              <PinAt x={correct.x} y={correct.y} tone="emerald" />
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
      {open && (
        <div
          className="w-full sm:w-[min(56vw,620px)] lg:w-[min(44vw,680px)] max-h-[min(72vh,560px)] overflow-hidden rounded-lg border border-atfr-gold/30 bg-atfr-ink/95 backdrop-blur shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 border-b border-atfr-gold/15 px-3 py-2">
            <Search size={14} className="text-atfr-gold shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une map…"
              className="flex-1 bg-transparent text-sm text-atfr-bone placeholder-atfr-fog focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-atfr-fog hover:text-atfr-bone"
              aria-label="Fermer"
            >
              <X size={14} />
            </button>
          </div>
          <div className="overflow-y-auto p-2 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 max-h-[min(58vh,460px)]">
            {filtered.length === 0 ? (
              <p className="col-span-full py-6 text-center text-xs text-atfr-fog">
                Aucune map ne correspond.
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
                  className="group relative aspect-square overflow-hidden rounded-md border-2 border-atfr-gold/15 hover:border-atfr-gold/60 transition-all"
                >
                  {m.image_url ? (
                    <img
                      src={m.image_url}
                      alt={m.name}
                      loading="lazy"
                      draggable={false}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-atfr-graphite" />
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-atfr-ink to-transparent px-1.5 py-1">
                    <p className="text-[10px] text-atfr-bone truncate">
                      {m.name}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => !disabled && setOpen((p) => !p)}
        className="flex items-center gap-2 rounded-md border-2 border-atfr-gold/40 hover:border-atfr-gold bg-atfr-ink/80 backdrop-blur shadow-xl px-2 py-1.5 transition-all sm:max-w-[260px]"
      >
        <div className="h-12 w-12 sm:h-16 sm:w-16 rounded overflow-hidden bg-atfr-graphite shrink-0 flex items-center justify-center">
          <MapIcon size={20} className="text-atfr-gold opacity-70" />
        </div>
        <div className="text-left pr-1.5">
          <p className="text-[9px] uppercase tracking-[0.2em] text-atfr-gold">
            Choisir la map
          </p>
          <p className="text-xs sm:text-sm font-medium text-atfr-bone max-w-[140px] truncate">
            Survole / clique
          </p>
        </div>
      </button>
    </div>
  );
}

function PinAt({
  x,
  y,
  tone,
}: {
  x: number;
  y: number;
  tone: 'gold' | 'emerald';
}) {
  const ring = tone === 'gold' ? 'border-atfr-gold' : 'border-emerald-400';
  const halo = tone === 'gold' ? 'bg-atfr-gold/30' : 'bg-emerald-400/40';
  const dot = tone === 'gold' ? 'bg-atfr-gold' : 'bg-emerald-400';
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="relative h-5 w-5">
        <div className={cn('absolute inset-0 -m-1.5 rounded-full blur-md opacity-80', halo)} />
        <div className={cn('absolute inset-0 rounded-full border-2 bg-atfr-ink/40 shadow-lg', ring)} />
        <div className={cn('absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full', dot)} />
      </div>
    </div>
  );
}
