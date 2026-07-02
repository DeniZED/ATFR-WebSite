import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Check, Plus, Shield, Swords, Trophy, X } from 'lucide-react';
import { Badge, Button, Card, CardBody, CardTitle, Input, Select, Spinner } from '@/components/ui';
import {
  useCwEvent,
  useDeleteCwLu,
  useSetCwLus,
  useSetLuDayResult,
  useSetRegistrationLu,
  type CwEventDetail as CwEventDetailData,
} from '@/features/cw/queries';
import { useConfirm } from '@/hooks/useConfirm';

function formatDay(day: { day: string; label: string | null }) {
  return day.label ?? new Date(day.day).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}

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
      <div className="flex items-center gap-3">
        <span className="h-11 w-11 rounded-xl bg-atfr-gold/10 border border-atfr-gold/30 text-atfr-gold flex items-center justify-center shrink-0">
          <Swords size={20} strokeWidth={1.8} />
        </span>
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold mb-1">Clan Wars</p>
          <h1 className="font-display text-3xl text-atfr-bone">{event.title}</h1>
        </div>
      </div>

      <LuPanel event={event} />
      <ResultsPanel event={event} />
      <RegistrationsTable event={event} />
    </div>
  );
}

function LuPanel({ event }: { event: CwEventDetailData }) {
  const setLu = useSetCwLus();
  const deleteLu = useDeleteCwLu();
  const confirmDialog = useConfirm();
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
            <Badge key={lu.id} variant="outline" className="gap-2 py-1">
              <Shield size={11} strokeWidth={2} />
              {lu.name}
              <button
                onClick={async () => {
                  if (
                    await confirmDialog({
                      message: `Supprimer ${lu.name} ?`,
                      tone: 'danger',
                      confirmLabel: 'Supprimer',
                    })
                  )
                    deleteLu.mutate({ luId: lu.id, eventId: event.id });
                }}
                className="text-atfr-fog hover:text-atfr-danger transition-colors"
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

function ResultsPanel({ event }: { event: CwEventDetailData }) {
  const setResult = useSetLuDayResult();

  function resultFor(luId: string, dayId: string) {
    return event.luDayResults.find((r) => r.lu_id === luId && r.event_day_id === dayId);
  }

  if (!event.lus.length) {
    return (
      <Card>
        <CardBody>
          <CardTitle>Résultats</CardTitle>
          <p className="text-xs text-atfr-fog mt-2">Créez une LU pour pouvoir saisir des résultats.</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody>
        <div className="flex items-center gap-2 mb-1">
          <Trophy size={16} strokeWidth={1.8} className="text-atfr-gold" />
          <CardTitle>Résultats (saisie manuelle)</CardTitle>
        </div>
        <p className="text-xs text-atfr-fog mb-4">Victoires / défaites par LU et par soirée. Aucune stat WoT automatique : tout est saisi à la main.</p>
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="text-left text-atfr-fog">
                <th className="py-2 px-2 sticky left-0 bg-atfr-carbon">LU</th>
                {event.days.map((day) => (
                  <th key={day.id} className="py-2 px-2 text-center font-medium">
                    {formatDay(day)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {event.lus.map((lu) => (
                <tr key={lu.id} className="border-t border-atfr-gold/10">
                  <td className="py-2 px-2 text-atfr-bone font-medium sticky left-0 bg-atfr-carbon">{lu.name}</td>
                  {event.days.map((day) => {
                    const result = resultFor(lu.id, day.id);
                    return (
                      <td key={day.id} className="py-2 px-2">
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            min={0}
                            value={result?.wins ?? 0}
                            onChange={(e) =>
                              setResult.mutate({
                                eventId: event.id,
                                eventDayId: day.id,
                                luId: lu.id,
                                wins: Number(e.target.value) || 0,
                                losses: result?.losses ?? 0,
                              })
                            }
                            className="w-12 rounded-md bg-atfr-ink/80 border border-atfr-success/30 text-atfr-success text-center px-1 py-1.5 focus:border-atfr-success focus:outline-none"
                            aria-label={`Victoires ${lu.name} ${day.day}`}
                          />
                          <span className="text-atfr-fog text-xs">/</span>
                          <input
                            type="number"
                            min={0}
                            value={result?.losses ?? 0}
                            onChange={(e) =>
                              setResult.mutate({
                                eventId: event.id,
                                eventDayId: day.id,
                                luId: lu.id,
                                wins: result?.wins ?? 0,
                                losses: Number(e.target.value) || 0,
                              })
                            }
                            className="w-12 rounded-md bg-atfr-ink/80 border border-atfr-danger/30 text-atfr-danger text-center px-1 py-1.5 focus:border-atfr-danger focus:outline-none"
                            aria-label={`Défaites ${lu.name} ${day.day}`}
                          />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
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
        <div className="flex items-center justify-between gap-3 mb-4">
          <CardTitle>Inscriptions &amp; affectations</CardTitle>
          <span className="text-xs text-atfr-fog">{event.registrations.length} inscrit{event.registrations.length > 1 ? 's' : ''}</span>
        </div>
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="text-left text-atfr-fog">
                <th className="py-2 px-2 sticky left-0 bg-atfr-carbon">Pseudo</th>
                <th className="py-2 px-2">LU</th>
                <th className="py-2 px-2">Statut</th>
                <th className="py-2 px-2">Commentaire</th>
                {event.days.map((day) => (
                  <th key={day.id} className="py-2 px-2 text-center font-medium">
                    {formatDay(day)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {event.registrations.map((reg) => {
                const member = luForRegistration(reg.id);
                return (
                  <tr key={reg.id} className="border-t border-atfr-gold/10 hover:bg-atfr-gold/5 transition-colors">
                    <td className="py-2 px-2 sticky left-0 bg-atfr-carbon">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full bg-atfr-gold/15 text-atfr-gold text-[10px] font-semibold flex items-center justify-center uppercase">
                          {reg.pseudo.slice(0, 2)}
                        </span>
                        <span className="text-atfr-bone">{reg.pseudo}</span>
                      </span>
                    </td>
                    <td className="py-2 px-2">
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
                        className="w-auto text-xs py-1.5"
                      >
                        <option value="">—</option>
                        {event.lus.map((lu) => (
                          <option key={lu.id} value={lu.id}>{lu.name}</option>
                        ))}
                      </Select>
                    </td>
                    <td className="py-2 px-2">
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
                        className="w-auto text-xs py-1.5"
                      >
                        <option value="titulaire">Titulaire</option>
                        <option value="remplacant">Remplaçant</option>
                      </Select>
                    </td>
                    <td className="py-2 px-2 text-atfr-fog text-xs max-w-[16rem] truncate" title={reg.comment ?? ''}>
                      {reg.comment ?? '—'}
                    </td>
                    {event.days.map((day) => {
                      const avail = event.availability.find(
                        (a) => a.registration_id === reg.id && a.event_day_id === day.id,
                      );
                      return (
                        <td key={day.id} className="py-2 px-2 text-center">
                          {avail?.available ? (
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-atfr-success/15 text-atfr-success">
                              <Check size={12} strokeWidth={2.4} />
                            </span>
                          ) : (
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-atfr-warning/10 text-atfr-warning/70">
                              <X size={12} strokeWidth={2.4} />
                            </span>
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
