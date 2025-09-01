import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { useAuthStore } from '../store/auth';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, user } = useAuthStore();

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (err) {
      setError('Email ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'admin' | 'user') => {
    setLoading(true);
    setError('');
    
    try {
      if (role === 'admin') {
        await signIn('admin@wsp.com', 'WSP@Admin2024!');
      } else {
        await signIn('carlos.silva@wsp.com', '123456');
      }
    } catch (err) {
      setError('Erro ao fazer login de demonstração');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#051524] via-[#112840] to-[#051524] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo e Header */}
        <div className="mb-8 text-center">
          <div className="bg-[#112840] rounded-2xl p-6 mb-6 shadow-2xl">
            <img
              src="https://wiser.com.br/assets/images/logo.svg"
              alt="WSP Logo"
              className="h-12 mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-white mb-2">WSP Platform</h1>
            <p className="text-[#b5cbe2] text-sm">
              Sistema de Treinamento e Desenvolvimento em Vendas
            </p>
          </div>
        </div>

        {/* Formulário de Login */}
        <div className="bg-[#112840] rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#b5cbe2] mb-2">
                EMAIL
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#051524] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1079e2] border border-[#051524] focus:border-[#1079e2] transition-colors"
                placeholder="seu@email.com"
                required
                disabled={loading}
              />
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
                  placeholder="••••••••"
                  required
                  disabled={loading}
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
                  <LogIn className="w-5 h-5" />
                  ENTRAR
                </>
              )}
            </button>
          </form>

          {/* Links de Ação */}
          <div className="mt-6 space-y-4">
            <div className="text-center">
              <Link 
                to="/register" 
                className="text-[#1079e2] text-sm hover:underline flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                CRIAR CONTA COM CONVITE
              </Link>
            </div>

            <div className="border-t border-[#051524] pt-4">
              <p className="text-[#b5cbe2] text-xs text-center mb-3">Acesso de demonstração:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleDemoLogin('admin')}
                  disabled={loading}
                  className="bg-purple-600 text-white py-2 px-3 rounded text-xs hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  Admin Demo
                </button>
                <button
                  onClick={() => handleDemoLogin('user')}
                  disabled={loading}
                  className="bg-blue-600 text-white py-2 px-3 rounded text-xs hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  User Demo
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-[#b5cbe2] text-xs">
            © 2024 WSP Platform. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}