import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { Alert, Section } from '@/components/ui';
import { useContent } from '@/hooks/useContent';
import { useTestimonials } from '@/features/content/queries';

export function Testimonials() {
  const { get } = useContent();
  const { data, isLoading, isError } = useTestimonials({ visibleOnly: true });

  if (isLoading) {
    return (
      <Section eyebrow={get('testimonials_eyebrow')} title={get('testimonials_title')}>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-atfr-gold/15 bg-atfr-carbon p-6 space-y-4">
              <div className="h-4 w-full shimmer rounded" />
              <div className="h-4 w-5/6 shimmer rounded" />
              <div className="h-4 w-4/6 shimmer rounded" />
              <div className="flex items-center gap-3 pt-4 border-t border-atfr-gold/10">
                <div className="h-10 w-10 shrink-0 rounded-full shimmer" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-28 shimmer rounded" />
                  <div className="h-3 w-16 shimmer rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>
    );
  }

  if (isError) {
    return (
      <Section eyebrow={get('testimonials_eyebrow')} title={get('testimonials_title')}>
        <Alert tone="danger">Les témoignages sont temporairement indisponibles. Réessaie dans quelques instants.</Alert>
      </Section>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <Section
      eyebrow={get('testimonials_eyebrow')}
      title={get('testimonials_title')}
    >
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {data.map((t, i) => (
          <motion.figure
            key={t.id}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, delay: i * 0.08 }}
            className="relative rounded-xl border border-atfr-gold/15 bg-atfr-carbon p-6"
          >
            <Quote
              size={32}
              className="absolute -top-3 left-5 text-atfr-gold/60 bg-atfr-ink rounded-full p-1 border border-atfr-gold/30"
              strokeWidth={1.5}
            />
            <blockquote className="text-atfr-bone leading-relaxed">
              « {t.quote} »
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3 border-t border-atfr-gold/10 pt-4">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-atfr-gold/30 bg-atfr-graphite">
                {t.avatar_url ? (
                  <img
                    src={t.avatar_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-atfr-gold font-display text-sm">
                    {t.author_name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium text-atfr-bone">{t.author_name}</p>
                {t.author_role && (
                  <p className="text-xs text-atfr-gold/80">{t.author_role}</p>
                )}
              </div>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </Section>
  );
}
