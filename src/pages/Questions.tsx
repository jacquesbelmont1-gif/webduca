import React, { useState } from 'react';
import { useQuestionsStore } from '../store/questions';
import { QuestionForm } from '../components/QuestionForm';
import { QuestionsList } from '../components/QuestionsList';
import { BarChart3 } from 'lucide-react';

export function Questions() {
  const { questions, categories } = useQuestionsStore();
  const [selectedTeam, setSelectedTeam] = useState<string>('all');

  const teams = ['blue', 'red', 'green', 'yellow'];
  const pendingQuestions = questions.filter(q => q.status === 'pending');

  const getTeamColor = (team: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-500',
      red: 'bg-red-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500'
    };
    return colors[team] || 'bg-gray-500';
  };

  const categoryStats = categories.map(category => ({
    category,
    count: pendingQuestions.filter(q => q.category === category).length,
    votes: pendingQuestions
      .filter(q => q.category === category)
      .reduce((sum, q) => sum + q.votes, 0)
  })).sort((a, b) => b.votes - a.votes);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Dúvidas da Comunidade</h1>
        <p className="text-[#b5cbe2]">
          Compartilhe suas dúvidas e vote nas que você também gostaria de ver respondidas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <QuestionForm />
          <QuestionsList />
        </div>

        <div className="space-y-8">
          <div className="bg-[#112840] rounded-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-[#1079e2]" />
              <h3 className="text-white font-semibold">Ranking por Categoria</h3>
            </div>
            <div className="space-y-4">
              {categoryStats.map(({ category, count, votes }) => (
                <div key={category} className="bg-[#051524] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{category}</span>
                    <span className="text-[#b5cbe2] text-sm">{count} dúvidas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-[#112840] rounded-full h-2">
                      <div
                        className="bg-[#1079e2] h-2 rounded-full"
                        style={{
                          width: `${Math.min(100, (votes / Math.max(...categoryStats.map(s => s.votes))) * 100)}%`
                        }}
                      />
                    </div>
                    <span className="text-[#1079e2] font-medium">{votes}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#112840] rounded-lg p-6">
            <h3 className="text-white font-semibold mb-4">Filtrar por Equipe</h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedTeam('all')}
                className={`w-full text-left px-4 py-2 rounded-lg ${
                  selectedTeam === 'all'
                    ? 'bg-[#1079e2] text-white'
                    : 'text-[#b5cbe2] hover:bg-[#051524]'
                }`}
              >
                Todas as equipes
              </button>
              {teams.map(team => (
                <button
                  key={team}
                  onClick={() => setSelectedTeam(team)}
                  className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-2 ${
                    selectedTeam === team
                      ? 'bg-[#1079e2] text-white'
                      : 'text-[#b5cbe2] hover:bg-[#051524]'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${getTeamColor(team)}`} />
                  <span className="capitalize">{team}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}