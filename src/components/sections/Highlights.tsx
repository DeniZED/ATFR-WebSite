import { motion } from 'framer-motion';
import { Section, Spinner } from '@/components/ui';
import { useContent } from '@/hooks/useContent';
import { useHighlights } from '@/features/content/queries';

export function Highlights() {
  const { get } = useContent();
  const { data, isLoading } = useHighlights({ visibleOnly: true });

  if (isLoading) {
    return (
      <Section eyebrow={get('highlights_eyebrow')} title={get('highlights_title')}>
        <div className="flex justify-center">
          <Spinner />
        </div>
      </Section>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <Section
      eyebrow={get('highlights_eyebrow')}
      title={get('highlights_title')}
    >
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {data.map((h, i) => (
          <motion.article
            key={h.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: i * 0.06, ease: [0.2, 0.8, 0.2, 1] }}
            className="group relative overflow-hidden rounded-xl border border-atfr-gold/15 bg-atfr-carbon"
          >
            <div className="aspect-video overflow-hidden bg-atfr-graphite">
              {h.image_url ? (
                <img
                  src={h.image_url}
                  alt={h.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-atfr-gold/10 to-transparent" />
              )}
            </div>
            <div className="p-5">
              {h.occurred_on && (
                <p className="text-[11px] uppercase tracking-[0.3em] text-atfr-gold/80 mb-2">
                  {h.occurred_on}
                </p>
              )}
              <h3 className="font-display text-lg text-atfr-bone mb-2">
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
    </Section>
  );
}
