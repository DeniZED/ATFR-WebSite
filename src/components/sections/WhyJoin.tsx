import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Crosshair,
  Headphones,
  LineChart,
  ShieldCheck,
} from 'lucide-react';
import { Button, Section } from '@/components/ui';
import { useContent } from '@/hooks/useContent';

const pillars = [
  {
    icon: Headphones,
    titleKey: 'why_join_1_title',
    textKey: 'why_join_1_text',
    statKey: 'why_join_1_stat',
    color: 'from-atfr-gold/20 to-transparent',
  },
  {
    icon: Crosshair,
    titleKey: 'why_join_2_title',
    textKey: 'why_join_2_text',
    statKey: 'why_join_2_stat',
    color: 'from-atfr-gold/15 to-transparent',
  },
  {
    icon: ShieldCheck,
    titleKey: 'why_join_3_title',
    textKey: 'why_join_3_text',
    statKey: 'why_join_3_stat',
    color: 'from-atfr-gold/18 to-transparent',
  },
  {
    icon: LineChart,
    titleKey: 'why_join_4_title',
    textKey: 'why_join_4_text',
    statKey: 'why_join_4_stat',
    color: 'from-atfr-gold/20 to-transparent',
  },
];

export function WhyJoin() {
  const { get } = useContent();
  const reduceMotion = useReducedMotion();
  const bgVideoUrl = get('why_join_video_url');
  const bgImageUrl = get('why_join_image_url');

  const journey = [1, 2, 3].map((i) => ({
    title: get(`why_join_path_${i}_title`),
    text: get(`why_join_path_${i}_text`),
  }));

  return (
    <Section
      eyebrow={get('why_join_eyebrow')}
      title={get('why_join_title')}
      description={get('why_join_text')}
      className="overflow-hidden relative"
    >
      {/* Optional background media */}
      {bgVideoUrl && (
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-10"
          autoPlay={!reduceMotion}
          loop
          muted
          playsInline
          preload="metadata"
          aria-hidden
        >
          <source src={bgVideoUrl} />
        </video>
      )}
      {!bgVideoUrl && bgImageUrl && (
        <img
          src={bgImageUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-8"
          aria-hidden
        />
      )}

      <div className="relative grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
        <div className="grid gap-4 sm:grid-cols-2">
          {pillars.map((pillar, i) => (
            <motion.article
              key={pillar.titleKey}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-70px' }}
              transition={{ duration: 0.45, delay: i * 0.07, ease: [0.2, 0.8, 0.2, 1] }}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-xl border border-atfr-gold/15 bg-atfr-carbon p-6 cursor-default"
            >
              {/* Top gradient reveal on hover */}
              <div
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-atfr-gold/0 via-atfr-gold/80 to-atfr-gold/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                aria-hidden
              />
              {/* Background radial on hover */}
              <div
                className={`absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${pillar.color} blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                aria-hidden
              />
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-atfr-gold/30 bg-atfr-gold/10 text-atfr-gold transition-all duration-300 group-hover:bg-atfr-gold/20 group-hover:border-atfr-gold/50 group-hover:scale-110">
                <pillar.icon size={21} strokeWidth={1.6} />
              </div>
              <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-atfr-gold/80">
                {get(pillar.statKey)}
              </p>
              <h3 className="font-display text-2xl text-atfr-bone transition-colors group-hover:text-atfr-gold-light">
                {get(pillar.titleKey)}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-atfr-fog">
                {get(pillar.textKey)}
              </p>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-70px' }}
          transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative overflow-hidden rounded-xl border border-atfr-gold/25 bg-atfr-graphite/80 p-7"
        >
          <div className="absolute inset-0 bg-grid bg-[size:38px_38px] opacity-20" aria-hidden />
          {/* Glow corner */}
          <div
            className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-atfr-gold/10 blur-3xl"
            aria-hidden
          />
          <div className="relative">
            <p className="text-xs uppercase tracking-[0.3em] text-atfr-gold">
              {get('why_join_path_eyebrow')}
            </p>
            <h3 className="mt-3 font-display text-3xl text-atfr-bone">
              {get('why_join_path_title')}
            </h3>
            <div className="mt-8 space-y-5">
              {journey.map((step, i) => (
                <motion.div
                  key={step.title}
                  className="flex gap-4"
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1, ease: [0.2, 0.8, 0.2, 1] }}
                >
                  <div className="relative flex flex-col items-center">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-atfr-gold/50 bg-atfr-gold/10 text-sm font-semibold text-atfr-gold font-display">
                      {i + 1}
                    </div>
                    {i < journey.length - 1 && (
                      <div className="mt-2 w-px flex-1 bg-gradient-to-b from-atfr-gold/30 to-transparent min-h-[20px]" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="font-medium text-atfr-bone flex items-center gap-2">
                      {step.title}
                      <CheckCircle2 size={14} className="text-atfr-gold/50" />
                    </p>
                    <p className="mt-1 text-sm text-atfr-fog">{step.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <Link to="/recrutement" className="mt-8 inline-flex">
              <Button trailingIcon={<ArrowRight size={14} />}>
                {get('why_join_cta')}
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}
