import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, Loader } from 'lucide-react';
import { useTrainingStore, VideoData } from '../../store/training';
import { useQuestionsStore } from '../../store/questions';
import { getVideoThumbnail } from '../../utils/videoThumbnail';

export default function VideoForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  
  // Referências para upload de arquivo
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Obter stores
  const { videos, addVideo, updateVideo, fetchVideos, categories } = useTrainingStore();
  const { questions, fetchQuestions } = useQuestionsStore();
  
  // Estados
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [customThumbnail, setCustomThumbnail] = useState<string | null>(null);
  
  // Estado do formulário
  const [formData, setFormData] = useState<Omit<VideoData, 'id' | 'createdAt'>>({
    title: '',
    description: '',
    url: '',
    platform: 'youtube',
    thumbnail_url: '',
    category: categories[0] || 'Geral',
  });

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingInitial(true);
        await Promise.all([fetchVideos(), fetchQuestions()]);
        
        // Se estivermos em modo de edição, buscar os dados do vídeo
        if (isEditMode && id) {
          const videoToEdit = videos.find(v => v.id === id);
          
          if (!videoToEdit) {
            setError('Vídeo não encontrado');
            return;
          }
          
          setFormData({
            title: videoToEdit.title,
            description: videoToEdit.description,
            url: videoToEdit.url,
            platform: videoToEdit.platform,
            thumbnail_url: videoToEdit.thumbnail_url,
            category: videoToEdit.category,
            questionId: videoToEdit.questionId
          });
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Não foi possível carregar os dados necessários. Tente novamente mais tarde.');
      } finally {
        setLoadingInitial(false);
      }
    };
    
    loadData();
  }, [isEditMode, id, fetchVideos, fetchQuestions, videos]);

  // Manipuladores de formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione um arquivo de imagem válido.');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCustomThumbnail(event.target.result.toString());
        setFormData(prev => ({ ...prev, thumbnail_url: event.target?.result?.toString() || '' }));
      }
    };
    reader.readAsDataURL(file);
  };
  
  const handleGetThumbnail = async () => {
    try {
      if (!formData.url) {
        setError('Por favor, insira a URL do vídeo antes de extrair a thumbnail.');
        return;
      }
      
      setLoading(true);
      const thumbnail = await getVideoThumbnail(formData.url, formData.platform);
      
      if (thumbnail) {
        setFormData(prev => ({ ...prev, thumbnail_url: thumbnail }));
        setCustomThumbnail(null);
        setSuccess('Thumbnail extraída com sucesso!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        // Define uma thumbnail padrão em caso de falha
        setFormData(prev => ({ 
          ...prev, 
          thumbnail_url: 'https://via.placeholder.com/640x360?text=Thumbnail+Indisponível' 
        }));
        setError('Não foi possível extrair a thumbnail. Uma imagem padrão foi definida.');
      }
    } catch (err) {
      console.error('Erro ao extrair thumbnail:', err);
      // Define uma thumbnail padrão em caso de erro
      setFormData(prev => ({ 
        ...prev, 
        thumbnail_url: 'https://via.placeholder.com/640x360?text=Thumbnail+Indisponível' 
      }));
      setError('Erro ao extrair thumbnail. Uma imagem padrão foi definida.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      if (isEditMode && id) {
        await updateVideo(id, formData);
        setSuccess('Vídeo atualizado com sucesso!');
      } else {
        await addVideo(formData);
        setSuccess('Vídeo adicionado com sucesso!');
      }
      
      // Redirecionar após breve delay
      setTimeout(() => {
        navigate('/admin/videos');
      }, 1500);
    } catch (err) {
      console.error('Erro ao salvar vídeo:', err);
      setError('Ocorreu um erro ao salvar o vídeo. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1079e2] mx-auto mb-4"></div>
        <p className="text-[#b5cbe2]">Carregando dados do formulário...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/admin/videos')}
          className="bg-[#051524] text-white p-2 rounded-lg hover:bg-[#051524]/80 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-white">{isEditMode ? 'Editar Vídeo' : 'Adicionar Vídeo'}</h1>
      </div>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-500/20 border border-green-500 text-green-400 p-4 rounded-lg mb-6">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-[#112840] rounded-lg p-6 mb-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-[#b5cbe2] mb-2">Título</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Digite o título do vídeo"
                    className="w-full bg-[#051524] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1079e2]"
                  />
                </div>
                
                <div>
                  <label className="block text-[#b5cbe2] mb-2">Descrição</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    placeholder="Digite uma descrição para o vídeo"
                    rows={4}
                    className="w-full bg-[#051524] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1079e2]"
                  />
                </div>
                
                <div>
                  <label className="block text-[#b5cbe2] mb-2">URL do Vídeo</label>
                  <input
                    type="url"
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    required
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-[#051524] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1079e2]"
                  />
                  <p className="text-[#b5cbe2] text-sm mt-1">
                    Suportamos links do YouTube, Vimeo e Loom.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#b5cbe2] mb-2">Plataforma</label>
                    <select
                        name="platform"
                        value={formData.platform}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-[#051524] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1079e2]"
                      >
                        <option value="youtube">YouTube</option>
                        <option value="vimeo">Vimeo</option>
                        <option value="loom">Loom</option>
                      </select>
                  </div>
                  
                  <div>
                    <label className="block text-[#b5cbe2] mb-2">Categoria</label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-[#051524] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1079e2]"
                      >
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-[#b5cbe2] mb-2">Pergunta Relacionada</label>
                  <select
                    name="questionId"
                    value={formData.questionId || ''}
                    onChange={handleInputChange}
                    className="w-full bg-[#051524] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1079e2]"
                  >
                    <option value="">Selecione uma pergunta (opcional)</option>
                    {questions.map(question => (
                      <option key={question.id} value={question.id}>
                        {question.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-[#112840] rounded-lg p-6 mb-6">
              <div>
                <label className="block text-[#b5cbe2] mb-4">Thumbnail</label>
                  
                <div className="mb-4 text-center">
                    {formData.thumbnail_url ? (
                      <img 
                        src={formData.thumbnail_url} 
                        alt="Thumbnail Preview" 
                        className="w-full max-h-48 object-cover rounded-lg"
                      />
                    ) : (
                      <div 
                        className="w-full h-48 bg-[#051524] flex items-center justify-center rounded-lg"
                      >
                        <span className="text-[#b5cbe2]">Sem thumbnail</span>
                      </div>
                    )}
                </div>
                  
                <div className="space-y-2">
                  <button 
                      type="button"
                      onClick={handleGetThumbnail}
                      disabled={loading || !formData.url}
                      className="w-full bg-[#051524] text-white px-4 py-2 rounded-lg hover:bg-[#051524]/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Extraindo...
                        </>
                      ) : (
                        'Extrair da URL'
                      )}
                    </button>
                    
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={loading}
                      className="w-full bg-[#051524] text-white px-4 py-2 rounded-lg hover:bg-[#051524]/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Fazer upload
                    </button>
                    
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#1079e2] text-white px-6 py-3 rounded-lg hover:bg-[#1079e2]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  isEditMode ? 'Salvar Alterações' : 'Criar Vídeo'
                )}
              </button>
              
              <button 
                type="button"
                onClick={() => navigate('/admin/videos')}
                disabled={loading}
                className="w-full bg-[#051524] text-white px-6 py-3 rounded-lg hover:bg-[#051524]/80 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
} 