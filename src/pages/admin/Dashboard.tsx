import React, { useState, useEffect } from 'react';
import { Users, Video, HelpCircle, ArrowLeft, Mail, TrendingUp, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Stats {
  users: number;
  videos: number;
  questions: number;
  pendingQuestions: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    users: 0,
    videos: 0,
    questions: 0,
    pendingQuestions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/stats', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const dashboardCards = [
    {
      title: 'Usuários Ativos',
      value: stats.users,
      icon: Users,
      link: '/admin/users',
      color: 'bg-blue-500',
      description: 'Total de usuários cadastrados'
    },
    {
      title: 'Vídeos de Treinamento',
      value: stats.videos,
      icon: Video,
      link: '/admin/videos',
      color: 'bg-green-500',
      description: 'Conteúdos disponíveis'
    },
    {
      title: 'Dúvidas Pendentes',
      value: stats.pendingQuestions,
      icon: Clock,
      link: '/admin/support',
      color: 'bg-yellow-500',
      description: 'Aguardando resposta'
    },
    {
      title: 'Total de Dúvidas',
      value: stats.questions,
      icon: HelpCircle,
      link: '/admin/support',
      color: 'bg-purple-500',
      description: 'Todas as perguntas enviadas'
    },
  ];

  const quickActions = [
    {
      title: 'Gerar Convite',
      description: 'Criar novo convite para usuário',
      icon: Mail,
      link: '/admin/invites',
      color: 'bg-indigo-500'
    },
    {
      title: 'Adicionar Vídeo',
      description: 'Upload de novo conteúdo',
      icon: Video,
      link: '/admin/videos/new',
      color: 'bg-green-500'
    },
    {
      title: 'Ver Dúvidas',
      description: 'Responder perguntas dos usuários',
      icon: HelpCircle,
      link: '/admin/support',
      color: 'bg-purple-500'
    }
  ];

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1079e2] mx-auto mb-4"></div>
        <p className="text-[#b5cbe2]">Carregando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          to="/"
          className="bg-[#051524] text-white p-2 rounded-lg hover:bg-[#051524]/80 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Painel Administrativo</h1>
          <p className="text-[#b5cbe2]">Gerencie usuários, conteúdos e monitore a plataforma</p>
        </div>
      </div>
      
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dashboardCards.map((card) => (
          <Link
            key={card.title}
            to={card.link}
            className="bg-[#112840] rounded-lg p-6 hover:bg-[#112840]/80 transition-all duration-200 group border border-[#051524] hover:border-[#1079e2]/30"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`${card.color} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-[#b5cbe2] group-hover:text-[#1079e2] transition-colors" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-1">{card.value}</h2>
              <p className="text-white font-medium mb-1">{card.title}</p>
              <p className="text-[#b5cbe2] text-sm">{card.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Ações Rápidas */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              to={action.link}
              className="bg-[#112840] rounded-lg p-6 hover:bg-[#112840]/80 transition-all duration-200 group border border-[#051524] hover:border-[#1079e2]/30"
            >
              <div className="flex items-center gap-4">
                <div className={`${action.color} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-medium">{action.title}</h3>
                  <p className="text-[#b5cbe2] text-sm">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Resumo do Sistema */}
      <div className="bg-[#112840] rounded-lg p-6 border border-[#051524]">
        <h2 className="text-xl font-bold text-white mb-4">Status do Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[#b5cbe2]">Usuários Ativos</span>
              <span className="text-white font-medium">{stats.users}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#b5cbe2]">Conteúdos Publicados</span>
              <span className="text-white font-medium">{stats.videos}</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[#b5cbe2]">Dúvidas Pendentes</span>
              <span className="text-yellow-400 font-medium">{stats.pendingQuestions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#b5cbe2]">Total de Dúvidas</span>
              <span className="text-white font-medium">{stats.questions}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}