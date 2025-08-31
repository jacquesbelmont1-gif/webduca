import React, { useState, useRef, useEffect } from 'react';
import { Plus, Search, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTrainingStore } from '../../store/training';
import type { VideoData } from '../../store/training';
import { useQuestionsStore } from '../../store/questions';
import { VideoCard } from '../../components';

export default function Videos() {
  const navigate = useNavigate();
  
  // Stores
  const { videos, categories, addVideo, updateVideo, deleteVideo, fetchVideos } = useTrainingStore();
  const { questions, fetchQuestions } = useQuestionsStore();
  
  // Estados
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Carrega os dados iniciais
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchVideos(), fetchQuestions()]);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Não foi possível carregar os vídeos. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [fetchVideos, fetchQuestions]);

  // Filtra os vídeos por título e categoria
  const filteredVideos = videos.filter(video => {
    const matchesTitle = video.title.toLowerCase().includes(filter.toLowerCase());
    const matchesCategory = !categoryFilter || video.category === categoryFilter;
    return matchesTitle && matchesCategory;
  });

  // Extrai todas as categorias únicas dos vídeos
  const uniqueCategories = [...new Set(videos.map(video => video.category))];

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          to="/admin"
          className="bg-[#051524] text-white p-2 rounded-lg hover:bg-[#051524]/80 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white">Vídeos de Treinamento</h1>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate('/admin/videos/new')}
          className="bg-[#1079e2] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1079e2]/90"
        >
          <Plus className="w-5 h-5" />
          Adicionar Vídeo
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#b5cbe2]" />
          <input
              placeholder="Pesquisar por título..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full bg-[#112840] text-white pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1079e2]"
            />
        </div>
        <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#112840] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1079e2]"
          >
            <option value="">Todas as categorias</option>
            {uniqueCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
      </div>
      
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1079e2] mx-auto mb-4"></div>
          <p className="text-[#b5cbe2]">Carregando vídeos...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {!loading && !error && (
        <>
          {filteredVideos.length === 0 ? (
            <div className="bg-blue-500/20 border border-blue-500 text-blue-400 p-4 rounded-lg">
              Nenhum vídeo encontrado com os filtros atuais.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map(video => (
                <div key={video.id}>
                  <VideoCard 
                    video={video}
                    relatedQuestion={video.questionId ? questions.find(q => q.id === video.questionId) : undefined}
                    onEdit={() => navigate(`/admin/videos/edit/${video.id}`)}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}