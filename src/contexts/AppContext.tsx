'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Função para gerar IDs únicos
let appIdCounter = 0;
const generateUniqueAppId = () => {
  appIdCounter++;
  return `app-${Date.now()}-${appIdCounter}-${Math.random().toString(36).substr(2, 9)}`;
};

interface User {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastSeen?: string;
}

interface Party {
  id: string;
  name: string;
  description: string;
  type: string;
  creator: User;
  participants: User[];
  isLive: boolean;
  maxParticipants: number;
  createdAt: Date;
  tags: string[];
  background: string;
}

interface Status {
  id: string;
  user: User;
  content: string;
  media?: {
    type: 'image' | 'video';
    url: string;
  };
  mood?: string;
  timestamp: Date;
  likes: string[];
  comments: Comment[];
  views: number;
}

interface Comment {
  id: string;
  user: User;
  content: string;
  timestamp: Date;
  likes: string[];
}

interface AppContextType {
  // Users
  users: User[];
  currentUser: User;
  searchUsers: (query: string) => User[];
  addFriend: (userId: string) => void;
  
  // Parties
  parties: Party[];
  createParty: (party: Omit<Party, 'id' | 'creator' | 'participants' | 'createdAt'>) => void;
  joinParty: (partyId: string) => void;
  leaveParty: (partyId: string) => void;
  
  // Status
  statusPosts: Status[];
  createStatus: (status: Omit<Status, 'id' | 'user' | 'timestamp' | 'likes' | 'comments' | 'views'>) => void;
  likeStatus: (statusId: string) => void;
  commentStatus: (statusId: string, content: string) => void;
  
  // Communities
  communities: any[];
  createCommunity: (community: any) => void;
  joinCommunity: (communityId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Dados mockados
const mockUsers: User[] = [
  { id: '1', name: 'Você', avatar: '🧑‍💻', isOnline: true },
  { id: '2', name: 'Ana Silva', avatar: '👩‍🎨', isOnline: true },
  { id: '3', name: 'Pedro Santos', avatar: '👨‍🚀', isOnline: false, lastSeen: '2 min atrás' },
  { id: '4', name: 'Maria Costa', avatar: '👩‍🔬', isOnline: true },
  { id: '5', name: 'João Oliveira', avatar: '👨‍🎵', isOnline: false, lastSeen: '1h atrás' },
  { id: '6', name: 'Lara Mendes', avatar: '👩‍🏫', isOnline: true },
  { id: '7', name: 'Carlos Lima', avatar: '👨‍💼', isOnline: false, lastSeen: '3h atrás' },
  { id: '8', name: 'Sofia Rodrigues', avatar: '👩‍⚕️', isOnline: true },
];

const mockParties: Party[] = [
  {
    id: '1',
    name: '🎵 Música Eletrônica',
    description: 'DJ MixMaster ao vivo com os melhores beats!',
    type: '🎵 Música',
    creator: mockUsers[1],
    participants: [mockUsers[1], mockUsers[2], mockUsers[3], mockUsers[4]],
    isLive: true,
    maxParticipants: 50,
    createdAt: new Date(),
    tags: ['música', 'eletrônica', 'dj', 'ao vivo'],
    background: 'from-purple-800 to-pink-800'
  },
  {
    id: '2',
    name: '🎤 Karaokê Night',
    description: 'Cantando hits dos anos 2000',
    type: '🎤 Karaokê',
    creator: mockUsers[2],
    participants: [mockUsers[2], mockUsers[4], mockUsers[5]],
    isLive: true,
    maxParticipants: 20,
    createdAt: new Date(),
    tags: ['karaokê', 'música', 'anos 2000'],
    background: 'from-blue-800 to-cyan-800'
  }
];

const mockStatus: Status[] = [
  {
    id: '1',
    user: mockUsers[1],
    content: 'Que dia lindo! ☀️ Começando a semana com energia positiva!',
    mood: '😊',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    likes: ['2', '3'],
    comments: [
      {
        id: '1',
        user: mockUsers[2],
        content: 'Concordo! Dia perfeito! 💫',
        timestamp: new Date(Date.now() - 20 * 60 * 1000),
        likes: ['1']
      }
    ],
    views: 15
  },
  {
    id: '2',
    user: mockUsers[2],
    content: 'Acabei de terminar meu projeto de arte digital! 🎨',
    media: {
      type: 'image',
      url: '/api/placeholder/400/300'
    },
    mood: '🎨',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    likes: ['1', '3', '4'],
    comments: [],
    views: 32
  }
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [users] = useState<User[]>(mockUsers);
  const [parties, setParties] = useState<Party[]>(mockParties);
  const [statusPosts, setStatusPosts] = useState<Status[]>(mockStatus);
  const [communities, setCommunities] = useState<any[]>([]);
  
  const currentUser = users[0];

  const searchUsers = (query: string): User[] => {
    if (!query.trim()) return users;
    
    return users.filter(user => 
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.id.includes(query)
    );
  };

  const addFriend = (userId: string) => {
    console.log(`Adicionando amigo: ${userId}`);
    // Implementar lógica de adicionar amigo
  };

  const createParty = (partyData: Omit<Party, 'id' | 'creator' | 'participants' | 'createdAt'>) => {
    const newParty: Party = {
      ...partyData,
      id: generateUniqueAppId(),
      creator: currentUser,
      participants: [currentUser],
      createdAt: new Date()
    };
    
    setParties(prev => [newParty, ...prev]);
  };

  const joinParty = (partyId: string) => {
    setParties(prev => prev.map(party => {
      if (party.id === partyId && !party.participants.find(p => p.id === currentUser.id)) {
        return {
          ...party,
          participants: [...party.participants, currentUser]
        };
      }
      return party;
    }));
  };

  const leaveParty = (partyId: string) => {
    setParties(prev => prev.map(party => {
      if (party.id === partyId) {
        return {
          ...party,
          participants: party.participants.filter(p => p.id !== currentUser.id)
        };
      }
      return party;
    }));
  };

  const createStatus = (statusData: Omit<Status, 'id' | 'user' | 'timestamp' | 'likes' | 'comments' | 'views'>) => {
    const newStatus: Status = {
      ...statusData,
      id: generateUniqueAppId(),
      user: currentUser,
      timestamp: new Date(),
      likes: [],
      comments: [],
      views: 0
    };
    
    setStatusPosts(prev => [newStatus, ...prev]);
  };

  const likeStatus = (statusId: string) => {
    setStatusPosts(prev => prev.map(status => {
      if (status.id === statusId) {
        const isLiked = status.likes.includes(currentUser.id);
        return {
          ...status,
          likes: isLiked 
            ? status.likes.filter(id => id !== currentUser.id)
            : [...status.likes, currentUser.id]
        };
      }
      return status;
    }));
  };

  const commentStatus = (statusId: string, content: string) => {
    const newComment: Comment = {
      id: generateUniqueAppId(),
      user: currentUser,
      content,
      timestamp: new Date(),
      likes: []
    };

    setStatusPosts(prev => prev.map(status => {
      if (status.id === statusId) {
        return {
          ...status,
          comments: [...status.comments, newComment]
        };
      }
      return status;
    }));
  };

  const createCommunity = (community: any) => {
    setCommunities(prev => [...prev, { ...community, id: generateUniqueAppId() }]);
  };

  const joinCommunity = (communityId: string) => {
    console.log(`Entrando na comunidade: ${communityId}`);
  };

  return (
    <AppContext.Provider value={{
      users,
      currentUser,
      searchUsers,
      addFriend,
      parties,
      createParty,
      joinParty,
      leaveParty,
      statusPosts,
      createStatus,
      likeStatus,
      commentStatus,
      communities,
      createCommunity,
      joinCommunity
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
