import React, { useState, useEffect } from 'react';
import { Mail, Plus, Copy, Check, Clock, UserCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Invite {
  id: string;
  token: string;
  email: string;
  invited_by_name: string;
  used: boolean;
  expires_at: string;
  created_at: string;
}

export function AdminInvites() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [email, setEmail] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/invites', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setInvites(data);
      }
    } catch (error) {
      console.error('Erro ao carregar convites:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:3001/api/auth/generate-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Convite gerado com sucesso! Token: ${data.token}`);
        setEmail('');
        setShowInviteForm(false);
        fetchInvites(); // Recarregar lista
      } else {
        setError(data.error || 'Erro ao gerar convite');
      }
    } catch (error) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'token' | 'url') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedToken(text);
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
    }
  };

  const getInviteUrl = (token: string) => {
    return `${window.location.origin}/register?token=${token}`;
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const getStatusBadge = (invite: Invite) => {
    if (invite.used) {
      return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs flex items-center gap-1">
        <UserCheck className="w-3 h-3" />
        Usado
      </span>;
    }
    
    if (isExpired(invite.expires_at)) {
      return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs flex items-center gap-1">
        <Clock className="w-3 h-3" />
        Expirado
      </span>;
    }
    
    return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs flex items-center gap-1">
      <Clock className="w-3 h-3" />
      Pendente
    </span>;
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1079e2] mx-auto mb-4"></div>
        <p className="text-[#b5cbe2]">Carregando convites...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link 
            to="/admin"
            className="bg-[#051524] text-white p-2 rounded-lg hover:bg-[#051524]/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Gerenciar Convites</h1>
            <p className="text-[#b5cbe2] text-sm">Controle o acesso ao sistema através de convites por email</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowInviteForm(true)}
          className="bg-[#1079e2] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1079e2]/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Gerar Convite
        </button>
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

      {/* Lista de Convites */}
      <div className="bg-[#112840] rounded-lg overflow-hidden">
        <div className="p-6 border-b border-[#051524]">
          <h2 className="text-white font-semibold">Convites Enviados</h2>
        </div>
        
        {invites.length === 0 ? (
          <div className="p-8 text-center">
            <Mail className="w-12 h-12 text-[#b5cbe2] mx-auto mb-4" />
            <p className="text-[#b5cbe2]">Nenhum convite foi enviado ainda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#051524]">
                  <th className="text-left p-4 text-[#b5cbe2] font-medium">Email</th>
                  <th className="text-left p-4 text-[#b5cbe2] font-medium">Status</th>
                  <th className="text-left p-4 text-[#b5cbe2] font-medium">Convidado por</th>
                  <th className="text-left p-4 text-[#b5cbe2] font-medium">Expira em</th>
                  <th className="text-left p-4 text-[#b5cbe2] font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {invites.map((invite) => (
                  <tr key={invite.id} className="border-t border-[#051524]">
                    <td className="p-4 text-white">{invite.email}</td>
                    <td className="p-4">{getStatusBadge(invite)}</td>
                    <td className="p-4 text-[#b5cbe2]">{invite.invited_by_name}</td>
                    <td className="p-4 text-[#b5cbe2]">
                      {new Date(invite.expires_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-4">
                      {!invite.used && !isExpired(invite.expires_at) && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => copyToClipboard(invite.token, 'token')}
                            className="text-[#1079e2] hover:text-[#1079e2]/80 p-1"
                            title="Copiar token"
                          >
                            {copiedToken === invite.token ? (
                              <Check className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => copyToClipboard(getInviteUrl(invite.token), 'url')}
                            className="text-[#1079e2] hover:text-[#1079e2]/80 p-1"
                            title="Copiar link de convite"
                          >
                            {copiedToken === getInviteUrl(invite.token) ? (
                              <Check className="w-4 h-4 text-green-400" />
                            ) : (
                              <Mail className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Gerar Convite */}
      {showInviteForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#112840] p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Gerar Novo Convite</h2>
            <form onSubmit={generateInvite}>
              <div className="mb-4">
                <label className="block text-[#b5cbe2] mb-2">Email do Convidado</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#051524] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1079e2]"
                  placeholder="usuario@exemplo.com"
                  required
                  disabled={generating}
                />
                <p className="text-[#b5cbe2] text-xs mt-1">
                  Um link de convite será gerado para este email
                </p>
              </div>
              
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteForm(false);
                    setEmail('');
                    setError('');
                  }}
                  disabled={generating}
                  className="px-4 py-2 text-[#b5cbe2] hover:text-white transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="px-6 py-2 bg-[#1079e2] text-white rounded-lg hover:bg-[#1079e2]/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {generating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Gerar Convite
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}