'use client';

import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Search, UserPlus, X, Check } from "lucide-react";

interface AddPeopleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPeople: (userIds: string[]) => void;
  title: string;
  description: string;
}

export default function AddPeopleModal({ 
  isOpen, 
  onClose, 
  onAddPeople, 
  title, 
  description 
}: AddPeopleModalProps) {
  const { users, searchUsers, currentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState(users.filter(u => u.id !== currentUser.id));

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = searchUsers(query).filter(u => u.id !== currentUser.id);
      setSearchResults(results);
    } else {
      setSearchResults(users.filter(u => u.id !== currentUser.id));
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAddPeople = () => {
    onAddPeople(selectedUsers);
    setSelectedUsers([]);
    setSearchQuery("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <p className="text-sm text-gray-400">{description}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Pesquisar por nome ou ID..."
              className="w-full bg-gray-700 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Selected Users */}
        {selectedUsers.length > 0 && (
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">
              Selecionados ({selectedUsers.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map(userId => {
                const user = users.find(u => u.id === userId);
                if (!user) return null;
                return (
                  <div key={userId} className="flex items-center space-x-2 bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                    <span>{user.avatar}</span>
                    <span>{user.name}</span>
                    <button 
                      onClick={() => toggleUserSelection(userId)}
                      className="hover:text-red-300"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Users List */}
        <div className="overflow-y-auto max-h-64">
          {searchResults.map(user => (
            <div 
              key={user.id} 
              className="flex items-center justify-between p-4 hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <span className="text-lg">{user.avatar}</span>
                  </div>
                  {user.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-white">{user.name}</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span>ID: {user.id}</span>
                    {user.isOnline ? (
                      <span className="text-green-400">Online</span>
                    ) : (
                      <span>{user.lastSeen || 'Offline'}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => toggleUserSelection(user.id)}
                className={`p-2 rounded-lg transition-colors ${
                  selectedUsers.includes(user.id)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                }`}
              >
                {selectedUsers.includes(user.id) ? (
                  <Check size={20} />
                ) : (
                  <UserPlus size={20} />
                )}
              </button>
            </div>
          ))}
          
          {searchResults.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              <UserPlus size={48} className="mx-auto mb-4 opacity-50" />
              <p>Nenhum usuário encontrado</p>
              <p className="text-sm mt-1">Tente pesquisar por nome ou ID</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex space-x-3">
          <button 
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleAddPeople}
            disabled={selectedUsers.length === 0}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
          >
            Adicionar ({selectedUsers.length})
          </button>
        </div>
      </div>
    </div>
  );
}
