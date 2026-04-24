import { useQuery } from '@tanstack/react-query';

export interface DiscordWidgetMember {
  id: string;
  username: string;
  discriminator?: string;
  avatar_url?: string | null;
  status: 'online' | 'idle' | 'dnd';
  activity?: { name: string };
}

export interface DiscordWidget {
  id: string;
  name: string;
  instant_invite: string | null;
  presence_count: number;
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
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
}
