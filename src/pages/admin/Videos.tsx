import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Edit, Search, Video as VideoIcon, Upload, ArrowLeft, Check, X, Loader } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTrainingStore } from '../../store/training';
import type { VideoData } from '../../store/training';
import { getVideoThumbnail } from '../../utils/videoThumbnail';
import { useQuestionsStore } from '../../store/questions';
import { Button, Container, Spinner, Alert, Row, Col, Card, Form, InputGroup } from 'react-bootstrap';
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
  const [editingVideo, setEditingVideo] = useState<VideoData | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [customThumbnail, setCustomThumbnail] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newVideo, setNewVideo] = useState<Partial<VideoData>>({
    title: '',
    description: '',
    url: '',
    platform: 'loom',
    category: categories[0],
    questionId: '',
  });

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

  // Lidar com upload de thumbnail personalizada
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCustomThumbnail(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Adicionar um novo vídeo
  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let thumbnailUrl = customThumbnail;
      
      // Se não tiver thumbnail personalizada, tenta obter da plataforma
      if (!thumbnailUrl && newVideo.url && newVideo.platform) {
        thumbnailUrl = await getVideoThumbnail(newVideo.url, newVideo.platform as 'youtube' | 'vimeo' | 'loom');
      }

      // Preparar dados do vídeo
      const videoData = {
        title: newVideo.title || '',
        description: newVideo.description || '',
        url: newVideo.url || '',
        platform: newVideo.platform as 'youtube' | 'vimeo' | 'loom',
        thumbnail_url: thumbnailUrl || '',
        category: newVideo.category || categories[0],
        questionId: newVideo.questionId
      };

      // Adicionar vídeo
      await addVideo(videoData);
      
      // Resetar o formulário
      setNewVideo({
        title: '',
        description: '',
        url: '',
        platform: 'loom',
        category: categories[0],
        questionId: '',
      });
      setCustomThumbnail(null);
      setShowAddForm(false);
      
      // Mostrar mensagem de sucesso
      setError('Vídeo adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar vídeo:', error);
      setError('Erro ao adicionar vídeo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Atualizar um vídeo existente
  const handleUpdateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;
    
    setLoading(true);
    
    try {
      let thumbnailUrl = customThumbnail || editingVideo.thumbnail_url;
      
      // Se a URL mudou e não tem thumbnail personalizada, tenta obter da plataforma
      if (customThumbnail === null && 
          editingVideo.url !== newVideo.url && 
          newVideo.url && 
          newVideo.platform) {
        thumbnailUrl = await getVideoThumbnail(newVideo.url, newVideo.platform as 'youtube' | 'vimeo' | 'loom');
      }

      // Preparar dados atualizados
      const updatedData: Partial<VideoData> = {
        ...(newVideo.title !== undefined && { title: newVideo.title }),
        ...(newVideo.description !== undefined && { description: newVideo.description }),
        ...(newVideo.url !== undefined && { url: newVideo.url }),
        ...(newVideo.platform !== undefined && { platform: newVideo.platform as 'youtube' | 'vimeo' | 'loom' }),
        ...(thumbnailUrl && { thumbnail_url: thumbnailUrl }),
        ...(newVideo.category !== undefined && { category: newVideo.category }),
        ...(newVideo.questionId !== undefined && { questionId: newVideo.questionId })
      };

      // Atualizar vídeo
      await updateVideo(editingVideo.id, updatedData);
      
      // Resetar estado
      setEditingVideo(null);
      setCustomThumbnail(null);
      
      // Mostrar mensagem de sucesso
      setError('Vídeo atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar vídeo:', error);
      setError('Erro ao atualizar vídeo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Excluir um vídeo
  const handleDeleteVideo = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este vídeo?')) return;
    
    setLoading(true);
    
    try {
      await deleteVideo(id);
      setError('Vídeo excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir vídeo:', error);
      setError('Erro ao excluir vídeo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Vídeos de Treinamento</h1>
      
      {/* Barra de ações */}
      <div className="d-flex justify-content-between mb-4">
        <Button 
          variant="primary" 
          onClick={() => navigate('/admin/videos/new')}
        >
          Adicionar Vídeo
        </Button>
      </div>
      
      {/* Filtros */}
      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <Form.Control
              placeholder="Pesquisar por título..."
              value={filter}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilter(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={6}>
          <Form.Select 
            value={categoryFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategoryFilter(e.target.value)}
          >
            <option value="">Todas as categorias</option>
            {uniqueCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>
      
      {/* Mensagem de carregamento */}
      {loading && (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </Spinner>
          <p className="mt-2">Carregando vídeos...</p>
        </div>
      )}
      
      {/* Mensagem de erro */}
      {error && (
        <Alert variant="danger">
          {error}
        </Alert>
      )}
      
      {/* Lista de vídeos */}
      {!loading && !error && (
        <>
          {filteredVideos.length === 0 ? (
            <Alert variant="info">
              Nenhum vídeo encontrado com os filtros atuais.
            </Alert>
          ) : (
            <Row>
              {filteredVideos.map(video => (
                <Col key={video.id} md={6} lg={4} className="mb-4">
                  <VideoCard 
                    video={video}
                    relatedQuestion={video.questionId ? questions.find(q => q.id === video.questionId) : undefined}
                    onEdit={() => navigate(`/admin/videos/edit/${video.id}`)}
                  />
                </Col>
              ))}
            </Row>
          )}
        </>
      )}
    </Container>
  );
}