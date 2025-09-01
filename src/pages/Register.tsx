import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../store/auth';

export function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [team, setTeam] = useState('blue');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);

  const teams = [
    { id: 'blue', name: 'Equipe Azul', color: 'bg-blue-500' },
    { id: 'red', name: 'Equipe Vermelha', color: 'bg-red-500' },
    { id: 'green', name: 'Equipe Verde', color: 'bg-green-500' },
    { id: 'yellow', name: 'Equipe Amarela', color: 'bg-yellow-500' }
  ];

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (token) {
      validateToken();
    }
  }, [token]);

  const validateToken = async () => {
    setValidatingToken(true);
    setError('');
    
    try {
      const response = await fetch(`http://localhost:3001/api/auth/validate-invite/${token}`);
      const data = await response.json();
      
      if (response.ok) {
        setEmail(data.email);
        setTokenValid(true);
      } else {
        setError(data.error || 'Token inválido ou expirado');
        setTokenValid(false);
      }
    } catch (err) {
      setError('Erro ao validar token de convite');
      setTokenValid(false);
    } finally {
      setValidatingToken(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          token,
          name,
          password,
          team
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Registro bem-sucedido, redirecionar
        navigate('/', { replace: true });
      } else {
        setError(data.error || 'Erro ao criar conta');
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (validatingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#051524] via-[#112840] to-[#051524] flex items-center justify-center p-4">
        <div className="bg-[#112840] rounded-2xl p-8 shadow-2xl text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1079e2] mx-auto mb-4"></div>
          <p className="text-[#b5cbe2]">Validando convite...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#051524] via-[#112840] to-[#051524] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-[#112840] rounded-2xl p-8 shadow-2xl text-center">
            <UserPlus className="w-16 h-16 text-[#1079e2] mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">Convite Necessário</h1>
            <p className="text-[#b5cbe2] mb-6">
              Para criar uma conta no WSP Platform, você precisa de um convite válido.
              Entre em contato com um administrador para receber seu link de convite.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#b5cbe2] mb-2">
                  TOKEN DE CONVITE
                </label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full bg-[#051524] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1079e2] border border-[#051524] focus:border-[#1079e2] transition-colors"
                  placeholder="Cole seu token de convite aqui"
                />
              </div>
              
              <button
                onClick={() => token && validateToken()}
                disabled={!token || validatingToken}
                className="w-full bg-[#1079e2] text-white py-3 rounded-lg hover:bg-[#1079e2]/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Validar Convite
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-[#051524]">
              <Link 
                to="/login" 
                className="text-[#1079e2] text-sm hover:underline flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar ao Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#051524] via-[#112840] to-[#051524] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-[#112840] rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Token Inválido</h1>
            <p className="text-red-400 mb-6">{error}</p>
            
            <Link 
              to="/register" 
              className="inline-flex items-center gap-2 bg-[#1079e2] text-white px-6 py-3 rounded-lg hover:bg-[#1079e2]/90 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Tentar Novamente
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#051524] via-[#112840] to-[#051524] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="bg-[#112840] rounded-2xl p-6 mb-6 shadow-2xl">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Criar Conta</h1>
            <p className="text-[#b5cbe2] text-sm">
              Convite válido para: <span className="text-white font-medium">{email}</span>
            </p>
          </div>
        </div>

        {/* Formulário de Registro */}
        <div className="bg-[#112840] rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#b5cbe2] mb-2">
                NOME COMPLETO
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#051524] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1079e2] border border-[#051524] focus:border-[#1079e2] transition-colors"
                placeholder="Seu nome completo"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="team" className="block text-sm font-medium text-[#b5cbe2] mb-2">
                EQUIPE
              </label>
              <select
                id="team"
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                className="w-full bg-[#051524] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1079e2] border border-[#051524] focus:border-[#1079e2] transition-colors"
                disabled={loading}
              >
                {teams.map(teamOption => (
                  <option key={teamOption.id} value={teamOption.id}>
                    {teamOption.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#b5cbe2] mb-2">
                SENHA
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#051524] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1079e2] border border-[#051524] focus:border-[#1079e2] transition-colors pr-12"
                  placeholder="Mínimo 6 caracteres"
                  required
                  disabled={loading}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#b5cbe2] hover:text-white transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#b5cbe2] mb-2">
                CONFIRMAR SENHA
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#051524] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1079e2] border border-[#051524] focus:border-[#1079e2] transition-colors pr-12"
                  placeholder="Confirme sua senha"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#b5cbe2] hover:text-white transition-colors"
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1079e2] text-white py-3 rounded-lg hover:bg-[#1079e2]/90 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  CRIAR CONTA
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#051524] text-center">
            <Link 
              to="/login" 
              className="text-[#1079e2] text-sm hover:underline flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}