import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, GraduationCap, Film, User, LogOut, Settings, Coins, HelpCircle } from 'lucide-react';
import { useAuthStore } from '../store/auth';

interface SidebarProps {
  userName: string;
  monthlyAmount: number;
  onCloseMobile?: () => void;
}

export function Sidebar({ userName, monthlyAmount, onCloseMobile }: SidebarProps) {
  const { signOut, user } = useAuthStore();
  const firstName = userName.split(' ')[0];

  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/equipe", icon: Users, label: "Equipe" },
    { to: "/treinamento", icon: GraduationCap, label: "Treinamento" },
    { to: "/midias", icon: Film, label: "Mídias" },
    { to: "/duvidas", icon: HelpCircle, label: "Dúvidas" },
    { to: "/perfil", icon: User, label: "Perfil" }
  ];

  const handleNavClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <div className="w-64 bg-[#112840] h-screen flex flex-col shadow-xl">
      <div className="p-6 flex-1 overflow-y-auto">
        <div className="mb-8">
          <img src="https://wiser.com.br/assets/images/logo.svg" alt="Logo" className="h-8" />
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-4 bg-[#051524]/30 p-4 rounded-lg">
            <div className="w-14 h-14 rounded-full bg-gradient-to-b from-[#1079e2] to-[#073766] flex items-center justify-center shadow-lg overflow-hidden">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={firstName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-7 h-7 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-white font-semibold">Olá,</h2>
              <p className="text-[#b5cbe2] text-sm truncate max-w-[120px]">{firstName}</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-[#051524] rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span className="text-[#b5cbe2] text-xs uppercase tracking-wider font-medium">
                  Fraternity Coins
                </span>
              </div>
              <span className="text-white font-semibold">{user?.fraternity_coins.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-[#1079e2] text-white shadow-lg shadow-[#1079e2]/20' 
                    : 'text-[#b5cbe2] hover:bg-[#1079e2]/10 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 mt-4 ${
                  isActive 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' 
                    : 'text-purple-400 hover:bg-purple-600/10 hover:text-white'
                }`
              }
            >
              <Settings className="w-5 h-5" />
              <span className="text-sm font-medium">Administrador</span>
            </NavLink>
          )}
        </nav>
      </div>

      <div className="p-6 border-t border-[#051524]/30">
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 text-[#b5cbe2] hover:text-white transition-colors w-full px-4 py-2.5 rounded-lg hover:bg-[#1079e2]/10 group"
        >
          <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-medium">Sair</span>
        </button>
      </div>
    </div>
  );
}