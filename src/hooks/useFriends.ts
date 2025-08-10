'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Friend {
  id: string;
  friendId: string;
  name: string;
  username: string;
  avatar: string;
  isOnline: boolean;
  acceptedAt: string;
  createdAt: string;
}

export interface FriendRequest {
  id: string;
  from: string;
  to: string;
  fromUser?: {
    name: string;
    username: string;
    avatar: string;
  };
  message: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'declined';
}

export const useFriends = (userId: string) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar amigos
  const fetchFriends = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/friends?userId=${encodeURIComponent(userId)}&type=friends`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na API friends:', errorText);
        throw new Error(`Erro ao buscar amigos: ${errorText}`);
      }

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('Erro ao fazer parse do JSON:', responseText);
        throw new Error(`Erro de JSON: ${responseText.substring(0, 100)}...`);
      }
      
      // Buscar informações dos usuários
      const friendsWithInfo = await Promise.all(
        data.friends.map(async (friend: any) => {
          try {
            const userResponse = await fetch(`/api/user/${friend.friendId}`);
            if (userResponse.ok) {
              const userResponseText = await userResponse.text();
              try {
                const userData = JSON.parse(userResponseText);
                return {
                  ...friend,
                  name: userData.name,
                  username: userData.username,
                  avatar: userData.avatar,
                  isOnline: userData.isOnline || false
                };
              } catch (jsonError) {
                console.error(`Erro ao fazer parse do JSON user/${friend.friendId}:`, userResponseText);
                return {
                  ...friend,
                  name: friend.friendId,
                  username: `@${friend.friendId}`,
                  avatar: '👤',
                  isOnline: false
                };
              }
            }
            return {
              ...friend,
              name: friend.friendId,
              username: `@${friend.friendId}`,
              avatar: '👤',
              isOnline: false
            };
          } catch {
            return {
              ...friend,
              name: friend.friendId,
              username: `@${friend.friendId}`,
              avatar: '👤',
              isOnline: false
            };
          }
        })
      );

      setFriends(friendsWithInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar amigos');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Buscar solicitações recebidas
  const fetchFriendRequests = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/friends?userId=${encodeURIComponent(userId)}&type=requests`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na API requests:', errorText);
        throw new Error(`Erro ao buscar solicitações: ${errorText}`);
      }

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('Erro ao fazer parse do JSON requests:', responseText);
        throw new Error(`Erro de JSON requests: ${responseText.substring(0, 100)}...`);
      }
      
      // Buscar informações dos usuários que enviaram
      const requestsWithInfo = await Promise.all(
        data.requests.map(async (request: any) => {
          try {
            const userResponse = await fetch(`/api/user/${request.from}`);
            if (userResponse.ok) {
              const userResponseText = await userResponse.text();
              try {
                const userData = JSON.parse(userResponseText);
                return {
                  ...request,
                  fromUser: {
                    name: userData.name,
                    username: userData.username,
                    avatar: userData.avatar
                  }
                };
              } catch (jsonError) {
                console.error(`Erro ao fazer parse do JSON user/${request.from}:`, userResponseText);
                return {
                  ...request,
                  fromUser: {
                    name: request.from,
                    username: `@${request.from}`,
                    avatar: '👤'
                  }
                };
              }
            }
            return {
              ...request,
              fromUser: {
                name: request.from,
                username: `@${request.from}`,
                avatar: '👤'
              }
            };
          } catch {
            return {
              ...request,
              fromUser: {
                name: request.from,
                username: `@${request.from}`,
                avatar: '👤'
              }
            };
          }
        })
      );

      setFriendRequests(requestsWithInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar solicitações');
    }
  }, [userId]);

  // Buscar solicitações enviadas
  const fetchSentRequests = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/friends?userId=${encodeURIComponent(userId)}&type=sent_requests`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na API sent_requests:', errorText);
        throw new Error(`Erro ao buscar solicitações enviadas: ${errorText}`);
      }

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('Erro ao fazer parse do JSON sent_requests:', responseText);
        throw new Error(`Erro de JSON sent_requests: ${responseText.substring(0, 100)}...`);
      }
      setSentRequests(data.requests);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar solicitações enviadas');
    }
  }, [userId]);

  // Enviar solicitação de amizade
  const sendFriendRequest = async (toUserId: string, message: string = '') => {
    try {
      setError(null);

      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: userId,
          to: toUserId,
          message
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao enviar solicitação');
      }

      const data = await response.json();
      
      // Atualizar lista de solicitações enviadas
      setSentRequests(prev => [...prev, data.request]);
      
      return data.request;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar solicitação');
      throw err;
    }
  };

  // Aceitar solicitação de amizade
  const acceptFriendRequest = async (requestId: string) => {
    try {
      setError(null);

      const response = await fetch('/api/friends', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          action: 'accept'
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao aceitar solicitação');
      }

      // Remover da lista de solicitações
      setFriendRequests(prev => prev.filter(req => req.id !== requestId));
      
      // Recarregar amigos
      await fetchFriends();
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao aceitar solicitação');
      throw err;
    }
  };

  // Recusar solicitação de amizade
  const declineFriendRequest = async (requestId: string) => {
    try {
      setError(null);

      const response = await fetch('/api/friends', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          action: 'decline'
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao recusar solicitação');
      }

      // Remover da lista de solicitações
      setFriendRequests(prev => prev.filter(req => req.id !== requestId));
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao recusar solicitação');
      throw err;
    }
  };

  // Remover amigo
  const removeFriend = async (friendId: string) => {
    try {
      setError(null);

      const response = await fetch(`/api/friends?user1=${userId}&user2=${friendId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao remover amigo');
      }

      // Remover da lista de amigos
      setFriends(prev => prev.filter(friend => friend.friendId !== friendId));
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover amigo');
      throw err;
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    if (userId) {
      fetchFriends();
      fetchFriendRequests();
      fetchSentRequests();
    }
  }, [userId, fetchFriends, fetchFriendRequests, fetchSentRequests]);

  return {
    friends,
    friendRequests,
    sentRequests,
    loading,
    error,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    refetch: () => {
      fetchFriends();
      fetchFriendRequests();
      fetchSentRequests();
    }
  };
};
