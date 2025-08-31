import { create } from 'zustand';
import axios from 'axios';

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
      const response = await axios.post('http://localhost:3001/api/auth/login', { email, password }, { withCredentials: true });
      set({ user: response.data, loading: false });
    } catch (err) {
      set({ user: null, loading: false });
    }
  },
  signOut: async () => {
    await axios.post('http://localhost:3001/api/auth/logout', {}, { withCredentials: true });
    set({ user: null });
  },
  checkAuth: async () => {
    set({ loading: true });
    try {
      const response = await axios.get('http://localhost:3001/api/auth/me', { withCredentials: true });
      set({ user: response.data, loading: false });
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
      await axios.post('http://localhost:3001/api/auth/update-password', {
        currentPassword,
        newPassword
      }, { withCredentials: true });
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }
}));