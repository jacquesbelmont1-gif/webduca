import React, { useState } from 'react';
import { useQuestionsStore } from '../store/questions';
import { useAuthStore } from '../store/auth';

export function QuestionForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Vendas');
  const { addQuestion, categories } = useQuestionsStore();
  const { user } = useAuthStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    addQuestion({
      userId: user.id,
      userName: user.name.split(' ')[0], // Only first name
      userTeam: user.team || 'blue',
      title,
      description,
      category
    });

    setTitle('');
    setDescription('');
    setCategory('Vendas');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#112840] rounded-lg p-6">
      <h3 className="text-white font-semibold mb-4">Tem alguma dúvida?</h3>
      <div className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Título da sua dúvida"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#051524] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1079e2]"
            required
          />
        </div>
        <div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-[#051524] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1079e2]"
            required
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <textarea
            placeholder="Descreva sua dúvida em detalhes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-[#051524] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1079e2] min-h-[100px]"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-[#1079e2] text-white py-3 rounded-lg hover:bg-[#1079e2]/90 transition-colors"
        >
          Enviar Dúvida
        </button>
      </div>
    </form>
  );
}