import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  avatar_url?: string;
  fraternity_coins: number;
  team?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  signIn: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Credenciais inválidas');
      }
      
      const userData = await response.json();
      set({ user: userData, loading: false });
    } catch (err) {
      set({ user: null, loading: false });
      throw err;
    }
  },
  signOut: async () => {
    await fetch('http://localhost:3001/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
    set({ user: null });
  },
  checkAuth: async () => {
    set({ loading: true });
    try {
      const response = await fetch('http://localhost:3001/api/auth/me', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Not authenticated');
      }
      
      const userData = await response.json();
      set({ user: userData, loading: false });
    } catch (err) {
      set({ user: null, loading: false });
    }
  },
  updateProfile: async (data) => {
    try {
      // TODO: Replace with actual API call
      set((state) => ({
        user: state.user ? { ...state.user, ...data } : null
      }));
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
  updatePassword: async (currentPassword: string, newPassword: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }
}));