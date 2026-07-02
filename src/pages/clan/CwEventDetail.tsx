import { Suspense, lazy, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  AlertTriangle,
  CalendarDays,
  Check,
  ClipboardList,
  LayoutDashboard,
  Shield,
  Star,
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

// Palette cyclique pour distinguer chaque LU visuellement (header, charts, badges).
const LU_PALETTE = ['#3B82F6', '#D946EF', '#3FA55A', '#F59E0B', '#06B6D4', '#8B5CF6', '#EC4899', '#84CC16'];

function colorFor(index: number) {
  return LU_PALETTE[index % LU_PALETTE.length];
}

function formatDay(day: { day: string; label: string | null }) {
  return day.label ?? new Date(day.day).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit' });
}

// Graphiques recharts chargés en lazy (P2-5) : le chunk recharts
// (~115 kB gzip) n'est téléchargé qu'au rendu du dashboard.
const CwEventCharts = lazy(() => import('@/components/cw/CwEventCharts'));

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

    const luStats = event.lus.map((lu, index) => {
      const members = event.luMembers
        .filter((m) => m.lu_id === lu.id)
        .map((m) => ({ ...m, pseudo: pseudoFor(m.registration_id) }));
      const titulaires = members.filter((m) => m.role === 'titulaire');
      const remplacants = members.filter((m) => m.role === 'remplacant');

      const perDay = event.days.map((day) => {
        const absentTitulaires = titulaires.filter((t) => !isAvailable(t.registration_id, day.id));
        const availableRemplacants = remplacants.filter((r) => isAvailable(r.registration_id, day.id));
        const result = event.luDayResults.find((r) => r.lu_id === lu.id && r.event_day_id === day.id);
        const wins = result?.wins ?? 0;
        const losses = result?.losses ?? 0;
        return {
          day,
          availableTitulaires: titulaires.length - absentTitulaires.length,
          totalTitulaires: titulaires.length,
          absentTitulaires,
          availableRemplacants,
          wins,
          losses,
          rate: wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : null,
        };
      });

      const wins = perDay.reduce((sum, d) => sum + d.wins, 0);
      const losses = perDay.reduce((sum, d) => sum + d.losses, 0);
      const winRate = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : null;
      const replacementsNeeded = perDay.filter((d) => d.absentTitulaires.length > 0).length;
      const presenceCountFor = (registrationId: string) =>
        event.days.filter((day) => isAvailable(registrationId, day.id)).length;

      return {
        lu,
        color: colorFor(index),
        titulaires,
        remplacants,
        perDay,
        wins,
        losses,
        winRate,
        replacementsNeeded,
        presenceCountFor,
      };
    });

    const clanWins = luStats.reduce((sum, l) => sum + l.wins, 0);
    const clanLosses = luStats.reduce((sum, l) => sum + l.losses, 0);
    const clanWinRate = clanWins + clanLosses > 0 ? Math.round((clanWins / (clanWins + clanLosses)) * 100) : null;
    const totalBattles = clanWins + clanLosses;

    const globalPie = clanWins + clanLosses > 0
      ? [
          { name: 'Victoires', value: clanWins, color: '#3FA55A' },
          { name: 'Défaites', value: clanLosses, color: '#D2453A' },
        ]
      : [];

    const luBarData = luStats.map((l) => ({ name: l.lu.name, Victoires: l.wins, Défaites: l.losses }));

    const luBattlesPie = luStats
      .map((l) => ({ name: l.lu.name, value: l.wins + l.losses, color: l.color }))
      .filter((d) => d.value > 0);

    return { totalRegistrations, dayStats, luStats, clanWins, clanLosses, clanWinRate, totalBattles, globalPie, luBarData, luBattlesPie };
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

      <Suspense
        fallback={
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        }
      >
        <CwEventCharts
          globalPie={stats.globalPie}
          luBarData={stats.luBarData}
          luBattlesPie={stats.luBattlesPie}
          clanWins={stats.clanWins}
          clanLosses={stats.clanLosses}
          clanWinRate={stats.clanWinRate}
          totalBattles={stats.totalBattles}
        />
      </Suspense>

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
        <div className="grid gap-4 xl:grid-cols-2">
          {stats.luStats.map((lu) => <LuPanel key={lu.lu.id} stats={lu} days={event.days} />)}
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

type LuMemberWithPseudo = CwEventDetailData['luMembers'][number] & { pseudo: string };

interface LuStats {
  lu: CwEventDetailData['lus'][number];
  color: string;
  titulaires: LuMemberWithPseudo[];
  remplacants: LuMemberWithPseudo[];
  perDay: {
    day: CwEventDetailData['days'][number];
    availableTitulaires: number;
    totalTitulaires: number;
    absentTitulaires: LuMemberWithPseudo[];
    availableRemplacants: LuMemberWithPseudo[];
    wins: number;
    losses: number;
    rate: number | null;
  }[];
  wins: number;
  losses: number;
  winRate: number | null;
  replacementsNeeded: number;
  presenceCountFor: (registrationId: string) => number;
}

function LuPanel({ stats, days }: { stats: LuStats; days: CwEventDetailData['days'] }) {
  const { lu, color, titulaires, remplacants, perDay, wins, losses, winRate, replacementsNeeded, presenceCountFor } = stats;
  const members = [...titulaires, ...remplacants];

  return (
    <Card className="overflow-hidden" style={{ borderColor: `${color}33` }}>
      <div className="px-5 py-3 flex items-center justify-between" style={{ backgroundColor: color }}>
        <span className="font-display text-base text-white drop-shadow">{lu.name}</span>
        {replacementsNeeded > 0 && (
          <Badge className="bg-white/20 border-white/40 text-white shrink-0">
            <AlertTriangle size={11} strokeWidth={2.2} />
            {replacementsNeeded} remplacement{replacementsNeeded > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      <CardBody className="space-y-5">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-atfr-ink/60 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-atfr-fog">Victoires</p>
            <p className="text-lg font-display text-atfr-success">{wins}</p>
          </div>
          <div className="rounded-lg bg-atfr-ink/60 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-atfr-fog">Défaites</p>
            <p className="text-lg font-display text-atfr-danger">{losses}</p>
          </div>
          <div className="rounded-lg bg-atfr-ink/60 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-atfr-fog">Moyenne</p>
            <p className="text-lg font-display text-atfr-bone">{winRate !== null ? `${winRate}%` : '—'}</p>
          </div>
        </div>
        {winRate !== null && (
          <div className="h-1.5 rounded-full bg-atfr-graphite overflow-hidden -mt-2">
            <div
              className={`h-full rounded-full ${winRate >= 50 ? 'bg-atfr-success' : 'bg-atfr-danger'}`}
              style={{ width: `${winRate}%` }}
            />
          </div>
        )}

        <div>
          <p className="text-[11px] uppercase tracking-wider text-atfr-fog mb-2">
            Composition ({titulaires.length} titulaires · {remplacants.length} remplaçants)
          </p>
          <div className="grid sm:grid-cols-2 gap-1.5">
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-2 rounded-md bg-atfr-ink/40 px-2.5 py-1.5 text-xs">
                {m.role === 'titulaire' ? (
                  <Star size={12} strokeWidth={2} className="text-atfr-gold shrink-0" />
                ) : (
                  <Shield size={12} strokeWidth={2} className="text-atfr-fog shrink-0" />
                )}
                <span className="text-atfr-bone truncate">{m.pseudo}</span>
              </div>
            ))}
            {!members.length && <p className="text-xs text-atfr-fog">Aucun joueur affecté.</p>}
          </div>
        </div>

        {!!perDay.length && (
          <div>
            <p className="text-[11px] uppercase tracking-wider text-atfr-fog mb-2">Résultats par soirée</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs whitespace-nowrap">
                <thead>
                  <tr className="text-left text-atfr-fog">
                    <th className="py-1.5 pr-2">Soirée</th>
                    <th className="py-1.5 px-2 text-center">V</th>
                    <th className="py-1.5 px-2 text-center">D</th>
                    <th className="py-1.5 px-2 text-center">%</th>
                  </tr>
                </thead>
                <tbody>
                  {perDay.map(({ day, wins: dWins, losses: dLosses, rate }) => (
                    <tr key={day.id} className="border-t border-atfr-gold/10">
                      <td className="py-1.5 pr-2 text-atfr-fog">{formatDay(day)}</td>
                      <td className="py-1.5 px-2 text-center text-atfr-success">{dWins}</td>
                      <td className="py-1.5 px-2 text-center text-atfr-danger">{dLosses}</td>
                      <td className="py-1.5 px-2 text-center text-atfr-bone">{rate !== null ? `${rate}%` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!!members.length && !!days.length && (
          <div>
            <p className="text-[11px] uppercase tracking-wider text-atfr-fog mb-2">Présence des joueurs par soirée</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs whitespace-nowrap">
                <thead>
                  <tr className="text-left text-atfr-fog">
                    <th className="py-1 pr-2 sticky left-0 bg-atfr-carbon">Joueur</th>
                    {days.map((day) => (
                      <th key={day.id} className="py-1 px-1 text-center font-medium">{formatDay(day)}</th>
                    ))}
                    <th className="py-1 px-1 text-center">TT</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => {
                    const dayRow = perDay.map((d) => ({
                      dayId: d.day.id,
                      isAbsentTitulaire: m.role === 'titulaire' && d.absentTitulaires.some((t) => t.id === m.id),
                      isAvailableRemplacant: m.role === 'remplacant' && d.availableRemplacants.some((r) => r.id === m.id),
                    }));
                    return (
                      <tr key={m.id} className="border-t border-atfr-gold/10">
                        <td className="py-1 pr-2 sticky left-0 bg-atfr-carbon text-atfr-bone truncate max-w-[7rem]">{m.pseudo}</td>
                        {dayRow.map((d) => {
                          const ok = m.role === 'titulaire' ? !d.isAbsentTitulaire : d.isAvailableRemplacant;
                          return (
                            <td key={d.dayId} className="py-1 px-1 text-center">
                              <span
                                className={`inline-block h-3.5 w-3.5 rounded-sm ${ok ? 'bg-atfr-success/70' : 'bg-atfr-danger/60'}`}
                              />
                            </td>
                          );
                        })}
                        <td className="py-1 px-1 text-center text-atfr-fog">{presenceCountFor(m.registration_id)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
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
