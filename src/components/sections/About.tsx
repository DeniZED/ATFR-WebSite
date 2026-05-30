import { motion } from 'framer-motion';
import { Flame, HeartHandshake, Swords, Target } from 'lucide-react';
import { Section } from '@/components/ui';
import { useContent } from '@/hooks/useContent';

const values = [
  {
    icon: Swords,
    title: 'Compétitif',
    text: 'Entraînements hebdomadaires, stratégie en équipe et participation aux tournois communautaires.',
    stat: 'Tournois',
    statVal: 'Top',
  },
  {
    icon: HeartHandshake,
    title: 'Communauté',
    text: "Un Discord francophone actif, des soirées pleine équipe, de l'entraide et du fun au quotidien.",
    stat: 'Ambiance',
    statVal: '5★',
  },
  {
    icon: Target,
    title: 'Progression',
    text: 'Coaching entre membres, analyses de replays, partage de setups et de compositions gagnantes.',
    stat: 'Coaching',
    statVal: 'Pro',
  },
  {
    icon: Flame,
    title: 'Engagé',
    text: 'Campagnes globales, escarmouches, événements spéciaux — on joue pour gagner du steel.',
    stat: 'Campagnes',
    statVal: 'Max',
  },
];

export function About() {
  const { get } = useContent();
  const [featured, ...rest] = values;
  const FeaturedIcon = featured.icon;

  return (
    <Section
      id="about"
      eyebrow={get('about_eyebrow')}
      title={get('about_title')}
      description={get('about_text')}
      variant="tinted"
    >
      <div className="grid gap-5 lg:grid-cols-12">
        {/* Featured large card */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
          className="lg:col-span-5 group relative overflow-hidden rounded-2xl border border-atfr-gold/20 bg-gradient-to-br from-atfr-carbon to-atfr-graphite/60 p-8 flex flex-col justify-between min-h-[320px]"
        >
          <div className="absolute inset-0 bg-grid bg-[size:38px_38px] opacity-15" aria-hidden />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-atfr-gold/8 blur-3xl" aria-hidden />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-atfr-gold/60 to-transparent" aria-hidden />

          <div className="relative">
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl border border-atfr-gold/40 bg-atfr-gold/10 text-atfr-gold transition-all duration-300 group-hover:scale-110 group-hover:bg-atfr-gold/20">
              <FeaturedIcon size={26} strokeWidth={1.4} />
            </div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-atfr-gold/70 mb-3">
              {featured.stat} —{' '}
              <span className="text-atfr-gold">{featured.statVal}</span>
            </p>
            <h3 className="font-display text-4xl text-atfr-bone mb-4 leading-none">
              {featured.title}
            </h3>
            <p className="text-atfr-fog leading-relaxed">{featured.text}</p>
          </div>

          <span
            className="relative mt-8 font-display text-[120px] leading-none font-bold text-atfr-gold/5 select-none"
            aria-hidden
          >
            01
          </span>
        </motion.div>

        {/* 3 compact cards */}
        <div className="lg:col-span-7 grid gap-5 sm:grid-cols-2">
          {rest.map((v, i) => {
            const Icon = v.icon;
            return (
              <motion.article
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{
                  duration: 0.45,
                  delay: (i + 1) * 0.08,
                  ease: [0.2, 0.8, 0.2, 1],
                }}
                whileHover={{ y: -5 }}
                className={[
                  'group relative overflow-hidden rounded-xl border border-atfr-gold/15 bg-atfr-carbon p-6 cursor-default',
                  i === 2 ? 'sm:col-span-2' : '',
                ].join(' ')}
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-atfr-gold/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden />
                <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-atfr-gold/8 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden />

                <div className="flex items-start justify-between gap-4">
                  <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-atfr-gold/30 bg-atfr-gold/10 text-atfr-gold transition-all duration-300 group-hover:scale-110 group-hover:bg-atfr-gold/20">
                    <Icon size={20} strokeWidth={1.6} />
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-atfr-gold/60 pt-1">
                    {v.stat} —{' '}
                    <span className="text-atfr-gold/90">{v.statVal}</span>
                  </span>
                </div>
                <h3 className="mt-4 font-display text-2xl text-atfr-bone transition-colors group-hover:text-atfr-gold-light">
                  {v.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-atfr-fog">
                  {v.text}
                </p>

                <span
                  className="absolute -bottom-3 -right-2 font-display text-7xl font-bold text-atfr-gold/5 select-none leading-none"
                  aria-hidden
                >
                  0{i + 2}
                </span>
              </motion.article>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
