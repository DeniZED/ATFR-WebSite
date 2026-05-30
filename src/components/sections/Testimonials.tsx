import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import { Alert, Section } from '@/components/ui';
import { useContent } from '@/hooks/useContent';
import { useTestimonials } from '@/features/content/queries';

function Stars({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${count} étoiles sur 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={13}
          className={i < count ? 'text-atfr-gold fill-atfr-gold' : 'text-atfr-fog/30'}
          strokeWidth={1}
        />
      ))}
    </div>
  );
}

export function Testimonials() {
  const { get } = useContent();
  const { data, isLoading, isError } = useTestimonials({ visibleOnly: true });

  if (isLoading) {
    return (
      <Section
        eyebrow={get('testimonials_eyebrow')}
        title={get('testimonials_title')}
        variant="tinted"
      >
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-atfr-gold/15 bg-atfr-carbon p-6 space-y-4"
            >
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((__, j) => (
                  <div key={j} className="h-3 w-3 shimmer rounded" />
                ))}
              </div>
              <div className="h-4 w-full shimmer rounded" />
              <div className="h-4 w-5/6 shimmer rounded" />
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
      <Section
        eyebrow={get('testimonials_eyebrow')}
        title={get('testimonials_title')}
        variant="tinted"
      >
        <Alert tone="danger">Les témoignages sont temporairement indisponibles.</Alert>
      </Section>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <Section
      eyebrow={get('testimonials_eyebrow')}
      title={get('testimonials_title')}
      variant="tinted"
    >
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {data.map((t, i) => (
          <motion.figure
            key={t.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, delay: i * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
            whileHover={{ y: -4 }}
            className="group relative rounded-xl border border-atfr-gold/15 bg-atfr-carbon p-6 overflow-hidden"
          >
            {/* Hover top bar */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-atfr-gold/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden />
            {/* Subtle glow */}
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-atfr-gold/6 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden />

            {/* Decorative quote icon */}
            <Quote
              size={36}
              className="absolute top-4 right-4 text-atfr-gold/10 group-hover:text-atfr-gold/20 transition-colors duration-300"
              strokeWidth={1}
              aria-hidden
            />

            <div className="relative">
              {/* Stars */}
              <Stars />

              {/* Quote */}
              <blockquote className="mt-4 text-atfr-bone leading-relaxed text-sm sm:text-base">
                « {t.quote} »
              </blockquote>

              {/* Author */}
              <figcaption className="mt-5 flex items-center gap-3 border-t border-atfr-gold/10 pt-4">
                <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-atfr-gold/30 bg-atfr-graphite">
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
                  <p className="font-semibold text-atfr-bone">{t.author_name}</p>
                  {t.author_role && (
                    <p className="text-xs text-atfr-gold/80 mt-0.5">{t.author_role}</p>
                  )}
                </div>
              </figcaption>
            </div>
          </motion.figure>
        ))}
      </div>
    </Section>
  );
}
