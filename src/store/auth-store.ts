// src/store/auth-store.ts
import { create } from 'zustand';
import Cookies from 'js-cookie';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { AuthState, User } from '@/types/auth';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  error: null,

  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      const userData = userDoc.data() as Omit<User, 'id'>;
      
      // Set auth cookie
      Cookies.set('auth', 'true', { expires: 7 }); // 7 days expiry
      
      set({ 
        user: {
          id: userCredential.user.uid,
          ...userData
        },
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: (error as Error).message, 
        isLoading: false 
      });
      throw error;
    }
  },

  signUp: async (email: string, password: string, name: string) => {
    try {
      set({ isLoading: true, error: null });
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      const userData: Omit<User, 'id'> = {
        email,
        name,
        createdAt: new Date(),
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userData);

      // Set auth cookie
      Cookies.set('auth', 'true', { expires: 7 }); // 7 days expiry

      set({ 
        user: {
          id: userCredential.user.uid,
          ...userData
        },
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: (error as Error).message, 
        isLoading: false 
      });
      throw error;
    }
  },

  signOut: async () => {
    try {
      await firebaseSignOut(auth);
      // Remove auth cookie
      Cookies.remove('auth');
      set({ user: null });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },
}));

// Set up auth state listener
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data() as Omit<User, 'id'>;
    
    // Ensure cookie is set
    Cookies.set('auth', 'true', { expires: 7 });
    
    useAuthStore.setState({ 
      user: {
        id: user.uid,
        ...userData
      },
      isLoading: false 
    });
  } else {
    // Remove cookie when no user
    Cookies.remove('auth');
    useAuthStore.setState({ user: null, isLoading: false });
  }
});