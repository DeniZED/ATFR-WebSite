import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
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
  },
  {
    icon: Crosshair,
    titleKey: 'why_join_2_title',
    textKey: 'why_join_2_text',
    statKey: 'why_join_2_stat',
  },
  {
    icon: ShieldCheck,
    titleKey: 'why_join_3_title',
    textKey: 'why_join_3_text',
    statKey: 'why_join_3_stat',
  },
  {
    icon: LineChart,
    titleKey: 'why_join_4_title',
    textKey: 'why_join_4_text',
    statKey: 'why_join_4_stat',
  },
];

export function WhyJoin() {
  const { get } = useContent();
  const journey = [1, 2, 3].map((i) => ({
    title: get(`why_join_path_${i}_title`),
    text: get(`why_join_path_${i}_text`),
  }));

  return (
    <Section
      eyebrow={get('why_join_eyebrow')}
      title={get('why_join_title')}
      description={get('why_join_text')}
      className="overflow-hidden"
    >
      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
        <div className="grid gap-4 sm:grid-cols-2">
          {pillars.map((pillar, i) => (
            <motion.article
              key={pillar.titleKey}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-70px' }}
              transition={{
                duration: 0.45,
                delay: i * 0.07,
                ease: [0.2, 0.8, 0.2, 1],
              }}
              whileHover={{ y: -5 }}
              className="group relative overflow-hidden rounded-xl border border-atfr-gold/15 bg-atfr-carbon p-6"
            >
              <div
                className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-atfr-gold/0 via-atfr-gold/70 to-atfr-gold/0 opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden
              />
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-atfr-gold/30 bg-atfr-gold/10 text-atfr-gold">
                <pillar.icon size={21} strokeWidth={1.6} />
              </div>
              <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-atfr-gold/80">
                {get(pillar.statKey)}
              </p>
              <h3 className="font-display text-2xl text-atfr-bone">
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
          className="relative overflow-hidden rounded-xl border border-atfr-gold/20 bg-atfr-graphite/70 p-7"
        >
          <div
            className="absolute inset-0 bg-grid bg-[size:38px_38px] opacity-25"
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
                <div key={step.title} className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-atfr-gold/40 bg-atfr-ink text-sm font-semibold text-atfr-gold">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-medium text-atfr-bone">{step.title}</p>
                    <p className="mt-1 text-sm text-atfr-fog">{step.text}</p>
                  </div>
                </div>
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
