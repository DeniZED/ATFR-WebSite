import { create } from 'zustand';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
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

let unsubscribe: (() => void) | null = null;

export const useApplicationsStore = create<ApplicationsState>((set) => ({
  applications: [],
  initialized: false,

  initialize: () => {
    // Éviter les doubles initialisations
    if (unsubscribe) return;

    const q = query(collection(db, 'applications'), orderBy('timestamp', 'desc'));
    
    unsubscribe = onSnapshot(q, (snapshot) => {
      const applications = snapshot.docs.map(doc => {
        const data = doc.data();
        // Convertir le Timestamp Firebase en timestamp JavaScript
        const timestamp = data.timestamp instanceof Timestamp 
          ? data.timestamp.toMillis() 
          : Date.now();
        
        return {
          id: doc.id,
          ...data,
          timestamp
        } as Application;
      });
      
      set({ applications, initialized: true });
    }, (error) => {
      console.error('Erreur de synchronisation Firebase:', error);
      set({ initialized: true });
    });
  },

  addApplication: async (application) => {
    const newApplication = {
      ...application,
      timestamp: serverTimestamp(),
      status: 'pending' as const
    };

    try {
      // Ajouter à Firebase
      const docRef = await addDoc(collection(db, 'applications'), newApplication);
      console.log('Application ajoutée avec ID:', docRef.id);

      // Notification Discord
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
      console.error('Erreur lors de l\'ajout de la candidature:', error);
      throw error;
    }
  },

  updateStatus: async (id, status) => {
    try {
      await updateDoc(doc(db, 'applications', id), { 
        status,
        updateTimestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  },

  deleteApplication: async (id) => {
    try {
      await deleteDoc(doc(db, 'applications', id));
    } catch (error) {
      console.error('Erreur lors de la suppression de la candidature:', error);
      throw error;
    }
  }
}));