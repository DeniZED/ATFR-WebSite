import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Map, Sparkles } from 'lucide-react';
import { Button, Section, Spinner } from '@/components/ui';
import { cn } from '@/lib/cn';
import { usePublishedModules } from '@/features/modules/queries';
import { useContent } from '@/hooks/useContent';

const fallbackModules = [
  {
    title: 'Guide pour les bots',
    description:
      'Questions pédagogiques, situations pièges et explications pour progresser sans se prendre au sérieux.',
    icon: BookOpen,
    path: 'guide-bots',
    tag: 'Pédagogie',
  },
  {
    title: 'WoT Géoguesseur',
    description:
      'Une capture, une map, une position. Le mini-jeu parfait pour travailler la lecture de terrain.',
    icon: Map,
    path: 'wot-geoguesser',
    tag: 'Mini-jeu',
  },
];

export function AcademyPreview() {
  const { get } = useContent();
  const { data, isLoading } = usePublishedModules();
  const modules =
    data && data.length > 0
      ? data.slice(0, 3).map(({ registry, row }) => ({
          title: row.custom_title || registry.title,
          description: row.custom_description || registry.description,
          icon: registry.icon,
          path: registry.path,
          tag: row.badge_label || registry.category,
        }))
      : fallbackModules;

  return (
    <Section
      eyebrow={get('academy_preview_eyebrow')}
      title={get('academy_preview_title')}
      description={get('academy_preview_text')}
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
          className="rounded-xl border border-atfr-gold/15 bg-atfr-carbon p-7"
        >
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-atfr-gold/40 bg-atfr-gold/10 text-atfr-gold">
            <Sparkles size={22} strokeWidth={1.6} />
          </div>
          <h3 className="mt-5 font-display text-3xl text-atfr-bone">
            {get('academy_preview_card_title')}
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-atfr-fog">
            {get('academy_preview_card_text')}
          </p>
          <Link to="/modules" className="mt-7 inline-flex">
            <Button variant="outline" trailingIcon={<ArrowRight size={14} />}>
              {get('academy_preview_cta')}
            </Button>
          </Link>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2">
          {isLoading ? (
            <div className="sm:col-span-2 flex justify-center py-12">
              <Spinner />
            </div>
          ) : (
            modules.map((module, i) => (
              <motion.div
                key={module.path}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-70px' }}
                transition={{
                  duration: 0.45,
                  delay: i * 0.08,
                  ease: [0.2, 0.8, 0.2, 1],
                }}
              >
                <Link
                  to={`/modules/${module.path}`}
                  className={cn(
                    'group relative flex h-full min-h-[230px] flex-col overflow-hidden rounded-xl border border-atfr-gold/15 bg-atfr-graphite/60 p-6 transition-all',
                    'hover:-translate-y-1 hover:border-atfr-gold/60',
                  )}
                >
                  <div
                    className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-atfr-gold/15 to-transparent opacity-80"
                    aria-hidden
                  />
                  <div className="relative mb-5 flex items-start justify-between gap-3">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-atfr-gold/40 bg-atfr-ink text-atfr-gold">
                      <module.icon size={21} strokeWidth={1.6} />
                    </div>
                    <span className="rounded-full border border-atfr-gold/30 px-2 py-0.5 text-[10px] uppercase tracking-[0.22em] text-atfr-gold">
                      {module.tag}
                    </span>
                  </div>
                  <h3 className="relative font-display text-2xl text-atfr-bone">
                    {module.title}
                  </h3>
                  <p className="relative mt-3 flex-1 text-sm leading-relaxed text-atfr-fog">
                    {module.description}
                  </p>
                  <span className="relative mt-6 inline-flex items-center gap-1 text-sm font-medium text-atfr-gold transition-all group-hover:gap-2">
                    {get('academy_preview_module_cta')}
                    <ArrowRight size={14} />
                  </span>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </Section>
  );
}
