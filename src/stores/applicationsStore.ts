import { create } from 'zustand';
import { ref, get, set, remove, onValue, push, getDatabase } from 'firebase/database';
import { db } from '../services/firebase';

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
  initialized: boolean;
  addApplication: (application: Omit<Application, 'id' | 'timestamp' | 'status'>) => Promise<void>;
  updateStatus: (id: string, status: Application['status']) => Promise<void>;
  deleteApplication: (id: string) => Promise<void>;
  initialize: () => void;
}

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1303716498749264053/pss6pxCyqr7clvQsqAkQXVKXPQcpmi3SlA45kAQkALlSgauL44qVH37u4AQ2WFsrxzEq';

export const useApplicationsStore = create<ApplicationsState>((set, get) => ({
  applications: [],
  initialized: false,

  initialize: () => {
    if (get().initialized) return;

    const applicationsRef = ref(db, 'applications');
    onValue(applicationsRef, (snapshot) => {
      const data = snapshot.val();
      const applications = data ? Object.entries(data).map(([id, app]) => ({
        id,
        ...(app as Omit<Application, 'id'>)
      })) : [];
      
      set({ 
        applications: applications.sort((a, b) => b.timestamp - a.timestamp),
        initialized: true 
      });
    });
  },

  addApplication: async (application) => {
    try {
      const applicationsRef = ref(db, 'applications');
      const newApplicationRef = push(applicationsRef);
      
      const newApplication = {
        ...application,
        timestamp: Date.now(),
        status: 'pending' as const
      };

      await set(newApplicationRef, newApplication);

      // Send Discord notification
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
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la candidature:', error);
      throw new Error('Erreur lors de l\'ajout de la candidature');
    }
  },

  updateStatus: async (id: string, status: Application['status']) => {
    try {
      const applicationRef = ref(db, `applications/${id}`);
      const snapshot = await get(applicationRef);
      
      if (snapshot.exists()) {
        await set(applicationRef, {
          ...snapshot.val(),
          status
        });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw new Error('Erreur lors de la mise à jour du statut');
    }
  },

  deleteApplication: async (id: string) => {
    try {
      const applicationRef = ref(db, `applications/${id}`);
      await remove(applicationRef);
    } catch (error) {
      console.error('Erreur lors de la suppression de la candidature:', error);
      throw new Error('Erreur lors de la suppression de la candidature');
    }
  }
}));