import { Outlet, Link, useLocation } from 'react-router-dom';
import { Users, Video, HelpCircle, Home, Mail, LogOut, User } from 'lucide-react';
import { useAuthStore } from '../store/auth';

export function AdminLayout() {
  const location = useLocation();
  const { user, signOut } = useAuthStore();

  const navItems = [
    { to: "/admin", icon: Home, label: "Dashboard", exact: true },
    { to: "/admin/users", icon: Users, label: "Usuários" },
    { to: "/admin/invites", icon: Mail, label: "Convites" },
    { to: "/admin/videos", icon: Video, label: "Vídeos" },
    { to: "/admin/support", icon: HelpCircle, label: "Dúvidas" },
  ];

  const isActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#051524] flex">
      <div className="w-64 bg-[#112840] flex flex-col shadow-xl">
        {/* Header */}
        <div className="p-6 border-b border-[#051524]/30">
          <img src="https://wiser.com.br/assets/images/logo.svg" alt="Logo" className="h-8 mb-4" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-b from-[#1079e2] to-[#073766] flex items-center justify-center">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover rounded-full" />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <p className="text-white font-medium text-sm">{user?.name}</p>
              <p className="text-[#b5cbe2] text-xs">Administrador</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6">
          <div className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive(item.to, item.exact)
                    ? 'bg-[#1079e2] text-white shadow-lg shadow-[#1079e2]/20'
                    : 'text-[#b5cbe2] hover:bg-[#1079e2]/10 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-[#051524]/30">
          <Link
            to="/"
            className="flex items-center gap-3 text-[#b5cbe2] hover:text-white transition-colors w-full px-4 py-2.5 rounded-lg hover:bg-[#1079e2]/10 mb-2"
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">Área do Usuário</span>
          </Link>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 text-[#b5cbe2] hover:text-white transition-colors w-full px-4 py-2.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 group"
          >
            <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </div>
      
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}