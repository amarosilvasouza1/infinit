'use client';

import { createContext, useContext, useReducer, ReactNode } from 'react';

// Types
interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'video' | 'audio';
}

interface Chat {
  id: string;
  name: string;
  type: 'direct' | 'group';
  participants: string[];
  lastMessage?: Message;
  avatar: string;
  isOnline?: boolean;
}

interface ChatState {
  currentChatId: string | null;
  chats: Chat[];
  messages: { [chatId: string]: Message[] };
  user: {
    id: string;
    name: string;
    avatar: string;
  };
}

// Actions
type ChatAction =
  | { type: 'SET_CURRENT_CHAT'; payload: string }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_CHATS'; payload: Chat[] }
  | { type: 'SET_MESSAGES'; payload: { chatId: string; messages: Message[] } };

// Initial state
const initialState: ChatState = {
  currentChatId: null,
  chats: [
    {
      id: '1',
      name: 'João Silva',
      type: 'direct',
      participants: ['user', '1'],
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
      isOnline: true
    },
    {
      id: '2',
      name: 'Grupo da Galera',
      type: 'group',
      participants: ['user', '2', '3', '4'],
      avatar: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=32&h=32&fit=crop',
      isOnline: false
    },
    {
      id: '3',
      name: 'Maria Santos',
      type: 'direct',
      participants: ['user', '3'],
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b4ab?w=32&h=32&fit=crop&crop=face',
      isOnline: true
    },
    {
      id: '4',
      name: 'Projeto Infinit',
      type: 'group',
      participants: ['user', '4', '5'],
      avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=32&h=32&fit=crop',
      isOnline: true
    },
    {
      id: '5',
      name: 'Julia Costa',
      type: 'direct',
      participants: ['user', '5'],
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=32&h=32&fit=crop&crop=face',
      isOnline: false
    }
  ],
  messages: {
    '1': [
      {
        id: '1',
        chatId: '1',
        senderId: '1',
        senderName: 'João Silva',
        content: 'E aí, tudo certo?',
        timestamp: new Date(Date.now() - 3600000),
        type: 'text'
      },
      {
        id: '2',
        chatId: '1',
        senderId: 'user',
        senderName: 'Você',
        content: 'Tudo ótimo, e por aí?',
        timestamp: new Date(Date.now() - 3500000),
        type: 'text'
      },
      {
        id: '3',
        chatId: '1',
        senderId: '1',
        senderName: 'João Silva',
        content: 'Tranquilo também. Viu o novo trailer que saiu?',
        timestamp: new Date(Date.now() - 3000000),
        type: 'text'
      },
      {
        id: '4',
        chatId: '1',
        senderId: 'user',
        senderName: 'Você',
        content: 'Ainda não, qual deles?',
        timestamp: new Date(Date.now() - 2500000),
        type: 'text'
      },
      {
        id: '5',
        chatId: '1',
        senderId: '1',
        senderName: 'João Silva',
        content: 'Aquele do filme de ficção científica que a gente tava esperando!',
        timestamp: new Date(Date.now() - 2000000),
        type: 'text'
      }
    ]
  },
  user: {
    id: 'user',
    name: 'Você',
    avatar: 'https://github.com/shadcn.png'
  }
};

// Reducer
function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_CURRENT_CHAT':
      return { ...state, currentChatId: action.payload };
    case 'ADD_MESSAGE':
      const message = action.payload;
      return {
        ...state,
        messages: {
          ...state.messages,
          [message.chatId]: [...(state.messages[message.chatId] || []), message]
        }
      };
    case 'SET_CHATS':
      return { ...state, chats: action.payload };
    case 'SET_MESSAGES':
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.chatId]: action.payload.messages
        }
      };
    default:
      return state;
  }
}

// Context
const ChatContext = createContext<{
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
  sendMessage: (content: string, type?: 'text' | 'image' | 'video' | 'audio') => void;
  selectChat: (chatId: string) => void;
} | null>(null);

// Provider
export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const sendMessage = (content: string, type: 'text' | 'image' | 'video' | 'audio' = 'text') => {
    if (!state.currentChatId || !content.trim()) return;

    const message: Message = {
      id: Math.random().toString(36).substr(2, 9),
      chatId: state.currentChatId,
      senderId: state.user.id,
      senderName: state.user.name,
      content: content.trim(),
      timestamp: new Date(),
      type
    };

    dispatch({ type: 'ADD_MESSAGE', payload: message });
  };

  const selectChat = (chatId: string) => {
    dispatch({ type: 'SET_CURRENT_CHAT', payload: chatId });
  };

  return (
    <ChatContext.Provider value={{ state, dispatch, sendMessage, selectChat }}>
      {children}
    </ChatContext.Provider>
  );
}

// Hook
export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
