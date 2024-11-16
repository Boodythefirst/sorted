// src/store/session-store.ts
import { create } from 'zustand';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp,
  getDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SessionStore, Session } from '@/types/session';
import { useAuthStore } from './auth-store';

interface SessionState {
  sessions: Session[];
  filteredSessions: Session[];
  isLoading: boolean;
  error: string | null;
  filter: {
    search: string;
    status: string;
  };
  createSession: (session: Omit<Session, 'id' | 'createdAt' | 'code'>) => Promise<void>;
  updateSession: (id: string, session: Partial<Session>) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  fetchSessions: () => Promise<void>;
  setFilter: (filter: { search: string; status: string }) => void;
  duplicateSession: (sessionId: string) => Promise<Session>;
}
export const useSessionStore = create<SessionState>((set, get) => ({
  sessions: [],
  filteredSessions: [], // This will be set when fetching sessions
  isLoading: false,
  error: null,
  filter: {
    search: "",
    status: "all",
  },
  createSession: async (sessionData) => {
    try {
      set({ isLoading: true, error: null });
      const user = useAuthStore.getState().user;
      
      if (!user) throw new Error('User not authenticated');

      // Generate a random 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      const newSession = {
        ...sessionData,
        code,
        createdBy: user.id,
        createdAt: serverTimestamp(),
        participantCount: 0,
      };

      const docRef = await addDoc(collection(db, 'sessions'), newSession);
      
      set((state) => ({
        sessions: [...state.sessions, { 
          ...newSession, 
          id: docRef.id,
          createdAt: new Date().toISOString(),
        }],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  updateSession: async (id, sessionData) => {
    try {
      set({ isLoading: true, error: null });
      const sessionRef = doc(db, 'sessions', id);
      await updateDoc(sessionRef, sessionData);
      
      set((state) => ({
        sessions: state.sessions.map((session) =>
          session.id === id ? { ...session, ...sessionData } : session
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  deleteSession: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await deleteDoc(doc(db, 'sessions', id));
      
      set((state) => ({
        sessions: state.sessions.filter((session) => session.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  fetchSessions: async () => {
    try {
      set({ isLoading: true, error: null });
      const user = useAuthStore.getState().user;
      
      if (!user) throw new Error('User not authenticated');

      const q = query(
        collection(db, 'sessions'),
        where('createdBy', '==', user.id)
      );

      const querySnapshot = await getDocs(q);
      const sessions = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt instanceof Timestamp 
            ? data.createdAt.toDate().toISOString()
            : new Date().toISOString(),
        };
      }) as Session[];

      // Set both sessions and filteredSessions initially
      set({ 
        sessions, 
        filteredSessions: sessions, // Initialize filteredSessions with all sessions
        isLoading: false 
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  setFilter: (filter) => {
    set({ filter });
    const { sessions } = get();
    
    // If no filter is applied, show all sessions
    if (filter.status === "all" && !filter.search) {
      set({ filteredSessions: sessions });
      return;
    }

    const filteredSessions = sessions.filter(session => {
      // Status filter
      if (filter.status !== "all" && session.status !== filter.status) {
        return false;
      }

      // Search filter
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        return (
          session.title.toLowerCase().includes(searchLower) ||
          session.description.toLowerCase().includes(searchLower) ||
          session.code.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
    set({ filteredSessions });
  },

  duplicateSession: async (sessionId) => {
    try {
      set({ isLoading: true, error: null });
      const sessionRef = doc(db, 'sessions', sessionId);
      const sessionSnap = await getDoc(sessionRef);
      
      if (!sessionSnap.exists()) {
        throw new Error('Session not found');
      }

      const sessionData = sessionSnap.data();
      const newSession = {
        ...sessionData,
        title: `${sessionData.title} (Copy)`,
        status: 'draft',
        code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        createdAt: serverTimestamp(),
        participantCount: 0,
      };

      const docRef = await addDoc(collection(db, 'sessions'), newSession);
      
      const createdSession = {
        id: docRef.id,
        ...newSession,
        createdAt: new Date().toISOString(),
      } as Session;

      set((state) => ({
        sessions: [...state.sessions, createdSession],
        isLoading: false,
      }));

      return createdSession;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  setFilter: (filter) => {
    set({ filter });
    const { sessions } = get();
    const filteredSessions = sessions.filter(session => {
      // Status filter
      if (filter.status !== "all" && session.status !== filter.status) {
        return false;
      }

      // Search filter
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        return (
          session.title.toLowerCase().includes(searchLower) ||
          session.description.toLowerCase().includes(searchLower) ||
          session.code.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
    set({ filteredSessions });
  },
}));