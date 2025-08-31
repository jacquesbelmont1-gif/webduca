import VideoModel from '../models/Video';

// Dados iniciais para o banco de dados
const SEED_VIDEOS = [
  {
    title: 'Técnicas de Vendas Avançadas',
    description: 'Aprenda técnicas avançadas para melhorar suas vendas e conversões.',
    url: 'https://www.youtube.com/watch?v=abcdefgh123',
    platform: 'youtube',
    thumbnail_url: 'https://i.ytimg.com/vi/abcdefgh123/hqdefault.jpg',
    category: 'Vendas',
  },
  {
    title: 'Fundamentos de Liderança',
    description: 'Princípios básicos para liderar equipes de alta performance.',
    url: 'https://www.loom.com/share/abcdefgh456',
    platform: 'loom',
    thumbnail_url: 'https://cdn.loom.com/sessions/thumbnails/abcdefgh456.jpg',
    category: 'Liderança',
  },
  {
    title: 'Marketing Digital para Iniciantes',
    description: 'Aprenda conceitos básicos de marketing digital para impulsionar seu negócio.',
    url: 'https://www.youtube.com/watch?v=marketing123',
    platform: 'youtube',
    thumbnail_url: 'https://i.ytimg.com/vi/marketing123/hqdefault.jpg',
    category: 'Marketing',
  }
];

// Função para popular o banco de dados com dados iniciais
export const seedDatabase = async () => {
  try {
    console.log('Iniciando seed do banco de dados...');
    
    // Verificar se já existem dados
    const videoCount = await VideoModel.count();
    
    if (videoCount > 0) {
      console.log('O banco de dados já contém vídeos. Pulando seed.');
      return;
    }
    
    // Inserir vídeos iniciais
    for (const video of SEED_VIDEOS) {
      await VideoModel.create(video as any);
    }
    
    console.log('Seed concluído com sucesso!');
  } catch (error) {
    console.error('Erro durante o seed do banco de dados:', error);
  }
}; 