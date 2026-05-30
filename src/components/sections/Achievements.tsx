import { motion } from 'framer-motion';
import { Medal, Trophy } from 'lucide-react';
import { Alert, Section } from '@/components/ui';
import { useContent } from '@/hooks/useContent';
import { useAchievements } from '@/features/content/queries';

const RANK_STYLE: Record<string, string> = {
  '1er': 'border-atfr-gold bg-atfr-gold/10 text-atfr-gold',
  '2e': 'border-atfr-fog/40 bg-atfr-fog/5 text-atfr-fog',
  '3e': 'border-atfr-bronze/50 bg-atfr-bronze/10 text-atfr-bronze',
};

function rankStyle(rank?: string | null) {
  if (!rank) return 'border-atfr-gold/20 bg-atfr-gold/5 text-atfr-gold/70';
  const key = Object.keys(RANK_STYLE).find((k) =>
    rank.toLowerCase().startsWith(k),
  );
  return key ? RANK_STYLE[key] : 'border-atfr-gold/20 bg-atfr-gold/5 text-atfr-gold/70';
}

function isGold(rank?: string | null) {
  return rank && rank.toLowerCase().startsWith('1');
}

export function Achievements() {
  const { get } = useContent();
  const { data, isLoading, isError } = useAchievements({ visibleOnly: true });

  if (isLoading) {
    return (
      <Section
        eyebrow={get('achievements_eyebrow')}
        title={get('achievements_title')}
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-atfr-gold/20 bg-atfr-carbon p-6"
            >
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 shrink-0 rounded-lg shimmer" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-3/4 shimmer rounded" />
                  <div className="h-4 w-full shimmer rounded" />
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
        eyebrow={get('achievements_eyebrow')}
        title={get('achievements_title')}
      >
        <Alert tone="danger">Le palmarès est temporairement indisponible.</Alert>
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
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, delay: i * 0.06, ease: [0.2, 0.8, 0.2, 1] }}
            whileHover={{ y: -4 }}
            className={[
              'group relative overflow-hidden rounded-xl p-6',
              isGold(a.rank)
                ? 'border border-atfr-gold/40 bg-gradient-to-br from-atfr-carbon via-atfr-carbon to-atfr-graphite/60'
                : 'border border-atfr-gold/15 bg-atfr-carbon',
            ].join(' ')}
          >
            {/* Gold special glow */}
            {isGold(a.rank) && (
              <>
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-atfr-gold/80 to-transparent" aria-hidden />
                <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-atfr-gold/8 blur-3xl" aria-hidden />
              </>
            )}
            <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-atfr-gold/5 blur-2xl opacity-0 transition-all duration-500 group-hover:opacity-100" aria-hidden />

            <div className="relative flex items-start gap-4">
              {/* Trophy / image */}
              <div className="relative h-14 w-14 shrink-0 rounded-xl border border-atfr-gold/30 bg-atfr-ink/70 flex items-center justify-center text-atfr-gold overflow-hidden">
                {a.image_url ? (
                  <img
                    src={a.image_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : isGold(a.rank) ? (
                  <Trophy size={26} strokeWidth={1.4} />
                ) : (
                  <Medal size={26} strokeWidth={1.4} className="text-atfr-gold/70" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {a.rank && (
                    <span
                      className={[
                        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold font-display',
                        rankStyle(a.rank),
                      ].join(' ')}
                    >
                      {a.rank}
                    </span>
                  )}
                  <h3 className="font-display text-lg text-atfr-bone leading-tight">
                    {a.title}
                  </h3>
                </div>
                {a.subtitle && (
                  <p className="text-sm text-atfr-fog">{a.subtitle}</p>
                )}
                {(a.competition || a.earned_on) && (
                  <p className="mt-2 text-xs text-atfr-fog/70">
                    {a.competition}
                    {a.competition && a.earned_on && ' — '}
                    {a.earned_on}
                  </p>
                )}
                {a.description && (
                  <p className="mt-3 text-sm text-atfr-fog leading-relaxed">
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
