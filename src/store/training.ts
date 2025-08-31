import { create } from 'zustand';
import VideoModel, { VideoAttributes } from '../models/Video';
import { v4 as uuidv4 } from 'uuid';

export interface VideoData {
  id: string;
  title: string;
  description: string;
  url: string;
  platform: 'youtube' | 'vimeo' | 'loom';
  thumbnail_url: string;
  category: string;
  createdAt: string;
  questionId?: string;
}

interface TrainingState {
  videos: VideoData[];
  categories: string[];
  addVideo: (video: Omit<VideoData, 'id' | 'createdAt'>) => Promise<any>;
  updateVideo: (id: string, data: Partial<VideoData>) => Promise<any>;
  deleteVideo: (id: string) => Promise<void>;
  addCategory: (category: string) => void;
  fetchVideos: () => Promise<VideoData[]>;
}

// Dados mockados para desenvolvimento - serão substituídos pelo PostgreSQL
const MOCK_VIDEOS: VideoData[] = [
  {
    id: '1',
    title: 'Técnicas de Vendas Avançadas',
    description: 'Aprenda técnicas avançadas para melhorar suas vendas e conversões.',
    url: 'https://www.youtube.com/watch?v=abcdefgh123',
    platform: 'youtube',
    thumbnail_url: 'https://i.ytimg.com/vi/abcdefgh123/hqdefault.jpg',
    category: 'Vendas',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    title: 'Fundamentos de Liderança',
    description: 'Princípios básicos para liderar equipes de alta performance.',
    url: 'https://www.loom.com/share/abcdefgh456',
    platform: 'loom',
    thumbnail_url: 'https://cdn.loom.com/sessions/thumbnails/abcdefgh456.jpg',
    category: 'Liderança',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const useTrainingStore = create<TrainingState>((set) => ({
  videos: [],
  categories: ['Fundamentos', 'Vendas', 'Liderança', 'Técnicas Avançadas'],
  
  addVideo: async (videoData) => {
    try {
      console.log('Tentando salvar vídeo no PostgreSQL:', videoData);
      
      // Criar vídeo no banco de dados
      const newVideo = await VideoModel.create({
        title: videoData.title,
        description: videoData.description,
        url: videoData.url,
        platform: videoData.platform,
        thumbnail_url: videoData.thumbnail_url,
        category: videoData.category,
        questionId: videoData.questionId
      });
      
      // Converter o modelo para o formato esperado
      const formattedVideo: VideoData = {
        id: newVideo.id,
        title: newVideo.title,
        description: newVideo.description,
        url: newVideo.url,
        platform: newVideo.platform,
        thumbnail_url: newVideo.thumbnail_url,
        category: newVideo.category,
        createdAt: newVideo.createdAt.toISOString(),
        questionId: newVideo.questionId
      };
      
      console.log('Vídeo salvo com sucesso:', formattedVideo);
      
      // Atualize o estado com o novo vídeo
      set((state) => ({ 
        videos: [...state.videos, formattedVideo] 
      }));
      
      return formattedVideo;
    } catch (error) {
      console.error('Erro ao salvar vídeo:', error);
      throw error;
    }
  },
  
  updateVideo: async (id, data) => {
    try {
      console.log('Tentando atualizar vídeo:', { id, data });
      
      // Encontrar o vídeo no banco de dados
      const video = await VideoModel.findByPk(id);
      
      if (!video) {
        throw new Error('Vídeo não encontrado');
      }
      
      // Remover o campo createdAt se existir para evitar erro de tipo
      const { createdAt, ...updateData } = data;
      
      // Atualizar os dados do vídeo
      await video.update(updateData);
      
      // Buscar novamente para ter todos os dados atualizados
      const updatedVideo = await VideoModel.findByPk(id);
      
      if (!updatedVideo) {
        throw new Error('Vídeo não encontrado após atualização');
      }
      
      // Converter o modelo para o formato esperado
      const formattedVideo: VideoData = {
        id: updatedVideo.id,
        title: updatedVideo.title,
        description: updatedVideo.description,
        url: updatedVideo.url,
        platform: updatedVideo.platform,
        thumbnail_url: updatedVideo.thumbnail_url,
        category: updatedVideo.category,
        createdAt: updatedVideo.createdAt.toISOString(),
        questionId: updatedVideo.questionId
      };
      
      // Atualizar o estado
      set((state) => ({
        videos: state.videos.map(v => 
          v.id === id ? formattedVideo : v
        )
      }));
      
      return formattedVideo;
    } catch (error) {
      console.error('Erro ao atualizar vídeo:', error);
      throw error;
    }
  },
  
  deleteVideo: async (id) => {
    try {
      console.log('Tentando deletar vídeo:', id);
      
      // Encontrar o vídeo no banco de dados
      const video = await VideoModel.findByPk(id);
      
      if (!video) {
        throw new Error('Vídeo não encontrado');
      }
      
      // Deletar o vídeo
      await video.destroy();
      
      // Atualizar o estado
      set((state) => ({
        videos: state.videos.filter(v => v.id !== id)
      }));
    } catch (error) {
      console.error('Erro ao deletar vídeo:', error);
      throw error;
    }
  },
  
  addCategory: (category) => set((state) => ({
    categories: [...state.categories, category]
  })),
  
  fetchVideos: async () => {
    try {
      console.log('Buscando vídeos...');
      
      // Buscar todos os vídeos do banco de dados
      const videoModels = await VideoModel.findAll();
      
      // Converter os modelos para o formato esperado
      const videos: VideoData[] = videoModels.map(video => ({
        id: video.id,
        title: video.title,
        description: video.description,
        url: video.url,
        platform: video.platform,
        thumbnail_url: video.thumbnail_url,
        category: video.category,
        createdAt: video.createdAt.toISOString(),
        questionId: video.questionId
      }));
      
      console.log('Vídeos carregados com sucesso:', videos);
      
      // Atualizar o estado
      set({ videos });
      
      return videos;
    } catch (error) {
      console.error('Erro ao buscar vídeos:', error);
      throw error;
    }
  },
}));