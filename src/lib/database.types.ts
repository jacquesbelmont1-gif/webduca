// Este arquivo contém tipos para o banco de dados Supabase
// Durante a migração para PostgreSQL, usaremos tipos simplificados

export interface Database {
  public: {
    Tables: {
      videos: {
        Row: {
          id: string;
          title: string;
          description: string;
          url: string;
          platform: 'youtube' | 'vimeo' | 'loom';
          thumbnail_url: string;
          category: string;
          created_at: string;
          updated_at: string;
          question_id?: string;
        };
        Insert: Omit<Database['public']['Tables']['videos']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['videos']['Insert']>;
      };
      questions: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          category: string;
          status: 'pending' | 'in_progress' | 'resolved';
          video_id?: string;
          votes_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['questions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['questions']['Insert']>;
      };
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'admin' | 'user';
          avatar_url?: string;
          fraternity_coins: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
    };
  };
} 