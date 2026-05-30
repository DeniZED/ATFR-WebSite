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
    num: String(i).padStart(2, '0'),
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
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: [0.2, 0.8, 0.2, 1] }}
            whileHover={{ y: -8 }}
            className="group relative overflow-hidden rounded-2xl border border-atfr-gold/15 bg-atfr-carbon"
          >
            {/* Image area */}
            <div className="aspect-[4/3] overflow-hidden bg-atfr-graphite relative">
              {it.image ? (
                <img
                  src={it.image}
                  alt={it.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-atfr-gold/8 to-transparent">
                  <it.Icon size={72} className="text-atfr-gold/25" strokeWidth={1} />
                </div>
              )}
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-atfr-ink via-atfr-ink/30 to-transparent" />
              {/* Large number watermark */}
              <span
                className="absolute -bottom-4 -right-2 font-display text-[100px] leading-none font-bold text-white/5 select-none group-hover:text-atfr-gold/8 transition-colors duration-500"
                aria-hidden
              >
                {it.num}
              </span>
              {/* Top border glow on hover */}
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-atfr-gold to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden />
            </div>

            {/* Content */}
            <div className="relative -mt-14 px-6 pb-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-atfr-gold/40 bg-atfr-ink/90 backdrop-blur text-atfr-gold transition-all duration-300 group-hover:scale-110 group-hover:bg-atfr-gold/15">
                <it.Icon size={20} strokeWidth={1.6} />
              </div>
              <h3 className="font-display text-xl text-atfr-bone mb-2 transition-colors group-hover:text-atfr-gold-light">
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
