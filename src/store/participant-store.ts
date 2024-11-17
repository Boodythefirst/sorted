// src/store/participant-store.ts
import { create } from 'zustand';
import { 
  collection, 
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Session, ParticipantSort, Category } from '@/types/session';

interface ParticipantSession {
  title: ReactNode;
  description: ReactNode;
  id: string;
  sessionId: string;
  startedAt: string;
  completedAt?: string;
  cards: Session['cards'];
  categories: Category[];
  type: Session['type'];
  allowNewCategories: boolean;
}

interface ParticipantState {
  currentSession: ParticipantSession | null;
  isLoading: boolean;
  error: string | null;
  customCategories: Category[];
  joinSession: (code: string) => Promise<void>;
  submitSort: (sort: Omit<ParticipantSort, 'id'>) => Promise<void>;
  addCustomCategory: (category: Category) => void;
  removeCustomCategory: (categoryId: string) => void;
}

export const useParticipantStore = create<ParticipantState>((set, get) => ({
  currentSession: null,
  isLoading: false,
  error: null,
  customCategories: [],

  joinSession: async (code: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // Query for session with the given code
      const sessionsRef = collection(db, 'sessions');
      const q = query(sessionsRef, where('code', '==', code));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('Session not found. Please check the code and try again.');
      }

      const sessionDoc = querySnapshot.docs[0];
      const sessionData = sessionDoc.data() as Session;
      
      if (sessionData.status !== 'active') {
        throw new Error('This session is not currently active.');
      }

      // Create participant session
      const participantSession: Omit<ParticipantSession, 'id'> = {
        sessionId: sessionDoc.id,
        startedAt: new Date().toISOString(),
        cards: sessionData.cards,
        categories: sessionData.categories,
        type: sessionData.type,
        allowNewCategories: sessionData.type !== 'closed'
      };

      const participantSessionRef = await addDoc(
        collection(db, 'participant_sessions'),
        {
          ...participantSession,
          startedAt: serverTimestamp(),
        }
      );

      set({
        currentSession: {
          id: participantSessionRef.id,
          ...participantSession,
        },
        customCategories: [],
        isLoading: false,
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  submitSort: async (sort) => {
    try {
      set({ isLoading: true, error: null });
      
      // Combine predefined and custom categories
      const currentSession = get().currentSession;
      const customCategories = get().customCategories;
      
      if (!currentSession) {
        throw new Error('No active session');
      }

      // Add custom categories to the sort data if any
      const sortWithCustomCategories = {
        ...sort,
        categories: [
          ...sort.categories,
          ...customCategories.map(category => ({
            id: category.id,
            name: category.name,
            cardIds: category.cards.map(card => card.id)
          }))
        ]
      };

      await addDoc(collection(db, 'participant_sorts'), {
        ...sortWithCustomCategories,
        completedAt: serverTimestamp(),
      });

      // Update participant session
      await updateDoc(doc(db, 'participant_sessions', currentSession.id), {
        completedAt: serverTimestamp(),
        customCategories: customCategories
      });

      set({ currentSession: null, customCategories: [], isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  addCustomCategory: (category: Category) => {
    const currentSession = get().currentSession;
    
    if (!currentSession || !currentSession.allowNewCategories) {
      return;
    }

    set(state => ({
      customCategories: [...state.customCategories, category]
    }));
  },

  removeCustomCategory: (categoryId: string) => {
    set(state => ({
      customCategories: state.customCategories.filter(c => c.id !== categoryId)
    }));
  },
}));