import React, { useState } from 'react';
import { Plus } from 'lucide-react';

type Class = {
  title: string;
  module: string;
  url: string;
  platform: 'loom' | 'youtube' | 'vimeo';
};

export function AdminClasses() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [newClass, setNewClass] = useState<Class>({ title: '', module: '', url: '', platform: 'loom' });
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    setClasses([...classes, newClass]);
    setNewClass({ title: '', module: '', url: '', platform: 'loom' });
    setShowAddForm(false);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">Gerenciar Aulas</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-[#1079e2] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1079e2]/90"
        >
          <Plus className="w-5 h-5" />
          Adicionar Aula
        </button>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-[#112840] p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Adicionar Aula</h2>
            <form onSubmit={handleAddClass} className="space-y-4">
              <div>
                <label className="block text-[#b5cbe2] mb-2">Título</label>
                <input
                  type="text"
                  value={newClass.title}
                  onChange={(e) => setNewClass({ ...newClass, title: e.target.value })}
                  className="w-full bg-[#051524] text-white px-4 py-2 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-[#b5cbe2] mb-2">Módulo</label>
                <input
                  type="text"
                  value={newClass.module}
                  onChange={(e) => setNewClass({ ...newClass, module: e.target.value })}
                  className="w-full bg-[#051524] text-white px-4 py-2 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-[#b5cbe2] mb-2">URL do Vídeo</label>
                <input
                  type="url"
                  value={newClass.url}
                  onChange={(e) => setNewClass({ ...newClass, url: e.target.value })}
                  className="w-full bg-[#051524] text-white px-4 py-2 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-[#b5cbe2] mb-2">Plataforma</label>
                <select
                  value={newClass.platform}
                  onChange={(e) => setNewClass({ ...newClass, platform: e.target.value as 'loom' | 'youtube' | 'vimeo' })}
                  className="w-full bg-[#051524] text-white px-4 py-2 rounded-lg"
                  required
                >
                  <option value="loom">Loom</option>
                  <option value="youtube">YouTube</option>
                  <option value="vimeo">Vimeo</option>
                </select>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-[#b5cbe2] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1079e2] text-white rounded-lg hover:bg-[#1079e2]/90"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-[#112840] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#051524]">
              <th className="text-left p-4 text-[#b5cbe2]">Título</th>
              <th className="text-left p-4 text-[#b5cbe2]">Módulo</th>
              <th className="text-left p-4 text-[#b5cbe2]">Plataforma</th>
              <th className="text-left p-4 text-[#b5cbe2]">URL</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((classItem, index) => (
              <tr key={index} className="border-t border-[#051524]">
                <td className="p-4 text-white">{classItem.title}</td>
                <td className="p-4 text-[#b5cbe2]">{classItem.module}</td>
                <td className="p-4 text-[#b5cbe2]">{classItem.platform}</td>
                <td className="p-4 text-[#b5cbe2]">{classItem.url}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 