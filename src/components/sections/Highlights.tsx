import { motion } from 'framer-motion';
import { Alert, Section } from '@/components/ui';
import { useContent } from '@/hooks/useContent';
import { useHighlights } from '@/features/content/queries';

export function Highlights() {
  const { get } = useContent();
  const { data, isLoading, isError } = useHighlights({ visibleOnly: true });

  if (isLoading) {
    return (
      <Section
        eyebrow={get('highlights_eyebrow')}
        title={get('highlights_title')}
        variant="tinted"
      >
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-atfr-gold/15 bg-atfr-carbon overflow-hidden"
            >
              <div className="aspect-video shimmer" />
              <div className="p-5 space-y-2">
                <div className="h-3 w-20 shimmer rounded" />
                <div className="h-5 w-3/4 shimmer rounded" />
                <div className="h-4 w-full shimmer rounded" />
              </div>
            </div>
          ))}
        </div>
      </Section>
    );
  }

  if (isError) {
    return (
      <Section
        eyebrow={get('highlights_eyebrow')}
        title={get('highlights_title')}
        variant="tinted"
      >
        <Alert tone="danger">
          Les moments forts sont temporairement indisponibles.
        </Alert>
      </Section>
    );
  }

  if (!data || data.length === 0) return null;

  const [featured, ...rest] = data;

  return (
    <Section
      eyebrow={get('highlights_eyebrow')}
      title={get('highlights_title')}
      variant="tinted"
    >
      <div className="space-y-5">
        {/* Featured item — full width, taller */}
        {featured && (
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
            className="group relative overflow-hidden rounded-2xl border border-atfr-gold/20 bg-atfr-carbon"
          >
            <div className="aspect-[21/8] overflow-hidden bg-atfr-graphite sm:aspect-[21/7]">
              {featured.image_url ? (
                <img
                  src={featured.image_url}
                  alt={featured.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-atfr-gold/10 to-transparent" />
              )}
            </div>
            {/* Overlay text */}
            <div className="absolute inset-0 bg-gradient-to-t from-atfr-ink via-atfr-ink/40 to-transparent" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-atfr-gold/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden />
            <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8">
              {featured.occurred_on && (
                <p className="text-[11px] uppercase tracking-[0.35em] text-atfr-gold mb-2">
                  {featured.occurred_on}
                </p>
              )}
              <h3 className="font-display text-2xl sm:text-3xl text-atfr-bone max-w-2xl leading-tight">
                {featured.title}
              </h3>
              {featured.description && (
                <p className="mt-2 text-sm text-atfr-fog/90 max-w-xl leading-relaxed hidden sm:block">
                  {featured.description}
                </p>
              )}
            </div>
          </motion.article>
        )}

        {/* Remaining items — 3 column grid */}
        {rest.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((h, i) => (
              <motion.article
                key={h.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{
                  duration: 0.45,
                  delay: i * 0.07,
                  ease: [0.2, 0.8, 0.2, 1],
                }}
                className="group relative overflow-hidden rounded-xl border border-atfr-gold/15 bg-atfr-carbon"
              >
                <div className="aspect-video overflow-hidden bg-atfr-graphite relative">
                  {h.image_url ? (
                    <img
                      src={h.image_url}
                      alt={h.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-107"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-atfr-gold/10 to-transparent" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-atfr-ink/80 via-transparent to-transparent" />
                </div>
                <div className="p-5">
                  {h.occurred_on && (
                    <p className="text-[11px] uppercase tracking-[0.3em] text-atfr-gold/80 mb-2">
                      {h.occurred_on}
                    </p>
                  )}
                  <h3 className="font-display text-lg text-atfr-bone mb-2 transition-colors group-hover:text-atfr-gold-light">
                    {h.title}
                  </h3>
                  {h.description && (
                    <p className="text-sm text-atfr-fog leading-relaxed">
                      {h.description}
                    </p>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}
