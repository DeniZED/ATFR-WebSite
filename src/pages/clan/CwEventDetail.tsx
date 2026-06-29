import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Section, Card, CardBody, CardTitle, Badge, Button, Input, Textarea, Spinner, StatCard } from '@/components/ui';
import { usePlayerIdentity } from '@/features/identity/usePlayerIdentity';
import { useCwEvent, useRegisterToCwEvent, type CwEventDetail as CwEventDetailData } from '@/features/cw/queries';
import { CW_EVENT_STATUS_LABELS } from '@/types/database';

type Tab = 'dashboard' | 'inscription';

export default function CwEventDetail() {
  const { eventId } = useParams<{ eventId: string }>();
  const { data: event, isLoading } = useCwEvent(eventId);
  const [tab, setTab] = useState<Tab>('dashboard');

  if (isLoading || !event) {
    return (
      <Section eyebrow="Espace membres" title="Clan Wars" className="pt-10 sm:pt-16">
        <div className="py-16 flex justify-center"><Spinner label="Chargement…" /></div>
      </Section>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'inscription', label: 'Inscription' },
  ];

  return (
    <Section
      eyebrow="Espace membres"
      title={event.title}
      description={event.description ?? undefined}
      className="pt-10 sm:pt-16"
    >
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Badge variant="gold">{CW_EVENT_STATUS_LABELS[event.status]}</Badge>
        <span className="text-xs text-atfr-fog">
          {new Date(event.starts_at).toLocaleDateString('fr-FR')} —{' '}
          {new Date(event.ends_at).toLocaleDateString('fr-FR')}
        </span>
      </div>

      <div className="mb-8 flex gap-2 border-b border-atfr-gold/10">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium tracking-wide transition-colors border-b-2 ${
              tab === t.id
                ? 'border-atfr-gold text-atfr-gold'
                : 'border-transparent text-atfr-fog hover:text-atfr-bone'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && <DashboardTab event={event} />}
      {tab === 'inscription' && <InscriptionTab event={event} />}
    </Section>
  );
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

function DashboardTab({ event }: { event: CwEventDetailData }) {
  const stats = useMemo(() => {
    const totalRegistrations = event.registrations.length;
    const dayStats = event.days.map((day) => {
      const availCount = event.availability.filter(
        (a) => a.event_day_id === day.id && a.available,
      ).length;
      return { day, availCount, total: totalRegistrations };
    });

    const luStats = event.lus.map((lu) => {
      const members = event.luMembers.filter((m) => m.lu_id === lu.id);
      const titulaires = members.filter((m) => m.role === 'titulaire');
      const remplacants = members.filter((m) => m.role === 'remplacant');
      const perDay = event.days.map((day) => {
        const availableTitulaires = titulaires.filter((t) =>
          event.availability.some(
            (a) => a.registration_id === t.registration_id && a.event_day_id === day.id && a.available,
          ),
        ).length;
        return { day, availableTitulaires, totalTitulaires: titulaires.length };
      });
      return { lu, titulaires, remplacants, perDay };
    });

    return { totalRegistrations, dayStats, luStats };
  }, [event]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard label="Inscrits" value={stats.totalRegistrations} />
        <StatCard label="Line-Up créées" value={event.lus.length} />
        <StatCard label="Soirées" value={event.days.length} />
      </div>

      <Card>
        <CardBody>
          <CardTitle>Dispo par soirée</CardTitle>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-atfr-fog">
                  <th className="py-2 pr-4">Soirée</th>
                  <th className="py-2">Dispo</th>
                </tr>
              </thead>
              <tbody>
                {stats.dayStats.map(({ day, availCount, total }) => (
                  <tr key={day.id} className="border-t border-atfr-gold/10">
                    <td className="py-2 pr-4 text-atfr-bone">
                      {day.label ?? new Date(day.day).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-2 text-atfr-fog">
                      {availCount} / {total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <CardTitle>Inscrits</CardTitle>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="text-left text-atfr-fog">
                  <th className="py-2 pr-4">Pseudo</th>
                  {event.days.map((day) => (
                    <th key={day.id} className="py-2 px-2 text-center">
                      {day.label ?? new Date(day.day).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {event.registrations.map((reg) => (
                  <tr key={reg.id} className="border-t border-atfr-gold/10">
                    <td className="py-2 pr-4 text-atfr-bone">{reg.pseudo}</td>
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
                ))}
              </tbody>
            </table>
            {!event.registrations.length && (
              <p className="text-sm text-atfr-fog py-6 text-center">Aucune inscription pour le moment.</p>
            )}
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {stats.luStats.map(({ lu, titulaires, remplacants, perDay }) => (
          <Card key={lu.id}>
            <CardBody className="space-y-3">
              <div className="flex items-center justify-between">
                <CardTitle>{lu.name}</CardTitle>
                <span className="text-xs text-atfr-fog">
                  {titulaires.length} titulaires · {remplacants.length} remplaçants
                </span>
              </div>
              <div className="space-y-1">
                {perDay.map(({ day, availableTitulaires, totalTitulaires }) => {
                  const incomplete = totalTitulaires > 0 && availableTitulaires < totalTitulaires;
                  return (
                    <div key={day.id} className="flex items-center justify-between text-xs">
                      <span className="text-atfr-fog">
                        {day.label ?? new Date(day.day).toLocaleDateString('fr-FR')}
                      </span>
                      <span className={incomplete ? 'text-atfr-warning' : 'text-atfr-success'}>
                        {availableTitulaires} / {totalTitulaires}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        ))}
        {!stats.luStats.length && (
          <p className="text-sm text-atfr-fog">Aucune LU créée pour cette campagne.</p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inscription
// ---------------------------------------------------------------------------

function InscriptionTab({ event }: { event: CwEventDetailData }) {
  const identity = usePlayerIdentity();
  const register = useRegisterToCwEvent();

  const existing = useMemo(
    () => event.registrations.find((r) => r.account_id === identity.accountId),
    [event.registrations, identity.accountId],
  );

  const [pseudo, setPseudo] = useState(existing?.pseudo ?? identity.nickname ?? '');
  const [comment, setComment] = useState(existing?.comment ?? '');
  const [availability, setAvailability] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const day of event.days) {
      const existingAvail = existing
        ? event.availability.find((a) => a.registration_id === existing.id && a.event_day_id === day.id)
        : undefined;
      initial[day.id] = existingAvail?.available ?? true;
    }
    return initial;
  });
  const [done, setDone] = useState(false);

  if (event.status !== 'open' && !existing) {
    return <p className="text-sm text-atfr-fog">Les inscriptions ne sont pas ouvertes pour cette campagne.</p>;
  }

  async function handleSubmit() {
    if (!pseudo.trim()) return;
    await register.mutateAsync({
      eventId: event.id,
      accountId: identity.accountId,
      pseudo: pseudo.trim(),
      comment: comment.trim() || null,
      availability: event.days.map((d) => ({ eventDayId: d.id, available: availability[d.id] ?? false })),
    });
    setDone(true);
  }

  return (
    <Card className="max-w-2xl">
      <CardBody className="space-y-5">
        <CardTitle>{existing ? 'Modifier mon inscription' : "M'inscrire à la campagne"}</CardTitle>
        <Input
          label="Pseudo"
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
          placeholder="Ton pseudo WoT"
        />
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-atfr-fog mb-2">
            Disponibilités
          </p>
          <div className="space-y-2">
            {event.days.map((day) => (
              <label key={day.id} className="flex items-center justify-between rounded-md bg-atfr-ink/60 px-3 py-2">
                <span className="text-sm text-atfr-bone">
                  {day.label ?? new Date(day.day).toLocaleDateString('fr-FR')}
                </span>
                <input
                  type="checkbox"
                  checked={availability[day.id] ?? false}
                  onChange={(e) => setAvailability((a) => ({ ...a, [day.id]: e.target.checked }))}
                  className="h-4 w-4 accent-atfr-gold"
                />
              </label>
            ))}
            {!event.days.length && (
              <p className="text-sm text-atfr-fog">Aucune soirée définie pour le moment.</p>
            )}
          </div>
        </div>
        <Textarea
          label="Commentaire (optionnel)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Indisponibilités particulières, remarques..."
        />
        <Button variant="primary" onClick={handleSubmit} disabled={register.isPending}>
          {existing ? 'Mettre à jour' : "S'inscrire"}
        </Button>
        {done && <p className="text-sm text-atfr-success">Inscription enregistrée.</p>}
      </CardBody>
    </Card>
  );
}
