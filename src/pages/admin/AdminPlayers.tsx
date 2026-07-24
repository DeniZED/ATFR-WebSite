import { useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Clock3,
  Link2,
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
  useAutoLinkDiscordMembers,
  useCreatePlayer,
  useDiscordGuildMembers,
  useHrPlayers,
  useImportMembersToPlayers,
  useRecomputePlayerStatuses,
  useSnapshotPlayerActivity,
  useSyncAllDiscordMembers,
} from '@/features/rh/queries';
import { useClanInfo } from '@/features/clan/queries';
import { useDiscordWidget } from '@/features/discord/queries';
import { useContent } from '@/hooks/useContent';
import { useRole } from '@/hooks/useRole';
import type { DiscordMemberPayload, PlayerHrStatus } from '@/types/database';
import { cn } from '@/lib/cn';
import { ClanMovementsTab } from '@/components/admin/ClanMovementsTab';
import {
  filterByScope,
  RH_SCOPES,
  RH_SCOPE_LABELS,
  type RhScope,
} from '@/features/rh/perimeter';

type PeriodPreset = '7' | '14' | '30' | '90' | 'custom';
type PresenceFilter = 'all' | 'present' | 'missing';
type DiscordFilter = 'all' | 'linked' | 'unlinked' | 'suggested';
type AlertFilter = 'all' | 'with' | 'none';
type SortKey =
  | 'nickname'
  | 'clan'
  | 'status'
  | 'ingame'
  | 'battles'
  | 'voice'
  | 'days'
  | 'score'
  | 'alerts';
type SortDir = 'asc' | 'desc';

const SORT_ACCESSORS: Record<SortKey, (s: PlayerActivitySummary) => string | number> = {
  nickname: (s) => s.player.nickname.toLowerCase(),
  clan: (s) => s.player.current_clan_tag ?? '',
  status: (s) => s.player.status,
  ingame: (s) => (s.latestWotActivityAt ? new Date(s.latestWotActivityAt).getTime() : -1),
  battles: (s) => s.battleDelta ?? -1,
  voice: (s) => s.voiceSeconds,
  days: (s) => s.activeDays,
  score: (s) => s.score.value,
  alerts: (s) => s.alerts.length,
};

export default function AdminPlayers() {
  const navigate = useNavigate();
  const { can, isLoading: roleLoading } = useRole();
  const canManageRh = can('members');
  const [tab, setTab] = useState<'players' | 'movements'>('players');
  const [scope, setScope] = useState<RhScope>('current');
  const [search, setSearch] = useState('');
  const [clan, setClan] = useState('all');
  const [status, setStatus] = useState<PlayerHrStatus | 'all'>('all');
  const [activity, setActivity] = useState<ActivityLevel | 'all'>('all');
  const [voice, setVoice] = useState<PresenceFilter>('all');
  const [ingame, setIngame] = useState<PresenceFilter>('all');
  const [discord, setDiscord] = useState<DiscordFilter>('all');
  const [alerts, setAlerts] = useState<AlertFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('score');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
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

  const { get } = useContent();
  const discordServerId = get('discord_server_id') || null;
  const clanInfo = useClanInfo();
  const discordWidget = useDiscordWidget(discordServerId);
  const players = useHrPlayers(period, { enabled: canManageRh });
  const discordMembers = useDiscordGuildMembers({ enabled: canManageRh });
  const importMembers = useImportMembersToPlayers();
  const autoLinkDiscord = useAutoLinkDiscordMembers();
  const syncAllDiscord = useSyncAllDiscordMembers();
  const recomputeStatuses = useRecomputePlayerStatuses();
  const snapshotActivity = useSnapshotPlayerActivity();
  const createPlayer = useCreatePlayer();

  const widgetDiscordMembers = useMemo<DiscordMemberPayload[]>(
    () =>
      (discordWidget.data?.members ?? []).map((member) => ({
        discord_user_id: member.id,
        username: member.username,
        display_name: member.username,
        status: member.status,
        avatar_url: member.avatar_url ?? null,
        channel_id: member.channel_id ?? null,
        activity: member.activity ?? null,
        source: 'widget',
      })),
    [discordWidget.data],
  );

  const discordNameKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const member of widgetDiscordMembers) {
      const key = normalizeDiscordName(
        member.nickname ??
          member.display_name ??
          member.global_name ??
          member.username ??
          '',
      );
      if (key) keys.add(key);
    }
    for (const member of discordMembers.data ?? []) {
      const key = normalizeDiscordName(
        member.nickname ??
          member.display_name ??
          member.global_name ??
          member.username,
      );
      if (key) keys.add(key);
    }
    return keys;
  }, [discordMembers.data, widgetDiscordMembers]);

  const clanOptions = useMemo(() => {
    const values = new Set<string>();
    for (const summary of players.data?.players ?? []) {
      if (summary.player.current_clan_tag) {
        values.add(summary.player.current_clan_tag);
      }
    }
    return [...values].sort((a, b) => a.localeCompare(b));
  }, [players.data]);

  // Périmètre RH : membres actuels / prospects / anciens / tous. Toutes les
  // métriques de la liste (tuiles, tableau, alertes) sont calculées sur ce
  // périmètre — anciens et prospects ne faussent plus les stats par défaut.
  const allRows = useMemo(() => players.data?.players ?? [], [players.data]);
  const scopedRows = useMemo(
    () => filterByScope(allRows, scope),
    [allRows, scope],
  );
  const scopeCounts = useMemo(
    () =>
      Object.fromEntries(
        RH_SCOPES.map((s) => [s, filterByScope(allRows, s).length]),
      ) as Record<RhScope, number>,
    [allRows],
  );
  const tabRows = scopedRows;

  const playerNicknamesById = useMemo(
    () => new Map(allRows.map((s) => [s.player.id, s.player.nickname])),
    [allRows],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tabRows.filter((summary) => {
      const player = summary.player;
      const link = summary.discordLink;
      const hasDiscordSuggestion =
        !link && discordNameKeys.has(normalizeDiscordName(player.nickname));
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
      const matchesDiscord =
        discord === 'all' ||
        (discord === 'linked'
          ? Boolean(link)
          : discord === 'unlinked'
            ? !link
            : hasDiscordSuggestion);
      const matchesAlerts =
        alerts === 'all' ||
        (alerts === 'with'
          ? summary.alerts.length > 0
          : summary.alerts.length === 0);

      return (
        matchesSearch &&
        matchesClan &&
        matchesStatus &&
        matchesActivity &&
        matchesVoice &&
        matchesIngame &&
        matchesDiscord &&
        matchesAlerts
      );
    });
  }, [
    activity,
    alerts,
    clan,
    discord,
    ingame,
    tabRows,
    search,
    status,
    voice,
    discordNameKeys,
  ]);

  const sorted = useMemo(() => {
    const accessor = SORT_ACCESSORS[sortKey];
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const va = accessor(a);
      const vb = accessor(b);
      if (typeof va === 'string' || typeof vb === 'string') {
        return dir * String(va).localeCompare(String(vb));
      }
      return dir * ((va as number) - (vb as number));
    });
  }, [filtered, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  // Stats calculées sur le PÉRIMÈTRE sélectionné (membres actuels par défaut).
  const stats = useMemo(() => {
    const rows = scopedRows;
    return {
      total: rows.length,
      archived: scopeCounts.former,
      active: rows.filter((s) => s.score.value >= 50).length,
      inactive: rows.filter((s) => s.score.value < 25).length,
      watch: rows.filter((s) => s.player.status === 'watch').length,
      discordLinked: rows.filter((s) => Boolean(s.discordLink)).length,
      discordSuggested: rows.filter(
        (s) =>
          !s.discordLink &&
          discordNameKeys.has(normalizeDiscordName(s.player.nickname)),
      ).length,
      alerts: rows.reduce((sum, s) => sum + s.alerts.length, 0),
      voiceSeconds: rows.reduce((sum, s) => sum + s.voiceSeconds, 0),
    };
  }, [scopedRows, scopeCounts, discordNameKeys]);

  const hasActiveFilter =
    search.trim().length > 0 ||
    clan !== 'all' ||
    status !== 'all' ||
    activity !== 'all' ||
    voice !== 'all' ||
    ingame !== 'all' ||
    discord !== 'all' ||
    alerts !== 'all';

  async function importRosterToRh() {
    try {
      const imported = await importMembers.mutateAsync({
        clanTag: clanInfo.data?.tag ?? null,
        clanId: clanInfo.data?.clan_id ?? null,
        members:
          clanInfo.data?.members.map((member) => ({
            account_id: member.account_id,
            account_name: member.account_name,
            role: member.role,
            joined_at: member.joined_at,
          })) ?? [],
      });

      if (imported > 0) {
        setSearch('');
        setClan('all');
        setStatus('all');
        setActivity('all');
        setVoice('all');
        setIngame('all');
        setDiscord('all');
        setAlerts('all');
        await players.refetch();
      }
    } catch {
      /* surfaced by mutation state */
    }
  }

  async function autoLinkDiscordMembers() {
    try {
      await autoLinkDiscord.mutateAsync({
        guildId: discordServerId,
        members: widgetDiscordMembers,
      });
      await players.refetch();
    } catch {
      /* surfaced by mutation state */
    }
  }

  async function syncFullDiscordMembers() {
    try {
      await syncAllDiscord.mutateAsync({ guildId: discordServerId });
      await players.refetch();
      await discordMembers.refetch();
    } catch {
      /* surfaced by mutation state */
    }
  }

  async function recomputeRhStatuses() {
    try {
      await recomputeStatuses.mutateAsync();
      await players.refetch();
    } catch {
      /* surfaced by mutation state */
    }
  }

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
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={importRosterToRh}
            leadingIcon={<RefreshCcw size={14} />}
            disabled={
              importMembers.isPending ||
              roleLoading ||
              !canManageRh ||
              clanInfo.isLoading
            }
          >
            {importMembers.isPending ? 'Import…' : 'Importer membres'}
          </Button>
          <Button
            onClick={autoLinkDiscordMembers}
            leadingIcon={<Link2 size={14} />}
            disabled={
              autoLinkDiscord.isPending || roleLoading || !canManageRh
            }
          >
            {autoLinkDiscord.isPending ? 'Liaison…' : 'Auto-lier visibles'}
          </Button>
          <Button
            onClick={syncFullDiscordMembers}
            leadingIcon={<RefreshCcw size={14} />}
            disabled={
              syncAllDiscord.isPending || roleLoading || !canManageRh
            }
          >
            {syncAllDiscord.isPending ? 'Sync…' : 'Sync Discord complet'}
          </Button>
          <Button
            onClick={recomputeRhStatuses}
            leadingIcon={<ShieldAlert size={14} />}
            disabled={
              recomputeStatuses.isPending || roleLoading || !canManageRh
            }
          >
            {recomputeStatuses.isPending ? 'Recalcul…' : 'Recalculer statuts'}
          </Button>
          <Button
            onClick={async () => {
              try {
                await snapshotActivity.mutateAsync();
              } catch { /* surfaced by mutation state */ }
            }}
            leadingIcon={<RefreshCcw size={14} />}
            disabled={snapshotActivity.isPending || roleLoading || !canManageRh}
          >
            {snapshotActivity.isPending ? 'Snapshot…' : 'Snapshot WoT'}
          </Button>
        </div>
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

      {/* ── Onglets : joueurs / mouvements ── */}
      <div className="flex gap-1 border-b border-atfr-gold/15 pb-0">
        {(
          [
            { key: 'players', label: 'Joueurs' },
            { key: 'movements', label: 'Mouvements' },
          ] as const
        ).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === key
                ? 'border-atfr-gold text-atfr-gold'
                : 'border-transparent text-atfr-fog hover:text-atfr-bone',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'movements' ? (
        <ClanMovementsTab playerNicknamesById={playerNicknamesById} />
      ) : (
      <>
      {/* ── Périmètre RH (global) ── */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[11px] uppercase tracking-[0.2em] text-atfr-fog">
          Périmètre
        </span>
        {RH_SCOPES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setScope(s)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              scope === s
                ? 'border-atfr-gold/60 bg-atfr-gold/10 text-atfr-gold'
                : 'border-atfr-gold/15 text-atfr-fog hover:text-atfr-bone',
            )}
          >
            {RH_SCOPE_LABELS[s]} ({scopeCounts[s]})
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-7">
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
          label="À surveiller"
          value={stats.watch}
          icon={<ShieldAlert size={20} />}
          loading={players.isLoading}
        />
        <StatCard
          label="Inactifs"
          value={stats.inactive}
          icon={<ShieldAlert size={20} />}
          loading={players.isLoading}
        />
        <StatCard
          label="Discord liés"
          value={`${stats.discordLinked}/${stats.total}`}
          hint={
            stats.discordSuggested > 0
              ? `${stats.discordSuggested} suggestion(s)`
              : undefined
          }
          icon={<Link2 size={20} />}
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

      {importMembers.isSuccess &&
        (importMembers.data > 0 ? (
          <Alert tone="success">
            {importMembers.data} membre(s) importé(s) ou mis à jour dans le suivi RH.
          </Alert>
        ) : (
          <Alert tone="warning">
            Aucun membre importé. Le roster WoT live et la table Supabase members sont vides.
          </Alert>
        ))}
      {importMembers.isSuccess &&
        importMembers.data > 0 &&
        !players.isFetching &&
        (players.data?.players.length ?? 0) === 0 && (
          <Alert tone="warning">
            L'import a traité des membres, mais la liste RH ne voit encore aucun joueur.
            Vérifie que les policies RLS du module RH ont bien été appliquées dans Supabase.
          </Alert>
        )}
      {importMembers.isError && (
        <Alert tone="danger">{(importMembers.error as Error).message}</Alert>
      )}
      {autoLinkDiscord.isSuccess && (
        <Alert tone={(autoLinkDiscord.data ?? 0) > 0 ? 'success' : 'warning'}>
          {(autoLinkDiscord.data ?? 0) > 0
            ? `${autoLinkDiscord.data ?? 0} liaison(s) Discord créée(s).`
            : 'Aucune nouvelle liaison Discord. Le widget ne voit que les membres en ligne ; le bot pourra alimenter le reste.'}
        </Alert>
      )}
      {autoLinkDiscord.isError && (
        <Alert tone="danger">{(autoLinkDiscord.error as Error).message}</Alert>
      )}
      {syncAllDiscord.isSuccess && (
        <Alert tone="success">
          {syncAllDiscord.data.synced} membre(s) Discord synchronisé(s),{' '}
          {syncAllDiscord.data.linked} liaison(s) créée(s),{' '}
          {syncAllDiscord.data.statuses} statut(s) recalculé(s).
        </Alert>
      )}
      {syncAllDiscord.isError && (
        <Alert tone="danger">{(syncAllDiscord.error as Error).message}</Alert>
      )}
      {recomputeStatuses.isSuccess && (
        <Alert tone="success">
          {recomputeStatuses.data ?? 0} statut(s) RH recalculé(s).
        </Alert>
      )}
      {recomputeStatuses.isError && (
        <Alert tone="danger">{(recomputeStatuses.error as Error).message}</Alert>
      )}
      {snapshotActivity.isSuccess && (
        <Alert tone={snapshotActivity.data.errors > 0 ? 'warning' : 'success'}>
          Snapshot WoT : {snapshotActivity.data.snapshots} snapshot(s) enregistré(s) sur{' '}
          {snapshotActivity.data.players} joueur(s)
          {snapshotActivity.data.errors > 0
            ? ` (${snapshotActivity.data.errors} erreur(s)).`
            : '.'}
        </Alert>
      )}
      {snapshotActivity.isError && (
        <Alert tone="danger">{(snapshotActivity.error as Error).message}</Alert>
      )}
      {createPlayer.isSuccess && (
        <Alert tone="success">Joueur ajouté au suivi RH.</Alert>
      )}
      {createPlayer.isError && (
        <Alert tone="danger">{(createPlayer.error as Error).message}</Alert>
      )}

      <Card>
        <CardBody className="p-5 space-y-4">
          <div className="grid gap-3 lg:grid-cols-4 xl:grid-cols-[1.4fr_repeat(7,minmax(0,1fr))]">
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
            <Select
              label="Discord"
              value={discord}
              onChange={(e) => setDiscord(e.target.value as DiscordFilter)}
            >
              <option value="all">Tous</option>
              <option value="linked">Liés</option>
              <option value="unlinked">Non liés</option>
              <option value="suggested">Suggestion</option>
            </Select>
            <Select
              label="Alertes"
              value={alerts}
              onChange={(e) => setAlerts(e.target.value as AlertFilter)}
            >
              <option value="all">Toutes</option>
              <option value="with">Avec alerte</option>
              <option value="none">Sans alerte</option>
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
        <EmptyState hasSearch={search.length > 0} hasFilter={hasActiveFilter} />
      ) : (
        <PlayerTable
          players={sorted}
          discordNameKeys={discordNameKeys}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={toggleSort}
        />
      )}
      </>
      )}
        </>
      )}
    </div>
  );
}

function PlayerTable({
  players,
  discordNameKeys,
  sortKey,
  sortDir,
  onSort,
}: {
  players: PlayerActivitySummary[];
  discordNameKeys: Set<string>;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  return (
    <Card>
      <CardBody className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-atfr-gold/10 bg-atfr-ink/70 text-xs uppercase tracking-wider text-atfr-fog">
              <tr>
                <SortTh label="Joueur" col="nickname" active={sortKey} dir={sortDir} onSort={onSort} />
                <SortTh label="Clan" col="clan" active={sortKey} dir={sortDir} onSort={onSort} />
                <Th>Discord</Th>
                <SortTh label="Statut" col="status" active={sortKey} dir={sortDir} onSort={onSort} />
                <SortTh label="In-game" col="ingame" active={sortKey} dir={sortDir} onSort={onSort} />
                <SortTh label="Batailles" col="battles" active={sortKey} dir={sortDir} onSort={onSort} />
                <SortTh label="Vocal" col="voice" active={sortKey} dir={sortDir} onSort={onSort} />
                <SortTh label="Jours" col="days" active={sortKey} dir={sortDir} onSort={onSort} />
                <SortTh label="Score" col="score" active={sortKey} dir={sortDir} onSort={onSort} />
                <SortTh label="Alertes" col="alerts" active={sortKey} dir={sortDir} onSort={onSort} />
                <Th>Commentaire</Th>
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-atfr-gold/10">
              {players.map((summary) => (
                <PlayerRow
                  key={summary.player.id}
                  summary={summary}
                  hasDiscordSuggestion={
                    !summary.discordLink &&
                    discordNameKeys.has(
                      normalizeDiscordName(summary.player.nickname),
                    )
                  }
                />
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
}

function PlayerRow({
  summary,
  hasDiscordSuggestion,
}: {
  summary: PlayerActivitySummary;
  hasDiscordSuggestion: boolean;
}) {
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
        {!summary.discordLink && hasDiscordSuggestion && (
          <Badge variant="gold" className="mt-1">
            Suggestion
          </Badge>
        )}
      </Td>
      <Td>
        <Badge variant={STATUS_BADGE[player.status]}>
          {STATUS_LABELS[player.status]}
        </Badge>
      </Td>
      <Td>
        <p className="text-atfr-bone">{formatDateTime(summary.latestWotActivityAt)}</p>
      </Td>
      <Td>
        <p className="text-atfr-bone">
          {summary.battleDelta == null ? '—' : summary.battleDelta}
        </p>
        <p className="text-xs text-atfr-fog">bataille(s)</p>
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
        {alertSeverity ? (
          <Badge
            variant={alertSeverity}
            title={summary.alerts.map((alert) => alert.title).join('\n')}
          >
            {summary.alerts.length}
          </Badge>
        ) : (
          <span className="text-atfr-fog">—</span>
        )}
      </Td>
      <Td>
        <p className="max-w-64 truncate text-atfr-fog">
          {player.staff_comment || '—'}
        </p>
      </Td>
      <Td>
        <Link
          to={`/admin/rh/${player.id}`}
          className="inline-flex items-center justify-center rounded-md border border-atfr-gold/30 px-3 py-1.5 text-xs font-medium text-atfr-gold transition-colors hover:bg-atfr-gold/10"
        >
          Éditer
        </Link>
      </Td>
    </tr>
  );
}

function EmptyState({
  hasSearch,
  hasFilter,
}: {
  hasSearch: boolean;
  hasFilter: boolean;
}) {
  return (
    <Card>
      <CardBody className="p-10 text-center">
        <Search className="mx-auto text-atfr-gold" size={28} />
        <p className="mt-3 font-display text-xl text-atfr-bone">
          {hasSearch || hasFilter ? 'Aucun joueur trouvé' : 'Aucun joueur RH'}
        </p>
        <p className="mt-2 text-sm text-atfr-fog max-w-xl mx-auto">
          {hasSearch || hasFilter
            ? 'Aucun joueur ne correspond aux filtres actuels.'
            : 'Importe les membres existants pour initialiser le suivi, puis lie les comptes Discord et laisse le bot/API alimenter les snapshots.'}
        </p>
      </CardBody>
    </Card>
  );
}

function Th({ children }: { children: ReactNode }) {
  return <th className="px-4 py-3 text-left font-medium">{children}</th>;
}

function SortTh({
  label,
  col,
  active,
  dir,
  onSort,
}: {
  label: string;
  col: SortKey;
  active: SortKey;
  dir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  const isActive = active === col;
  return (
    <th className="px-4 py-3 text-left font-medium">
      <button
        type="button"
        onClick={() => onSort(col)}
        className={cn(
          'inline-flex items-center gap-1 transition-colors hover:text-atfr-gold',
          isActive && 'text-atfr-gold',
        )}
      >
        {label}
        {isActive ? (
          dir === 'asc' ? (
            <ArrowUp size={12} />
          ) : (
            <ArrowDown size={12} />
          )
        ) : (
          <ArrowUpDown size={12} className="opacity-40" />
        )}
      </button>
    </th>
  );
}

function Td({ children }: { children: ReactNode }) {
  return <td className="px-4 py-4">{children}</td>;
}

function normalizeDiscordName(value: string): string {
  return value
    .toLowerCase()
    .replace(/^\s*[[(]?(atfr|a[\s-]*t[\s-]*o|ato)[\])]?\s*[-:|]*\s*/i, '')
    .replace(/[^a-z0-9]+/g, '');
}
