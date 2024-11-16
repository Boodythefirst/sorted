// src/types/auth.ts
export interface User {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
  }
  
  export interface AuthState {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, name: string) => Promise<void>;
    signOut: () => Promise<void>;
  }