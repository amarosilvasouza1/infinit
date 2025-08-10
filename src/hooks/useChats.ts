'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'gif';
  timestamp: string;
  mediaUrl?: string;
  duration?: number;
  edited?: boolean;
  editedAt?: string;
}

export interface Chat {
  id: string;
  participants: string[];
  type: 'direct' | 'group';
  name?: string;
  avatar?: string;
  lastMessage?: Message;
  lastActivity: string;
  isOnline?: boolean;
  unreadCount?: number;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export const useChats = (userId: string) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar todas as conversas do usuário
  const fetchChats = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/chats?userId=${encodeURIComponent(userId)}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar conversas');
      }

      const data = await response.json();
      setChats(data.chats || []);
    } catch (error) {
      console.error('Erro ao buscar chats:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Buscar conversa específica com mensagens
  const fetchChat = useCallback(async (chatId: string) => {
    if (!userId || !chatId) return null;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/chats/${chatId}?userId=${encodeURIComponent(userId)}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar conversa');
      }

      const data = await response.json();
      setCurrentChat(data.chat);
      return data.chat;
    } catch (error) {
      console.error('Erro ao buscar chat:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Criar nova conversa
  const createChat = useCallback(async (participants: string[], type: 'direct' | 'group' = 'direct', name?: string) => {
    if (!userId) return null;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participants: [userId, ...participants],
          type,
          name,
          createdBy: userId
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar conversa');
      }

      const data = await response.json();
      
      // Atualizar lista de chats
      await fetchChats();
      
      return data.chat;
    } catch (error) {
      console.error('Erro ao criar chat:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId, fetchChats]);

  // Enviar mensagem
  const sendMessage = useCallback(async (
    chatId: string, 
    content: string, 
    type: Message['type'] = 'text',
    mediaUrl?: string,
    duration?: number
  ) => {
    if (!userId || !chatId || !content) return null;

    try {
      // Buscar nome do usuário atual
      const userResponse = await fetch(`/api/user/${userId}`);
      let senderName = 'Usuário';
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        senderName = userData.name || userData.username || 'Usuário';
      }

      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId: userId,
          senderName,
          content,
          type,
          mediaUrl,
          duration
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar mensagem');
      }

      const data = await response.json();
      
      // Atualizar chat atual se for o mesmo
      if (currentChat && currentChat.id === chatId) {
        setCurrentChat(prev => prev ? {
          ...prev,
          messages: [...prev.messages, data.message],
          lastMessage: data.message,
          lastActivity: data.message.timestamp,
          updatedAt: data.message.timestamp
        } : null);
      }

      // Atualizar lista de chats
      setChats(prev => prev.map(chat => 
        chat.id === chatId 
          ? {
              ...chat,
              lastMessage: data.message,
              lastActivity: data.message.timestamp,
              updatedAt: data.message.timestamp
            }
          : chat
      ).sort((a, b) => 
        new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
      ));

      return data.message;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      return null;
    }
  }, [userId, currentChat]);

  // Editar mensagem
  const editMessage = useCallback(async (chatId: string, messageId: string, content: string) => {
    if (!userId || !chatId || !messageId || !content) return false;

    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          content,
          userId
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao editar mensagem');
      }

      const data = await response.json();
      
      // Atualizar chat atual
      if (currentChat && currentChat.id === chatId) {
        setCurrentChat(prev => prev ? {
          ...prev,
          messages: prev.messages.map(msg => 
            msg.id === messageId ? data.message : msg
          )
        } : null);
      }

      return true;
    } catch (error) {
      console.error('Erro ao editar mensagem:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      return false;
    }
  }, [userId, currentChat]);

  // Deletar mensagem
  const deleteMessage = useCallback(async (chatId: string, messageId: string) => {
    if (!userId || !chatId || !messageId) return false;

    try {
      const response = await fetch(`/api/chats/${chatId}?messageId=${messageId}&userId=${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar mensagem');
      }

      // Atualizar chat atual
      if (currentChat && currentChat.id === chatId) {
        setCurrentChat(prev => prev ? {
          ...prev,
          messages: prev.messages.filter(msg => msg.id !== messageId)
        } : null);
      }

      return true;
    } catch (error) {
      console.error('Erro ao deletar mensagem:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      return false;
    }
  }, [userId, currentChat]);

  // Deletar conversa
  const deleteChat = useCallback(async (chatId: string) => {
    if (!userId || !chatId) return false;

    try {
      const response = await fetch(`/api/chats?chatId=${chatId}&userId=${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar conversa');
      }

      // Remover da lista local
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      
      // Se era o chat atual, limpar
      if (currentChat && currentChat.id === chatId) {
        setCurrentChat(null);
      }

      return true;
    } catch (error) {
      console.error('Erro ao deletar conversa:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      return false;
    }
  }, [userId, currentChat]);

  // Buscar conversas na inicialização
  useEffect(() => {
    if (userId) {
      fetchChats();
    }
  }, [userId, fetchChats]);

  return {
    chats,
    currentChat,
    loading,
    error,
    fetchChats,
    fetchChat,
    createChat,
    sendMessage,
    editMessage,
    deleteMessage,
    deleteChat,
    setCurrentChat,
    setError
  };
};
