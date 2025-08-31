import React, { useState } from 'react';
import { Search, Video, ArrowLeft, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSupportStore } from '../../store/support';
import { useTrainingStore } from '../../store/training';

export function AdminSupport() {
  const { tickets, updateTicket } = useSupportStore();
  const { videos } = useTrainingStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'resolved'>('all');
  const [linkingVideo, setLinkingVideo] = useState<string | null>(null);

  // Sort tickets by votes (highest first) and then by date
  const sortedTickets = [...tickets].sort((a, b) => {
    if (a.votes !== b.votes) {
      return b.votes - a.votes;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const filteredTickets = sortedTickets.filter(ticket => {
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (ticketId: string, status: 'pending' | 'in_progress' | 'resolved') => {
    updateTicket(ticketId, { status });
  };

  const handleLinkVideo = (ticketId: string, videoId: string) => {
    updateTicket(ticketId, { 
      videoId,
      status: 'resolved' // Automatically mark as resolved when video is linked
    });
    setLinkingVideo(null);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      in_progress: 'bg-blue-500/20 text-blue-400',
      resolved: 'bg-green-500/20 text-green-400'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Link 
            to="/admin"
            className="bg-[#051524] text-white p-2 rounded-lg hover:bg-[#051524]/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Dúvidas dos Usuários</h1>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:min-w-[300px]">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#b5cbe2]" />
            <input
              type="text"
              placeholder="Buscar dúvidas..."
              className="w-full bg-[#112840] text-white pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1079e2]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-[#112840] text-white px-4 py-3 rounded-lg appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-[#1079e2]"
            >
              <option value="all">Todos os status</option>
              <option value="pending">Pendente</option>
              <option value="in_progress">Em Progresso</option>
              <option value="resolved">Concluído</option>
            </select>
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#b5cbe2] pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {filteredTickets.map((ticket) => (
          <div key={ticket.id} className="bg-[#112840] rounded-lg p-6">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-2">{ticket.title}</h3>
                    <p className="text-[#b5cbe2]">{ticket.description}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm ${getStatusColor(ticket.status)}`}>
                    {ticket.status === 'pending' && 'Pendente'}
                    {ticket.status === 'in_progress' && 'Em Progresso'}
                    {ticket.status === 'resolved' && 'Concluído'}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-[#b5cbe2]">
                  <span>Por: {ticket.userName}</span>
                  <span>•</span>
                  <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{ticket.votes} votos</span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <select
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(ticket.id, e.target.value as any)}
                  className="bg-[#051524] text-white px-4 py-2 rounded-lg"
                >
                  <option value="pending">Pendente</option>
                  <option value="in_progress">Em Progresso</option>
                  <option value="resolved">Concluído</option>
                </select>
                
                <button
                  onClick={() => setLinkingVideo(ticket.id)}
                  className="flex items-center justify-center gap-2 bg-[#1079e2] text-white px-4 py-2 rounded-lg hover:bg-[#1079e2]/90"
                >
                  <Video className="w-5 h-5" />
                  {ticket.videoId ? 'Alterar Vídeo' : 'Vincular Vídeo'}
                </button>
              </div>
            </div>

            {ticket.videoId && (
              <div className="mt-4 p-4 bg-[#051524] rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="text-[#b5cbe2]">
                    Vídeo vinculado: {videos.find(v => v.id === ticket.videoId)?.title}
                  </p>
                  <button
                    onClick={() => setLinkingVideo(ticket.id)}
                    className="text-[#1079e2] hover:text-[#1079e2]/80"
                  >
                    Alterar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredTickets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#b5cbe2]">Nenhuma dúvida encontrada</p>
          </div>
        )}
      </div>

      {linkingVideo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#112840] p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Vincular Vídeo</h2>
              <button
                onClick={() => setLinkingVideo(null)}
                className="text-[#b5cbe2] hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>

            <div className="grid gap-4">
              {videos.map((video) => (
                <button
                  key={video.id}
                  onClick={() => handleLinkVideo(linkingVideo, video.id)}
                  className="flex items-start gap-4 bg-[#051524] p-4 rounded-lg hover:bg-[#051524]/80 transition-colors text-left"
                >
                  <div className="w-32 h-20 bg-[#112840] rounded overflow-hidden flex-shrink-0">
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-8 h-8 text-[#1079e2]" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">{video.title}</h3>
                    <p className="text-[#b5cbe2] text-sm">{video.category}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}