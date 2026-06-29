import { Link } from 'react-router-dom';
import { Swords } from 'lucide-react';
import { Section, Card, CardBody, Badge, Spinner } from '@/components/ui';
import { useCwEvents } from '@/features/cw/queries';
import { CW_EVENT_STATUS_LABELS, type CwEventStatus } from '@/types/database';

const STATUS_VARIANT: Record<CwEventStatus, 'neutral' | 'success' | 'warning'> = {
  draft: 'neutral',
  open: 'success',
  closed: 'warning',
  archived: 'neutral',
};

export default function CwEventsList() {
  const { data: events, isLoading } = useCwEvents();

  return (
    <Section
      eyebrow="Espace membres"
      title="Clan Wars"
      description="Campagnes CW : inscriptions, dispo et composition des Line-Up."
      className="pt-10 sm:pt-16"
    >
      {isLoading ? (
        <div className="py-16 flex justify-center"><Spinner label="Chargement…" /></div>
      ) : !events?.length ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 rounded-xl border border-atfr-gold/15 bg-atfr-graphite/40">
          <div className="h-14 w-14 rounded-xl border border-atfr-gold/30 bg-atfr-gold/10 flex items-center justify-center text-atfr-gold">
            <Swords size={26} strokeWidth={1.6} />
          </div>
          <p className="text-sm text-atfr-fog">Aucune campagne CW pour le moment.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link key={event.id} to={`/clan/evenements/${event.id}`}>
              <Card className="h-full">
                <CardBody className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={STATUS_VARIANT[event.status]}>
                      {CW_EVENT_STATUS_LABELS[event.status]}
                    </Badge>
                  </div>
                  <h3 className="font-display text-lg text-atfr-bone">{event.title}</h3>
                  <p className="text-xs text-atfr-fog">
                    {new Date(event.starts_at).toLocaleDateString('fr-FR')} —{' '}
                    {new Date(event.ends_at).toLocaleDateString('fr-FR')}
                  </p>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </Section>
  );
}
