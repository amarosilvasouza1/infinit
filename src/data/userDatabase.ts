'use client';

// Banco de dados temporário do usuário em memória
export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  banner: string;
  bio: string;
  location: string;
  website: string;
  joinDate: Date;
  birthDate: Date;
  isOnline: boolean;
  status: 'online' | 'away' | 'busy' | 'offline';
  customStatus: string;
  theme: 'dark' | 'light';
  language: string;
  timezone: string;
  isPremium: boolean;
  isDeveloper: boolean;
  badges: string[];
  stats: {
    messagesCount: number;
    friendsCount: number;
    groupsCount: number;
    callTimeHours: number;
    postsCount: number;
  };
}

// Base do usuário atual (seus dados)
const currentUserData: UserProfile = {
  id: 'current-user',
  name: 'Amaro',
  username: '@amaro_dev',
  email: 'amaro@infinit.dev',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  banner: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=300&fit=crop',
  bio: 'Desenvolvedor principal do Infinit Chat. Premium member com acesso a recursos exclusivos! 🚀✨',
  location: 'São Paulo, Brasil',
  website: 'https://infinit.dev',
  joinDate: new Date('2025-01-01'),
  birthDate: new Date('1999-01-01'),
  isOnline: true,
  status: 'online',
  customStatus: 'Desenvolvendo o futuro do chat ⚡',
  theme: 'dark',
  language: 'pt-BR',
  timezone: 'America/Sao_Paulo',
  isPremium: true,
  isDeveloper: true,
  badges: ['DEV', 'PREMIUM', 'FOUNDER'],
  stats: {
    messagesCount: 1234,
    friendsCount: 42,
    groupsCount: 18,
    callTimeHours: 156,
    postsCount: 89
  }
};

// Outros usuários da plataforma
export const usersDatabase: { [key: string]: UserProfile } = {
  'current-user': currentUserData,
  '1': {
    id: '1',
    name: 'Ana Silva',
    username: '@ana_silva',
    email: 'ana@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bb?w=150&h=150&fit=crop&crop=face',
    banner: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    bio: 'Designer UX/UI apaixonada por criar experiências incríveis',
    location: 'Rio de Janeiro, RJ',
    website: 'https://anasilva.design',
    joinDate: new Date('2024-03-15'),
    birthDate: new Date('1995-05-20'),
    isOnline: true,
    status: 'online',
    customStatus: 'Trabalhando em novos designs',
    theme: 'light',
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    isPremium: true,
    isDeveloper: false,
    badges: ['PREMIUM', 'DESIGNER'],
    stats: {
      messagesCount: 892,
      friendsCount: 38,
      groupsCount: 12,
      callTimeHours: 67,
      postsCount: 45
    }
  },
  '2': {
    id: '2',
    name: 'Pedro Santos',
    username: '@pedro_dev',
    email: 'pedro@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    banner: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    bio: 'Full Stack Developer | React & Node.js Enthusiast',
    location: 'Belo Horizonte, MG',
    website: 'https://pedrosantos.dev',
    joinDate: new Date('2024-02-10'),
    birthDate: new Date('1992-08-14'),
    isOnline: false,
    status: 'offline',
    customStatus: '',
    theme: 'dark',
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    isPremium: false,
    isDeveloper: true,
    badges: ['DEV'],
    stats: {
      messagesCount: 567,
      friendsCount: 29,
      groupsCount: 8,
      callTimeHours: 34,
      postsCount: 23
    }
  }
};

// Funções para gerenciar dados do usuário
export const getCurrentUser = (): UserProfile => {
  return currentUserData;
};

export const getUserById = (id: string): UserProfile | null => {
  return usersDatabase[id] || null;
};

export const updateCurrentUser = (updates: Partial<UserProfile>): void => {
  Object.assign(currentUserData, updates);
  // Também atualizar no banco de dados
  usersDatabase['current-user'] = { ...currentUserData };
  
  // Salvar no localStorage para persistência
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('infinit-current-user', JSON.stringify(currentUserData));
    } catch (error) {
      console.warn('Não foi possível salvar dados do usuário:', error);
    }
  }
};

// Carregar dados do usuário do localStorage se disponível
export const loadUserFromStorage = (): void => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('infinit-current-user');
      if (saved) {
        const userData = JSON.parse(saved);
        // Converter datas de string para Date
        userData.joinDate = new Date(userData.joinDate);
        userData.birthDate = new Date(userData.birthDate);
        
        Object.assign(currentUserData, userData);
        usersDatabase['current-user'] = { ...currentUserData };
      }
    } catch (error) {
      console.warn('Erro ao carregar dados do usuário:', error);
    }
  }
};

// Inicializar dados ao carregar
if (typeof window !== 'undefined') {
  loadUserFromStorage();
}

export default currentUserData;
