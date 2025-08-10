'use client';

import { useState, useEffect } from 'react';
import StorageManager from '@/utils/StorageManager';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  banner: string;
  bio: string;
  location: string;
  website: string;
  joinDate: string;
  birthDate: string;
  isOnline: boolean;
  status: 'online' | 'away' | 'busy' | 'offline';
  customStatus: string;
  theme: 'dark' | 'light';
  language: string;
  timezone: string;
  isPremium: boolean;
  isDeveloper: boolean;
  badges: string[];
  gallery?: {
    id: number;
    url: string;
    title: string;
    date: string;
    favorite: boolean;
    type: 'image' | 'gif';
    shared?: boolean;
  }[];
  stats: {
    messagesCount: number;
    friendsCount: number;
    groupsCount: number;
    callTimeHours: number;
    postsCount: number;
  };
}

// Hook para usuário atual
export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      
      // Primeiro, verificar sessionStorage (dados da sessão atual)
      const sessionUser = sessionStorage.getItem('infinit-session-user');
      if (sessionUser) {
        try {
          const userData = JSON.parse(sessionUser);
          setUser(userData);
          setError(null);
          setLoading(false);
          return userData;
        } catch (parseError) {
          console.warn('Erro ao fazer parse do usuário do sessionStorage:', parseError);
          sessionStorage.removeItem('infinit-session-user');
        }
      }
      
      // Segundo, tentar localStorage com dados essenciais
      const storedUser = localStorage.getItem('infinit-current-user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          
          // Verificar se os dados do localStorage correspondem aos do banco de dados
          const response = await fetch(`/api/user/${userData.id}`);
          if (response.ok) {
            const dbUser = await response.json();
            // Se encontrou o usuário no banco, usar os dados atualizados
            setUser(dbUser);
            
            // Salvar na sessão (sem limite de quota)
            try {
              sessionStorage.setItem('infinit-session-user', JSON.stringify(dbUser));
            } catch (sessionError) {
              console.warn('Erro ao salvar no sessionStorage:', sessionError);
            }
            
            // Salvar dados essenciais no localStorage
            saveEssentialDataToLocalStorage(dbUser);
            
            setError(null);
            setLoading(false);
            return dbUser;
          } else {
            // Se não encontrou por ID específico, usar dados do localStorage mesmo
            setUser(userData);
            setError(null);
            setLoading(false);
            return userData;
          }
        } catch (parseError) {
          console.warn('Erro ao fazer parse do usuário do localStorage:', parseError);
          localStorage.removeItem('infinit-current-user');
        }
      }

      // Se não encontrou no localStorage, busca da API (usuário padrão)
      const response = await fetch('/api/user/current');
      
      if (!response.ok) {
        throw new Error('Falha ao buscar usuário');
      }
      
      const userData = await response.json();
      setUser(userData);
      setError(null);
      
      // Salvar na sessão primeiro
      try {
        sessionStorage.setItem('infinit-session-user', JSON.stringify(userData));
      } catch (sessionError) {
        console.warn('Erro ao salvar no sessionStorage:', sessionError);
      }
      
      // Salvar dados essenciais no localStorage
      saveEssentialDataToLocalStorage(userData);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error('Erro ao buscar usuário atual:', err);
    } finally {
      setLoading(false);
    }
  };

  // Função para salvar apenas dados essenciais no localStorage
  const saveEssentialDataToLocalStorage = (userData: User) => {
    try {
      const essentialData = {
        id: userData.id,
        name: userData.name,
        username: userData.username,
        email: userData.email,
        avatar: userData.avatar,
        banner: userData.banner,
        bio: userData.bio,
        status: userData.status,
        customStatus: userData.customStatus,
        isPremium: userData.isPremium,
        isDeveloper: userData.isDeveloper,
        badges: userData.badges,
        stats: userData.stats,
        // Não incluir galeria para economizar espaço
        joinDate: userData.joinDate,
        birthDate: userData.birthDate,
        location: userData.location,
        website: userData.website,
        theme: userData.theme,
        language: userData.language,
        timezone: userData.timezone,
        isOnline: userData.isOnline
      };
      
      localStorage.setItem('infinit-current-user', JSON.stringify(essentialData));
      localStorage.setItem('infinit-authenticated', 'true');
      console.log('Dados essenciais salvos no localStorage');
    } catch (error) {
      console.warn('Erro ao salvar no localStorage, tentando versão ainda mais compacta:', error);
      
      // Versão ultra compacta apenas com dados de autenticação
      try {
        const ultraEssential = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          avatar: userData.avatar || '',
          isPremium: userData.isPremium,
          isDeveloper: userData.isDeveloper
        };
        localStorage.setItem('infinit-current-user', JSON.stringify(ultraEssential));
        localStorage.setItem('infinit-authenticated', 'true');
        console.log('Dados ultra essenciais salvos no localStorage');
      } catch (finalError) {
        console.error('Não foi possível salvar no localStorage:', finalError);
        // Manter apenas flag de autenticação
        localStorage.setItem('infinit-authenticated', 'true');
        localStorage.setItem('infinit-user-id', userData.id);
      }
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    try {
      // Atualizar localmente primeiro para responsividade
      if (user) {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        
        // Salvar na sessão primeiro (sem limites de quota)
        try {
          sessionStorage.setItem('infinit-session-user', JSON.stringify(updatedUser));
        } catch (sessionError) {
          console.warn('Erro ao salvar no sessionStorage:', sessionError);
        }
        
        // Salvar dados essenciais no localStorage
        saveEssentialDataToLocalStorage(updatedUser);
      }

      // Incluir o ID do usuário na requisição para a API saber qual usuário atualizar
      const requestBody = {
        userId: user?.id,
        ...updates
      };

      const response = await fetch('/api/user/current', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar usuário');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      
      // Salvar na sessão
      try {
        sessionStorage.setItem('infinit-session-user', JSON.stringify(updatedUser));
      } catch (sessionError) {
        console.warn('Erro ao salvar no sessionStorage:', sessionError);
      }
      
      // Salvar dados essenciais no localStorage
      saveEssentialDataToLocalStorage(updatedUser);
      
      return updatedUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar');
      // Em caso de erro, recarregar dados originais
      fetchCurrentUser();
      throw err;
    }
  };

  return {
    user,
    loading,
    error,
    updateUser,
    refetch: fetchCurrentUser
  };
}

// Hook para buscar usuário por ID
export function useUserById(id: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/user/${id}`);
        
        if (!response.ok) {
          throw new Error('Usuário não encontrado');
        }
        
        const userData = await response.json();
        setUser(userData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        console.error('Erro ao buscar usuário:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  return { user, loading, error };
}

// Hook para verificar se é premium
export function useIsPremium() {
  const { user } = useCurrentUser();
  return user?.isPremium || false;
}

// Hook para verificar se é desenvolvedor
export function useIsDeveloper() {
  const { user } = useCurrentUser();
  return user?.isDeveloper || false;
}

// Hook para obter avatar do usuário
export function useUserAvatar(userId?: string) {
  const { user: currentUser } = useCurrentUser();
  const { user: otherUser } = useUserById(userId || '');
  
  const user = userId ? otherUser : currentUser;
  
  if (!user) return null;
  
  // Se o avatar é uma URL de imagem, retorna ela
  if (user.avatar && user.avatar.startsWith('http')) {
    return user.avatar;
  }
  
  return null;
}

// Hook para obter inicial do nome
export function useUserInitial(userId?: string) {
  const { user: currentUser } = useCurrentUser();
  const { user: otherUser } = useUserById(userId || '');
  
  const user = userId ? otherUser : currentUser;
  
  if (!user) return 'U';
  
  return user.name.charAt(0).toUpperCase();
}
