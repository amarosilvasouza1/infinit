'use client';

import { useState } from 'react';
import { X, Users, Camera, Plus, Check, Search } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useUserAPI';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (groupData: any) => void;
}

export default function CreateGroupModal({ isOpen, onClose, onCreateGroup }: CreateGroupModalProps) {
  const { user } = useCurrentUser();
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupAvatar, setGroupAvatar] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [step, setStep] = useState<'info' | 'members'>('info');

  // Mock de amigos para adicionar ao grupo
  const mockFriends = [
    {
      id: 'user-1',
      name: 'Ana Silva',
      username: '@ana.silva',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bb?w=150&h=150&fit=crop&crop=face',
      isOnline: true
    },
    {
      id: 'user-2',
      name: 'Carlos Santos', 
      username: '@carlos_dev',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      isOnline: false
    },
    {
      id: 'user-3',
      name: 'Maria Costa',
      username: '@maria.costa',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      isOnline: true
    },
    {
      id: 'user-4',
      name: 'João Oliveira',
      username: '@joao.dev',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
      isOnline: true
    }
  ];

  const filteredFriends = mockFriends.filter(friend =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleMember = (memberId: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleCreateGroup = () => {
    if (groupName.trim() && selectedMembers.length > 0) {
      const groupData = {
        id: `group-${Date.now()}`,
        name: groupName.trim(),
        description: groupDescription.trim(),
        avatar: groupAvatar || '👥',
        type: 'group',
        participants: [user?.id, ...selectedMembers],
        createdBy: user?.id,
        createdAt: new Date().toISOString(),
        admins: [user?.id],
        settings: {
          canAllMembersAdd: true,
          canAllMembersEdit: false,
          isPublic: false
        }
      };
      onCreateGroup(groupData);
      onClose();
      // Reset form
      setGroupName('');
      setGroupDescription('');
      setGroupAvatar('');
      setSelectedMembers([]);
      setStep('info');
    }
  };

  const canProceed = step === 'info' ? groupName.trim().length > 0 : selectedMembers.length > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Users size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Criar Grupo</h2>
              <p className="text-sm text-gray-400">
                {step === 'info' ? 'Informações do grupo' : `Adicionar membros (${selectedMembers.length} selecionados)`}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'info' ? (
            <div className="space-y-6">
              {/* Group Avatar */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-2xl font-bold text-white">
                    {groupAvatar || '👥'}
                  </div>
                  <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center text-white transition-colors">
                    <Camera size={16} />
                  </button>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">Foto do Grupo</h3>
                  <p className="text-sm text-gray-400">Escolha um emoji ou carregue uma imagem</p>
                  <div className="flex space-x-2 mt-2">
                    {['👥', '🎮', '💼', '🎵', '📚', '🏃'].map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => setGroupAvatar(emoji)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          groupAvatar === emoji
                            ? 'bg-purple-600 scale-110'
                            : 'bg-gray-700/50 hover:bg-gray-600/50'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Group Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome do Grupo *
                </label>
                <input
                  type="text"
                  placeholder="Digite o nome do grupo..."
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  maxLength={50}
                  className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">{groupName.length}/50 caracteres</p>
              </div>

              {/* Group Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descrição (opcional)
                </label>
                <textarea
                  placeholder="Descreva sobre o que é este grupo..."
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  maxLength={200}
                  rows={3}
                  className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">{groupDescription.length}/200 caracteres</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Search Members */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar amigos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Members List */}
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {filteredFriends.map(friend => (
                  <div
                    key={friend.id}
                    onClick={() => toggleMember(friend.id)}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                      selectedMembers.includes(friend.id)
                        ? 'bg-purple-600/20 border border-purple-500/30'
                        : 'bg-gray-800/30 hover:bg-gray-700/30 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={friend.avatar}
                          alt={friend.name}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                        {friend.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-gray-900 rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{friend.name}</h3>
                        <p className="text-sm text-gray-400">{friend.username}</p>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedMembers.includes(friend.id)
                        ? 'bg-purple-600 border-purple-600'
                        : 'border-gray-500'
                    }`}>
                      {selectedMembers.includes(friend.id) && (
                        <Check size={14} className="text-white" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {selectedMembers.length > 0 && (
                <div className="bg-purple-600/10 border border-purple-500/20 rounded-xl p-3">
                  <p className="text-sm text-purple-300 font-medium">
                    {selectedMembers.length} membro{selectedMembers.length !== 1 ? 's' : ''} selecionado{selectedMembers.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700/50">
          {step === 'members' && (
            <button
              onClick={() => setStep('info')}
              className="px-6 py-3 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-xl transition-colors font-medium"
            >
              Voltar
            </button>
          )}
          <div className="flex space-x-3 ml-auto">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-xl transition-colors font-medium"
            >
              Cancelar
            </button>
            {step === 'info' ? (
              <button
                onClick={() => setStep('members')}
                disabled={!canProceed}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  canProceed
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                Próximo
              </button>
            ) : (
              <button
                onClick={handleCreateGroup}
                disabled={!canProceed}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  canProceed
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                Criar Grupo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
