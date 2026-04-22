import { motion } from 'framer-motion';
import { Gamepad2, Swords, Trophy } from 'lucide-react';
import { Section } from '@/components/ui';
import { useContent } from '@/hooks/useContent';

const fallbackIcons = [Swords, Trophy, Gamepad2];

export function Activities() {
  const { get } = useContent();

  const items = [1, 2, 3].map((i) => ({
    title: get(`activity_${i}_title`),
    text: get(`activity_${i}_text`),
    image: get(`activity_${i}_image`),
    Icon: fallbackIcons[i - 1],
  }));

  return (
    <Section
      eyebrow={get('activities_eyebrow')}
      title={get('activities_title')}
    >
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((it, i) => (
          <motion.article
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: [0.2, 0.8, 0.2, 1] }}
            whileHover={{ y: -6 }}
            className="group relative overflow-hidden rounded-xl border border-atfr-gold/15 bg-atfr-carbon"
          >
            <div className="aspect-[4/3] overflow-hidden bg-atfr-graphite relative">
              {it.image ? (
                <img
                  src={it.image}
                  alt={it.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-atfr-gold/10 to-transparent">
                  <it.Icon
                    size={64}
                    className="text-atfr-gold/40"
                    strokeWidth={1.2}
                  />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-atfr-ink via-atfr-ink/20 to-transparent" />
            </div>
            <div className="relative -mt-16 px-6 pb-6">
              <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-atfr-gold/40 bg-atfr-ink/80 backdrop-blur text-atfr-gold">
                <it.Icon size={20} strokeWidth={1.6} />
              </div>
              <h3 className="font-display text-xl text-atfr-bone mb-2">
                {it.title}
              </h3>
              <p className="text-sm text-atfr-fog leading-relaxed">{it.text}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </Section>
  );
}
