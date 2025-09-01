import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  avatar_url?: string;
  fraternity_coins: number;
  team: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
}

interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  addUser: (user: Omit<User, 'id' | 'created_at' | 'fraternity_coins' | 'is_active'> & { password: string }) => Promise<void>;
  updateUser: (id: string, data: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  loading: false,
  error: null,
  
  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('http://localhost:3001/api/users', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Falha ao carregar usuários');
      }
      
      const users = await response.json();
      set({ users, loading: false });
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      set({ error: 'Erro ao carregar usuários', loading: false });
      throw error;
    }
  },
  
  addUser: async (userData) => {
    try {
      const response = await fetch('http://localhost:3001/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao adicionar usuário');
      }
      
      const newUser = await response.json();
      set((state) => ({ 
        users: [...state.users, newUser],
        error: null 
      }));
    } catch (error) {
      console.error('Erro ao adicionar usuário:', error);
      set({ error: 'Erro ao adicionar usuário' });
      throw error;
    }
  },
  
  updateUser: async (id, data) => {
    try {
      const response = await fetch(`http://localhost:3001/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao atualizar usuário');
      }
      
      const updatedUser = await response.json();
      set((state) => ({
        users: state.users.map(user => 
          user.id === id ? { ...user, ...updatedUser } : user
        ),
        error: null
      }));
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      set({ error: 'Erro ao atualizar usuário' });
      throw error;
    }
  },
  
  deleteUser: async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/api/users/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao remover usuário');
      }
      
      set((state) => ({
        users: state.users.filter(user => user.id !== id),
        error: null
      }));
    } catch (error) {
      console.error('Erro ao remover usuário:', error);
      set({ error: 'Erro ao remover usuário' });
      throw error;
    }
  },
}));