'use client';

import { useState, useRef, useEffect } from "react";
import Header from "@/components/layout/Header";
import { useCurrentUser } from "@/hooks/useUserAPI";
import { useChats, Chat, Message } from "@/hooks/useChats";
import { useCall } from "@/contexts/CallContext";
import AddFriendModal from "@/components/modals/AddFriendModal";
import CreateGroupModal from "@/components/modals/CreateGroupModal";
import GroupSettingsModal from "@/components/modals/GroupSettingsModal";
import { 
  Send, 
  Paperclip, 
  Mic, 
  Phone, 
  Video, 
  Search, 
  MoreVertical,
  Image,
  Camera,
  Users,
  FileText,
  X,
  Play,
  Edit,
  Trash2,
  Plus,
  UserPlus,
  Settings
} from "lucide-react";

export default function ConversasPage() {
  const { user } = useCurrentUser();
  const { 
    chats, 
    currentChat, 
    loading, 
    error, 
    fetchChat, 
    sendMessage, 
    editMessage, 
    deleteMessage,
    createChat,
    setCurrentChat 
  } = useChats(user?.id || '');
  
  const { startCall, startGroupCall, canStartCall, callState } = useCall();
  
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatUser, setNewChatUser] = useState('');
  const [showToast, setShowToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  // Novos estados para os modais
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showGroupSettingsModal, setShowGroupSettingsModal] = useState(false);
  const [selectedGroupForSettings, setSelectedGroupForSettings] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat?.messages]);

  // Auto-hide toast
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Atalhos de teclado para calls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentChat || !user) return;
      
      // Ctrl + D para chamada de voz
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        handleStartVoiceCall();
      }
      
      // Ctrl + Shift + D para chamada de vídeo
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        handleStartVideoCall();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentChat, user]);

  const handleSelectChat = async (chat: Chat) => {
    await fetchChat(chat.id);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentChat || !user) return;

    const sentMessage = await sendMessage(currentChat.id, message.trim());
    if (sentMessage) {
      setMessage('');
      setShowToast({message: 'Mensagem enviada!', type: 'success'});
    }
  };

  const handleEditMessage = async (messageId: string, content: string) => {
    if (!currentChat) return;
    
    const success = await editMessage(currentChat.id, messageId, content);
    if (success) {
      setEditingMessageId(null);
      setEditingContent('');
      setShowToast({message: 'Mensagem editada!', type: 'success'});
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!currentChat) return;
    
    const success = await deleteMessage(currentChat.id, messageId);
    if (success) {
      setShowToast({message: 'Mensagem deletada!', type: 'success'});
    }
  };

  const handleCreateNewChat = async () => {
    if (!newChatUser.trim()) return;
    
    const chat = await createChat([newChatUser.trim()]);
    if (chat) {
      setShowNewChatModal(false);
      setNewChatUser('');
      setShowToast({message: 'Conversa criada!', type: 'success'});
      await fetchChat(chat.id);
    }
  };

  const handleStartVoiceCall = async () => {
    if (!currentChat || !user) return;

    if (!canStartCall()) {
      setShowToast({message: 'Já existe uma chamada ativa', type: 'error'});
      return;
    }

    try {
      if (currentChat.type === 'group') {
        // Chamada em grupo
        const participants = currentChat.participants.map(participantId => ({
          id: participantId,
          name: participantId === user.id ? user.name : participantId,
          avatar: participantId === user.id ? (user.avatar || '👤') : '👤',
          isCurrentUser: participantId === user.id,
          isOwner: participantId === user.id
        }));

        const success = await startGroupCall(
          getChatDisplayName(currentChat),
          getChatAvatar(currentChat),
          participants,
          user.id
        );

        if (success) {
          setShowToast({message: 'Chamada em grupo iniciada!', type: 'success'});
        } else {
          setShowToast({message: 'Erro ao iniciar chamada em grupo', type: 'error'});
        }
      } else {
        // Chamada direta
        const otherUserId = currentChat.participants.find(p => p !== user.id);
        if (otherUserId) {
          const success = await startCall(
            otherUserId,
            getChatDisplayName(currentChat),
            getChatAvatar(currentChat)
          );

          if (success) {
            setShowToast({message: 'Chamada iniciada!', type: 'success'});
          } else {
            setShowToast({message: 'Erro ao iniciar chamada', type: 'error'});
          }
        }
      }
    } catch (error) {
      console.error('Erro ao iniciar chamada:', error);
      setShowToast({message: 'Erro ao iniciar chamada', type: 'error'});
    }
  };

  const handleStartVideoCall = async () => {
    if (!currentChat || !user) return;

    if (!canStartCall()) {
      setShowToast({message: 'Já existe uma chamada ativa', type: 'error'});
      return;
    }

    try {
      if (currentChat.type === 'group') {
        // Chamada de vídeo em grupo
        const participants = currentChat.participants.map(participantId => ({
          id: participantId,
          name: participantId === user.id ? user.name : participantId,
          avatar: participantId === user.id ? (user.avatar || '👤') : '👤',
          isCurrentUser: participantId === user.id,
          isOwner: participantId === user.id
        }));

        const success = await startGroupCall(
          getChatDisplayName(currentChat),
          getChatAvatar(currentChat),
          participants,
          user.id
        );

        if (success) {
          setShowToast({message: 'Chamada de vídeo em grupo iniciada!', type: 'success'});
        } else {
          setShowToast({message: 'Erro ao iniciar chamada de vídeo em grupo', type: 'error'});
        }
      } else {
        // Chamada de vídeo direta
        const otherUserId = currentChat.participants.find(p => p !== user.id);
        if (otherUserId) {
          const success = await startCall(
            otherUserId,
            getChatDisplayName(currentChat),
            getChatAvatar(currentChat)
          );

          if (success) {
            setShowToast({message: 'Chamada de vídeo iniciada!', type: 'success'});
          } else {
            setShowToast({message: 'Erro ao iniciar chamada de vídeo', type: 'error'});
          }
        }
      }
    } catch (error) {
      console.error('Erro ao iniciar chamada de vídeo:', error);
      setShowToast({message: 'Erro ao iniciar chamada de vídeo', type: 'error'});
    }
  };

  const filteredChats = chats.filter(chat => {
    if (!searchTerm) return true;
    
    const chatName = chat.type === 'group' 
      ? chat.name || 'Grupo sem nome'
      : chat.participants.find(p => p !== user?.id) || 'Usuário';
    
    return chatName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           chat.lastMessage?.content.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 168) { // 7 dias
      return date.toLocaleDateString('pt-BR', { 
        weekday: 'short' 
      });
    } else {
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  };

  const getChatDisplayName = (chat: Chat) => {
    if (chat.type === 'group') {
      return chat.name || '🚀 Grupo sem nome';
    }
    
    const otherUser = chat.participants.find(p => p !== user?.id);
    return otherUser || 'Usuário';
  };

  const getChatAvatar = (chat: Chat) => {
    if (chat.type === 'group') {
      return chat.avatar || '👥';
    }
    
    return '👤';
  };

  // Funções dos modais
  const handleAddFriend = (friendData: any) => {
    // Criar nova conversa com o amigo
    const newChat = {
      id: `chat-${Date.now()}`,
      type: 'direct' as const,
      participants: [user?.id || '', friendData.id],
      name: friendData.name,
      avatar: friendData.avatar,
      isOnline: friendData.isOnline,
      lastMessage: undefined,
      lastActivity: new Date().toISOString(),
      unreadCount: 0,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // O createChat espera apenas os participantes, vamos simular
    setShowToast({message: `${friendData.name} foi adicionado aos seus contatos!`, type: 'success'});
    setShowAddFriendModal(false);
  };

  const handleCreateGroup = (groupData: any) => {
    const newGroupChat = {
      id: groupData.id,
      type: 'group' as const,
      participants: groupData.participants,
      name: groupData.name,
      avatar: groupData.avatar,
      lastMessage: undefined,
      lastActivity: new Date().toISOString(),
      unreadCount: 0,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setShowToast({message: `Grupo "${groupData.name}" criado com sucesso!`, type: 'success'});
    setShowCreateGroupModal(false);
  };

  const handleGroupSettings = (chat: Chat) => {
    if (chat.type === 'group') {
      // Converter para o formato esperado pelo modal
      const groupData = {
        id: chat.id,
        name: chat.name || 'Grupo sem nome',
        description: '',
        avatar: chat.avatar || '👥',
        members: chat.participants.map(id => ({
          id,
          name: id === user?.id ? user.name : id,
          username: id === user?.id ? user.username : `@${id}`,
          avatar: id === user?.id ? user.avatar : '👤',
          isOnline: true,
          isAdmin: id === user?.id, // O primeiro usuário é sempre admin
          joinedAt: new Date().toISOString()
        })),
        admins: [user?.id || ''],
        createdBy: user?.id || '',
        settings: {
          canAllMembersAdd: true,
          canAllMembersEdit: false,
          isPublic: false
        }
      };
      
      setSelectedGroupForSettings(groupData);
      setShowGroupSettingsModal(true);
    }
  };

  const handleUpdateGroup = (updates: any) => {
    if (selectedGroupForSettings) {
      // Atualizar o chat com as novas informações
      setShowToast({message: 'Configurações do grupo atualizadas!', type: 'success'});
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col">
      <Header />
      
      {/* Toast */}
      {showToast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white ${
          showToast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {showToast.message}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar de Conversas */}
        <div className="w-1/3 bg-gray-900/80 backdrop-blur-xl border-r border-gray-700/50 flex flex-col">
          {/* Header da Sidebar */}
          <div className="p-4 border-b border-gray-700/50 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">💬 Conversas</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowAddFriendModal(true)}
                  className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  title="Adicionar Amigo"
                >
                  <UserPlus size={20} />
                </button>
                <button
                  onClick={() => setShowCreateGroupModal(true)}
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  title="Criar Grupo"
                >
                  <Users size={20} />
                </button>
              </div>
            </div>
            
            {/* Barra de Pesquisa */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Buscar conversas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Lista de Conversas */}
          <div className="flex-1 overflow-y-auto" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#8b5cf6 rgba(17, 24, 39, 0.5)'
          }}>
            <style jsx>{`
              div::-webkit-scrollbar {
                width: 8px;
              }
              div::-webkit-scrollbar-track {
                background: rgba(17, 24, 39, 0.5);
                border-radius: 10px;
                margin: 4px;
              }
              div::-webkit-scrollbar-thumb {
                background: linear-gradient(135deg, #8b5cf6, #a855f7, #c084fc);
                border-radius: 10px;
                border: 1px solid rgba(75, 85, 99, 0.3);
                box-shadow: 0 2px 4px rgba(139, 92, 246, 0.3);
              }
              div::-webkit-scrollbar-thumb:hover {
                background: linear-gradient(135deg, #7c3aed, #9333ea, #a855f7);
                box-shadow: 0 2px 8px rgba(139, 92, 246, 0.5);
              }
            `}</style>
            
            {loading && (
              <div className="p-4 text-center text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
                Carregando conversas...
              </div>
            )}

            {!loading && filteredChats.length === 0 && (
              <div className="p-4 text-center text-gray-400">
                {searchTerm ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
              </div>
            )}

            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleSelectChat(chat)}
                className={`p-4 border-b border-gray-700/30 cursor-pointer transition-all duration-200 hover:bg-gray-800/50 ${
                  currentChat?.id === chat.id ? 'bg-purple-900/30 border-l-4 border-l-purple-500' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg relative">
                    {getChatAvatar(chat)}
                    {chat.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-gray-900 rounded-full"></div>
                    )}
                    {/* Indicador de chamada ativa */}
                    {callState.isActive && (
                      (chat.type === 'group' && callState.isGroup) ||
                      (chat.type === 'direct' && !callState.isGroup && 
                       chat.participants.includes(callState.contactId || ''))
                    ) && (
                      <div className="absolute -top-1 -left-1 w-6 h-6 bg-green-500 border-2 border-gray-900 rounded-full flex items-center justify-center animate-pulse">
                        <Phone size={12} className="text-white" />
                      </div>
                    )}
                  </div>

                  {/* Info da Conversa */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-white truncate">
                        {getChatDisplayName(chat)}
                      </h3>
                      <span className="text-xs text-gray-400">
                        {chat.lastMessage && formatTime(chat.lastMessage.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-400 truncate">
                      {chat.lastMessage?.content || 'Conversa iniciada'}
                    </p>
                  </div>

                  {/* Badge de mensagens não lidas */}
                  {chat.unreadCount && chat.unreadCount > 0 && (
                    <div className="bg-purple-600 text-white text-xs rounded-full px-2 py-1 min-w-5 text-center">
                      {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Área do Chat */}
        <div className="flex-1 flex flex-col">
          {currentChat ? (
            <>
              {/* Header do Chat */}
              <div className="bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50 flex-shrink-0">
                {/* Indicador de chamada ativa */}
                {callState.isActive && (
                  ((currentChat.type === 'group' && callState.isGroup) ||
                   (currentChat.type === 'direct' && !callState.isGroup && 
                    currentChat.participants.includes(callState.contactId || '')))
                ) && (
                  <div className="px-4 pt-3 pb-1">
                    <div className="p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-xl backdrop-blur-sm">
                      <div className="flex items-center space-x-3 text-green-300">
                        <div className="relative">
                          <Phone size={18} className="animate-pulse" />
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                        </div>
                        <span className="font-medium">
                          {currentChat.type === 'group' ? 'Chamada em grupo ativa' : 'Em chamada'}
                        </span>
                        <div className="flex-1"></div>
                        <span className="text-xs text-green-400/80 font-mono">
                          {callState.startTime && new Date(callState.startTime).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {getChatAvatar(currentChat)}
                      </div>
                      {currentChat.type === 'direct' && currentChat.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-gray-900 rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">
                        {getChatDisplayName(currentChat)}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${currentChat.isOnline ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                        <p className="text-sm text-gray-400">
                          {currentChat.type === 'group' 
                            ? `${currentChat.participants.length} membros` 
                            : currentChat.isOnline ? 'Online' : 'Offline'
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={handleStartVoiceCall}
                      disabled={!canStartCall()}
                      className="p-3 text-gray-400 hover:text-white hover:bg-purple-600/20 hover:border-purple-500/30 border border-transparent rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative group"
                      title={currentChat.type === 'group' ? 'Chamada de voz em grupo (Ctrl+D)' : 'Chamada de voz (Ctrl+D)'}
                    >
                      <Phone size={20} />
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800/90 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap shadow-lg border border-gray-700/50">
                        {currentChat.type === 'group' ? 'Chamada de voz em grupo' : 'Chamada de voz'}
                        <div className="text-xs opacity-70 font-mono">(Ctrl+D)</div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800/90"></div>
                      </div>
                    </button>
                    <button 
                      onClick={handleStartVideoCall}
                      disabled={!canStartCall()}
                      className="p-3 text-gray-400 hover:text-white hover:bg-blue-600/20 hover:border-blue-500/30 border border-transparent rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative group"
                      title={currentChat.type === 'group' ? 'Chamada de vídeo em grupo (Ctrl+Shift+D)' : 'Chamada de vídeo (Ctrl+Shift+D)'}
                    >
                      <Video size={20} />
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800/90 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap shadow-lg border border-gray-700/50">
                        {currentChat.type === 'group' ? 'Chamada de vídeo em grupo' : 'Chamada de vídeo'}
                        <div className="text-xs opacity-70 font-mono">(Ctrl+Shift+D)</div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800/90"></div>
                      </div>
                    </button>
                    {currentChat.type === 'group' && (
                      <button 
                        onClick={() => handleGroupSettings(currentChat)}
                        className="p-3 text-gray-400 hover:text-white hover:bg-blue-600/20 hover:border-blue-500/30 border border-transparent rounded-xl transition-all duration-200 relative group"
                        title="Configurações do Grupo"
                      >
                        <Settings size={20} />
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800/90 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap shadow-lg border border-gray-700/50">
                          Configurações do grupo
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800/90"></div>
                        </div>
                      </button>
                    )}
                    <button className="p-3 text-gray-400 hover:text-white hover:bg-gray-600/20 hover:border-gray-500/30 border border-transparent rounded-xl transition-all duration-200 relative group">
                      <MoreVertical size={20} />
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800/90 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap shadow-lg border border-gray-700/50">
                        Mais opções
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800/90"></div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Área de Mensagens */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#8b5cf6 rgba(17, 24, 39, 0.5)'
              }}>
                <style jsx>{`
                  div::-webkit-scrollbar {
                    width: 8px;
                  }
                  div::-webkit-scrollbar-track {
                    background: rgba(17, 24, 39, 0.5);
                    border-radius: 10px;
                    margin: 4px;
                  }
                  div::-webkit-scrollbar-thumb {
                    background: linear-gradient(135deg, #8b5cf6, #a855f7, #c084fc);
                    border-radius: 10px;
                    border: 1px solid rgba(75, 85, 99, 0.3);
                    box-shadow: 0 2px 4px rgba(139, 92, 246, 0.3);
                  }
                  div::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(135deg, #7c3aed, #9333ea, #a855f7);
                    box-shadow: 0 2px 8px rgba(139, 92, 246, 0.5);
                  }
                `}</style>

                {currentChat.messages.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <div className="text-6xl mb-4">💬</div>
                    <p>Nenhuma mensagem ainda</p>
                    <p className="text-sm">Envie a primeira mensagem!</p>
                  </div>
                ) : (
                  currentChat.messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative group ${
                        msg.senderId === user.id
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                          : 'bg-gray-700/80 backdrop-blur-sm text-white border border-gray-600/50'
                      }`}>
                        {editingMessageId === msg.id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editingContent}
                              onChange={(e) => setEditingContent(e.target.value)}
                              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleEditMessage(msg.id, editingContent);
                                }
                              }}
                            />
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditMessage(msg.id, editingContent)}
                                className="text-xs bg-green-600 hover:bg-green-700 px-2 py-1 rounded"
                              >
                                Salvar
                              </button>
                              <button
                                onClick={() => {
                                  setEditingMessageId(null);
                                  setEditingContent('');
                                }}
                                className="text-xs bg-gray-600 hover:bg-gray-700 px-2 py-1 rounded"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="break-words">{msg.content}</p>
                            <div className="flex items-center justify-between mt-1 text-xs opacity-70">
                              <span>{formatTime(msg.timestamp)}</span>
                              {msg.senderId === user.id && (
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                                  <button
                                    onClick={() => {
                                      setEditingMessageId(msg.id);
                                      setEditingContent(msg.content);
                                    }}
                                    className="hover:text-blue-300"
                                  >
                                    <Edit size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMessage(msg.id)}
                                    className="hover:text-red-300"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input de Mensagem */}
              <div className="p-4 bg-gray-900/50 backdrop-blur-xl border-t border-gray-700/50 flex-shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                  <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                  >
                    <Paperclip size={20} />
                  </button>
                  
                  <div className="flex-1">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Digite sua mensagem..."
                      className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                  >
                    <Mic size={20} />
                  </button>

                  <button
                    type="submit"
                    disabled={!message.trim()}
                    className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            /* Estado vazio */
            <div className="flex-1 flex items-center justify-center text-center">
              <div className="text-gray-400">
                <div className="text-8xl mb-6">💬</div>
                <h3 className="text-2xl font-semibold text-white mb-2">Selecione uma conversa</h3>
                <p>Escolha uma conversa da lista ou inicie uma nova</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Nova Conversa */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Nova Conversa</h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome do usuário
                </label>
                <input
                  type="text"
                  value={newChatUser}
                  onChange={(e) => setNewChatUser(e.target.value)}
                  placeholder="Digite o nome do usuário..."
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowNewChatModal(false)}
                  className="flex-1 bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateNewChat}
                  disabled={!newChatUser.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Criar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modais */}
      <AddFriendModal
        isOpen={showAddFriendModal}
        onClose={() => setShowAddFriendModal(false)}
        onAddFriend={handleAddFriend}
      />

      <CreateGroupModal
        isOpen={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        onCreateGroup={handleCreateGroup}
      />

      {selectedGroupForSettings && (
        <GroupSettingsModal
          isOpen={showGroupSettingsModal}
          onClose={() => setShowGroupSettingsModal(false)}
          groupData={selectedGroupForSettings}
          currentUserId={user?.id || ''}
          onUpdateGroup={handleUpdateGroup}
        />
      )}
    </div>
  );
}
