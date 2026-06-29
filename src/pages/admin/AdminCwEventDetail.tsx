import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Check, Plus, X } from 'lucide-react';
import { Badge, Button, Card, CardBody, CardTitle, Input, Select, Spinner } from '@/components/ui';
import {
  useCwEvent,
  useDeleteCwLu,
  useSetCwLus,
  useSetRegistrationLu,
  type CwEventDetail as CwEventDetailData,
} from '@/features/cw/queries';

export default function AdminCwEventDetail() {
  const { eventId } = useParams<{ eventId: string }>();
  const { data: event, isLoading } = useCwEvent(eventId);

  if (isLoading || !event) {
    return (
      <div className="py-16 flex justify-center">
        <Spinner label="Chargement…" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold mb-1">Clan Wars</p>
        <h1 className="font-display text-3xl text-atfr-bone">{event.title}</h1>
      </div>

      <LuPanel event={event} />
      <RegistrationsTable event={event} />
    </div>
  );
}

function LuPanel({ event }: { event: CwEventDetailData }) {
  const setLu = useSetCwLus();
  const deleteLu = useDeleteCwLu();
  const [name, setName] = useState('');

  function addLu() {
    if (!name.trim()) return;
    setLu.mutate({ eventId: event.id, lu: { name: name.trim() } });
    setName('');
  }

  return (
    <Card>
      <CardBody className="space-y-4">
        <CardTitle>Line-Up</CardTitle>
        <div className="flex flex-wrap gap-2">
          {event.lus.map((lu) => (
            <Badge key={lu.id} variant="outline" className="gap-2">
              {lu.name}
              <button
                onClick={() => {
                  if (confirm(`Supprimer ${lu.name} ?`)) deleteLu.mutate({ luId: lu.id, eventId: event.id });
                }}
                className="text-atfr-danger"
                aria-label="Supprimer"
              >
                <X size={12} />
              </button>
            </Badge>
          ))}
          {!event.lus.length && <p className="text-xs text-atfr-fog">Aucune LU créée.</p>}
        </div>
        <div className="flex gap-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom de la LU (ex: LU 1)" />
          <Button variant="secondary" onClick={addLu} leadingIcon={<Plus size={14} />}>
            Créer
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

function RegistrationsTable({ event }: { event: CwEventDetailData }) {
  const setRegLu = useSetRegistrationLu();

  function luForRegistration(registrationId: string) {
    return event.luMembers.find((m) => m.registration_id === registrationId);
  }

  return (
    <Card>
      <CardBody>
        <CardTitle>Inscriptions &amp; affectations</CardTitle>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="text-left text-atfr-fog">
                <th className="py-2 pr-4">Pseudo</th>
                <th className="py-2 pr-4">LU</th>
                <th className="py-2 pr-4">Statut</th>
                <th className="py-2 pr-4">Commentaire</th>
                {event.days.map((day) => (
                  <th key={day.id} className="py-2 px-2 text-center">
                    {day.label ?? new Date(day.day).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {event.registrations.map((reg) => {
                const member = luForRegistration(reg.id);
                return (
                  <tr key={reg.id} className="border-t border-atfr-gold/10">
                    <td className="py-2 pr-4 text-atfr-bone">{reg.pseudo}</td>
                    <td className="py-2 pr-4">
                      <Select
                        value={member?.lu_id ?? ''}
                        onChange={(e) =>
                          setRegLu.mutate({
                            eventId: event.id,
                            registrationId: reg.id,
                            luId: e.target.value || null,
                            role: member?.role ?? 'titulaire',
                          })
                        }
                        className="w-auto text-xs py-1"
                      >
                        <option value="">—</option>
                        {event.lus.map((lu) => (
                          <option key={lu.id} value={lu.id}>{lu.name}</option>
                        ))}
                      </Select>
                    </td>
                    <td className="py-2 pr-4">
                      <Select
                        value={member?.role ?? 'titulaire'}
                        disabled={!member}
                        onChange={(e) =>
                          member &&
                          setRegLu.mutate({
                            eventId: event.id,
                            registrationId: reg.id,
                            luId: member.lu_id,
                            role: e.target.value as 'titulaire' | 'remplacant',
                          })
                        }
                        className="w-auto text-xs py-1"
                      >
                        <option value="titulaire">Titulaire</option>
                        <option value="remplacant">Remplaçant</option>
                      </Select>
                    </td>
                    <td className="py-2 pr-4 text-atfr-fog text-xs max-w-[16rem] truncate" title={reg.comment ?? ''}>
                      {reg.comment ?? '—'}
                    </td>
                    {event.days.map((day) => {
                      const avail = event.availability.find(
                        (a) => a.registration_id === reg.id && a.event_day_id === day.id,
                      );
                      return (
                        <td key={day.id} className="py-2 px-2 text-center">
                          {avail?.available ? (
                            <Check size={14} className="inline text-atfr-success" />
                          ) : (
                            <span className="inline-block h-3 w-3 rounded-sm border border-atfr-warning bg-atfr-warning/20" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!event.registrations.length && (
            <p className="text-sm text-atfr-fog py-6 text-center">Aucune inscription pour le moment.</p>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
