import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { env } from '@/lib/env';
import type {
  Database,
  DiscordGuildMemberRow,
  DiscordMemberPayload,
  DiscordVoiceSessionRow,
  PlayerActivitySnapshotRow,
  PlayerDiscordLinkRow,
  PlayerHrStatus,
  PlayerRow,
  PlayerStaffNoteRow,
  PlayerStatusHistoryRow,
  PlayerTrackingSettingsRow,
  StaffNoteType,
} from '@/types/database';
import {
  buildPlayerSummary,
  type ActivityPeriod,
  type PlayerActivitySummary,
} from '@/features/rh/activity';

type PlayerInsert = Database['public']['Tables']['players']['Insert'];
type PlayerUpdate = Database['public']['Tables']['players']['Update'];
type DiscordLinkInsert =
  Database['public']['Tables']['player_discord_links']['Insert'];
type DiscordLinkUpdate =
  Database['public']['Tables']['player_discord_links']['Update'];
type StaffNoteInsert =
  Database['public']['Tables']['player_staff_notes']['Insert'];
type TrackingSettingsInsert =
  Database['public']['Tables']['player_tracking_settings']['Insert'];
type TrackingSettingsUpdate =
  Database['public']['Tables']['player_tracking_settings']['Update'];

export interface HrListData {
  period: ActivityPeriod;
  players: PlayerActivitySummary[];
}

export interface HrPlayerDetailData {
  period: ActivityPeriod;
  summary: PlayerActivitySummary;
  trackingSettings: PlayerTrackingSettingsRow | null;
  statusHistory: PlayerStatusHistoryRow[];
  memberHistory: Database['public']['Tables']['members_history']['Row'][];
  persistedAlerts: Database['public']['Tables']['player_alerts']['Row'][];
}

export interface SavePlayerInput {
  id: string;
  patch: PlayerUpdate;
  previousStatus?: PlayerHrStatus | null;
  previousRole?: string | null;
  actorId?: string | null;
}

export interface SaveDiscordLinkInput {
  playerId: string;
  linkId?: string | null;
  discordUserId: string;
  discordTag?: string | null;
  discordRole?: string | null;
  guildId?: string | null;
  actorId?: string | null;
}

export interface AddStaffNoteInput {
  playerId: string;
  noteType: StaffNoteType;
  content: string;
  authorId?: string | null;
}

export interface SaveTrackingSettingsInput {
  playerId: string;
  patch: TrackingSettingsUpdate;
  actorId?: string | null;
}

export interface ImportMembersInput {
  clanTag?: string | null;
  clanId?: number | null;
  members?: Array<{
    account_id: number;
    account_name: string;
    role: string;
    joined_at?: number | null;
  }>;
}

export interface AutoLinkDiscordInput {
  guildId?: string | null;
  members?: DiscordMemberPayload[];
}

export interface DiscordFullSyncResult {
  synced: number;
  linked: number;
  statuses: number;
  guildId: string;
}

export function useHrPlayers(
  period: ActivityPeriod,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: ['hr', 'players', period.from.toISOString(), period.to.toISOString()],
    enabled: options.enabled ?? true,
    queryFn: async (): Promise<HrListData> => {
      const [
        playersResult,
        linksResult,
        snapshotsResult,
        voiceResult,
        notesResult,
        settingsResult,
      ] = await Promise.all([
        supabase.from('players').select('*').order('nickname'),
        supabase.from('player_discord_links').select('*'),
        supabase
          .from('player_activity_snapshots')
          .select('*')
          .gte('snapshot_date', isoDate(period.previousFrom))
          .lte('snapshot_date', isoDate(period.to)),
        supabase
          .from('discord_voice_sessions')
          .select('*')
          .gte('joined_at', period.previousFrom.toISOString())
          .lte('joined_at', period.to.toISOString()),
        supabase
          .from('player_staff_notes')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(500),
        supabase.from('player_tracking_settings').select('*'),
      ]);

      throwIfError(playersResult.error);
      throwIfError(linksResult.error);
      throwIfError(snapshotsResult.error);
      throwIfError(voiceResult.error);
      throwIfError(notesResult.error);
      if (settingsResult.error && !isMissingRelationError(settingsResult.error)) {
        throw settingsResult.error;
      }

      const rows = (playersResult.data ?? []) as PlayerRow[];
      const links = (linksResult.data ?? []) as PlayerDiscordLinkRow[];
      const snapshots =
        (snapshotsResult.data ?? []) as PlayerActivitySnapshotRow[];
      const voiceSessions = (voiceResult.data ?? []) as DiscordVoiceSessionRow[];
      const notes = (notesResult.data ?? []) as PlayerStaffNoteRow[];
      const settings =
        (settingsResult.data ?? []) as PlayerTrackingSettingsRow[];

      return {
        period,
        players: rows.map((player) =>
          buildSummaryForPlayer({
            player,
            period,
            links,
            snapshots,
            voiceSessions,
            notes,
            trackingSettings: settings,
          }),
        ),
      };
    },
    staleTime: 30_000,
  });
}

export function useDiscordGuildMembers(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['hr', 'discord-members'],
    enabled: options.enabled ?? true,
    queryFn: async (): Promise<DiscordGuildMemberRow[]> => {
      const { data, error } = await supabase
        .from('discord_guild_members')
        .select('*')
        .order('last_seen_at', { ascending: false });

      if (error) {
        if (error.code === '42P01' || error.code === 'PGRST205') {
          return [];
        }
        throw error;
      }

      return (data ?? []) as DiscordGuildMemberRow[];
    },
  });
}

export function useHrPlayerDetail(
  playerId: string | undefined,
  period: ActivityPeriod,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: [
      'hr',
      'player',
      playerId ?? 'none',
      period.from.toISOString(),
      period.to.toISOString(),
    ],
    enabled: !!playerId && (options.enabled ?? true),
    queryFn: async (): Promise<HrPlayerDetailData> => {
      const [
        playerResult,
        linksResult,
        snapshotsResult,
        voiceResult,
        notesResult,
        historyResult,
        alertsResult,
        settingsResult,
      ] = await Promise.all([
        supabase.from('players').select('*').eq('id', playerId!).single(),
        supabase
          .from('player_discord_links')
          .select('*')
          .eq('player_id', playerId!),
        supabase
          .from('player_activity_snapshots')
          .select('*')
          .eq('player_id', playerId!)
          .gte('snapshot_date', isoDate(period.previousFrom))
          .lte('snapshot_date', isoDate(period.to))
          .order('snapshot_date', { ascending: false }),
        supabase
          .from('discord_voice_sessions')
          .select('*')
          .gte('joined_at', period.previousFrom.toISOString())
          .lte('joined_at', period.to.toISOString())
          .order('joined_at', { ascending: false }),
        supabase
          .from('player_staff_notes')
          .select('*')
          .eq('player_id', playerId!)
          .order('created_at', { ascending: false }),
        supabase
          .from('player_status_history')
          .select('*')
          .eq('player_id', playerId!)
          .order('changed_at', { ascending: false }),
        supabase
          .from('player_alerts')
          .select('*')
          .eq('player_id', playerId!)
          .is('resolved_at', null)
          .order('detected_at', { ascending: false }),
        supabase
          .from('player_tracking_settings')
          .select('*')
          .eq('player_id', playerId!)
          .maybeSingle(),
      ]);

      throwIfError(playerResult.error);
      throwIfError(linksResult.error);
      throwIfError(snapshotsResult.error);
      throwIfError(voiceResult.error);
      throwIfError(notesResult.error);
      throwIfError(historyResult.error);
      throwIfError(alertsResult.error);
      if (settingsResult.error && !isMissingRelationError(settingsResult.error)) {
        throw settingsResult.error;
      }

      const player = playerResult.data as PlayerRow;
      const memberHistoryResult = player.account_id
        ? await supabase
            .from('members_history')
            .select('*')
            .eq('account_id', player.account_id)
            .order('occurred_at', { ascending: false })
        : { data: [], error: null };
      throwIfError(memberHistoryResult.error);
      const links = (linksResult.data ?? []) as PlayerDiscordLinkRow[];
      const snapshots =
        (snapshotsResult.data ?? []) as PlayerActivitySnapshotRow[];
      const voiceSessions = (voiceResult.data ?? []) as DiscordVoiceSessionRow[];
      const notes = (notesResult.data ?? []) as PlayerStaffNoteRow[];
      const trackingSettings =
        (settingsResult.data ?? null) as PlayerTrackingSettingsRow | null;

      return {
        period,
        summary: buildSummaryForPlayer({
          player,
          period,
          links,
          snapshots,
          voiceSessions,
          notes,
          trackingSettings: trackingSettings ? [trackingSettings] : [],
        }),
        trackingSettings,
        statusHistory:
          (historyResult.data ?? []) as PlayerStatusHistoryRow[],
        memberHistory:
          (memberHistoryResult.data ?? []) as HrPlayerDetailData['memberHistory'],
        persistedAlerts:
          (alertsResult.data ?? []) as HrPlayerDetailData['persistedAlerts'],
      };
    },
  });
}

export function useCreatePlayer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: PlayerInsert) => {
      const { data, error } = await supabase
        .from('players')
        .insert(input)
        .select('*')
        .single();
      if (error) throw error;
      return data as PlayerRow;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['hr'] });
      await qc.refetchQueries({ queryKey: ['hr', 'players'], type: 'active' });
    },
  });
}

export function useSavePlayer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      patch,
      previousStatus,
      previousRole,
      actorId,
    }: SavePlayerInput) => {
      const { error } = await supabase.from('players').update(patch).eq('id', id);
      if (error) throw error;

      const statusChanged =
        patch.status != null && patch.status !== previousStatus;
      const roleChanged =
        patch.internal_role !== undefined && patch.internal_role !== previousRole;

      if (statusChanged || roleChanged) {
        const { error: historyError } = await supabase
          .from('player_status_history')
          .insert({
            player_id: id,
            author_id: actorId ?? null,
            old_status: previousStatus ?? null,
            new_status: (patch.status as PlayerHrStatus | undefined) ?? previousStatus ?? null,
            old_role: previousRole ?? null,
            new_role:
              patch.internal_role !== undefined
                ? patch.internal_role ?? null
                : previousRole ?? null,
          });
        if (historyError) throw historyError;
      }
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['hr'] });
      qc.invalidateQueries({ queryKey: ['hr', 'player', variables.id] });
    },
  });
}

export function useUpsertDiscordLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: SaveDiscordLinkInput) => {
      const basePayload = {
        discord_user_id: input.discordUserId.trim(),
        discord_tag: input.discordTag?.trim() || null,
        discord_role: input.discordRole?.trim() || null,
        guild_id: input.guildId?.trim() || null,
        linked_by: input.actorId ?? null,
        is_primary: true,
      };

      const { error } = input.linkId
        ? await supabase
            .from('player_discord_links')
            .update(basePayload satisfies DiscordLinkUpdate)
            .eq('id', input.linkId)
        : await supabase.from('player_discord_links').insert({
            ...basePayload,
            player_id: input.playerId,
          } satisfies DiscordLinkInsert);
      if (error) throw error;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['hr'] });
      await qc.refetchQueries({ queryKey: ['hr', 'players'], type: 'active' });
    },
  });
}

export function useDeleteDiscordLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (linkId: string) => {
      const { error } = await supabase
        .from('player_discord_links')
        .delete()
        .eq('id', linkId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr'] }),
  });
}

export function useAddStaffNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: AddStaffNoteInput) => {
      const payload: StaffNoteInsert = {
        player_id: input.playerId,
        author_id: input.authorId ?? null,
        note_type: input.noteType,
        content: input.content.trim(),
      };
      const { error } = await supabase.from('player_staff_notes').insert(payload);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr'] }),
  });
}

export function useSavePlayerTrackingSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      playerId,
      patch,
      actorId,
    }: SaveTrackingSettingsInput) => {
      const payload: TrackingSettingsInsert = {
        player_id: playerId,
        manual_status_lock: patch.manual_status_lock ?? false,
        ignore_voice_alerts: patch.ignore_voice_alerts ?? false,
        ignore_wot_alerts: patch.ignore_wot_alerts ?? false,
        inactivity_warning_days: patch.inactivity_warning_days ?? null,
        inactivity_danger_days: patch.inactivity_danger_days ?? null,
        voice_target_minutes: patch.voice_target_minutes ?? null,
        note: patch.note ?? null,
        updated_by: actorId ?? null,
      };

      const { error } = await supabase
        .from('player_tracking_settings')
        .upsert(payload, { onConflict: 'player_id' });
      if (error) throw error;
    },
    onSuccess: async (_data, variables) => {
      await qc.invalidateQueries({ queryKey: ['hr'] });
      await qc.invalidateQueries({
        queryKey: ['hr', 'player', variables.playerId],
      });
      await qc.refetchQueries({ queryKey: ['hr', 'players'], type: 'active' });
    },
  });
}

export function useImportMembersToPlayers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ImportMembersInput = {}): Promise<number> => {
      const { data, error } = await supabase.rpc('import_members_to_players', {
        p_clan_tag: input.clanTag ?? env.clanTag ?? null,
        p_clan_id: (input.clanId ?? Number(env.clanId)) || null,
        p_members: input.members ?? [],
      });
      if (error) {
        if (error.code === '42883') {
          throw new Error(
            'Fonction import_members_to_players introuvable. Relance la migration RH complete dans Supabase.',
          );
        }
        throw error;
      }
      return data ?? 0;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['hr'] });
      await qc.refetchQueries({ queryKey: ['hr', 'players'], type: 'active' });
    },
  });
}

export function useAutoLinkDiscordMembers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: AutoLinkDiscordInput = {}): Promise<number> => {
      const members = input.members ?? [];
      if (members.length > 0) {
        const { error: syncError } = await supabase.rpc(
          'upsert_discord_guild_members',
          {
            p_guild_id: input.guildId ?? null,
            p_members: members,
          },
        );
        if (syncError) {
          if (syncError.code === '42883') {
            throw new Error(
              'Fonction upsert_discord_guild_members introuvable. Relance la migration RH Discord.',
            );
          }
          throw syncError;
        }
      }

      const { data, error } = await supabase.rpc('auto_link_discord_members', {
        p_guild_id: input.guildId ?? null,
      });
      if (error) {
        if (error.code === '42883') {
          throw new Error(
            'Fonction auto_link_discord_members introuvable. Relance la migration RH Discord.',
          );
        }
        throw error;
      }
      return data ?? 0;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['hr'] });
      await qc.refetchQueries({ queryKey: ['hr', 'players'], type: 'active' });
    },
  });
}

export function useRecomputePlayerStatuses() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<number> => {
      const { data, error } = await supabase.rpc('recompute_player_hr_statuses');
      if (error) {
        if (error.code === '42883') {
          throw new Error(
            'Fonction recompute_player_hr_statuses introuvable. Relance la migration RH Discord.',
          );
        }
        throw error;
      }
      return data ?? 0;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['hr'] });
      await qc.refetchQueries({ queryKey: ['hr', 'players'], type: 'active' });
    },
  });
}

export function useSyncAllDiscordMembers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<DiscordFullSyncResult> => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        throw new Error('Session admin introuvable. Reconnecte-toi.');
      }

      const res = await fetch('/.netlify/functions/discord-sync-members', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      const payload = (await res.json().catch(() => null)) as
        | DiscordFullSyncResult
        | { error?: string; detail?: string }
        | null;

      if (!res.ok) {
        const message =
          payload && 'error' in payload && payload.error
            ? payload.detail
              ? `${payload.error}: ${payload.detail}`
              : payload.error
            : `Synchronisation Discord impossible (${res.status}).`;
        throw new Error(message);
      }

      return payload as DiscordFullSyncResult;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['hr'] });
      await qc.invalidateQueries({ queryKey: ['hr', 'discord-members'] });
      await qc.refetchQueries({ queryKey: ['hr', 'players'], type: 'active' });
    },
  });
}

function buildSummaryForPlayer(input: {
  player: PlayerRow;
  period: ActivityPeriod;
  links: PlayerDiscordLinkRow[];
  snapshots: PlayerActivitySnapshotRow[];
  voiceSessions: DiscordVoiceSessionRow[];
  notes: PlayerStaffNoteRow[];
  trackingSettings: PlayerTrackingSettingsRow[];
}): PlayerActivitySummary {
  const link =
    input.links.find((candidate) => candidate.player_id === input.player.id) ??
    null;
  const currentSnapshots = input.snapshots.filter(
    (snapshot) =>
      snapshot.player_id === input.player.id &&
      isBetweenDateOnly(snapshot.snapshot_date, input.period.from, input.period.to),
  );
  const previousSnapshots = input.snapshots.filter(
    (snapshot) =>
      snapshot.player_id === input.player.id &&
      isBetweenDateOnly(
        snapshot.snapshot_date,
        input.period.previousFrom,
        input.period.previousTo,
      ),
  );
  const currentVoice = input.voiceSessions.filter(
    (session) =>
      belongsToPlayer(session, input.player, link) &&
      isBetweenDateTime(session.joined_at, input.period.from, input.period.to),
  );
  const previousVoice = input.voiceSessions.filter(
    (session) =>
      belongsToPlayer(session, input.player, link) &&
      isBetweenDateTime(
        session.joined_at,
        input.period.previousFrom,
        input.period.previousTo,
      ),
  );
  const trackingSettings =
    input.trackingSettings.find(
      (settings) => settings.player_id === input.player.id,
    ) ?? null;

  return buildPlayerSummary({
    player: input.player,
    discordLink: link,
    trackingSettings,
    snapshots: currentSnapshots,
    previousSnapshots,
    voiceSessions: currentVoice,
    previousVoiceSessions: previousVoice,
    notes: input.notes.filter((note) => note.player_id === input.player.id),
    period: input.period,
  });
}

function belongsToPlayer(
  session: DiscordVoiceSessionRow,
  player: PlayerRow,
  link: PlayerDiscordLinkRow | null,
): boolean {
  if (session.player_id) return session.player_id === player.id;
  if (!link) return false;
  return session.discord_user_id === link.discord_user_id;
}

function isBetweenDateOnly(value: string, from: Date, to: Date): boolean {
  const date = new Date(`${value}T12:00:00.000Z`);
  return date >= from && date <= to;
}

function isBetweenDateTime(value: string, from: Date, to: Date): boolean {
  const date = new Date(value);
  return date >= from && date <= to;
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function throwIfError(error: { message: string } | null) {
  if (error) throw error;
}

function isMissingRelationError(error: {
  code?: string;
  message?: string;
}): boolean {
  return (
    error.code === '42P01' ||
    error.code === 'PGRST205' ||
    error.message?.includes('player_tracking_settings') === true
  );
}
