import { create } from 'zustand';

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved';
  videoId?: string;
  votes: number;
  createdAt: string;
}

interface SupportState {
  tickets: SupportTicket[];
  addTicket: (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'votes'>) => void;
  updateTicket: (id: string, data: Partial<SupportTicket>) => void;
  deleteTicket: (id: string) => void;
}

export const useSupportStore = create<SupportState>((set) => ({
  tickets: [
    {
      id: '1',
      userId: '1',
      userName: 'Jacques Belmont',
      title: 'Como configurar meu perfil?',
      description: 'Preciso de ajuda para configurar meu perfil corretamente no sistema.',
      status: 'pending',
      votes: 5,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      userId: '2',
      userName: 'Maria Silva',
      title: 'Dúvida sobre relatórios',
      description: 'Como posso gerar relatórios personalizados?',
      status: 'in_progress',
      votes: 3,
      createdAt: new Date().toISOString()
    }
  ],
  addTicket: (ticketData) => set((state) => ({
    tickets: [...state.tickets, {
      id: Math.random().toString(36).substr(2, 9),
      votes: 0,
      createdAt: new Date().toISOString(),
      ...ticketData
    }]
  })),
  updateTicket: (id, data) => set((state) => ({
    tickets: state.tickets.map(ticket => 
      ticket.id === id ? { ...ticket, ...data } : ticket
    )
  })),
  deleteTicket: (id) => set((state) => ({
    tickets: state.tickets.filter(ticket => ticket.id !== id)
  })),
}));