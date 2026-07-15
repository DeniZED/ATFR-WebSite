import { motion } from 'framer-motion';
import {
  Crown,
  Flag,
  Milestone,
  Shield,
  Star,
  TrendingUp,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardBody, Section } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useClanHistory } from '@/features/history/queries';

const ICONS: Record<string, LucideIcon> = {
  shield: Shield,
  flag: Flag,
  'trending-up': TrendingUp,
  star: Star,
  trophy: Trophy,
  crown: Crown,
};

function iconFor(name: string | null): LucideIcon {
  return (name && ICONS[name]) || Milestone;
}

/**
 * Section « Notre Histoire » : chronologie du clan à axe central, jalons en
 * alternance gauche/droite (image + année + icône + titre + texte), au style
 * ATFR. Contenu éditable via l'admin (table clan_history).
 */
export function ClanHistory() {
  const { data } = useClanHistory({ visibleOnly: true });
  if (!data || data.length === 0) return null;

  return (
    <Section
      id="histoire"
      eyebrow="Notre parcours"
      title="Notre Histoire"
      description="Des premières manœuvres au Top 5 français — les grandes étapes du clan."
    >
      <div className="relative mx-auto max-w-4xl">
        {/* Axe central (à gauche sur mobile). */}
        <div
          className="pointer-events-none absolute left-4 md:left-1/2 top-2 bottom-2 w-px -translate-x-1/2 bg-gradient-to-b from-atfr-gold/35 via-atfr-gold to-atfr-gold/35"
          aria-hidden
        />

        <ol className="space-y-6">
          {data.map((m, i) => {
            const left = i % 2 === 0;
            const Icon = iconFor(m.icon);
            return (
              <li key={m.id} className="relative md:grid md:grid-cols-2 md:gap-12">
                <span
                  className="absolute left-4 md:left-1/2 top-5 z-10 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-atfr-gold shadow-[0_0_0_4px_rgba(232,176,67,0.15),0_0_12px_rgba(232,176,67,0.6)]"
                  aria-hidden
                />
                <motion.article
                  className={cn('ml-12 md:ml-0', left ? 'md:col-start-1' : 'md:col-start-2')}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
                >
                  <Card className="overflow-hidden">
                    {m.image_url && (
                      <div className="relative h-32 overflow-hidden">
                        <img
                          src={m.image_url}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-atfr-carbon via-atfr-carbon/20 to-transparent" />
                        <span className="absolute left-2.5 top-2.5 rounded bg-atfr-gold px-2 py-0.5 font-mono text-[11px] font-bold tracking-wider text-atfr-ink">
                          {m.year}
                        </span>
                      </div>
                    )}
                    <CardBody className="p-4">
                      <div className="flex items-center gap-2">
                        <Icon size={16} className="shrink-0 text-atfr-gold" />
                        <h3 className="font-display text-lg uppercase tracking-tight text-atfr-gold">
                          {m.title}
                        </h3>
                        {!m.image_url && (
                          <span className="ml-auto rounded bg-atfr-gold/15 px-2 py-0.5 font-mono text-[11px] font-bold tracking-wider text-atfr-gold">
                            {m.year}
                          </span>
                        )}
                      </div>
                      {m.description && (
                        <p className="mt-1.5 text-sm text-atfr-fog">{m.description}</p>
                      )}
                    </CardBody>
                  </Card>
                </motion.article>
              </li>
            );
          })}
        </ol>
      </div>
    </Section>
  );
}
