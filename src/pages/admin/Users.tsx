import React, { useState } from 'react';
import { Trash2, Edit, Search, Plus, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useUsersStore, User } from '../../store/users';
import { Link } from 'react-router-dom';

export function AdminUsers() {
  const { users, updateUser, deleteUser, addUser, fetchUsers } = useUsersStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User> & { password?: string; confirmPassword?: string }>({
    name: '',
    email: '',
    role: 'user',
    password: '',
    confirmPassword: ''
  });

  // Carregar usuários ao montar o componente
  React.useEffect(() => {
    fetchUsers().catch(console.error);
  }, [fetchUsers]);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newUser.password !== newUser.confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }

    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: newUser.name || '',
      email: newUser.email || '',
      role: newUser.role as 'admin' | 'user'
    };
    
    addUser(user);
    setShowAddForm(false);
    setNewUser({
      name: '',
      email: '',
      role: 'user',
      password: '',
      confirmPassword: ''
    });
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUser(editingUser.id, editingUser);
      setEditingUser(null);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link 
            to="/"
            className="bg-[#051524] text-white p-2 rounded-lg hover:bg-[#051524]/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Gerenciar Usuários</h1>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-[#1079e2] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1079e2]/90"
        >
          <Plus className="w-5 h-5" />
          Adicionar Novo Usuário
        </button>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#b5cbe2]" />
        <input
          type="text"
          placeholder="Buscar usuários..."
          className="w-full bg-[#112840] text-white pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1079e2]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-[#112840] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#051524]">
              <th className="text-left p-4 text-[#b5cbe2]">Nome</th>
              <th className="text-left p-4 text-[#b5cbe2]">Email</th>
              <th className="text-left p-4 text-[#b5cbe2]">Função</th>
              <th className="text-right p-4 text-[#b5cbe2]">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-t border-[#051524]">
                <td className="p-4 text-white">{user.name}</td>
                <td className="p-4 text-[#b5cbe2]">{user.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {user.role === 'admin' ? 'Admin' : 'Usuário'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => setEditingUser(user)}
                    className="text-[#1079e2] hover:text-[#1079e2]/80 p-2"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="text-red-500 hover:text-red-600 p-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(showAddForm || editingUser) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-[#112840] p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingUser ? 'Editar Usuário' : 'Adicionar Usuário'}
            </h2>
            <form onSubmit={editingUser ? handleUpdateUser : handleAddUser}>
              <div className="space-y-4">
                <div>
                  <label className="block text-[#b5cbe2] mb-2">Nome</label>
                  <input
                    type="text"
                    value={editingUser ? editingUser.name : newUser.name}
                    onChange={(e) => editingUser
                      ? setEditingUser({ ...editingUser, name: e.target.value })
                      : setNewUser({ ...newUser, name: e.target.value })
                    }
                    className="w-full bg-[#051524] text-white px-4 py-2 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#b5cbe2] mb-2">Email</label>
                  <input
                    type="email"
                    value={editingUser ? editingUser.email : newUser.email}
                    onChange={(e) => editingUser
                      ? setEditingUser({ ...editingUser, email: e.target.value })
                      : setNewUser({ ...newUser, email: e.target.value })
                    }
                    className="w-full bg-[#051524] text-white px-4 py-2 rounded-lg"
                    required
                  />
                </div>
                {!editingUser && (
                  <>
                    <div>
                      <label className="block text-[#b5cbe2] mb-2">Senha</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={newUser.password}
                          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                          className="w-full bg-[#051524] text-white px-4 py-2 rounded-lg pr-10"
                          required
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
                      <label className="block text-[#b5cbe2] mb-2">Confirmar Senha</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={newUser.confirmPassword}
                          onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                          className="w-full bg-[#051524] text-white px-4 py-2 rounded-lg pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#b5cbe2]"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-[#b5cbe2] mb-2">Função</label>
                  <select
                    value={editingUser ? editingUser.role : newUser.role}
                    onChange={(e) => editingUser
                      ? setEditingUser({ ...editingUser, role: e.target.value as 'admin' | 'user' })
                      : setNewUser({ ...newUser, role: e.target.value as 'admin' | 'user' })
                    }
                    className="w-full bg-[#051524] text-white px-4 py-2 rounded-lg"
                  >
                    <option value="user">Usuário</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setEditingUser(null);
                    setShowAddForm(false);
                  }}
                  className="px-4 py-2 text-[#b5cbe2] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1079e2] text-white rounded-lg hover:bg-[#1079e2]/90"
                >
                  {editingUser ? 'Salvar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}