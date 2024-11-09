import { create } from 'zustand';
import { auth } from '../services/firebase';
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User 
} from 'firebase/auth';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,

  login: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      set({ 
        isAuthenticated: true, 
        user: userCredential.user,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur de connexion',
        loading: false 
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
      set({ 
        isAuthenticated: false, 
        user: null,
        error: null 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur de déconnexion' 
      });
      throw error;
    }
  },

  initialize: () => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      set({ 
        isAuthenticated: !!user,
        user,
        loading: false 
      });
    });

    // Cleanup subscription
    return () => unsubscribe();
  }
}));