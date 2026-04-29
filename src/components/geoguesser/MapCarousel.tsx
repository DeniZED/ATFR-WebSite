import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { Database } from '@/types/database';

type MapRow = Database['public']['Tables']['wot_maps']['Row'];

interface MapCarouselProps {
  maps: MapRow[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

export function MapCarousel({
  maps,
  selectedId,
  onSelect,
  disabled,
}: MapCarouselProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return maps;
    return maps.filter((m) => m.name.toLowerCase().includes(q));
  }, [maps, search]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold">
          Choisir la map
        </p>
        <div className="relative">
          <Search
            size={12}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-atfr-fog"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher…"
            className="rounded-full border border-atfr-gold/30 bg-atfr-graphite/60 py-1.5 pl-7 pr-3 text-xs text-atfr-bone placeholder-atfr-fog focus:outline-none focus:border-atfr-gold/60"
          />
        </div>
      </div>

      <div
        className={cn(
          'flex gap-3 overflow-x-auto snap-x snap-mandatory pb-3 -mx-1 px-1',
          // Hide scrollbar on hover but keep functional
          '[scrollbar-width:thin]',
          disabled && 'opacity-60 pointer-events-none',
        )}
      >
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-atfr-fog py-6 w-full">
            Aucune map ne correspond.
          </p>
        ) : (
          filtered.map((m) => {
            const active = selectedId === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onSelect(m.id)}
                className={cn(
                  'group relative shrink-0 snap-start overflow-hidden rounded-md border-2 transition-all',
                  'h-24 w-24 sm:h-28 sm:w-28',
                  active
                    ? 'border-atfr-gold ring-2 ring-atfr-gold/40 scale-[1.04]'
                    : 'border-atfr-gold/15 hover:border-atfr-gold/50',
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
                  <p className="text-[10px] text-atfr-bone truncate">{m.name}</p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
