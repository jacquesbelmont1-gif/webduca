import { create } from 'zustand';

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

export const useTrainingStore = create<TrainingState>((set) => ({
  videos: [],
  categories: ['Fundamentos', 'Vendas', 'Liderança', 'Técnicas Avançadas'],
  
  addVideo: async (videoData) => {
    try {
      const response = await fetch('http://localhost:3001/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(videoData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to add video');
      }
      
      const newVideo = await response.json();
      
      set((state) => ({ 
        videos: [...state.videos, {
          ...newVideo,
          createdAt: newVideo.created_at
        }] 
      }));
      
      return newVideo;
    } catch (error) {
      throw error;
    }
  },
  
  updateVideo: async (id, data) => {
    try {
      const response = await fetch(`http://localhost:3001/api/videos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update video');
      }
      
      const updatedVideo = await response.json();
      
      set((state) => ({
        videos: state.videos.map(v => 
          v.id === id ? { ...updatedVideo, createdAt: updatedVideo.created_at } : v
        )
      }));
      
      return updatedVideo;
    } catch (error) {
      throw error;
    }
  },
  
  deleteVideo: async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/api/videos/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete video');
      }
      
      set((state) => ({
        videos: state.videos.filter(v => v.id !== id)
      }));
    } catch (error) {
      throw error;
    }
  },
  
  addCategory: (category) => set((state) => ({
    categories: [...state.categories, category]
  })),
  
  fetchVideos: async () => {
    try {
      const response = await fetch('http://localhost:3001/api/videos', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }
      
      const videos = await response.json();
      const formattedVideos = videos.map((video: any) => ({
        ...video,
        createdAt: video.created_at,
        questionId: video.question_id
      }));
      
      set({ videos });
      
      return formattedVideos;
    } catch (error) {
      throw error;
    }
  },
}));