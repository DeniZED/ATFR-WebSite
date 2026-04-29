import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { Database } from '@/types/database';

type MapRow = Database['public']['Tables']['wot_maps']['Row'];

interface FloatingMapPickerProps {
  maps: MapRow[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  disabled?: boolean;
  /** When false, the panel can't be opened (e.g. during reveal). */
  open?: boolean;
}

/**
 * GeoGuessr-style picker: a small floating panel pinned to the
 * bottom-right of its relative parent. Hovering or focusing the panel
 * (or clicking the toggle) expands it into a searchable grid of maps.
 * On mobile the toggle becomes a tap target — hover is suppressed by
 * the `:hover` media query trick (CSS `@media (hover:hover)`).
 */
export function FloatingMapPicker({
  maps,
  selectedId,
  onSelect,
  disabled,
}: FloatingMapPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const selected = useMemo(
    () => maps.find((m) => m.id === selectedId) ?? null,
    [maps, selectedId],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return maps;
    return maps.filter((m) => m.name.toLowerCase().includes(q));
  }, [maps, query]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
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

  return (
    <div
      ref={wrapRef}
      className={cn(
        'absolute z-20 right-3 bottom-3 flex flex-col items-end gap-2',
        disabled && 'pointer-events-none opacity-70',
      )}
      onMouseEnter={() => !disabled && setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {open && (
        <div
          className="w-[min(92vw,420px)] max-h-[min(60vh,440px)] overflow-hidden rounded-lg border border-atfr-gold/30 bg-atfr-ink/95 backdrop-blur shadow-2xl"
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
          <div className="overflow-y-auto p-2 grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[min(48vh,360px)]">
            {filtered.length === 0 ? (
              <p className="col-span-full py-6 text-center text-xs text-atfr-fog">
                Aucune map ne correspond.
              </p>
            ) : (
              filtered.map((m) => {
                const active = m.id === selectedId;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      onSelect(m.id);
                      setOpen(false);
                    }}
                    className={cn(
                      'group relative aspect-square overflow-hidden rounded-md border-2 transition-all',
                      active
                        ? 'border-atfr-gold ring-2 ring-atfr-gold/40'
                        : 'border-atfr-gold/15 hover:border-atfr-gold/60',
                    )}
                    aria-pressed={active}
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
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Toggle / current-selection thumb */}
      <button
        type="button"
        onClick={() => !disabled && setOpen((p) => !p)}
        className={cn(
          'flex items-center gap-2 rounded-md border-2 bg-atfr-ink/80 backdrop-blur shadow-xl px-2 py-1.5 transition-all',
          'border-atfr-gold/40 hover:border-atfr-gold',
        )}
      >
        <div className="h-12 w-12 sm:h-16 sm:w-16 rounded overflow-hidden bg-atfr-graphite shrink-0">
          {selected?.image_url ? (
            <img
              src={selected.image_url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full" />
          )}
        </div>
        <div className="text-left pr-1.5">
          <p className="text-[9px] uppercase tracking-[0.2em] text-atfr-gold">
            {selected ? 'Map choisie' : 'Choisir la map'}
          </p>
          <p className="text-xs sm:text-sm font-medium text-atfr-bone max-w-[140px] truncate">
            {selected ? selected.name : 'Survole / clique'}
          </p>
        </div>
      </button>
    </div>
  );
}
