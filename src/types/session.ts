// src/types/session.ts
export interface Card {
  id: string;
  text: string;
}

export interface Category {
  id: string;
  name: string;
  cards: Card[];
}

// src/types/session.ts
export interface Session {
  id: string;
  title: string;
  description: string;
  cards: Card[];
  categories: Category[];
  status: 'draft' | 'active' | 'completed';
  createdAt: string;
  createdBy: string;
  participantCount: number;
  isOpen: boolean;
  code: string;
}

export interface SessionStore {
  sessions: Session[];
  isLoading: boolean;
  error: string | null;
  createSession: (session: Omit<Session, 'id' | 'createdAt' | 'code'>) => Promise<void>;
  updateSession: (id: string, session: Partial<Session>) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  fetchSessions: () => Promise<void>;
}


export interface ParticipantSort {
  id: string;
  participantId: string;
  sessionId: string;
  completedAt?: string;
  categories: {
    id: string;
    name: string;
    cardIds: string[];
  }[];
}

export interface ParticipantSession {
  id: string;
  sessionId: string;
  startedAt: string;
  completedAt?: string;
  cards: Card[];
  categories: Category[];
}