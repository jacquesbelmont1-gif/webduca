import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
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
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Carregando...</span>
        </Spinner>
        <p className="mt-2">Carregando dados do formulário...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex align-items-center mb-4">
        <Button 
          variant="outline-primary" 
          className="me-3"
          onClick={() => navigate('/admin/videos')}
        >
          Voltar
        </Button>
        <h1 className="mb-0">{isEditMode ? 'Editar Vídeo' : 'Adicionar Vídeo'}</h1>
      </div>
      
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={8}>
            <Card className="mb-4">
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Título</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Digite o título do vídeo"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Descrição</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    placeholder="Digite uma descrição para o vídeo"
                    rows={4}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>URL do Vídeo</Form.Label>
                  <Form.Control
                    type="url"
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    required
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <Form.Text className="text-muted">
                    Suportamos links do YouTube, Vimeo e Loom.
                  </Form.Text>
                </Form.Group>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Plataforma</Form.Label>
                      <Form.Select
                        name="platform"
                        value={formData.platform}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="youtube">YouTube</option>
                        <option value="vimeo">Vimeo</option>
                        <option value="loom">Loom</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Categoria</Form.Label>
                      <Form.Select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                      >
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>Pergunta Relacionada</Form.Label>
                  <Form.Select
                    name="questionId"
                    value={formData.questionId || ''}
                    onChange={handleInputChange}
                  >
                    <option value="">Selecione uma pergunta (opcional)</option>
                    {questions.map(question => (
                      <option key={question.id} value={question.id}>
                        {question.title}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4}>
            <Card className="mb-4">
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Thumbnail</Form.Label>
                  
                  <div className="mb-3 text-center">
                    {formData.thumbnail_url ? (
                      <img 
                        src={formData.thumbnail_url} 
                        alt="Thumbnail Preview" 
                        className="img-fluid rounded mb-2" 
                        style={{ maxHeight: '200px' }}
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                          e.currentTarget.src = 'https://via.placeholder.com/640x360?text=Thumbnail+Indisponível';
                        }}
                      />
                    ) : (
                      <div 
                        className="bg-light d-flex justify-content-center align-items-center rounded"
                        style={{ height: '200px' }}
                      >
                        <span className="text-muted">Sem thumbnail</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="d-grid gap-2">
                    <Button 
                      variant="outline-secondary" 
                      onClick={handleGetThumbnail}
                      disabled={loading || !formData.url}
                    >
                      {loading ? (
                        <>
                          <Spinner as="span" size="sm" animation="border" className="me-2" />
                          Extraindo...
                        </>
                      ) : (
                        'Extrair da URL'
                      )}
                    </Button>
                    
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={loading}
                    >
                      Fazer upload
                    </Button>
                    
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      className="d-none"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                </Form.Group>
              </Card.Body>
            </Card>
            
            <div className="d-grid gap-2">
              <Button 
                variant="primary" 
                type="submit" 
                disabled={loading}
                size="lg"
              >
                {loading ? (
                  <>
                    <Spinner as="span" size="sm" animation="border" className="me-2" />
                    Salvando...
                  </>
                ) : (
                  isEditMode ? 'Salvar Alterações' : 'Criar Vídeo'
                )}
              </Button>
              
              <Button 
                variant="outline-secondary" 
                onClick={() => navigate('/admin/videos')}
                disabled={loading}
              >
                Cancelar
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
    </Container>
  );
} 