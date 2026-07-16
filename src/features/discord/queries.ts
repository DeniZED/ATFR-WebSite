import { useQuery } from '@tanstack/react-query';

export interface DiscordChannel {
  id: string;
  name: string;
  position: number;
}

export interface DiscordWidgetMember {
  id: string;
  username: string;
  discriminator?: string;
  avatar_url?: string | null;
  status: 'online' | 'idle' | 'dnd';
  /** Set when the member is currently in a voice channel. */
  channel_id?: string | null;
  activity?: { name: string };
}

export interface DiscordWidget {
  id: string;
  name: string;
  instant_invite: string | null;
  presence_count: number;
  channels: DiscordChannel[];
  members: DiscordWidgetMember[];
}

export interface DiscordCommunityStats {
  total_members: number;
  atfr_members: number;
  ato_members: number;
  online_total: number;
  atfr_online: number;
  ato_online: number;
  voice_seconds_30d: number;
  voice_members_30d: number;
  computedAt: string;
}

/**
 * Agrégats issus du bot (membres par rôle de clan, temps vocal 30j).
 * Servis par la fonction Netlify discord-community, qui lit la config en
 * base et applique une fonction SECURITY DEFINER. Renvoie null si la
 * fonction est indisponible pour que l'UI retombe proprement sur le widget.
 */
export function useDiscordCommunityStats() {
  return useQuery<DiscordCommunityStats | null>({
    queryKey: ['discord_community_stats'],
    queryFn: async () => {
      const res = await fetch('/.netlify/functions/discord-community', {
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) return null;
      return (await res.json()) as DiscordCommunityStats;
    },
    staleTime: 5 * 60_000,
    refetchInterval: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useDiscordWidget(serverId: string | null | undefined) {
  return useQuery<DiscordWidget | null>({
    queryKey: ['discord_widget', serverId ?? 'none'],
    enabled: !!serverId,
    queryFn: async () => {
      const res = await fetch(
        `https://discord.com/api/guilds/${serverId}/widget.json`,
      );
      if (!res.ok) {
        // Widget disabled, wrong ID, or rate-limited. We surface null so
        // the section can hide gracefully or fall back to invite URL.
        return null;
      }
      return (await res.json()) as DiscordWidget;
    },
    // Refresh every 30s while the home is open — voice channel
    // composition changes constantly. Stale-while-revalidate keeps the
    // UI snappy.
    staleTime: 30_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: false,
  });
}
