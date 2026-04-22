import { format, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { Badge, Card, CardBody, Section, Spinner } from '@/components/ui';
import { useEvents } from '@/features/events/queries';
import { EVENT_TYPE_LABELS } from '@/lib/constants';

export default function Events() {
  const { data, isLoading, error } = useEvents();

  return (
    <Section
      eyebrow="Agenda"
      title="Prochains événements"
      description="Entraînements, tournois, soirées clan. Les événements publics sont visibles ici ; les sessions internes sont disponibles via l'admin."
    >
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner label="Chargement…" />
        </div>
      ) : error ? (
        <p className="text-center text-atfr-danger">
          Impossible de charger les événements.
        </p>
      ) : !data || data.length === 0 ? (
        <p className="text-center text-atfr-fog py-10">
          Aucun événement à venir. Reviens plus tard !
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.map((e) => {
            const start = parseISO(e.starts_at);
            const end = e.ends_at ? parseISO(e.ends_at) : null;
            return (
              <Card key={e.id}>
                <CardBody className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="font-display text-xl text-atfr-bone">
                      {e.title}
                    </h3>
                    <Badge variant="gold">
                      {EVENT_TYPE_LABELS[e.type]}
                    </Badge>
                  </div>
                  {e.description && (
                    <p className="text-sm text-atfr-fog leading-relaxed mb-4">
                      {e.description}
                    </p>
                  )}
                  <div className="grid gap-2 text-sm text-atfr-fog">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-atfr-gold" />
                      {format(start, "EEEE d MMMM yyyy", { locale: fr })}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-atfr-gold" />
                      {format(start, 'HH:mm')}
                      {end && !isSameDay(start, end)
                        ? ` → ${format(end, "d MMM HH:mm", { locale: fr })}`
                        : end
                          ? ` → ${format(end, 'HH:mm')}`
                          : ''}
                    </div>
                    {e.location && (
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-atfr-gold" />
                        {e.location}
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </Section>
  );
}
