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
  users: [
    {
      id: '1',
      email: 'jacquesbelmont@gmail.com',
      name: 'Jacques Yves Silva Belmont',
      role: 'admin',
    },
    {
      id: '2',
      email: 'user@example.com',
      name: 'John Doe',
      role: 'user',
    }
  ],
  addUser: (user) => set((state) => ({ users: [...state.users, user] })),
  updateUser: (id, data) => set((state) => ({
    users: state.users.map(user => 
      user.id === id ? { ...user, ...data } : user
    )
  })),
  deleteUser: (id) => set((state) => ({
    users: state.users.filter(user => user.id !== id)
  })),
}));