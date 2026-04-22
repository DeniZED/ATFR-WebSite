import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import { Badge, Card, CardBody, Section, Spinner } from '@/components/ui';
import { useClanStats } from '@/features/stats/queries';
import { tomatoProfileUrl, wn8Color, wn8Label } from '@/lib/tomato-api';
import { ROLE_TRANSLATIONS } from '@/lib/constants';

export function TopPlayers() {
  const { data, isLoading } = useClanStats();

  return (
    <Section
      eyebrow="Classement"
      title="Top joueurs"
      description="Classement par WN8 sur un échantillon des membres actifs. Cliquez sur un joueur pour ouvrir son profil tomato.gg."
    >
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner label="Récupération des stats…" />
        </div>
      ) : !data || data.topPlayers.length === 0 ? (
        <p className="text-center text-atfr-fog">Aucune donnée disponible.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {data.topPlayers.map((p, idx) => (
            <motion.a
              key={p.accountId}
              href={tomatoProfileUrl(p.nickname)}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{
                duration: 0.4,
                delay: idx * 0.05,
                ease: [0.2, 0.8, 0.2, 1],
              }}
              whileHover={{ y: -3 }}
            >
              <Card className="transition-colors hover:border-atfr-gold/40">
                <CardBody className="flex items-center gap-4 p-4">
                  <div
                    className={
                      'flex h-12 w-12 items-center justify-center rounded-lg font-display font-semibold text-lg ' +
                      (idx === 0
                        ? 'bg-gradient-gold text-atfr-ink'
                        : 'bg-atfr-graphite text-atfr-bone border border-atfr-gold/20')
                    }
                  >
                    {idx === 0 ? <Crown size={20} /> : `#${idx + 1}`}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-atfr-bone truncate">
                      {p.nickname}
                    </p>
                    <p className="text-xs text-atfr-fog">
                      {ROLE_TRANSLATIONS[p.role] ?? p.role}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className={`font-display text-xl ${wn8Color(p.wn8)}`}>
                      {p.wn8 != null ? Math.round(p.wn8) : '—'}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-atfr-fog">
                      WN8
                    </p>
                  </div>

                  <Badge variant="outline" className="hidden sm:inline-flex">
                    {wn8Label(p.wn8)}
                  </Badge>
                </CardBody>
              </Card>
            </motion.a>
          ))}
        </div>
      )}
    </Section>
  );
}
