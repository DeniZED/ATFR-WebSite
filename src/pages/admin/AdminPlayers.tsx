import { useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Clock3,
  RefreshCcw,
  Search,
  ShieldAlert,
  TriangleAlert,
  UserCheck,
  Users,
} from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  Input,
  Select,
  Spinner,
  StatCard,
} from '@/components/ui';
import {
  ACTIVITY_BADGE,
  ACTIVITY_LABELS,
  STATUS_BADGE,
  STATUS_LABELS,
  formatDateTime,
  formatDuration,
  makeCustomPeriod,
  makeRollingPeriod,
  type ActivityLevel,
  type PlayerActivitySummary,
} from '@/features/rh/activity';
import {
  useCreatePlayer,
  useHrPlayers,
  useImportMembersToPlayers,
} from '@/features/rh/queries';
import { useRole } from '@/hooks/useRole';
import type { PlayerHrStatus } from '@/types/database';
import { cn } from '@/lib/cn';

type PeriodPreset = '7' | '14' | '30' | '90' | 'custom';
type PresenceFilter = 'all' | 'present' | 'missing';

export default function AdminPlayers() {
  const navigate = useNavigate();
  const { can, isLoading: roleLoading } = useRole();
  const canManageRh = can('members');
  const [search, setSearch] = useState('');
  const [clan, setClan] = useState('all');
  const [status, setStatus] = useState<PlayerHrStatus | 'all'>('all');
  const [activity, setActivity] = useState<ActivityLevel | 'all'>('all');
  const [voice, setVoice] = useState<PresenceFilter>('all');
  const [ingame, setIngame] = useState<PresenceFilter>('all');
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>('30');
  const [customFrom, setCustomFrom] = useState(
    new Date(Date.now() - 29 * 86_400_000).toISOString().slice(0, 10),
  );
  const [customTo, setCustomTo] = useState(new Date().toISOString().slice(0, 10));
  const [newNickname, setNewNickname] = useState('');

  const period = useMemo(() => {
    if (periodPreset === 'custom') return makeCustomPeriod(customFrom, customTo);
    return makeRollingPeriod(Number(periodPreset));
  }, [customFrom, customTo, periodPreset]);

  const players = useHrPlayers(period, { enabled: canManageRh });
  const importMembers = useImportMembersToPlayers();
  const createPlayer = useCreatePlayer();

  const clanOptions = useMemo(() => {
    const values = new Set<string>();
    for (const summary of players.data?.players ?? []) {
      if (summary.player.current_clan_tag) {
        values.add(summary.player.current_clan_tag);
      }
    }
    return [...values].sort((a, b) => a.localeCompare(b));
  }, [players.data]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (players.data?.players ?? []).filter((summary) => {
      const player = summary.player;
      const link = summary.discordLink;
      const matchesSearch =
        !query ||
        player.nickname.toLowerCase().includes(query) ||
        link?.discord_tag?.toLowerCase().includes(query) ||
        String(player.account_id ?? '').includes(query) ||
        Boolean(link?.discord_user_id.includes(query));
      const matchesClan = clan === 'all' || player.current_clan_tag === clan;
      const matchesStatus = status === 'all' || player.status === status;
      const matchesActivity =
        activity === 'all' || summary.score.level === activity;
      const matchesVoice =
        voice === 'all' ||
        (voice === 'present'
          ? summary.voiceSeconds > 0
          : summary.voiceSeconds === 0);
      const matchesIngame =
        ingame === 'all' ||
        (ingame === 'present'
          ? summary.activeDays > 0 || Boolean(summary.latestWotActivityAt)
          : summary.activeDays === 0 && !summary.latestWotActivityAt);

      return (
        matchesSearch &&
        matchesClan &&
        matchesStatus &&
        matchesActivity &&
        matchesVoice &&
        matchesIngame
      );
    });
  }, [activity, clan, ingame, players.data, search, status, voice]);

  const stats = useMemo(() => {
    const rows = players.data?.players ?? [];
    return {
      total: rows.length,
      active: rows.filter((s) => s.score.value >= 50).length,
      inactive: rows.filter((s) => s.score.value < 25).length,
      alerts: rows.reduce((sum, s) => sum + s.alerts.length, 0),
      voiceSeconds: rows.reduce((sum, s) => sum + s.voiceSeconds, 0),
    };
  }, [players.data]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold mb-1">
            Staff · RH
          </p>
          <h1 className="font-display text-3xl text-atfr-bone">
            Gestion joueurs
          </h1>
          <p className="text-sm text-atfr-fog mt-1">
            Suivi croisé WoT, vocal Discord, notes staff et alertes RH.
          </p>
        </div>
        <Button
          onClick={() => importMembers.mutate()}
          leadingIcon={<RefreshCcw size={14} />}
          disabled={importMembers.isPending || roleLoading || !canManageRh}
        >
          {importMembers.isPending ? 'Import…' : 'Importer membres'}
        </Button>
      </div>

      {roleLoading ? (
        <div className="flex justify-center py-10">
          <Spinner label="Vérification des droits…" />
        </div>
      ) : !canManageRh ? (
        <Alert tone="danger">
          Accès réservé aux administrateurs du clan.
        </Alert>
      ) : (
        <>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Joueurs suivis"
          value={stats.total}
          icon={<Users size={20} />}
          loading={players.isLoading}
        />
        <StatCard
          label="Actifs"
          value={stats.active}
          icon={<UserCheck size={20} />}
          loading={players.isLoading}
        />
        <StatCard
          label="Inactifs"
          value={stats.inactive}
          icon={<ShieldAlert size={20} />}
          loading={players.isLoading}
        />
        <StatCard
          label="Alertes"
          value={stats.alerts}
          icon={<TriangleAlert size={20} />}
          loading={players.isLoading}
        />
        <StatCard
          label="Vocal période"
          value={formatDuration(stats.voiceSeconds)}
          icon={<Clock3 size={20} />}
          loading={players.isLoading}
        />
      </div>

      {importMembers.isSuccess && (
        <Alert tone="success">
          {importMembers.data} membre(s) importé(s) ou mis à jour dans le suivi RH.
        </Alert>
      )}
      {importMembers.isError && (
        <Alert tone="danger">{(importMembers.error as Error).message}</Alert>
      )}
      {createPlayer.isSuccess && (
        <Alert tone="success">Joueur ajouté au suivi RH.</Alert>
      )}
      {createPlayer.isError && (
        <Alert tone="danger">{(createPlayer.error as Error).message}</Alert>
      )}

      <Card>
        <CardBody className="p-5 space-y-4">
          <div className="grid gap-3 lg:grid-cols-[1.4fr_repeat(5,minmax(0,1fr))]">
            <Input
              label="Recherche"
              placeholder="Pseudo, Discord, account_id..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              label="Clan"
              value={clan}
              onChange={(e) => setClan(e.target.value)}
            >
              <option value="all">Tous</option>
              {clanOptions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>
            <Select
              label="Statut"
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
            >
              <option value="all">Tous</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <Select
              label="Activité"
              value={activity}
              onChange={(e) => setActivity(e.target.value as typeof activity)}
            >
              <option value="all">Toutes</option>
              {Object.entries(ACTIVITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <Select
              label="Vocal"
              value={voice}
              onChange={(e) => setVoice(e.target.value as PresenceFilter)}
            >
              <option value="all">Tous</option>
              <option value="present">Avec vocal</option>
              <option value="missing">Sans vocal</option>
            </Select>
            <Select
              label="In-game"
              value={ingame}
              onChange={(e) => setIngame(e.target.value as PresenceFilter)}
            >
              <option value="all">Tous</option>
              <option value="present">Avec activité</option>
              <option value="missing">Sans activité</option>
            </Select>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            <Select
              label="Période"
              value={periodPreset}
              onChange={(e) => setPeriodPreset(e.target.value as PeriodPreset)}
            >
              <option value="7">7 jours</option>
              <option value="14">14 jours</option>
              <option value="30">30 jours</option>
              <option value="90">90 jours</option>
              <option value="custom">Personnalisée</option>
            </Select>
            {periodPreset === 'custom' && (
              <>
                <Input
                  label="Du"
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                />
                <Input
                  label="Au"
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                />
              </>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <Input
              label="Ajouter un prospect / joueur manuel"
              placeholder="Pseudo joueur"
              value={newNickname}
              onChange={(e) => setNewNickname(e.target.value)}
            />
            <Button
              onClick={async () => {
                const nickname = newNickname.trim();
                if (!nickname) return;
                try {
                  const created = await createPlayer.mutateAsync({
                    nickname,
                    status: 'prospect',
                    source: 'manual',
                  });
                  setNewNickname('');
                  navigate(`/admin/rh/${created.id}`);
                } catch {
                  /* surfaced by mutation state */
                }
              }}
              disabled={createPlayer.isPending || !newNickname.trim()}
            >
              Ajouter
            </Button>
          </div>
        </CardBody>
      </Card>

      {players.isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner label="Chargement RH…" />
        </div>
      ) : players.isError ? (
        <Alert tone="danger">
          {(players.error as Error).message}
          <span className="block mt-1 text-xs">
            Vérifie que la migration RH a bien été exécutée dans Supabase.
          </span>
        </Alert>
      ) : filtered.length === 0 ? (
        <EmptyState hasSearch={search.length > 0} />
      ) : (
        <PlayerTable players={filtered} />
      )}
        </>
      )}
    </div>
  );
}

function PlayerTable({ players }: { players: PlayerActivitySummary[] }) {
  return (
    <Card>
      <CardBody className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-atfr-gold/10 bg-atfr-ink/70 text-xs uppercase tracking-wider text-atfr-fog">
              <tr>
                <Th>Joueur</Th>
                <Th>Clan</Th>
                <Th>Discord</Th>
                <Th>Statut</Th>
                <Th>In-game</Th>
                <Th>Vocal</Th>
                <Th>Jours</Th>
                <Th>Score</Th>
                <Th>Commentaire</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-atfr-gold/10">
              {players.map((summary) => (
                <PlayerRow key={summary.player.id} summary={summary} />
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
}

function PlayerRow({ summary }: { summary: PlayerActivitySummary }) {
  const player = summary.player;
  const alertSeverity = summary.alerts.some((alert) => alert.severity === 'danger')
    ? 'danger'
    : summary.alerts.length > 0
      ? 'warning'
      : null;

  return (
    <tr className="align-top hover:bg-atfr-graphite/30 transition-colors">
      <Td>
        <div className="flex items-center gap-3 min-w-52">
          <div className="h-9 w-9 rounded-md bg-atfr-gold/10 border border-atfr-gold/25 flex items-center justify-center text-atfr-gold font-display text-xs">
            {player.nickname.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <Link
              to={`/admin/rh/${player.id}`}
              className="font-medium text-atfr-bone hover:text-atfr-gold"
            >
              {player.nickname}
            </Link>
            <p className="text-xs text-atfr-fog">
              {player.account_id ? `WoT ${player.account_id}` : 'WoT non lié'}
            </p>
          </div>
        </div>
      </Td>
      <Td>
        <Badge variant="outline">{player.current_clan_tag ?? '—'}</Badge>
      </Td>
      <Td>
        <p className="text-atfr-bone">
          {summary.discordLink?.discord_role ?? '—'}
        </p>
        <p className="text-xs text-atfr-fog">
          {summary.discordLink?.discord_tag ??
            summary.discordLink?.discord_user_id ??
            'Non lié'}
        </p>
      </Td>
      <Td>
        <Badge variant={STATUS_BADGE[player.status]}>
          {STATUS_LABELS[player.status]}
        </Badge>
        {alertSeverity && (
          <Badge
            variant={alertSeverity}
            className="mt-1"
            title={summary.alerts.map((alert) => alert.title).join('\n')}
          >
            {summary.alerts.length} alerte(s)
          </Badge>
        )}
      </Td>
      <Td>
        <p className="text-atfr-bone">{formatDateTime(summary.latestWotActivityAt)}</p>
        <p className="text-xs text-atfr-fog">
          {summary.battleDelta == null
            ? 'Batailles —'
            : `${summary.battleDelta} bataille(s)`}
        </p>
      </Td>
      <Td>
        <p className="text-atfr-bone">{formatDuration(summary.voiceSeconds)}</p>
        <p className="text-xs text-atfr-fog">
          {summary.voiceSessionCount} connexion(s)
        </p>
      </Td>
      <Td>
        <p className="text-atfr-bone">{summary.activeDays}</p>
        <p className="text-xs text-atfr-fog">jours actifs</p>
      </Td>
      <Td>
        <div className="min-w-32">
          <div className="flex items-center justify-between gap-2">
            <Badge variant={ACTIVITY_BADGE[summary.score.level]}>
              {summary.score.value}
            </Badge>
            <span className="text-xs text-atfr-fog">{summary.score.label}</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-atfr-ink overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full',
                summary.score.value >= 80
                  ? 'bg-atfr-success'
                  : summary.score.value >= 50
                    ? 'bg-atfr-gold'
                    : summary.score.value >= 25
                      ? 'bg-atfr-warning'
                      : 'bg-atfr-danger',
              )}
              style={{ width: `${summary.score.value}%` }}
            />
          </div>
        </div>
      </Td>
      <Td>
        <p className="max-w-64 truncate text-atfr-fog">
          {player.staff_comment || '—'}
        </p>
      </Td>
    </tr>
  );
}

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <Card>
      <CardBody className="p-10 text-center">
        <Search className="mx-auto text-atfr-gold" size={28} />
        <p className="mt-3 font-display text-xl text-atfr-bone">
          {hasSearch ? 'Aucun joueur trouvé' : 'Aucun joueur RH'}
        </p>
        <p className="mt-2 text-sm text-atfr-fog max-w-xl mx-auto">
          Importe les membres existants pour initialiser le suivi, puis lie les
          comptes Discord et laisse le bot/API alimenter les snapshots.
        </p>
      </CardBody>
    </Card>
  );
}

function Th({ children }: { children: ReactNode }) {
  return <th className="px-4 py-3 text-left font-medium">{children}</th>;
}

function Td({ children }: { children: ReactNode }) {
  return <td className="px-4 py-4">{children}</td>;
}
