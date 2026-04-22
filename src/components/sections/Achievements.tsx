import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { Section, Spinner } from '@/components/ui';
import { useContent } from '@/hooks/useContent';
import { useAchievements } from '@/features/content/queries';

export function Achievements() {
  const { get } = useContent();
  const { data, isLoading } = useAchievements({ visibleOnly: true });

  if (isLoading) {
    return (
      <Section
        eyebrow={get('achievements_eyebrow')}
        title={get('achievements_title')}
      >
        <div className="flex justify-center">
          <Spinner />
        </div>
      </Section>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <Section
      eyebrow={get('achievements_eyebrow')}
      title={get('achievements_title')}
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((a, i) => (
          <motion.article
            key={a.id}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, delay: i * 0.06 }}
            className="group relative overflow-hidden rounded-xl border border-atfr-gold/20 bg-gradient-to-br from-atfr-carbon to-atfr-graphite/60 p-6"
          >
            <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-atfr-gold/5 blur-2xl transition-all group-hover:bg-atfr-gold/10" />
            <div className="relative flex items-start gap-4">
              <div className="h-14 w-14 shrink-0 rounded-lg border border-atfr-gold/40 bg-atfr-ink/60 flex items-center justify-center text-atfr-gold">
                {a.image_url ? (
                  <img
                    src={a.image_url}
                    alt=""
                    className="h-full w-full object-cover rounded-lg"
                  />
                ) : (
                  <Trophy size={24} strokeWidth={1.6} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {a.rank && (
                    <span className="inline-flex items-center rounded-full bg-atfr-gold/15 px-2 py-0.5 text-xs font-semibold text-atfr-gold">
                      {a.rank}
                    </span>
                  )}
                  <h3 className="font-display text-lg text-atfr-bone">
                    {a.title}
                  </h3>
                </div>
                {a.subtitle && (
                  <p className="text-sm text-atfr-fog mt-1">{a.subtitle}</p>
                )}
                {(a.competition || a.earned_on) && (
                  <p className="text-xs text-atfr-fog/80 mt-2">
                    {a.competition}
                    {a.competition && a.earned_on && ' — '}
                    {a.earned_on}
                  </p>
                )}
                {a.description && (
                  <p className="text-sm text-atfr-fog mt-3 leading-relaxed">
                    {a.description}
                  </p>
                )}
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </Section>
  );
}
