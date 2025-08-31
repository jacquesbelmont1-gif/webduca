import { create } from 'zustand';
// Importação mockada durante a transição
import { mockSupabaseResponse } from '../lib/supabase';

export interface Question {
  id: string;
  user_id: string;
  title: string;  // Esta é a propriedade que usamos para exibir o texto da pergunta
  description: string;
  category: string;
  status: 'pending' | 'in_progress' | 'resolved';
  video_id?: string;
  votes_count: number;
  voters: Array<{
    id: string;
    name: string;
    team: string;
  }>;
  created_at: string;
  updated_at: string;
}

interface QuestionsState {
  questions: Question[];
  addQuestion: (question: Omit<Question, 'id' | 'created_at' | 'updated_at' | 'votes_count' | 'voters'>) => Promise<void>;
  updateQuestion: (id: string, data: Partial<Question>) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
  voteQuestion: (questionId: string, userId: string, userName: string, userTeam: string) => Promise<void>;
  fetchQuestions: () => Promise<void>;
}

// Dados mock para desenvolvimento durante a migração para PostgreSQL
const MOCK_QUESTIONS: Question[] = [
  {
    id: '1',
    user_id: '1',
    title: 'Como criar um funil de vendas eficiente?',
    description: 'Gostaria de entender as melhores práticas para criar um funil de vendas que converta bem em nosso nicho.',
    category: 'Vendas',
    status: 'resolved',
    video_id: '1',
    votes_count: 12,
    voters: [
      { id: '1', name: 'Jacques Belmont', team: 'blue' },
      { id: '2', name: 'Maria Silva', team: 'red' }
    ],
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    user_id: '2',
    title: 'Quais as melhores técnicas de objeção?',
    description: 'Preciso de ajuda para lidar com objeções comuns dos clientes em nossa área.',
    category: 'Vendas',
    status: 'in_progress',
    votes_count: 8,
    voters: [
      { id: '3', name: 'João Costa', team: 'green' },
      { id: '4', name: 'Ana Ferreira', team: 'blue' }
    ],
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    user_id: '3',
    title: 'Como liderar uma equipe remota eficientemente?',
    description: 'Estou tendo dificuldades para manter minha equipe motivada e produtiva trabalhando remotamente.',
    category: 'Liderança',
    status: 'pending',
    votes_count: 15,
    voters: [
      { id: '5', name: 'Roberto Alves', team: 'red' },
      { id: '6', name: 'Clara Santos', team: 'blue' }
    ],
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const useQuestionsStore = create<QuestionsState>((set) => ({
  questions: MOCK_QUESTIONS,

  addQuestion: async (questionData) => {
    try {
      // Versão mock durante a migração para PostgreSQL
      const newQuestion: Question = {
        id: Math.random().toString(36).substr(2, 9),
        votes_count: 0,
        voters: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...questionData
      };

      // Simular resposta do Supabase durante migração
      const response = mockSupabaseResponse(newQuestion);
      
      if (response.error) {
        throw new Error(response.error.message);
      }

      set((state) => ({
        questions: [...state.questions, newQuestion]
      }));
    } catch (error) {
      console.error('Erro ao adicionar pergunta:', error);
      throw error;
    }
  },

  updateQuestion: async (id, data) => {
    try {
      // Versão mock durante a migração para PostgreSQL
      const updatedQuestion = { ...data, updated_at: new Date().toISOString() };
      
      // Simular resposta do Supabase durante migração
      const response = mockSupabaseResponse(updatedQuestion);
      
      if (response.error) {
        throw new Error(response.error.message);
      }

      set((state) => ({
        questions: state.questions.map(question => 
          question.id === id ? { ...question, ...updatedQuestion } : question
        )
      }));
    } catch (error) {
      console.error('Erro ao atualizar pergunta:', error);
      throw error;
    }
  },

  deleteQuestion: async (id) => {
    try {
      // Simular resposta do Supabase durante migração
      const response = mockSupabaseResponse();
      
      if (response.error) {
        throw new Error(response.error.message);
      }

      set((state) => ({
        questions: state.questions.filter(question => question.id !== id)
      }));
    } catch (error) {
      console.error('Erro ao deletar pergunta:', error);
      throw error;
    }
  },

  voteQuestion: async (questionId, userId, userName, userTeam) => {
    try {
      set((state) => {
        const question = state.questions.find(q => q.id === questionId);
        
        if (!question) {
          return state;
        }
        
        // Verificar se o usuário já votou
        const alreadyVoted = question.voters.some(voter => voter.id === userId);
        
        if (alreadyVoted) {
          // Remover voto
          return {
            questions: state.questions.map(q => 
              q.id === questionId ? {
                ...q,
                votes_count: q.votes_count - 1,
                voters: q.voters.filter(voter => voter.id !== userId)
              } : q
            )
          };
        } else {
          // Adicionar voto
          return {
            questions: state.questions.map(q => 
              q.id === questionId ? {
                ...q,
                votes_count: q.votes_count + 1,
                voters: [...q.voters, { id: userId, name: userName, team: userTeam }]
              } : q
            )
          };
        }
      });
    } catch (error) {
      console.error('Erro ao votar na pergunta:', error);
      throw error;
    }
  },

  fetchQuestions: async () => {
    try {
      // Versão mock durante a migração para PostgreSQL
      // Simular resposta do Supabase durante migração
      const response = mockSupabaseResponse(MOCK_QUESTIONS);
      
      if (response.error) {
        throw new Error(response.error.message);
      }

      set({ questions: response.data || [] });
    } catch (error) {
      console.error('Erro ao buscar perguntas:', error);
      throw error;
    }
  }
}));