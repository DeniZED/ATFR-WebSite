import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Play, X } from 'lucide-react';
import { Section, Spinner } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useMediaAssets } from '@/features/media/queries';
import type { Database, MediaKind } from '@/types/database';

type MediaRow = Database['public']['Tables']['media_assets']['Row'];

export default function Gallery() {
  const [filter, setFilter] = useState<MediaKind | 'all'>('all');
  const { data, isLoading } = useMediaAssets();
  const [selected, setSelected] = useState<MediaRow | null>(null);

  const filtered = useMemo(
    () =>
      (data ?? []).filter((a) => (filter === 'all' ? true : a.kind === filter)),
    [data, filter],
  );

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [selected]);

  return (
    <>
      <Section
        eyebrow="Galerie"
        title="Captures & vidéos du clan"
        description="Les meilleurs moments ATFR — batailles épiques, tournois, soirées clan."
      >
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {(['all', 'image', 'video'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                'rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.2em] transition-colors',
                filter === f
                  ? 'bg-atfr-gold text-atfr-ink border-atfr-gold'
                  : 'border-atfr-gold/30 text-atfr-fog hover:text-atfr-bone hover:border-atfr-gold/60',
              )}
            >
              {f === 'all' ? 'Tout' : f === 'image' ? 'Images' : 'Vidéos'}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner label="Chargement…" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-atfr-fog py-20">Aucun média pour le moment.</p>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
            {filtered.map((a, i) => (
              <motion.button
                key={a.id}
                type="button"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  duration: 0.4,
                  delay: Math.min(i * 0.03, 0.3),
                  ease: [0.2, 0.8, 0.2, 1],
                }}
                onClick={() => setSelected(a)}
                className="group mb-4 block w-full overflow-hidden rounded-lg border border-atfr-gold/15 bg-atfr-carbon break-inside-avoid"
              >
                {a.kind === 'image' ? (
                  <img
                    src={a.public_url}
                    alt={a.caption ?? ''}
                    loading="lazy"
                    className="w-full transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="relative aspect-video overflow-hidden">
                    <video
                      src={a.public_url}
                      muted
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-atfr-ink/30 transition-opacity group-hover:bg-atfr-ink/10">
                      <div className="h-14 w-14 rounded-full bg-atfr-gold/90 flex items-center justify-center text-atfr-ink">
                        <Play size={22} strokeWidth={2.4} />
                      </div>
                    </div>
                  </div>
                )}
                {a.caption && (
                  <p className="px-3 py-2 text-xs text-atfr-fog border-t border-atfr-gold/10">
                    {a.caption}
                  </p>
                )}
              </motion.button>
            ))}
          </div>
        )}
      </Section>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-atfr-ink/90 backdrop-blur-md p-4"
          >
            <button
              type="button"
              aria-label="Fermer"
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 h-10 w-10 rounded-full bg-atfr-ink/80 border border-atfr-gold/30 text-atfr-bone hover:text-atfr-gold inline-flex items-center justify-center"
            >
              <X size={20} />
            </button>
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] max-w-6xl w-full flex flex-col items-center"
            >
              {selected.kind === 'image' ? (
                <img
                  src={selected.public_url}
                  alt={selected.caption ?? ''}
                  className="max-h-[85vh] max-w-full object-contain rounded-lg"
                />
              ) : (
                <video
                  src={selected.public_url}
                  controls
                  autoPlay
                  className="max-h-[85vh] max-w-full rounded-lg"
                />
              )}
              {selected.caption && (
                <p className="mt-3 text-center text-sm text-atfr-fog">
                  {selected.caption}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
