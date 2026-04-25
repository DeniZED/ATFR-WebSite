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
