'use client';

import { useState, useEffect } from 'react';
import { X, Search, UserPlus, Users, Mail, Check, Clock, UserCheck } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useUserAPI';
import { useFriends } from '@/hooks/useFriends';

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFriend: (friendData: any) => void;
}

export default function AddFriendModal({ isOpen, onClose, onAddFriend }: AddFriendModalProps) {
  const { user } = useCurrentUser();
  const { 
    friends, 
    friendRequests, 
    sentRequests,
    sendFriendRequest, 
    acceptFriendRequest, 
    declineFriendRequest,
    loading: friendsLoading
  } = useFriends(user?.id || '');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'requests' | 'invite'>('search');
  const [requestMessage, setRequestMessage] = useState('');

  // Mock de usuários para busca (em produção viria de uma API)
  const mockUsers = [
    {
      id: 'user-1',
      name: 'Ana Silva',
      username: '@ana.silva',
      email: 'ana@example.com',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bb?w=150&h=150&fit=crop&crop=face',
      isOnline: true,
      mutualFriends: 5
    },
    {
      id: 'user-2', 
      name: 'Carlos Santos',
      username: '@carlos_dev',
      email: 'carlos@example.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      isOnline: false,
      mutualFriends: 2
    },
    {
      id: 'user-3',
      name: 'Maria Costa',
      username: '@maria.costa',
      email: 'maria@example.com', 
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      isOnline: true,
      mutualFriends: 8
    }
  ];

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.length > 2) {
      setIsSearching(true);
      // Simular busca
      setTimeout(() => {
        const results = mockUsers.filter(user => {
          // Filtrar usuários que não são amigos e não têm solicitações pendentes
          const isAlreadyFriend = friends.some(f => f.friendId === user.id);
          const hasPendingRequest = sentRequests.some(r => r.to === user.id);
          const hasReceivedRequest = friendRequests.some(r => r.from === user.id);
          
          if (isAlreadyFriend || hasPendingRequest || hasReceivedRequest) {
            return false;
          }
          
          return user.name.toLowerCase().includes(term.toLowerCase()) ||
                 user.username.toLowerCase().includes(term.toLowerCase()) ||
                 user.email.toLowerCase().includes(term.toLowerCase());
        });
        setSearchResults(results);
        setIsSearching(false);
      }, 500);
    } else {
      setSearchResults([]);
    }
  };

  const handleSendFriendRequest = async (targetUser: any) => {
    try {
      await sendFriendRequest(targetUser.id, requestMessage);
      onAddFriend(targetUser);
      // Remover da lista de resultados
      setSearchResults(prev => prev.filter(u => u.id !== targetUser.id));
      setRequestMessage('');
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
    } catch (error) {
      console.error('Erro ao aceitar solicitação:', error);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await declineFriendRequest(requestId);
    } catch (error) {
      console.error('Erro ao recusar solicitação:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <UserPlus size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Adicionar Amigo</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700/30">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 transition-colors ${
              activeTab === 'search'
                ? 'text-green-400 border-b-2 border-green-400 bg-green-500/10'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
            }`}
          >
            <Search size={16} />
            <span>Buscar</span>
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 transition-colors relative ${
              activeTab === 'requests'
                ? 'text-green-400 border-b-2 border-green-400 bg-green-500/10'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
            }`}
          >
            <UserCheck size={16} />
            <span>Solicitações</span>
            {friendRequests.length > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                {friendRequests.length}
              </div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('invite')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 transition-colors ${
              activeTab === 'invite'
                ? 'text-green-400 border-b-2 border-green-400 bg-green-500/10'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
            }`}
          >
            <Mail size={16} />
            <span>Convidar</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'search' ? (
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar por nome, username ou email..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Search Results */}
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {isSearching ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-3"></div>
                    <p className="text-gray-400">Buscando...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map(friend => (
                    <div key={friend.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-xl hover:bg-gray-700/30 transition-colors">
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
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">{friend.name}</h3>
                          <p className="text-sm text-gray-400">{friend.username}</p>
                          {friend.mutualFriends > 0 && (
                            <p className="text-xs text-green-400">{friend.mutualFriends} amigos em comum</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleSendFriendRequest(friend)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        Adicionar
                      </button>
                    </div>
                  ))
                ) : searchTerm.length > 2 ? (
                  <div className="text-center py-8">
                    <Users size={48} className="text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">Nenhum usuário encontrado</p>
                    <p className="text-sm text-gray-500">Tente buscar por nome, username ou email</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Search size={48} className="text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">Digite para buscar amigos</p>
                    <p className="text-sm text-gray-500">Mínimo 3 caracteres</p>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'requests' ? (
            <div className="space-y-4">
              {friendsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-3"></div>
                  <p className="text-gray-400">Carregando...</p>
                </div>
              ) : friendRequests.length > 0 ? (
                friendRequests.map(request => (
                  <div key={request.id} className="p-4 bg-gray-800/30 rounded-xl space-y-3">
                    <div className="flex items-center space-x-3">
                      <img
                        src={request.fromUser?.avatar || '👤'}
                        alt={request.fromUser?.name || 'Usuário'}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{request.fromUser?.name || 'Usuário'}</h3>
                        <p className="text-sm text-gray-400">{request.fromUser?.username || '@usuario'}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    {request.message && (
                      <div className="bg-gray-700/30 rounded-lg p-3">
                        <p className="text-sm text-gray-300">"{request.message}"</p>
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAcceptRequest(request.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                      >
                        Aceitar
                      </button>
                      <button
                        onClick={() => handleDeclineRequest(request.id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                      >
                        Recusar
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <UserCheck size={48} className="text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">Nenhuma solicitação pendente</p>
                  <p className="text-sm text-gray-500">Suas solicitações de amizade aparecerão aqui</p>
                </div>
              )}
              
              {/* Sent Requests */}
              {sentRequests.length > 0 && (
                <div className="border-t border-gray-700/50 pt-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Solicitações Enviadas</h4>
                  <div className="space-y-2">
                    {sentRequests.map(request => (
                      <div key={request.id} className="flex items-center justify-between p-3 bg-gray-800/20 rounded-lg">
                        <div>
                          <p className="text-sm text-white">Para: {request.to}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 text-yellow-400">
                          <Clock size={16} />
                          <span className="text-xs">Pendente</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Invite by Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Convidar por Email
                </label>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    placeholder="email@exemplo.com"
                    className="flex-1 bg-gray-800/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors font-medium">
                    Enviar
                  </button>
                </div>
              </div>

              {/* Share Link */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Compartilhar Link de Convite
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value="https://infinit.dev/invite/amaro123"
                    readOnly
                    className="flex-1 bg-gray-800/50 border border-gray-600/50 rounded-xl px-4 py-3 text-gray-300 focus:outline-none"
                  />
                  <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors font-medium">
                    Copiar
                  </button>
                </div>
              </div>

              {/* QR Code */}
              <div className="text-center pt-4">
                <div className="w-32 h-32 bg-white rounded-xl mx-auto mb-3 flex items-center justify-center">
                  <div className="text-6xl">📱</div>
                </div>
                <p className="text-sm text-gray-400">Código QR para convite rápido</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
