import React, { useState } from 'react';
import { useQuestionsStore } from '../store/questions';
import { useAuthStore } from '../store/auth';
import { ThumbsUp, Users, ChevronLeft, ChevronRight } from 'lucide-react';

export function QuestionsList() {
  const { questions, voteQuestion, unvoteQuestion, categories } = useQuestionsStore();
  const { user } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showVoters, setShowVoters] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 10;

  const filteredQuestions = questions
    .filter(q => q.status === 'pending' && (selectedCategory === 'all' || q.category === selectedCategory))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * questionsPerPage,
    currentPage * questionsPerPage
  );

  const handleVote = (questionId: string) => {
    if (!user) return;

    const question = questions.find(q => q.id === questionId);
    const hasVoted = question?.voters.some(voter => voter.id === user.id);

    if (hasVoted) {
      unvoteQuestion(questionId, user.id);
    } else {
      voteQuestion(questionId, {
        id: user.id,
        name: user.name.split(' ')[0],
        team: user.team || 'blue'
      });
    }
  };

  const getTeamColor = (team: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-500',
      red: 'bg-red-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500'
    };
    return colors[team] || 'bg-gray-500';
  };

  return (
    <div className="bg-[#112840] rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold">Dúvidas da Comunidade</h3>
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCurrentPage(1); // Reset to first page when changing category
          }}
          className="bg-[#051524] text-white px-4 py-2 rounded-lg"
        >
          <option value="all">Todas as categorias</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>
      <div className="space-y-4">
        {paginatedQuestions.map((question) => (
          <div key={question.id} className="bg-[#051524] rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-white font-medium">{question.title}</span>
                  <span className="px-2 py-1 rounded-full text-xs bg-[#1079e2]/20 text-[#1079e2]">
                    {question.category}
                  </span>
                </div>
                <p className="text-[#b5cbe2] text-sm mb-4">{question.description}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-[#b5cbe2]">
                    <span>{question.userName}</span>
                    <div className={`w-2 h-2 rounded-full ${getTeamColor(question.userTeam)}`} />
                  </div>
                  <span className="text-[#b5cbe2] text-sm">
                    {new Date(question.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={() => handleVote(question.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    question.voters.some(voter => voter.id === user?.id)
                      ? 'bg-[#1079e2] text-white'
                      : 'bg-[#112840] text-[#b5cbe2] hover:bg-[#1079e2]/10 hover:text-white'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{question.votes}</span>
                </button>
                {question.voters.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setShowVoters(showVoters === question.id ? null : question.id)}
                      className="text-[#b5cbe2] hover:text-white flex items-center gap-1 text-sm"
                    >
                      <Users className="w-4 h-4" />
                      {question.voters.length}
                    </button>
                    {showVoters === question.id && (
                      <div className="absolute bottom-full right-0 mb-2 w-48 bg-[#112840] rounded-lg shadow-lg p-2 z-10">
                        {question.voters.map((voter) => (
                          <div
                            key={voter.id}
                            className="flex items-center gap-2 p-2 hover:bg-[#051524] rounded"
                          >
                            <div className={`w-2 h-2 rounded-full ${getTeamColor(voter.team)}`} />
                            <span className="text-white text-sm">{voter.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {filteredQuestions.length === 0 && (
          <div className="text-center text-[#b5cbe2] py-8">
            Nenhuma dúvida foi enviada ainda.
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg bg-[#051524] text-[#b5cbe2] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#051524]/80"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-[#b5cbe2]">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg bg-[#051524] text-[#b5cbe2] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#051524]/80"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}