'use client';

import { useState, useRef, useEffect } from "react";
import Header from "@/components/layout/Header";
import { useCurrentUser } from "@/hooks/useUserAPI";
import { useChats, Chat, Message } from "@/hooks/useChats";
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
  Plus
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
  
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatUser, setNewChatUser] = useState('');
  const [showToast, setShowToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header />
      
      {/* Toast */}
      {showToast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white ${
          showToast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {showToast.message}
        </div>
      )}

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar de Conversas */}
        <div className="w-1/3 bg-gray-900/80 backdrop-blur-xl border-r border-gray-700/50">
          {/* Header da Sidebar */}
          <div className="p-4 border-b border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">💬 Conversas</h2>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <Plus size={20} />
              </button>
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
          <div className="overflow-y-auto h-full" style={{
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
              <div className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {getChatAvatar(currentChat)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">
                        {getChatDisplayName(currentChat)}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {currentChat.isOnline ? '🟢 Online' : '⚫ Offline'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors">
                      <Phone size={20} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors">
                      <Video size={20} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors">
                      <MoreVertical size={20} />
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
                          <>
                            <p className="text-sm">{msg.content}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs opacity-70">
                                {formatTime(msg.timestamp)}
                              </span>
                              {msg.edited && (
                                <span className="text-xs opacity-70">editado</span>
                              )}
                            </div>
                            
                            {/* Botões de ação (só para mensagens próprias) */}
                            {msg.senderId === user.id && (
                              <div className="absolute top-0 right-0 transform translate-x-full opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 rounded-lg p-1 flex space-x-1">
                                <button
                                  onClick={() => {
                                    setEditingMessageId(msg.id);
                                    setEditingContent(msg.content);
                                  }}
                                  className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteMessage(msg.id)}
                                  className="p-1 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input de Mensagem */}
              <div className="bg-gray-900/80 backdrop-blur-xl border-t border-gray-700/50 p-4">
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
              <h3 className="text-xl font-semibold text-white">Nova Conversa</h3>
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
                  ID do usuário
                </label>
                <input
                  type="text"
                  value={newChatUser}
                  onChange={(e) => setNewChatUser(e.target.value)}
                  placeholder="ex: fauder-user"
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
    </div>
  );
}
