'use client';

import { getCurrentUser, getUserById, usersDatabase } from '@/data/userDatabase';

// Hook personalizado para acessar dados do usuário atual em qualquer componente
export const useCurrentUser = () => {
  return getCurrentUser();
};

// Hook para acessar dados de qualquer usuário por ID
export const useUserById = (id: string) => {
  return getUserById(id);
};

// Hook para listar todos os usuários
export const useAllUsers = () => {
  return Object.values(usersDatabase);
};

// Hook para verificar se o usuário atual é premium
export const useIsPremium = () => {
  const user = getCurrentUser();
  return user.isPremium;
};

// Hook para verificar se o usuário atual é desenvolvedor
export const useIsDeveloper = () => {
  const user = getCurrentUser();
  return user.isDeveloper;
};

// Hook para obter avatar do usuário (com fallback)
export const useUserAvatar = (userId?: string) => {
  const user = userId ? getUserById(userId) : getCurrentUser();
  
  if (!user) return null;
  
  // Se o avatar é uma URL de imagem, retorna ela
  if (user.avatar && user.avatar.startsWith('http')) {
    return user.avatar;
  }
  
  // Caso contrário, retorna null para usar inicial/emoji
  return null;
};

// Hook para obter inicial do nome do usuário
export const useUserInitial = (userId?: string) => {
  const user = userId ? getUserById(userId) : getCurrentUser();
  
  if (!user) return 'U';
  
  return user.name.charAt(0).toUpperCase();
};

export default {
  useCurrentUser,
  useUserById,
  useAllUsers,
  useIsPremium,
  useIsDeveloper,
  useUserAvatar,
  useUserInitial
};
