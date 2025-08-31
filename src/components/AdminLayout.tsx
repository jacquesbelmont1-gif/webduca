import { Outlet, Link, useLocation } from 'react-router-dom';
import { Users, Video, HelpCircle, Home } from 'lucide-react';

export function AdminLayout() {
  const location = useLocation();

  const navItems = [
    { to: "/admin", icon: Home, label: "Dashboard", exact: true },
    { to: "/admin/users", icon: Users, label: "Usuários" },
    { to: "/admin/videos", icon: Video, label: "Vídeos" },
    { to: "/admin/classes", icon: Video, label: "Aulas" },
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
      <div className="w-64 bg-[#112840] p-6">
        <div className="mb-8">
          <img src="https://wiser.com.br/assets/images/logo.svg" alt="Logo" className="h-8" />
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                isActive(item.to, item.exact)
                  ? 'bg-[#1079e2] text-white'
                  : 'text-[#b5cbe2] hover:bg-[#1079e2]/10 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}