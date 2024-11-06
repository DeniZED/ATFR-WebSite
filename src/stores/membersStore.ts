import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ActivityType = 'join' | 'leave';

interface ClanActivity {
  account_id: number;
  account_name: string;
  type: ActivityType;
  timestamp: number;
  role: string;
  role_i18n: string;
  reason?: string;
}

interface PlayerStats {
  wn8: number;
  battles: number;
  avgTier: number;
  winrate: number;
  lastUpdate: number;
}

interface PlayerInfo {
  discordId?: string;
  stats: PlayerStats[];
}

interface MembersState {
  clanActivities: ClanActivity[];
  playerInfos: Record<number, PlayerInfo>;
  addActivity: (activity: ClanActivity) => void;
  clearActivities: () => void;
  updatePlayerInfo: (accountId: number, info: Partial<PlayerInfo>) => void;
  addPlayerStats: (accountId: number, stats: PlayerStats) => void;
}

export const useMembersStore = create<MembersState>()(
  persist(
    (set) => ({
      clanActivities: [],
      playerInfos: {},
      addActivity: (activity) => set((state) => ({
        clanActivities: [activity, ...state.clanActivities]
      })),
      clearActivities: () => set({ clanActivities: [] }),
      updatePlayerInfo: (accountId, info) => set((state) => ({
        playerInfos: {
          ...state.playerInfos,
          [accountId]: {
            ...state.playerInfos[accountId],
            ...info,
          }
        }
      })),
      addPlayerStats: (accountId, stats) => set((state) => ({
        playerInfos: {
          ...state.playerInfos,
          [accountId]: {
            ...state.playerInfos[accountId],
            stats: [
              ...(state.playerInfos[accountId]?.stats || []),
              stats
            ].slice(-30) // Keep only last 30 stats entries
          }
        }
      }))
    }),
    {
      name: 'members-storage',
    }
  )
);