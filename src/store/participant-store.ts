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
import { ParticipantSession, ParticipantSort, Session } from '@/types/session';

interface ParticipantStore {
  currentSession: ParticipantSession | null;
  isLoading: boolean;
  error: string | null;
  joinSession: (code: string) => Promise<void>;
  submitSort: (sort: Omit<ParticipantSort, 'id'>) => Promise<void>;
}

export const useParticipantStore = create<ParticipantStore>((set, get) => ({
  currentSession: null,
  isLoading: false,
  error: null,

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
      console.log('Submitting sort:', sort) // Debug log
      
      const sortRef = await addDoc(collection(db, 'participant_sorts'), {
        ...sort,
        completedAt: serverTimestamp(),
      });
      console.log('Sort submitted with ID:', sortRef.id) // Debug log
  
      // Update participant session
      if (get().currentSession) {
        await updateDoc(doc(db, 'participant_sessions', get().currentSession.id), {
          completedAt: serverTimestamp(),
        });
      }
  
      set({ currentSession: null, isLoading: false });
    } catch (error) {
      console.error('Error submitting sort:', error) // Debug log
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
}));