import React from 'react';
import { Users, Video, HelpCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUsersStore } from '../../store/users';
import { useTrainingStore } from '../../store/training';
import { useSupportStore } from '../../store/support';

export function AdminDashboard() {
  const users = useUsersStore((state) => state.users);
  const videos = useTrainingStore((state) => state.videos);
  const tickets = useSupportStore((state) => state.tickets);

  const pendingTickets = tickets.filter(t => t.status === 'pending').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;

  const stats = [
    {
      title: 'Usuários',
      value: users.length,
      icon: Users,
      link: '/admin/users',
      color: 'bg-blue-500',
    },
    {
      title: 'Vídeos',
      value: videos.length,
      icon: Video,
      link: '/admin/videos',
      color: 'bg-green-500',
    },
    {
      title: 'Dúvidas',
      value: tickets.length,
      subtitle: `${pendingTickets} pendentes • ${resolvedTickets} resolvidas`,
      icon: HelpCircle,
      link: '/admin/support',
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          to="/"
          className="bg-[#051524] text-white p-2 rounded-lg hover:bg-[#051524]/80 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white">Painel Administrativo</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Link
            key={stat.title}
            to={stat.link}
            className="bg-[#112840] rounded-lg p-6 hover:bg-[#112840]/80 transition-colors group"
          >
            <div className="flex items-start gap-4">
              <div className={`${stat.color} p-4 rounded-lg group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-white text-2xl font-bold">{stat.value}</h2>
                <p className="text-[#b5cbe2]">{stat.title}</p>
                {stat.subtitle && (
                  <p className="text-[#b5cbe2]/60 text-sm mt-1">{stat.subtitle}</p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}