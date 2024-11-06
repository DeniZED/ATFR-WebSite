import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Application {
  id: string;
  timestamp: number;
  status: 'pending' | 'accepted' | 'rejected';
  playerName: string;
  discordTag: string;
  wn8: string;
  winRate: string;
  battles: string;
  tier10Count: string;
  availability: string;
  motivation: string;
  previousClans: string;
  targetClan: string;
}

interface ApplicationsState {
  applications: Application[];
  addApplication: (application: Omit<Application, 'id' | 'timestamp' | 'status'>) => Promise<void>;
  updateStatus: (id: string, status: Application['status']) => void;
  deleteApplication: (id: string) => void;
}

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1303716498749264053/pss6pxCyqr7clvQsqAkQXVKXPQcpmi3SlA45kAQkALlSgauL44qVH37u4AQ2WFsrxzEq';

export const useApplicationsStore = create<ApplicationsState>()(
  persist(
    (set) => ({
      applications: [],
      addApplication: async (application) => {
        const newApplication = {
          ...application,
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          status: 'pending' as const
        };

        // Notification Discord via webhook
        try {
          await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              embeds: [{
                title: `📝 Nouvelle candidature ${application.targetClan}`,
                color: 0xF4B223,
                fields: [
                  { name: 'Joueur', value: application.playerName, inline: true },
                  { name: 'WN8', value: application.wn8, inline: true },
                  { name: 'Winrate', value: application.winRate, inline: true },
                  { name: 'Discord', value: application.discordTag, inline: true },
                  { name: 'Chars Tier X', value: application.tier10Count, inline: true },
                  { name: 'Batailles', value: application.battles, inline: true },
                  { name: 'Clan actuel', value: application.previousClans, inline: true },
                  { name: 'Disponibilités', value: application.availability },
                  { name: 'Motivation', value: application.motivation }
                ],
                timestamp: new Date().toISOString(),
                url: `https://tomato.gg/stats/EU/${encodeURIComponent(application.playerName)}`
              }]
            })
          });
        } catch (error) {
          console.error('Erreur lors de l\'envoi de la notification Discord:', error);
        }

        set((state) => ({
          applications: [newApplication, ...state.applications]
        }));
      },
      updateStatus: (id, status) => set((state) => ({
        applications: state.applications.map(app =>
          app.id === id ? { ...app, status } : app
        )
      })),
      deleteApplication: (id) => set((state) => ({
        applications: state.applications.filter(app => app.id !== id)
      }))
    }),
    {
      name: 'applications-storage'
    }
  )
);