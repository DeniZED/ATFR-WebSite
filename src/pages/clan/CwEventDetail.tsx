import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  AlertTriangle,
  CalendarDays,
  Check,
  ClipboardList,
  LayoutDashboard,
  Shield,
  Swords,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { Section, Card, CardBody, CardTitle, Badge, Button, Input, Textarea, Alert, Spinner, StatCard, Switch } from '@/components/ui';
import { usePlayerIdentity } from '@/features/identity/usePlayerIdentity';
import { useCwEvent, useRegisterToCwEvent, type CwEventDetail as CwEventDetailData } from '@/features/cw/queries';
import { CW_EVENT_STATUS_LABELS, type CwEventStatus } from '@/types/database';

type Tab = 'dashboard' | 'inscription';

const STATUS_VARIANT: Record<CwEventStatus, 'neutral' | 'success' | 'warning' | 'gold'> = {
  draft: 'neutral',
  open: 'success',
  closed: 'warning',
  archived: 'neutral',
};

function formatDay(day: { day: string; label: string | null }) {
  return day.label ?? new Date(day.day).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit' });
}

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

  const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inscription', label: 'Inscription', icon: ClipboardList },
  ];

  return (
    <Section
      eyebrow="Espace membres"
      title={event.title}
      description={event.description ?? undefined}
      className="pt-10 sm:pt-16"
    >
      <div className="mb-8 flex flex-wrap items-center gap-3 rounded-xl border border-atfr-gold/10 bg-atfr-carbon/60 px-4 py-3">
        <Badge variant={STATUS_VARIANT[event.status]}>{CW_EVENT_STATUS_LABELS[event.status]}</Badge>
        <span className="inline-flex items-center gap-1.5 text-xs text-atfr-fog">
          <CalendarDays size={14} strokeWidth={1.8} />
          {new Date(event.starts_at).toLocaleDateString('fr-FR')} — {new Date(event.ends_at).toLocaleDateString('fr-FR')}
        </span>
        {event.slot_start_time && event.slot_end_time && (
          <span className="text-xs text-atfr-fog">
            Créneau : {event.slot_start_time.slice(0, 5)} – {event.slot_end_time.slice(0, 5)}
          </span>
        )}
      </div>

      <div className="mb-8 inline-flex gap-1 rounded-xl border border-atfr-gold/10 bg-atfr-carbon/60 p-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium tracking-wide transition-colors ${
                active
                  ? 'bg-atfr-gold/15 text-atfr-gold'
                  : 'text-atfr-fog hover:text-atfr-bone'
              }`}
            >
              <Icon size={15} strokeWidth={1.8} />
              {t.label}
            </button>
          );
        })}
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

    const isAvailable = (registrationId: string, dayId: string) =>
      event.availability.some(
        (a) => a.registration_id === registrationId && a.event_day_id === dayId && a.available,
      );

    const pseudoFor = (registrationId: string) =>
      event.registrations.find((r) => r.id === registrationId)?.pseudo ?? '?';

    const luStats = event.lus.map((lu) => {
      const members = event.luMembers
        .filter((m) => m.lu_id === lu.id)
        .map((m) => ({ ...m, pseudo: pseudoFor(m.registration_id) }));
      const titulaires = members.filter((m) => m.role === 'titulaire');
      const remplacants = members.filter((m) => m.role === 'remplacant');

      const perDay = event.days.map((day) => {
        const absentTitulaires = titulaires.filter((t) => !isAvailable(t.registration_id, day.id));
        const availableRemplacants = remplacants.filter((r) => isAvailable(r.registration_id, day.id));
        const result = event.luDayResults.find((r) => r.lu_id === lu.id && r.event_day_id === day.id);
        return {
          day,
          availableTitulaires: titulaires.length - absentTitulaires.length,
          totalTitulaires: titulaires.length,
          absentTitulaires,
          availableRemplacants,
          wins: result?.wins ?? 0,
          losses: result?.losses ?? 0,
        };
      });

      const wins = perDay.reduce((sum, d) => sum + d.wins, 0);
      const losses = perDay.reduce((sum, d) => sum + d.losses, 0);
      const winRate = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : null;
      const replacementsNeeded = perDay.filter((d) => d.absentTitulaires.length > 0).length;

      return { lu, titulaires, remplacants, perDay, wins, losses, winRate, replacementsNeeded };
    });

    const clanWins = luStats.reduce((sum, l) => sum + l.wins, 0);
    const clanLosses = luStats.reduce((sum, l) => sum + l.losses, 0);
    const clanWinRate = clanWins + clanLosses > 0 ? Math.round((clanWins / (clanWins + clanLosses)) * 100) : null;

    return { totalRegistrations, dayStats, luStats, clanWins, clanLosses, clanWinRate };
  }, [event]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Inscrits" value={stats.totalRegistrations} icon={<Users size={18} strokeWidth={1.8} />} />
        <StatCard label="Line-Up créées" value={event.lus.length} icon={<Swords size={18} strokeWidth={1.8} />} />
        <StatCard label="Soirées" value={event.days.length} icon={<CalendarDays size={18} strokeWidth={1.8} />} />
        <StatCard
          label="Bilan du clan"
          value={`${stats.clanWins} – ${stats.clanLosses}`}
          hint={stats.clanWinRate !== null ? `${stats.clanWinRate}% de victoires` : 'Aucun résultat saisi'}
          icon={<Trophy size={18} strokeWidth={1.8} />}
        />
      </div>

      <Card>
        <CardBody>
          <div className="flex items-center justify-between gap-3 mb-1">
            <CardTitle>Inscrits &amp; disponibilités</CardTitle>
            <span className="text-xs text-atfr-fog">{stats.totalRegistrations} joueur{stats.totalRegistrations > 1 ? 's' : ''}</span>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="text-left text-atfr-fog">
                  <th className="py-2 pr-4 sticky left-0 bg-atfr-carbon">Pseudo</th>
                  {event.days.map((day) => (
                    <th key={day.id} className="py-2 px-2 text-center font-medium">
                      {formatDay(day)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {event.registrations.map((reg) => (
                  <tr key={reg.id} className="border-t border-atfr-gold/10 hover:bg-atfr-gold/5 transition-colors">
                    <td className="py-2.5 pr-4 sticky left-0 bg-atfr-carbon">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full bg-atfr-gold/15 text-atfr-gold text-[10px] font-semibold flex items-center justify-center uppercase">
                          {reg.pseudo.slice(0, 2)}
                        </span>
                        <span className="text-atfr-bone">{reg.pseudo}</span>
                      </span>
                    </td>
                    {event.days.map((day) => {
                      const avail = event.availability.find(
                        (a) => a.registration_id === reg.id && a.event_day_id === day.id,
                      );
                      return (
                        <td key={day.id} className="py-2.5 px-2 text-center">
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
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-atfr-gold/20 font-medium">
                  <td className="py-2.5 pr-4 text-atfr-fog sticky left-0 bg-atfr-carbon">Dispo / total</td>
                  {stats.dayStats.map(({ day, availCount, total }) => (
                    <td key={day.id} className="py-2.5 px-2 text-center text-atfr-fog">
                      {availCount}/{total}
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
            {!event.registrations.length && (
              <p className="text-sm text-atfr-fog py-6 text-center">Aucune inscription pour le moment.</p>
            )}
          </div>
        </CardBody>
      </Card>

      <div>
        <h3 className="font-display text-lg text-atfr-bone mb-4">Line-Up</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {stats.luStats.map(({ lu, titulaires, remplacants, perDay, wins, losses, winRate, replacementsNeeded }) => (
            <Card key={lu.id}>
              <CardBody className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="h-9 w-9 shrink-0 rounded-lg bg-atfr-gold/10 border border-atfr-gold/30 text-atfr-gold flex items-center justify-center">
                      <Shield size={16} strokeWidth={1.8} />
                    </span>
                    <div>
                      <CardTitle className="text-base">{lu.name}</CardTitle>
                      <p className="text-xs text-atfr-fog">
                        {titulaires.length} titulaires · {remplacants.length} remplaçants
                      </p>
                    </div>
                  </div>
                  {replacementsNeeded > 0 && (
                    <Badge variant="warning" className="shrink-0">
                      <AlertTriangle size={11} strokeWidth={2.2} />
                      {replacementsNeeded}
                    </Badge>
                  )}
                </div>

                <div className="rounded-lg bg-atfr-ink/60 px-3 py-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-atfr-fog">Bilan</span>
                    <span className="font-medium text-atfr-bone">
                      {wins}V – {losses}D{winRate !== null ? ` (${winRate}%)` : ''}
                    </span>
                  </div>
                  {winRate !== null && (
                    <div className="h-1.5 rounded-full bg-atfr-graphite overflow-hidden">
                      <div
                        className={`h-full rounded-full ${winRate >= 50 ? 'bg-atfr-success' : 'bg-atfr-danger'}`}
                        style={{ width: `${winRate}%` }}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {perDay.map(({ day, availableTitulaires, totalTitulaires, absentTitulaires, availableRemplacants, wins: dWins, losses: dLosses }) => {
                    const incomplete = absentTitulaires.length > 0;
                    return (
                      <div
                        key={day.id}
                        className={`rounded-md px-3 py-2 text-xs space-y-1.5 border ${
                          incomplete ? 'border-atfr-warning/30 bg-atfr-warning/5' : 'border-transparent bg-atfr-ink/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-atfr-fog font-medium">{formatDay(day)}</span>
                          <span className="flex items-center gap-2">
                            <Badge variant={incomplete ? 'warning' : 'success'} className="px-2 py-0">
                              {availableTitulaires}/{totalTitulaires} dispo
                            </Badge>
                            {(dWins > 0 || dLosses > 0) && (
                              <span className="text-atfr-bone tabular-nums">{dWins}V – {dLosses}D</span>
                            )}
                          </span>
                        </div>
                        {incomplete && (
                          <div className="flex flex-wrap items-start gap-1.5 text-[11px] leading-relaxed">
                            <span className="text-atfr-warning/90">
                              Absents : {absentTitulaires.map((t) => t.pseudo).join(', ')}
                            </span>
                            {availableRemplacants.length > 0 ? (
                              <span className="text-atfr-success">
                                → dispo : {availableRemplacants.map((r) => r.pseudo).join(', ')}
                              </span>
                            ) : (
                              <span className="text-atfr-danger">→ aucun remplaçant dispo</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {!perDay.length && <p className="text-xs text-atfr-fog">Aucune soirée définie.</p>}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
        {!stats.luStats.length && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-atfr-gold/15 bg-atfr-graphite/30 py-12">
            <Swords size={24} strokeWidth={1.6} className="text-atfr-fog" />
            <p className="text-sm text-atfr-fog">Aucune LU créée pour cette campagne.</p>
          </div>
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
    return (
      <Alert tone="warning" title="Inscriptions fermées">
        Les inscriptions ne sont pas ouvertes pour cette campagne.
      </Alert>
    );
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

  const availableCount = Object.values(availability).filter(Boolean).length;

  return (
    <Card className="max-w-2xl">
      <CardBody className="space-y-6">
        <div>
          <CardTitle>{existing ? 'Modifier mon inscription' : "M'inscrire à la campagne"}</CardTitle>
          <p className="text-xs text-atfr-fog mt-1">
            Indique ta disponibilité pour chaque soirée, ça nous permet d'organiser les Line-Up.
          </p>
        </div>
        <Input
          label="Pseudo"
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
          placeholder="Ton pseudo WoT"
        />
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium uppercase tracking-wider text-atfr-fog">
              Disponibilités
            </p>
            {event.days.length > 0 && (
              <span className="text-xs text-atfr-fog">{availableCount}/{event.days.length} soirées</span>
            )}
          </div>
          <div className="space-y-2">
            {event.days.map((day) => (
              <div key={day.id} className="rounded-md bg-atfr-ink/60 px-3 py-2.5">
                <Switch
                  checked={availability[day.id] ?? false}
                  onChange={(next) => setAvailability((a) => ({ ...a, [day.id]: next }))}
                  label={day.label ?? new Date(day.day).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })}
                />
              </div>
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
        {done && (
          <Alert tone="success" title="Inscription enregistrée">
            Tu peux revenir modifier tes disponibilités à tout moment.
          </Alert>
        )}
      </CardBody>
    </Card>
  );
}
