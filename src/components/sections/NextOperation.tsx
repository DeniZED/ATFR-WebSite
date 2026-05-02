import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { format, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  Radio,
  ShieldCheck,
  Swords,
  Trophy,
  Users,
} from 'lucide-react';
import { Badge, Button, Section, Spinner } from '@/components/ui';
import { useEvents } from '@/features/events/queries';
import { EVENT_TYPE_LABELS } from '@/lib/constants';
import type { Database, EventType } from '@/types/database';

type EventRow = Database['public']['Tables']['events']['Row'];

const EVENT_ICONS: Record<EventType, LucideIcon> = {
  training: ShieldCheck,
  competition: Swords,
  tournament: Trophy,
  meeting: Users,
  special: Radio,
};

function eventTimeLabel(event: EventRow) {
  const start = parseISO(event.starts_at);
  const end = event.ends_at ? parseISO(event.ends_at) : null;

  if (!end) return format(start, 'HH:mm');
  if (!isSameDay(start, end)) {
    return `${format(start, 'HH:mm')} → ${format(end, "d MMM HH:mm", {
      locale: fr,
    })}`;
  }
  return `${format(start, 'HH:mm')} → ${format(end, 'HH:mm')}`;
}

export function NextOperation() {
  const { data, isLoading } = useEvents();
  const events = useMemo(() => {
    const now = Date.now();
    return (data ?? [])
      .filter((event) => {
        const start = parseISO(event.starts_at).getTime();
        const end = event.ends_at ? parseISO(event.ends_at).getTime() : start;
        return end >= now;
      })
      .slice(0, 3);
  }, [data]);

  const featured = events[0];
  const queue = events.slice(1);
  const FeaturedIcon = featured ? EVENT_ICONS[featured.type] : Calendar;

  return (
    <Section
      eyebrow="Agenda clan"
      title="Prochaine opération"
      description="Une home plus vivante montre immédiatement ce qui arrive : entraînement, tournoi, soirée clan ou rendez-vous vocal."
      className="pt-10 sm:pt-16"
    >
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner label="Chargement..." />
        </div>
      ) : !featured ? (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative overflow-hidden rounded-xl border border-atfr-gold/15 bg-atfr-carbon p-8 text-center"
        >
          <div
            className="absolute inset-0 bg-grid bg-[size:40px_40px] opacity-20"
            aria-hidden
          />
          <div className="relative mx-auto max-w-2xl">
            <Calendar size={34} className="mx-auto text-atfr-gold" />
            <h3 className="mt-4 font-display text-2xl text-atfr-bone">
              Aucun événement public planifié
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-atfr-fog">
              Ajoute le prochain entraînement ou tournoi depuis l'admin pour le
              faire apparaître ici automatiquement.
            </p>
            <Link to="/evenements" className="mt-6 inline-flex">
              <Button variant="outline" trailingIcon={<ArrowRight size={14} />}>
                Voir l'agenda
              </Button>
            </Link>
          </div>
        </motion.div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <motion.article
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
            className="group relative overflow-hidden rounded-xl border border-atfr-gold/20 bg-atfr-carbon p-7 sm:p-8"
          >
            <div
              className="absolute inset-0 bg-grid bg-[size:42px_42px] opacity-20"
              aria-hidden
            />
            <div
              className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-atfr-gold/80 to-transparent"
              aria-hidden
            />
            <div className="relative flex flex-col gap-7 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-atfr-gold/40 bg-atfr-gold/10 text-atfr-gold">
                  <FeaturedIcon size={26} strokeWidth={1.6} />
                </div>
                <div>
                  <Badge variant="gold">
                    {EVENT_TYPE_LABELS[featured.type]}
                  </Badge>
                  <h3 className="mt-4 font-display text-3xl text-atfr-bone sm:text-4xl">
                    {featured.title}
                  </h3>
                  {featured.description && (
                    <p className="mt-4 max-w-2xl text-sm leading-relaxed text-atfr-fog">
                      {featured.description}
                    </p>
                  )}
                </div>
              </div>
              <Link to="/evenements" className="shrink-0">
                <Button variant="outline" trailingIcon={<ArrowRight size={14} />}>
                  Agenda
                </Button>
              </Link>
            </div>

            <div className="relative mt-8 grid gap-3 sm:grid-cols-3">
              <Info
                icon={<Calendar size={15} />}
                label="Date"
                value={format(parseISO(featured.starts_at), 'EEEE d MMMM', {
                  locale: fr,
                })}
              />
              <Info
                icon={<Clock size={15} />}
                label="Horaire"
                value={eventTimeLabel(featured)}
              />
              <Info
                icon={<MapPin size={15} />}
                label="Lieu"
                value={featured.location || 'Discord / World of Tanks'}
              />
            </div>
          </motion.article>

          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.2, 0.8, 0.2, 1] }}
            className="rounded-xl border border-atfr-gold/15 bg-atfr-graphite/60 p-5"
          >
            <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold">
              File d'attente
            </p>
            {queue.length === 0 ? (
              <p className="mt-5 text-sm leading-relaxed text-atfr-fog">
                Aucun autre événement public à venir. Le prochain ajout admin
                remontera automatiquement ici.
              </p>
            ) : (
              <div className="mt-5 space-y-3">
                {queue.map((event) => {
                  const Icon = EVENT_ICONS[event.type];
                  return (
                    <Link
                      key={event.id}
                      to="/evenements"
                      className="group flex gap-3 rounded-lg border border-atfr-gold/10 bg-atfr-ink/40 p-3 transition-colors hover:border-atfr-gold/40"
                    >
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-atfr-gold/25 text-atfr-gold">
                        <Icon size={17} strokeWidth={1.6} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-atfr-bone">
                          {event.title}
                        </p>
                        <p className="mt-1 text-xs text-atfr-fog">
                          {format(parseISO(event.starts_at), 'd MMM', {
                            locale: fr,
                          })}{' '}
                          · {eventTimeLabel(event)}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </Section>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-atfr-gold/15 bg-atfr-ink/45 p-4">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-atfr-gold/80">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-sm font-medium text-atfr-bone">{value}</p>
    </div>
  );
}
