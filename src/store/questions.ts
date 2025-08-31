import { create } from 'zustand';

export interface Question {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'in_progress' | 'resolved';
  video_id?: string;
  votes: number;
  voters: Array<{
    id: string;
    name: string;
    team: string;
  }>;
  createdAt: string;
  userName: string;
  userTeam: string;
}

interface QuestionsState {
  questions: Question[];
  categories: string[];
  addQuestion: (question: { userId: string; userName: string; userTeam: string; title: string; description: string; category: string; }) => Promise<void>;
  updateQuestion: (id: string, data: Partial<Question>) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
  voteQuestion: (questionId: string, voter: { id: string; name: string; team: string; }) => Promise<void>;
  unvoteQuestion: (questionId: string, userId: string) => Promise<void>;
  fetchQuestions: () => Promise<void>;
}

export const useQuestionsStore = create<QuestionsState>((set) => ({
  questions: [],
  categories: ['Vendas', 'Liderança', 'Marketing', 'Técnicas', 'Gestão'],

  addQuestion: async (questionData) => {
    try {
      const response = await fetch('http://localhost:3001/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: questionData.title,
          description: questionData.description,
          category: questionData.category
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add question');
      }
      
      const newQuestion = await response.json();

      set((state) => ({
        questions: [...state.questions, {
          ...newQuestion,
          createdAt: newQuestion.created_at,
          votes: 0,
          voters: [],
          userName: questionData.userName,
          userTeam: questionData.userTeam
        }]
      }));
    } catch (error) {
      throw error;
    }
  },

  updateQuestion: async (id, data) => {
    try {
      const response = await fetch(`http://localhost:3001/api/questions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update question');
      }

      set((state) => ({
        questions: state.questions.map(question => 
          question.id === id ? { ...question, ...data } : question
        )
      }));
    } catch (error) {
      throw error;
    }
  },

  deleteQuestion: async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/api/questions/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete question');
      }

      set((state) => ({
        questions: state.questions.filter(question => question.id !== id)
      }));
    } catch (error) {
      throw error;
    }
  },

  voteQuestion: async (questionId, voter) => {
    try {
      const response = await fetch(`http://localhost:3001/api/questions/${questionId}/vote`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to vote');
      }
      
      set((state) => {
        const question = state.questions.find(q => q.id === questionId);
        if (!question) {
          return state;
        }
        
        const alreadyVoted = question.voters.some(v => v.id === voter.id);
        
        if (alreadyVoted) {
          return {
            questions: state.questions.map(q => 
              q.id === questionId ? {
                ...q,
                votes: q.votes - 1,
                voters: q.voters.filter(v => v.id !== voter.id)
              } : q
            )
          };
        } else {
          return {
            questions: state.questions.map(q => 
              q.id === questionId ? {
                ...q,
                votes: q.votes + 1,
                voters: [...q.voters, voter]
              } : q
            )
          };
        }
      });
    } catch (error) {
      throw error;
    }
  },

  unvoteQuestion: async (questionId, userId) => {
    // This is handled by voteQuestion - it toggles the vote
    // We'll keep this for compatibility but it does the same as voteQuestion
  },
  fetchQuestions: async () => {
    try {
      const response = await fetch('http://localhost:3001/api/questions', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      
      const questions = await response.json();
      const formattedQuestions = questions.map((q: any) => ({
        ...q,
        createdAt: q.created_at,
        votes: q.votes_count || 0,
        voters: q.voters || [],
        userName: q.user_name,
        userTeam: q.user_team
      }));

      set({ questions: formattedQuestions });
    } catch (error) {
      throw error;
    }
  }
}));