import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  Link2,
  MessageSquarePlus,
  Save,
  Trash2,
  TriangleAlert,
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
  Textarea,
} from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import {
  ACTIVITY_BADGE,
  STATUS_BADGE,
  STATUS_LABELS,
  formatDate,
  formatDateTime,
  formatDuration,
  makeRollingPeriod,
} from '@/features/rh/activity';
import {
  useAddStaffNote,
  useDeleteDiscordLink,
  useHrPlayerDetail,
  useSavePlayer,
  useUpsertDiscordLink,
} from '@/features/rh/queries';
import { tomatoProfileUrl } from '@/lib/tomato-api';
import type { PlayerHrStatus, StaffNoteType } from '@/types/database';

type PeriodPreset = '7' | '14' | '30' | '90';

const NOTE_LABELS: Record<StaffNoteType, string> = {
  info: 'Info',
  warning: 'Avertissement',
  recruitment: 'Recrutement',
  absence: 'Absence',
  behavior: 'Comportement',
  other: 'Autre',
};

interface PlayerFormState {
  nickname: string;
  accountId: string;
  clanTag: string;
  clanId: string;
  internalRole: string;
  joinedAt: string;
  status: PlayerHrStatus;
  tags: string;
  staffComment: string;
  tomatoUrl: string;
  wotProfileUrl: string;
}

interface DiscordFormState {
  discordUserId: string;
  discordTag: string;
  discordRole: string;
  guildId: string;
}

export default function AdminPlayerDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { can, isLoading: roleLoading } = useRole();
  const canManageRh = can('members');
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>('30');
  const period = useMemo(
    () => makeRollingPeriod(Number(periodPreset)),
    [periodPreset],
  );
  const detail = useHrPlayerDetail(id, period, { enabled: canManageRh });
  const savePlayer = useSavePlayer();
  const saveDiscord = useUpsertDiscordLink();
  const deleteDiscord = useDeleteDiscordLink();
  const addNote = useAddStaffNote();

  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<PlayerFormState>(() => emptyPlayerForm());
  const [discordForm, setDiscordForm] = useState<DiscordFormState>(() =>
    emptyDiscordForm(),
  );
  const [noteType, setNoteType] = useState<StaffNoteType>('info');
  const [noteContent, setNoteContent] = useState('');

  const detailData = detail.data;
  const summary = detailData?.summary;
  const player = summary?.player;
  const link = summary?.discordLink;

  useEffect(() => {
    if (!summary) return;
    setForm({
      nickname: summary.player.nickname,
      accountId: summary.player.account_id?.toString() ?? '',
      clanTag: summary.player.current_clan_tag ?? '',
      clanId: summary.player.current_clan_id?.toString() ?? '',
      internalRole: summary.player.internal_role ?? '',
      joinedAt: summary.player.joined_at?.slice(0, 10) ?? '',
      status: summary.player.status,
      tags: summary.player.tags.join(', '),
      staffComment: summary.player.staff_comment ?? '',
      tomatoUrl: summary.player.tomato_url ?? '',
      wotProfileUrl: summary.player.wot_profile_url ?? '',
    });
    setDiscordForm({
      discordUserId: summary.discordLink?.discord_user_id ?? '',
      discordTag: summary.discordLink?.discord_tag ?? '',
      discordRole: summary.discordLink?.discord_role ?? '',
      guildId: summary.discordLink?.guild_id ?? '',
    });
  }, [summary]);

  async function handleSave() {
    if (!player) return;
    setSaved(false);
    try {
      await savePlayer.mutateAsync({
        id: player.id,
        actorId: user?.id,
        previousStatus: player.status,
        previousRole: player.internal_role,
        patch: {
          nickname: form.nickname.trim(),
          account_id: nullableNumber(form.accountId),
          current_clan_tag: nullableText(form.clanTag),
          current_clan_id: nullableNumber(form.clanId),
          internal_role: nullableText(form.internalRole),
          joined_at: form.joinedAt ? new Date(form.joinedAt).toISOString() : null,
          status: form.status,
          tags: splitTags(form.tags),
          staff_comment: nullableText(form.staffComment),
          tomato_url: nullableText(form.tomatoUrl),
          wot_profile_url: nullableText(form.wotProfileUrl),
          updated_by: user?.id ?? null,
        },
      });

      if (discordForm.discordUserId.trim()) {
        await saveDiscord.mutateAsync({
          playerId: player.id,
          linkId: link?.id,
          actorId: user?.id,
          discordUserId: discordForm.discordUserId,
          discordTag: discordForm.discordTag,
          discordRole: discordForm.discordRole,
          guildId: discordForm.guildId,
        });
      }
      setSaved(true);
    } catch {
      /* surfaced by mutation state */
    }
  }

  async function handleAddNote() {
    if (!player || !noteContent.trim()) return;
    try {
      await addNote.mutateAsync({
        playerId: player.id,
        authorId: user?.id,
        noteType,
        content: noteContent,
      });
      setNoteContent('');
    } catch {
      /* surfaced by mutation state */
    }
  }

  if (roleLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner label="Vérification des droits…" />
      </div>
    );
  }

  if (!canManageRh) {
    return (
      <Alert tone="danger">
        Accès réservé aux administrateurs du clan.
      </Alert>
    );
  }

  if (detail.isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner label="Chargement joueur…" />
      </div>
    );
  }

  if (detail.isError || !detailData || !summary || !player) {
    return (
      <Alert tone="danger">
        {(detail.error as Error | undefined)?.message ?? 'Joueur introuvable.'}
      </Alert>
    );
  }

  const profileUrl =
    player.tomato_url || player.wot_profile_url || tomatoProfileUrl(player.nickname);
  const recentChannels = getRecentChannels(summary.voiceSessions);
  const visibleAlerts = [
    ...summary.alerts,
    ...detailData.persistedAlerts.map((alert) => ({
      kind: alert.kind,
      severity: alert.severity,
      title: alert.title,
      description: alert.description ?? 'Alerte enregistrée par le staff ou le bot.',
    })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link
            to="/admin/rh"
            className="inline-flex items-center gap-1 text-xs text-atfr-fog hover:text-atfr-gold mb-2"
          >
            <ArrowLeft size={12} /> RH joueurs
          </Link>
          <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold mb-1">
            Fiche joueur
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display text-3xl text-atfr-bone">
              {player.nickname}
            </h1>
            <Badge variant={STATUS_BADGE[player.status]}>
              {STATUS_LABELS[player.status]}
            </Badge>
            <Badge variant={ACTIVITY_BADGE[summary.score.level]}>
              Score {summary.score.value} · {summary.score.label}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <a
            href={profileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-atfr-gold/40 px-4 py-2 text-sm font-medium tracking-wide text-atfr-gold transition-all duration-200 hover:bg-atfr-gold/10"
          >
            <ExternalLink size={14} />
            Profil
          </a>
          <Button
            onClick={handleSave}
            leadingIcon={<Save size={14} />}
            disabled={savePlayer.isPending || saveDiscord.isPending}
          >
            Enregistrer
          </Button>
        </div>
      </div>

      {saved && <Alert tone="success">Fiche joueur enregistrée.</Alert>}
      {(savePlayer.isError || saveDiscord.isError) && (
        <Alert tone="danger">
          {((savePlayer.error ?? saveDiscord.error) as Error).message}
        </Alert>
      )}
      {(addNote.isError || deleteDiscord.isError) && (
        <Alert tone="danger">
          {((addNote.error ?? deleteDiscord.error) as Error).message}
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard
          label="Dernière activité WoT"
          value={formatDateTime(summary.latestWotActivityAt)}
          hint={`${summary.activeDays} jour(s) actif(s) sur la période`}
        />
        <SummaryCard
          label="Vocal Discord"
          value={formatDuration(summary.voiceSeconds)}
          hint={`${summary.voiceSessionCount} connexion(s)`}
        />
        <SummaryCard
          label="Moyenne session"
          value={formatDuration(summary.averageVoiceSessionSeconds)}
          hint="Durée moyenne des vocaux"
        />
        <SummaryCard
          label="Batailles période"
          value={summary.battleDelta == null ? '—' : summary.battleDelta}
          hint={summary.score.detail}
        />
      </div>

      {visibleAlerts.length > 0 && (
        <Card>
          <CardBody className="p-5">
            <p className="font-display text-lg text-atfr-bone mb-3">
              Alertes staff
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {visibleAlerts.map((alert) => (
                <div
                  key={`${alert.kind}-${alert.title}`}
                  className="rounded-md border border-atfr-gold/10 bg-atfr-ink/60 p-4"
                >
                  <Badge
                    variant={
                      alert.severity === 'danger'
                        ? 'danger'
                        : alert.severity === 'warning'
                          ? 'warning'
                          : 'outline'
                    }
                  >
                    <TriangleAlert size={12} /> {alert.title}
                  </Badge>
                  <p className="mt-2 text-sm text-atfr-fog">
                    {alert.description}
                  </p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardBody className="p-6 space-y-5">
            <SectionTitle
              title="Informations générales"
              description="Identité WoT, statut RH, clan et commentaire staff rapide."
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Pseudo"
                value={form.nickname}
                onChange={(e) => setForm({ ...form, nickname: e.target.value })}
              />
              <Input
                label="Account ID WoT"
                inputMode="numeric"
                value={form.accountId}
                onChange={(e) => setForm({ ...form, accountId: e.target.value })}
              />
              <Input
                label="Clan actuel"
                value={form.clanTag}
                onChange={(e) => setForm({ ...form, clanTag: e.target.value })}
              />
              <Input
                label="Clan ID"
                inputMode="numeric"
                value={form.clanId}
                onChange={(e) => setForm({ ...form, clanId: e.target.value })}
              />
              <Input
                label="Grade interne"
                value={form.internalRole}
                onChange={(e) =>
                  setForm({ ...form, internalRole: e.target.value })
                }
              />
              <Input
                label="Date d’arrivée"
                type="date"
                value={form.joinedAt}
                onChange={(e) => setForm({ ...form, joinedAt: e.target.value })}
              />
              <Select
                label="Statut RH"
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as PlayerHrStatus })
                }
              >
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
              <Input
                label="Tags internes"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                hint="Sépare les tags par des virgules."
              />
              <Input
                label="Tomato.gg"
                value={form.tomatoUrl}
                onChange={(e) => setForm({ ...form, tomatoUrl: e.target.value })}
              />
              <Input
                label="Profil WoT"
                value={form.wotProfileUrl}
                onChange={(e) =>
                  setForm({ ...form, wotProfileUrl: e.target.value })
                }
              />
            </div>
            <Textarea
              label="Commentaire staff rapide"
              value={form.staffComment}
              onChange={(e) =>
                setForm({ ...form, staffComment: e.target.value })
              }
            />
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6 space-y-5">
            <SectionTitle
              title="Matching Discord"
              description="Association manuelle entre le joueur WoT et le compte Discord."
            />
            <Input
              label="Discord user_id"
              value={discordForm.discordUserId}
              onChange={(e) =>
                setDiscordForm({
                  ...discordForm,
                  discordUserId: e.target.value,
                })
              }
            />
            <Input
              label="Tag Discord"
              value={discordForm.discordTag}
              onChange={(e) =>
                setDiscordForm({ ...discordForm, discordTag: e.target.value })
              }
            />
            <Input
              label="Rôle Discord"
              value={discordForm.discordRole}
              onChange={(e) =>
                setDiscordForm({ ...discordForm, discordRole: e.target.value })
              }
            />
            <Input
              label="Serveur Discord"
              value={discordForm.guildId}
              onChange={(e) =>
                setDiscordForm({ ...discordForm, guildId: e.target.value })
              }
            />
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                leadingIcon={<Link2 size={14} />}
                disabled={savePlayer.isPending || saveDiscord.isPending}
              >
                Lier / corriger
              </Button>
              {link && (
                <Button
                  variant="danger"
                  leadingIcon={<Trash2 size={14} />}
                  onClick={() => {
                    if (confirm('Supprimer cette liaison Discord ?')) {
                      deleteDiscord.mutate(link.id);
                    }
                  }}
                  disabled={deleteDiscord.isPending}
                >
                  Supprimer
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardBody className="p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <SectionTitle
                title="Activité"
                description="Synthèse WoT et Discord sur la période sélectionnée."
              />
              <Select
                value={periodPreset}
                onChange={(e) => setPeriodPreset(e.target.value as PeriodPreset)}
                className="min-w-32"
              >
                <option value="7">7 jours</option>
                <option value="14">14 jours</option>
                <option value="30">30 jours</option>
                <option value="90">90 jours</option>
              </Select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Metric label="Jours actifs WoT" value={summary.activeDays} />
              <Metric
                label="Dernière bataille"
                value={formatDateTime(summary.latestWotActivityAt)}
              />
              <Metric
                label="Temps vocal"
                value={formatDuration(summary.voiceSeconds)}
              />
              <Metric
                label="Dernier vocal"
                value={formatDateTime(summary.latestDiscordVoiceAt)}
              />
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-atfr-fog mb-2">
                Derniers salons vocaux
              </p>
              <div className="flex flex-wrap gap-2">
                {recentChannels.length === 0 ? (
                  <span className="text-sm text-atfr-fog">Aucune donnée.</span>
                ) : (
                  recentChannels.map((channel) => (
                    <Badge key={channel} variant="outline">
                      {channel}
                    </Badge>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-2">
              {summary.snapshots.slice(0, 7).map((snapshot) => (
                <div
                  key={snapshot.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-atfr-gold/10 bg-atfr-ink/60 px-3 py-2 text-sm"
                >
                  <span className="text-atfr-bone">
                    {formatDate(snapshot.snapshot_date)}
                  </span>
                  <span className="text-atfr-fog">
                    {snapshot.battles_delta ?? 0} bataille(s)
                  </span>
                </div>
              ))}
              {summary.snapshots.length === 0 && (
                <p className="text-sm text-atfr-fog">
                  Aucun snapshot WoT sur cette période.
                </p>
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6 space-y-5">
            <SectionTitle
              title="Notes staff"
              description="Historique interne visible uniquement par le staff."
            />
            <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
              <Select
                label="Type"
                value={noteType}
                onChange={(e) => setNoteType(e.target.value as StaffNoteType)}
              >
                {Object.entries(NOTE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
              <Textarea
                label="Nouvelle note"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
              />
            </div>
            <Button
              onClick={handleAddNote}
              leadingIcon={<MessageSquarePlus size={14} />}
              disabled={addNote.isPending || noteContent.trim().length === 0}
            >
              Ajouter la note
            </Button>
            <div className="space-y-3">
              {summary.notes.length === 0 ? (
                <p className="text-sm text-atfr-fog">Aucune note staff.</p>
              ) : (
                summary.notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-md border border-atfr-gold/10 bg-atfr-ink/60 p-4"
                  >
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <Badge variant="outline">{NOTE_LABELS[note.note_type]}</Badge>
                      <span className="text-xs text-atfr-fog">
                        {formatDateTime(note.created_at)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-atfr-bone whitespace-pre-wrap">
                      {note.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody className="p-6 space-y-4">
          <SectionTitle
            title="Historique RH"
            description="Changements de statut, grade et événements de suivi."
          />
          {detailData.statusHistory.length === 0 ? (
            <p className="text-sm text-atfr-fog">Aucun changement enregistré.</p>
          ) : (
            <div className="space-y-2">
              {detailData.statusHistory.map((event) => (
                <div
                  key={event.id}
                  className="grid gap-2 md:grid-cols-[180px_1fr] rounded-md border border-atfr-gold/10 bg-atfr-ink/60 px-3 py-2 text-sm"
                >
                  <span className="text-atfr-fog">
                    {formatDateTime(event.changed_at)}
                  </span>
                  <span className="text-atfr-bone">
                    {event.old_status
                      ? STATUS_LABELS[event.old_status]
                      : '—'}{' '}
                    →{' '}
                    {event.new_status
                      ? STATUS_LABELS[event.new_status]
                      : '—'}
                    {event.new_role && (
                      <span className="text-atfr-fog">
                        {' '}
                        · rôle {event.old_role ?? '—'} → {event.new_role}
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
          {detailData.memberHistory.length > 0 && (
            <div className="pt-2">
              <p className="text-xs uppercase tracking-wider text-atfr-fog mb-2">
                Historique clan WoT
              </p>
              <div className="space-y-2">
                {detailData.memberHistory.map((event) => (
                  <div
                    key={event.id}
                    className="grid gap-2 md:grid-cols-[180px_1fr] rounded-md border border-atfr-gold/10 bg-atfr-ink/60 px-3 py-2 text-sm"
                  >
                    <span className="text-atfr-fog">
                      {formatDateTime(event.occurred_at)}
                    </span>
                    <span className="text-atfr-bone">
                      {formatMemberAction(event.action)}
                      {event.previous_role || event.new_role ? (
                        <span className="text-atfr-fog">
                          {' '}
                          · {event.previous_role ?? '—'} →{' '}
                          {event.new_role ?? '—'}
                        </span>
                      ) : null}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
}) {
  return (
    <Card>
      <CardBody className="p-4">
        <p className="text-xs uppercase tracking-wider text-atfr-fog">{label}</p>
        <p className="mt-2 font-display text-2xl text-atfr-bone">{value}</p>
        {hint && <p className="mt-1 text-xs text-atfr-fog">{hint}</p>}
      </CardBody>
    </Card>
  );
}

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="font-display text-lg text-atfr-bone">{title}</p>
      <p className="text-sm text-atfr-fog mt-1">{description}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-md border border-atfr-gold/10 bg-atfr-ink/60 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-atfr-fog">
        {label}
      </p>
      <p className="text-sm text-atfr-bone">{value}</p>
    </div>
  );
}

function emptyPlayerForm(): PlayerFormState {
  return {
    nickname: '',
    accountId: '',
    clanTag: '',
    clanId: '',
    internalRole: '',
    joinedAt: '',
    status: 'prospect',
    tags: '',
    staffComment: '',
    tomatoUrl: '',
    wotProfileUrl: '',
  };
}

function emptyDiscordForm(): DiscordFormState {
  return {
    discordUserId: '',
    discordTag: '',
    discordRole: '',
    guildId: '',
  };
}

function nullableText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function nullableNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function splitTags(value: string): string[] {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function getRecentChannels(
  sessions: Array<{ channel_name: string | null; channel_id: string }>,
): string[] {
  const names = new Set<string>();
  for (const session of sessions) {
    names.add(session.channel_name ?? session.channel_id);
    if (names.size >= 5) break;
  }
  return [...names];
}

function formatMemberAction(action: 'joined' | 'left' | 'role_changed'): string {
  if (action === 'joined') return 'Entrée clan';
  if (action === 'left') return 'Sortie clan';
  return 'Changement de rôle';
}
