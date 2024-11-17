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
import { Session } from '@/types/session';
import { useAuthStore } from './auth-store';

interface FilterState {
  search: string;
  status: string;
  showArchived: boolean;
}

interface SessionState {
  sessions: Session[];
  filteredSessions: Session[];
  isLoading: boolean;
  error: string | null;
  filter: FilterState;
  createSession: (session: Omit<Session, 'id' | 'createdAt' | 'code'>) => Promise<void>;
  updateSession: (id: string, session: Partial<Session>) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  fetchSessions: () => Promise<void>;
  setFilter: (filter: Partial<FilterState>) => void;
  duplicateSession: (sessionId: string) => Promise<Session>;
  archiveSession: (id: string) => Promise<void>;
  unarchiveSession: (id: string) => Promise<void>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessions: [],
  filteredSessions: [],
  isLoading: false,
  error: null,
  filter: {
    search: "",
    status: "all",
    showArchived: false,
  },

  createSession: async (sessionData) => {
    try {
      set({ isLoading: true, error: null });
      const user = useAuthStore.getState().user;
      
      if (!user) throw new Error('User not authenticated');

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      const newSession = {
        ...sessionData,
        code,
        createdBy: user.id,
        createdAt: serverTimestamp(),
        participantCount: 0,
        archived: false,
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

      const currentFilter = get().filter;
      const filteredSessions = applyFilters(sessions, currentFilter);

      set({ 
        sessions,
        filteredSessions,
        isLoading: false 
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  setFilter: (newFilter) => {
    const currentFilter = get().filter;
    const updatedFilter = { ...currentFilter, ...newFilter };
    const sessions = get().sessions;
    
    const filteredSessions = applyFilters(sessions, updatedFilter);

    set({ 
      filter: updatedFilter,
      filteredSessions 
    });
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
        archived: false,
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

  archiveSession: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await updateDoc(doc(db, 'sessions', id), {
        archived: true,
        archivedAt: serverTimestamp()
      });
      
      set((state) => ({
        sessions: state.sessions.map((session) =>
          session.id === id 
            ? { 
                ...session, 
                archived: true,
                archivedAt: new Date().toISOString()
              } 
            : session
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  unarchiveSession: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await updateDoc(doc(db, 'sessions', id), {
        archived: false,
        archivedAt: null
      });
      
      set((state) => ({
        sessions: state.sessions.map((session) =>
          session.id === id 
            ? { 
                ...session, 
                archived: false,
                archivedAt: undefined
              } 
            : session
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
}));

// Helper function to apply filters
function applyFilters(sessions: Session[], filter: FilterState): Session[] {
  return sessions.filter(session => {
    // First filter by archived status
    if (!filter.showArchived && session.archived) {
      return false;
    }

    // Then filter by status if not "all"
    if (filter.status !== "all" && session.status !== filter.status) {
      return false;
    }

    // Finally, apply search if present
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
}