import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Hourglass } from 'lucide-react';
import { Section, Spinner } from '@/components/ui';
import { cn } from '@/lib/cn';
import { usePublishedModules } from '@/features/modules/queries';

const CATEGORY_LABEL = {
  pédagogie: 'Pédagogique',
  jeu: 'Jeu',
  outil: 'Outil',
} as const;

export default function Modules() {
  const { data, isLoading } = usePublishedModules();

  return (
    <Section
      eyebrow="Académie ATFR"
      title="Modules & mini-jeux"
      description="Une collection grandissante de tests, défis et outils communautaires autour de World of Tanks. Chaque module est administré indépendamment."
    >
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : !data || data.length === 0 ? (
        <p className="text-center text-atfr-fog py-20">
          Aucun module disponible pour le moment. Revenez bientôt — les
          premiers tests arrivent.
        </p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {data.map(({ registry, row }, i) => {
            const title = row.custom_title || registry.title;
            const description = row.custom_description || registry.description;
            const Icon = registry.icon;
            return (
              <motion.div
                key={registry.slug}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{
                  duration: 0.45,
                  delay: i * 0.06,
                  ease: [0.2, 0.8, 0.2, 1],
                }}
              >
                <Link
                  to={`/modules/${registry.path}`}
                  className={cn(
                    'group relative flex h-full flex-col overflow-hidden rounded-xl border bg-atfr-carbon p-6 transition-all',
                    'hover:-translate-y-1 hover:border-atfr-gold/60',
                    registry.accentBorder,
                  )}
                >
                  <div
                    className={cn(
                      'absolute inset-x-0 top-0 h-32 bg-gradient-to-b opacity-60 group-hover:opacity-100 transition-opacity',
                      registry.accentGradient,
                    )}
                    aria-hidden
                  />

                  <div className="relative flex items-start justify-between gap-3 mb-4">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-atfr-gold/40 bg-atfr-ink/80 text-atfr-gold">
                      <Icon size={22} strokeWidth={1.6} />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] uppercase tracking-[0.25em] text-atfr-fog">
                        {CATEGORY_LABEL[registry.category]}
                      </span>
                      {row.badge_label && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-atfr-gold/15 border border-atfr-gold/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-atfr-gold">
                          {row.badge_label}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="relative flex-1">
                    <h3 className="font-display text-2xl text-atfr-bone mb-2">
                      {title}
                    </h3>
                    <p className="text-sm text-atfr-fog leading-relaxed">
                      {description}
                    </p>
                  </div>

                  <div className="relative mt-6 flex items-center justify-between text-sm">
                    {registry.comingSoon ? (
                      <span className="inline-flex items-center gap-1.5 text-atfr-fog">
                        <Hourglass size={14} />
                        Bientôt disponible
                      </span>
                    ) : (
                      <span className="font-medium text-atfr-gold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                        {registry.cta}
                        <ArrowRight size={14} />
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </Section>
  );
}
