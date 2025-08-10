'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useCurrentUser, type User } from '@/hooks/useUserAPI';
import { useDataPersistence } from '@/hooks/useDataPersistence';

interface ProfileContextType {
  profile: User | null;
  loading: boolean;
  error: string | null;
  updateProfile: (updates: Partial<User>) => Promise<User>;
  updateAvatar: (url: string) => Promise<User>;
  updateBanner: (url: string) => Promise<User>;
  updateBio: (bio: string) => Promise<User>;
  updateStatus: (status: User['status']) => Promise<User>;
  updateCustomStatus: (status: string) => Promise<User>;
  clearLocalStorageData: () => void;
  generateUniqueId: () => string;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// Função para gerar IDs únicos
let profileIdCounter = 0;
const generateUniqueProfileId = () => {
  profileIdCounter++;
  return `profile-${Date.now()}-${profileIdCounter}-${Math.random().toString(36).substr(2, 9)}`;
};

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user, loading, error, updateUser } = useCurrentUser();
  
  // Usar o hook de persistência para manter dados sincronizados
  useDataPersistence();

  const updateProfile = async (updates: Partial<User>) => {
    return await updateUser(updates);
  };

  const updateAvatar = async (url: string) => {
    return await updateUser({ avatar: url });
  };

  const updateBanner = async (url: string) => {
    return await updateUser({ banner: url });
  };

  const updateBio = async (bio: string) => {
    return await updateUser({ bio });
  };

  const updateStatus = async (status: User['status']) => {
    return await updateUser({ status });
  };

  const updateCustomStatus = async (customStatus: string) => {
    return await updateUser({ customStatus });
  };

  const clearLocalStorageData = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('infinit-current-user');
        localStorage.removeItem('infinit-profile');
        console.log('Dados do localStorage limpos com sucesso');
      } catch (error) {
        console.error('Erro ao limpar localStorage:', error);
      }
    }
  };

  const generateUniqueId = generateUniqueProfileId;

  const value: ProfileContextType = {
    profile: user,
    loading,
    error,
    updateProfile,
    updateAvatar,
    updateBanner,
    updateBio,
    updateStatus,
    updateCustomStatus,
    clearLocalStorageData,
    generateUniqueId
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
