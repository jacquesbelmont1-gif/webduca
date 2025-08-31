import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  avatar_url?: string;
}

interface UsersState {
  users: User[];
  addUser: (user: User) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;
}

export const useUsersStore = create<UsersState>((set) => ({
  users: [],
  addUser: async (user) => {
    try {
      const response = await fetch('http://localhost:3001/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(user)
      });
      
      if (!response.ok) {
        throw new Error('Failed to add user');
      }
      
      const newUser = await response.json();
      set((state) => ({ users: [...state.users, newUser] }));
    } catch (error) {
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
        throw new Error('Failed to update user');
      }
      
      set((state) => ({
        users: state.users.map(user => 
          user.id === id ? { ...user, ...data } : user
        )
      }));
    } catch (error) {
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
        throw new Error('Failed to delete user');
      }
      
      set((state) => ({
        users: state.users.filter(user => user.id !== id)
      }));
    } catch (error) {
      throw error;
    }
  },
}));