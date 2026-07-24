import type {
  Database,
  PlayerDiscordLinkRow,
  PlayerStaffNoteRow,
  PlayerStatusHistoryRow,
} from '@/types/database';
import { STATUS_LABELS } from './activity';

type MembersHistoryRow = Database['public']['Tables']['members_history']['Row'];
type PlayerAlertRow = Database['public']['Tables']['player_alerts']['Row'];

export type TimelineKind =
  | 'clan_join'
  | 'clan_leave'
  | 'role_change'
  | 'status_change'
  | 'note'
  | 'alert_open'
  | 'alert_resolved'
  | 'discord_link';

export type TimelineTone = 'neutral' | 'positive' | 'warning' | 'danger';

export interface TimelineEvent {
  at: string;
  kind: TimelineKind;
  label: string;
  detail?: string;
  tone: TimelineTone;
}

function truncate(value: string, max = 90): string {
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

/**
 * Timeline unifiée d'un joueur : fusionne mouvements clan, changements de
 * statut, notes staff, alertes (ouvertes/résolues) et lien Discord, triés du
 * plus récent au plus ancien.
 */
export function computePlayerTimeline(input: {
  memberHistory: MembersHistoryRow[];
  statusHistory: PlayerStatusHistoryRow[];
  notes: PlayerStaffNoteRow[];
  alerts: PlayerAlertRow[];
  discordLink: PlayerDiscordLinkRow | null;
}): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  for (const m of input.memberHistory) {
    if (m.action === 'joined') {
      events.push({
        at: m.occurred_at,
        kind: 'clan_join',
        label: 'Arrivée dans le clan',
        detail: m.new_role ?? undefined,
        tone: 'positive',
      });
    } else if (m.action === 'left') {
      events.push({
        at: m.occurred_at,
        kind: 'clan_leave',
        label: 'Départ du clan',
        tone: 'danger',
      });
    } else if (m.action === 'role_changed') {
      events.push({
        at: m.occurred_at,
        kind: 'role_change',
        label: 'Changement de rôle',
        detail: `${m.previous_role ?? '—'} → ${m.new_role ?? '—'}`,
        tone: 'neutral',
      });
    }
  }

  for (const s of input.statusHistory) {
    const from = s.old_status ? STATUS_LABELS[s.old_status] : '—';
    const to = s.new_status ? STATUS_LABELS[s.new_status] : '—';
    events.push({
      at: s.changed_at,
      kind: 'status_change',
      label: 'Changement de statut RH',
      detail: `${from} → ${to}`,
      tone: 'neutral',
    });
  }

  for (const n of input.notes) {
    events.push({
      at: n.created_at,
      kind: 'note',
      label: 'Note staff',
      detail: truncate(n.content),
      tone: 'neutral',
    });
  }

  for (const a of input.alerts) {
    events.push({
      at: a.detected_at,
      kind: 'alert_open',
      label: 'Alerte détectée',
      detail: a.kind,
      tone: a.severity === 'danger' ? 'danger' : 'warning',
    });
    if (a.resolved_at) {
      events.push({
        at: a.resolved_at,
        kind: 'alert_resolved',
        label: 'Alerte résolue',
        detail: a.kind,
        tone: 'positive',
      });
    }
  }

  if (input.discordLink?.linked_at) {
    events.push({
      at: input.discordLink.linked_at,
      kind: 'discord_link',
      label: 'Lien Discord établi',
      detail: input.discordLink.discord_tag ?? undefined,
      tone: 'neutral',
    });
  }

  return events
    .filter((e) => e.at && !Number.isNaN(new Date(e.at).getTime()))
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}
