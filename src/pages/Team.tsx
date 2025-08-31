import React from 'react';
import { Search, SlidersHorizontal, Users, HelpCircle } from 'lucide-react';
import { useQuestionsStore } from '../store/questions';
import { useAuthStore } from '../store/auth';

export function Team() {
  const { user } = useAuthStore();
  const { questions } = useQuestionsStore();
  const userTeamQuestions = questions.filter(q => q.userTeam === user?.team);

  const teamMembers = [
    { id: 1, name: 'Jacques Belmont', role: 'Líder', questions: userTeamQuestions.length },
    // Add more team members as needed
  ];

  const getTeamColor = (team: string = 'blue') => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-500',
      red: 'bg-red-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500'
    };
    return colors[team] || 'bg-gray-500';
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div 
          className="h-48 rounded-2xl bg-cover bg-center mb-6 relative overflow-hidden"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6">
            <div className="bg-[#1079e2] rounded-lg p-2 inline-block mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-white text-2xl font-bold">Minha Equipe</h1>
            <p className="text-white/80 text-sm mt-2">
              Gerencie seu time e acompanhe o desempenho individual de cada membro.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[#112840] rounded-lg p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-12 h-12 rounded-full ${getTeamColor(user?.team)} flex items-center justify-center`}>
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-medium">Time {user?.team?.charAt(0).toUpperCase() + user?.team?.slice(1)}</h3>
            <p className="text-[#b5cbe2] text-sm">{teamMembers.length} membros</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#051524] rounded-lg p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#1079e2] flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold">{teamMembers.length} Membros</p>
                <p className="text-[#b5cbe2] text-sm">ativos na equipe</p>
              </div>
            </div>
          </div>

          <div className="bg-[#051524] rounded-lg p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold">{userTeamQuestions.length} Dúvidas</p>
                <p className="text-[#b5cbe2] text-sm">enviadas pela equipe</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="w-5 h-5 text-[#b5cbe2] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar membros..."
            className="w-full bg-[#051524] text-white pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1079e2]"
          />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#112840] text-[#b5cbe2] px-4 py-1 rounded-lg flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            FILTROS
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[#b5cbe2] text-sm">
                <th className="text-left py-3 px-4">Membro</th>
                <th className="text-left py-3 px-4">Função</th>
                <th className="text-left py-3 px-4">Dúvidas Enviadas</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map(member => (
                <tr key={member.id} className="border-t border-[#051524]">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${getTeamColor(user?.team)} flex items-center justify-center`}>
                        <span className="text-white text-sm">{member.name.charAt(0)}</span>
                      </div>
                      <span className="text-white">{member.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-[#b5cbe2]">{member.role}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-[#b5cbe2]">{member.questions}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}