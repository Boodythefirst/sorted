// src/types/session.ts
export interface Card {
  category: string;
  id: string;
  text: string;
}

export interface Category {
  id: string;
  name: string;
  cards: Card[];
}

export type SessionType = 'closed' | 'open' | 'hybrid';

export interface Session {
  id: string;
  title: string;
  description: string;
  cards: Card[];
  categories: Category[];
  status: 'draft' | 'active' | 'completed';
  type: SessionType;  // Make sure this is included
  allowNewCategories: boolean;
  createdAt: string;
  createdBy: string;
  participantCount: number;
  isOpen: boolean;
  code: string;
  archived: boolean;
  archivedAt?: string;
}

export interface ParticipantSort {
  id: string;
  sessionId: string;
  participantId: string;
  completedAt?: string;
  categories: {
    id: string;
    name: string;
    cardIds: string[];
  }[];
}

export interface SessionStore {
  sessions: Session[];
  filteredSessions: Session[];
  isLoading: boolean;
  error: string | null;
  filter: {
    search: string;
    status: string;
    showArchived: boolean;
  };
  createSession: (session: Omit<Session, 'id' | 'createdAt' | 'code'>) => Promise<void>;
  updateSession: (id: string, session: Partial<Session>) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  fetchSessions: () => Promise<void>;
  setFilter: (filter: Partial<FilterState>) => void;
  duplicateSession: (sessionId: string) => Promise<Session>;
  archiveSession: (id: string) => Promise<void>;
  unarchiveSession: (id: string) => Promise<void>;
}