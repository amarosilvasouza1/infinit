import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface Message {
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

interface Chat {
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

interface ChatsDatabase {
  chats: Chat[];
  lastUpdated: string;
}

const DATABASE_PATH = path.join(process.cwd(), 'src/data/chats.json');

// Função para ler o banco de dados
const readChatsDatabase = (): ChatsDatabase => {
  try {
    if (!fs.existsSync(DATABASE_PATH)) {
      // Criar arquivo inicial se não existir
      const initialData: ChatsDatabase = {
        chats: [],
        lastUpdated: new Date().toISOString()
      };
      fs.writeFileSync(DATABASE_PATH, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    
    const data = fs.readFileSync(DATABASE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao ler banco de chats:', error);
    return { chats: [], lastUpdated: new Date().toISOString() };
  }
};

// Função para escrever no banco de dados
const writeChatsDatabase = (data: ChatsDatabase) => {
  try {
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DATABASE_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Erro ao escrever banco de chats:', error);
    return false;
  }
};

// GET - Listar todas as conversas do usuário
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'UserId é obrigatório' }, { status: 400 });
    }

    const database = readChatsDatabase();
    
    // Filtrar chats do usuário
    const userChats = database.chats.filter(chat => 
      chat.participants.includes(userId)
    );

    // Ordenar por última atividade
    userChats.sort((a, b) => 
      new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    );

    return NextResponse.json({ 
      chats: userChats,
      total: userChats.length 
    });
  } catch (error) {
    console.error('Erro ao buscar chats:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Criar nova conversa
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { participants, type = 'direct', name, avatar, createdBy } = body;

    if (!participants || !Array.isArray(participants) || participants.length < 2) {
      return NextResponse.json({ 
        error: 'Pelo menos 2 participantes são necessários' 
      }, { status: 400 });
    }

    const database = readChatsDatabase();

    // Verificar se já existe uma conversa direta entre os mesmos usuários
    if (type === 'direct' && participants.length === 2) {
      const existingChat = database.chats.find(chat => 
        chat.type === 'direct' &&
        chat.participants.length === 2 &&
        chat.participants.every(p => participants.includes(p))
      );

      if (existingChat) {
        return NextResponse.json({ 
          chat: existingChat,
          message: 'Conversa já existe'
        });
      }
    }

    // Criar nova conversa
    const newChat: Chat = {
      id: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      participants: [...new Set(participants)], // Remover duplicatas
      type,
      name: type === 'group' ? name : undefined,
      avatar: avatar || undefined,
      lastActivity: new Date().toISOString(),
      unreadCount: 0,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    database.chats.push(newChat);
    
    if (writeChatsDatabase(database)) {
      return NextResponse.json({ 
        chat: newChat,
        message: 'Conversa criada com sucesso'
      }, { status: 201 });
    } else {
      return NextResponse.json({ error: 'Erro ao salvar conversa' }, { status: 500 });
    }
  } catch (error) {
    console.error('Erro ao criar chat:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT - Atualizar conversa
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { chatId, name, avatar, participants } = body;

    if (!chatId) {
      return NextResponse.json({ error: 'ChatId é obrigatório' }, { status: 400 });
    }

    const database = readChatsDatabase();
    const chatIndex = database.chats.findIndex(chat => chat.id === chatId);

    if (chatIndex === -1) {
      return NextResponse.json({ error: 'Conversa não encontrada' }, { status: 404 });
    }

    // Atualizar dados da conversa
    if (name !== undefined) database.chats[chatIndex].name = name;
    if (avatar !== undefined) database.chats[chatIndex].avatar = avatar;
    if (participants !== undefined) database.chats[chatIndex].participants = participants;
    
    database.chats[chatIndex].updatedAt = new Date().toISOString();

    if (writeChatsDatabase(database)) {
      return NextResponse.json({ 
        chat: database.chats[chatIndex],
        message: 'Conversa atualizada com sucesso'
      });
    } else {
      return NextResponse.json({ error: 'Erro ao atualizar conversa' }, { status: 500 });
    }
  } catch (error) {
    console.error('Erro ao atualizar chat:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE - Deletar conversa
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');
    const userId = searchParams.get('userId');

    if (!chatId || !userId) {
      return NextResponse.json({ 
        error: 'ChatId e UserId são obrigatórios' 
      }, { status: 400 });
    }

    const database = readChatsDatabase();
    const chatIndex = database.chats.findIndex(chat => chat.id === chatId);

    if (chatIndex === -1) {
      return NextResponse.json({ error: 'Conversa não encontrada' }, { status: 404 });
    }

    // Verificar se o usuário é participante da conversa
    if (!database.chats[chatIndex].participants.includes(userId)) {
      return NextResponse.json({ 
        error: 'Usuário não autorizado a deletar esta conversa' 
      }, { status: 403 });
    }

    // Remover conversa
    database.chats.splice(chatIndex, 1);

    if (writeChatsDatabase(database)) {
      return NextResponse.json({ 
        message: 'Conversa deletada com sucesso'
      });
    } else {
      return NextResponse.json({ error: 'Erro ao deletar conversa' }, { status: 500 });
    }
  } catch (error) {
    console.error('Erro ao deletar chat:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
