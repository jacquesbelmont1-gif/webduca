import React, { useState, useRef } from 'react';
import { User, Camera, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/auth';

export function Profile() {
  const { user, updateProfile } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    team: user?.team || 'blue',
    avatar_url: user?.avatar_url
  });

  const teams = [
    { id: 'blue', name: 'Blue' },
    { id: 'red', name: 'Red' },
    { id: 'green', name: 'Green' },
    { id: 'yellow', name: 'Yellow' }
  ];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Aqui você implementaria o upload da imagem para seu servidor/storage
    // Por enquanto, vamos apenas simular com uma URL local
    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({
        ...prev,
        avatar_url: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        name: formData.name,
        email: formData.email,
        team: formData.team,
        avatar_url: formData.avatar_url
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Erro ao atualizar perfil');
    }
  };

  return (
    <div className="p-8">
      <div className="bg-[#112840] rounded-lg p-8">
        <form onSubmit={handleSubmit}>
          <div className="flex items-start gap-8 mb-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-b from-[#1079e2] to-[#073766] flex items-center justify-center overflow-hidden">
                {formData.avatar_url ? (
                  <img 
                    src={formData.avatar_url} 
                    alt={formData.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-white" />
                )}
              </div>
              {isEditing && (
                <>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-[#1079e2] p-2 rounded-full text-white hover:bg-[#1079e2]/90"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-white text-2xl font-bold">{isEditing ? 'Editar Perfil' : formData.name}</h1>
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-[#1079e2] hover:text-[#1079e2]/80"
                >
                  {isEditing ? 'Cancelar' : 'Editar'}
                </button>
              </div>
              <span className="text-[#b5cbe2] uppercase">{formData.team}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#051524] rounded-lg p-6">
              <h3 className="text-[#b5cbe2] text-sm mb-4">Informações Pessoais</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[#b5cbe2] text-xs block mb-1">Nome</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-[#112840] text-white px-4 py-2 rounded-lg"
                    />
                  ) : (
                    <p className="text-white">{formData.name}</p>
                  )}
                </div>
                <div>
                  <label className="text-[#b5cbe2] text-xs block mb-1">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-[#112840] text-white px-4 py-2 rounded-lg"
                    />
                  ) : (
                    <p className="text-white">{formData.email}</p>
                  )}
                </div>
                <div>
                  <label className="text-[#b5cbe2] text-xs block mb-1">Equipe</label>
                  {isEditing ? (
                    <select
                      value={formData.team}
                      onChange={(e) => setFormData(prev => ({ ...prev, team: e.target.value }))}
                      className="w-full bg-[#112840] text-white px-4 py-2 rounded-lg"
                    >
                      {teams.map(team => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-white">{teams.find(t => t.id === formData.team)?.name}</p>
                  )}
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="bg-[#051524] rounded-lg p-6">
                <h3 className="text-[#b5cbe2] text-sm mb-4">Alterar Senha</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[#b5cbe2] text-xs block mb-1">Senha Atual</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.currentPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full bg-[#112840] text-white px-4 py-2 rounded-lg pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#b5cbe2]"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-[#b5cbe2] text-xs block mb-1">Nova Senha</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={formData.newPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full bg-[#112840] text-white px-4 py-2 rounded-lg pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#b5cbe2]"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {isEditing && (
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="bg-[#1079e2] text-white px-6 py-2 rounded-lg hover:bg-[#1079e2]/90"
              >
                Salvar Alterações
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}