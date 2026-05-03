import type {
  PlayerActivitySnapshotRow,
  PlayerDiscordLinkRow,
  PlayerHrStatus,
  PlayerRow,
  PlayerStaffNoteRow,
  PlayerTrackingSettingsRow,
  DiscordVoiceSessionRow,
} from '@/types/database';

export type ActivityLevel = 'very_active' | 'active' | 'low' | 'inactive';

export interface ActivityPeriod {
  from: Date;
  to: Date;
  previousFrom: Date;
  previousTo: Date;
  days: number;
}

export interface ActivityScore {
  value: number;
  level: ActivityLevel;
  label: string;
  detail: string;
}

export interface StaffAlert {
  kind:
    | 'inactive'
    | 'no_discord'
    | 'no_wot'
    | 'game_no_voice'
    | 'voice_no_clan'
    | 'activity_drop'
    | 'watch';
  severity: 'info' | 'warning' | 'danger';
  title: string;
  description: string;
}

export type VoiceAggregationMode = 'day' | 'week' | 'month' | 'player' | 'channel';

export interface VoiceAggregate {
  key: string;
  label: string;
  seconds: number;
  sessions: number;
}

export interface PlayerActivitySummary {
  player: PlayerRow;
  discordLink: PlayerDiscordLinkRow | null;
  trackingSettings: PlayerTrackingSettingsRow | null;
  snapshots: PlayerActivitySnapshotRow[];
  previousSnapshots: PlayerActivitySnapshotRow[];
  voiceSessions: DiscordVoiceSessionRow[];
  previousVoiceSessions: DiscordVoiceSessionRow[];
  notes: PlayerStaffNoteRow[];
  latestWotActivityAt: string | null;
  latestDiscordVoiceAt: string | null;
  voiceSeconds: number;
  previousVoiceSeconds: number;
  voiceSessionCount: number;
  averageVoiceSessionSeconds: number;
  activeDays: number;
  previousActiveDays: number;
  battleDelta: number | null;
  previousBattleDelta: number | null;
  score: ActivityScore;
  alerts: StaffAlert[];
}

const SCORE_RULES = {
  recentGame: 35,
  voice: 30,
  regularity: 20,
  trend: 15,
  targetVoiceHours: 10,
  strongDropPct: -45,
  inactivityWarningDays: 14,
  inactivityDangerDays: 30,
};

export const STATUS_LABELS: Record<PlayerHrStatus, string> = {
  active: 'Actif',
  low_activity: 'Peu actif',
  inactive: 'Inactif',
  former: 'Ancien membre',
  prospect: 'Prospect',
  watch: 'A surveiller',
};

export const STATUS_BADGE: Record<
  PlayerHrStatus,
  'success' | 'warning' | 'danger' | 'neutral' | 'gold' | 'outline'
> = {
  active: 'success',
  low_activity: 'warning',
  inactive: 'danger',
  former: 'neutral',
  prospect: 'gold',
  watch: 'outline',
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  very_active: 'Très actif',
  active: 'Actif',
  low: 'Faible activité',
  inactive: 'Inactif',
};

export const ACTIVITY_BADGE: Record<
  ActivityLevel,
  'success' | 'warning' | 'danger' | 'neutral'
> = {
  very_active: 'success',
  active: 'success',
  low: 'warning',
  inactive: 'danger',
};

export function makeRollingPeriod(days: number, now = new Date()): ActivityPeriod {
  const safeDays = Math.max(1, Math.round(days));
  const to = endOfDay(now);
  const from = startOfDay(addDays(to, -safeDays + 1));
  const previousTo = addDays(from, -1);
  const previousFrom = startOfDay(addDays(previousTo, -safeDays + 1));
  return { from, to, previousFrom, previousTo, days: safeDays };
}

export function makeCustomPeriod(from: string, to: string): ActivityPeriod {
  const parsedFrom = new Date(from);
  const parsedTo = new Date(to);
  if (
    !isValidDate(parsedFrom) ||
    !isValidDate(parsedTo) ||
    parsedFrom > parsedTo
  ) {
    return makeRollingPeriod(30);
  }

  const fromDate = startOfDay(parsedFrom);
  const toDate = endOfDay(parsedTo);
  const days = Math.max(
    1,
    Math.ceil((toDate.getTime() - fromDate.getTime()) / 86_400_000),
  );
  const previousTo = addDays(fromDate, -1);
  const previousFrom = startOfDay(addDays(previousTo, -days + 1));
  return { from: fromDate, to: toDate, previousFrom, previousTo, days };
}

export function buildPlayerSummary(input: {
  player: PlayerRow;
  discordLink: PlayerDiscordLinkRow | null;
  trackingSettings?: PlayerTrackingSettingsRow | null;
  snapshots: PlayerActivitySnapshotRow[];
  previousSnapshots: PlayerActivitySnapshotRow[];
  voiceSessions: DiscordVoiceSessionRow[];
  previousVoiceSessions: DiscordVoiceSessionRow[];
  notes: PlayerStaffNoteRow[];
  period: ActivityPeriod;
}): PlayerActivitySummary {
  const latestSnapshotActivity = latestDate(
    input.snapshots
      .map((snapshot) => snapshot.last_battle_at)
      .filter((value): value is string => Boolean(value)),
  );
  const latestWotActivityAt =
    latestDate([input.player.last_wot_activity_at, latestSnapshotActivity]) ??
    null;

  const latestDiscordVoiceAt =
    latestDate(
      [
        ...input.voiceSessions.map(
          (session) => session.left_at ?? session.joined_at,
        ),
        input.player.last_discord_voice_at,
      ],
    ) ?? null;

  const voiceSeconds = sumVoiceSeconds(input.voiceSessions);
  const previousVoiceSeconds = sumVoiceSeconds(input.previousVoiceSessions);
  const voiceSessionCount = input.voiceSessions.length;
  const activeDays = countActiveDays(input.snapshots);
  const previousActiveDays = countActiveDays(input.previousSnapshots);
  const battleDelta = sumNullable(input.snapshots.map((s) => s.battles_delta));
  const previousBattleDelta = sumNullable(
    input.previousSnapshots.map((s) => s.battles_delta),
  );

  const score = computeActivityScore({
    period: input.period,
    latestWotActivityAt,
    voiceSeconds,
    previousVoiceSeconds,
    activeDays,
    previousActiveDays,
    trackingSettings: input.trackingSettings ?? null,
  });

  return {
    player: input.player,
    discordLink: input.discordLink,
    trackingSettings: input.trackingSettings ?? null,
    snapshots: input.snapshots,
    previousSnapshots: input.previousSnapshots,
    voiceSessions: input.voiceSessions,
    previousVoiceSessions: input.previousVoiceSessions,
    notes: input.notes,
    latestWotActivityAt,
    latestDiscordVoiceAt,
    voiceSeconds,
    previousVoiceSeconds,
    voiceSessionCount,
    averageVoiceSessionSeconds:
      voiceSessionCount > 0 ? voiceSeconds / voiceSessionCount : 0,
    activeDays,
    previousActiveDays,
    battleDelta,
    previousBattleDelta,
    score,
    alerts: computeAlerts({
      player: input.player,
      discordLink: input.discordLink,
      period: input.period,
      score,
      latestWotActivityAt,
      voiceSeconds,
      previousVoiceSeconds,
      activeDays,
      previousActiveDays,
      trackingSettings: input.trackingSettings ?? null,
    }),
  };
}

export function computeActivityScore(input: {
  period: ActivityPeriod;
  latestWotActivityAt: string | null;
  voiceSeconds: number;
  previousVoiceSeconds: number;
  activeDays: number;
  previousActiveDays: number;
  trackingSettings?: PlayerTrackingSettingsRow | null;
}): ActivityScore {
  const daysSinceGame = input.latestWotActivityAt
    ? daysBetween(new Date(input.latestWotActivityAt), input.period.to)
    : null;

  let recentGameScore = 0;
  if (daysSinceGame != null) {
    if (daysSinceGame <= 7) recentGameScore = SCORE_RULES.recentGame;
    else if (daysSinceGame <= 14) recentGameScore = 25;
    else if (daysSinceGame <= 30) recentGameScore = 12;
  }

  const voiceHours = input.voiceSeconds / 3600;
  const targetVoiceHours =
    (input.trackingSettings?.voice_target_minutes ?? null) != null
      ? Math.max(0, (input.trackingSettings?.voice_target_minutes ?? 0) / 60)
      : SCORE_RULES.targetVoiceHours;
  const voiceScore =
    targetVoiceHours <= 0
      ? SCORE_RULES.voice
      : Math.min(
          SCORE_RULES.voice,
          (voiceHours / targetVoiceHours) * SCORE_RULES.voice,
        );

  const regularityScore =
    (Math.min(input.activeDays, input.period.days) / input.period.days) *
    SCORE_RULES.regularity;

  const currentWeight = input.activeDays + voiceHours;
  const previousWeight =
    input.previousActiveDays + input.previousVoiceSeconds / 3600;
  const trendPct = percentChange(currentWeight, previousWeight);
  const trendScore =
    trendPct == null
      ? SCORE_RULES.trend * 0.6
      : trendPct >= 0
        ? SCORE_RULES.trend
        : Math.max(0, SCORE_RULES.trend + trendPct / 10);

  const value = clampScore(
    recentGameScore + voiceScore + regularityScore + trendScore,
  );
  const level = getActivityLevel(value);

  return {
    value,
    level,
    label: ACTIVITY_LABELS[level],
    detail:
      trendPct == null
        ? 'Score basé sur la période actuelle'
        : `Evolution ${trendPct > 0 ? '+' : ''}${Math.round(trendPct)}% vs période précédente`,
  };
}

export function computeAlerts(input: {
  player: PlayerRow;
  discordLink: PlayerDiscordLinkRow | null;
  period: ActivityPeriod;
  score: ActivityScore;
  latestWotActivityAt: string | null;
  voiceSeconds: number;
  previousVoiceSeconds: number;
  activeDays: number;
  previousActiveDays: number;
  trackingSettings?: PlayerTrackingSettingsRow | null;
}): StaffAlert[] {
  const alerts: StaffAlert[] = [];
  const settings = input.trackingSettings;
  const warningDays =
    settings?.inactivity_warning_days ?? SCORE_RULES.inactivityWarningDays;
  const dangerDays =
    settings?.inactivity_danger_days ?? SCORE_RULES.inactivityDangerDays;

  if (!settings?.ignore_wot_alerts && !input.player.account_id) {
    alerts.push({
      kind: 'no_wot',
      severity: 'warning',
      title: 'Compte WoT non lié',
      description: 'Aucun account_id WoT n’est renseigné pour ce joueur.',
    });
  }

  if (!settings?.ignore_voice_alerts && !input.discordLink?.discord_user_id) {
    alerts.push({
      kind: 'no_discord',
      severity: 'warning',
      title: 'Discord non lié',
      description: 'Le staff doit encore associer un user_id Discord.',
    });
  }

  const inactiveDays = input.latestWotActivityAt
    ? daysBetween(new Date(input.latestWotActivityAt), input.period.to)
    : null;
  if (
    !settings?.ignore_wot_alerts &&
    inactiveDays != null &&
    inactiveDays >= warningDays &&
    input.player.status !== 'former'
  ) {
    alerts.push({
      kind: 'inactive',
      severity: inactiveDays >= dangerDays ? 'danger' : 'warning',
      title: `Inactif depuis ${inactiveDays} jours`,
      description: 'Dernière activité in-game ancienne pour son statut actuel.',
    });
  }

  if (
    !settings?.ignore_voice_alerts &&
    input.latestWotActivityAt &&
    input.voiceSeconds === 0
  ) {
    const daysSinceGame = daysBetween(
      new Date(input.latestWotActivityAt),
      input.period.to,
    );
    if (daysSinceGame <= input.period.days) {
      alerts.push({
        kind: 'game_no_voice',
        severity: 'info',
        title: 'Joue sans vocal',
        description: 'Activité WoT détectée sur la période, mais aucun vocal Discord.',
      });
    }
  }

  if (
    !settings?.ignore_voice_alerts &&
    !input.player.current_clan_tag &&
    input.voiceSeconds >= 7200
  ) {
    alerts.push({
      kind: 'voice_no_clan',
      severity: 'info',
      title: 'Vocal sans clan',
      description: 'Présence vocale notable alors que le clan actuel est vide.',
    });
  }

  const currentWeight = input.activeDays + input.voiceSeconds / 3600;
  const previousWeight = input.previousActiveDays + input.previousVoiceSeconds / 3600;
  const trendPct = percentChange(currentWeight, previousWeight);
  if (trendPct != null && trendPct <= SCORE_RULES.strongDropPct) {
    alerts.push({
      kind: 'activity_drop',
      severity: 'warning',
      title: 'Baisse forte d’activité',
      description: `Activité en recul de ${Math.abs(Math.round(trendPct))}% vs période précédente.`,
    });
  }

  if (input.player.status === 'watch') {
    alerts.push({
      kind: 'watch',
      severity: 'warning',
      title: 'Joueur à surveiller',
      description: 'Statut RH marqué comme suivi prioritaire.',
    });
  }

  return alerts;
}

export function getActivityLevel(value: number): ActivityLevel {
  if (value >= 80) return 'very_active';
  if (value >= 50) return 'active';
  if (value >= 25) return 'low';
  return 'inactive';
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (!isValidDate(date)) return '—';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (!isValidDate(date)) return '—';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  if (hours <= 0) return `${minutes} min`;
  if (minutes <= 0) return `${hours} h`;
  return `${hours} h ${minutes.toString().padStart(2, '0')}`;
}

export function aggregateVoiceSessions(
  sessions: DiscordVoiceSessionRow[],
  mode: VoiceAggregationMode,
): VoiceAggregate[] {
  const buckets = new Map<string, VoiceAggregate>();
  for (const session of sessions) {
    const key = getVoiceBucketKey(session, mode);
    const current = buckets.get(key) ?? {
      key,
      label: key,
      seconds: 0,
      sessions: 0,
    };
    current.seconds += session.duration_seconds ?? 0;
    current.sessions += 1;
    buckets.set(key, current);
  }
  return [...buckets.values()].sort((a, b) => a.key.localeCompare(b.key));
}

export function percentChange(current: number, previous: number): number | null {
  if (previous <= 0) return current > 0 ? 100 : null;
  return ((current - previous) / previous) * 100;
}

function getVoiceBucketKey(
  session: DiscordVoiceSessionRow,
  mode: VoiceAggregationMode,
): string {
  const date = new Date(session.joined_at);
  if (mode === 'player') return session.player_id ?? session.discord_user_id;
  if (mode === 'channel') return session.channel_name ?? session.channel_id;
  if (mode === 'month') return date.toISOString().slice(0, 7);
  if (mode === 'week') return `${date.getUTCFullYear()}-W${getIsoWeek(date)}`;
  return date.toISOString().slice(0, 10);
}

function getIsoWeek(date: Date): string {
  const copy = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = copy.getUTCDay() || 7;
  copy.setUTCDate(copy.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(copy.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((copy.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return week.toString().padStart(2, '0');
}

function countActiveDays(snapshots: PlayerActivitySnapshotRow[]): number {
  const days = new Set<string>();
  for (const snapshot of snapshots) {
    if (snapshot.active_day || (snapshot.battles_delta ?? 0) > 0) {
      days.add(snapshot.snapshot_date);
    }
  }
  return days.size;
}

function sumVoiceSeconds(sessions: DiscordVoiceSessionRow[]): number {
  return sessions.reduce((sum, session) => sum + (session.duration_seconds ?? 0), 0);
}

function sumNullable(values: Array<number | null>): number | null {
  const finite = values.filter((value): value is number => Number.isFinite(value));
  if (finite.length === 0) return null;
  return finite.reduce((sum, value) => sum + value, 0);
}

function latestDate(values: Array<string | null | undefined>): string | null {
  let latest: Date | null = null;
  for (const value of values) {
    if (!value) continue;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) continue;
    if (!latest || date > latest) latest = date;
  }
  return latest?.toISOString() ?? null;
}

function isValidDate(value: Date): boolean {
  return !Number.isNaN(value.getTime());
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function daysBetween(from: Date, to: Date): number {
  return Math.max(0, Math.floor((to.getTime() - from.getTime()) / 86_400_000));
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}
