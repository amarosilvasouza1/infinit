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

// GET - Buscar conversa específica com mensagens
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: chatId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json({ error: 'UserId é obrigatório' }, { status: 400 });
    }

    const database = readChatsDatabase();
    const chat = database.chats.find(c => c.id === chatId);

    if (!chat) {
      return NextResponse.json({ error: 'Conversa não encontrada' }, { status: 404 });
    }

    // Verificar se o usuário é participante
    if (!chat.participants.includes(userId)) {
      return NextResponse.json({ 
        error: 'Usuário não autorizado' 
      }, { status: 403 });
    }

    // Paginar mensagens (mais recentes primeiro)
    const sortedMessages = [...chat.messages].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const paginatedMessages = sortedMessages.slice(offset, offset + limit);

    return NextResponse.json({
      chat: {
        ...chat,
        messages: paginatedMessages.reverse() // Reverter para ordem cronológica
      },
      hasMore: offset + limit < chat.messages.length,
      total: chat.messages.length
    });
  } catch (error) {
    console.error('Erro ao buscar chat:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Enviar nova mensagem
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: chatId } = await params;
    const body = await request.json();
    const { senderId, senderName, content, type = 'text', mediaUrl, duration } = body;

    if (!senderId || !senderName || !content) {
      return NextResponse.json({ 
        error: 'Dados obrigatórios: senderId, senderName, content' 
      }, { status: 400 });
    }

    const database = readChatsDatabase();
    const chatIndex = database.chats.findIndex(c => c.id === chatId);

    if (chatIndex === -1) {
      return NextResponse.json({ error: 'Conversa não encontrada' }, { status: 404 });
    }

    // Verificar se o usuário é participante
    if (!database.chats[chatIndex].participants.includes(senderId)) {
      return NextResponse.json({ 
        error: 'Usuário não autorizado' 
      }, { status: 403 });
    }

    // Criar nova mensagem
    const newMessage: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      senderId,
      senderName,
      content,
      type,
      timestamp: new Date().toISOString(),
      mediaUrl,
      duration
    };

    // Adicionar mensagem ao chat
    database.chats[chatIndex].messages.push(newMessage);
    database.chats[chatIndex].lastMessage = newMessage;
    database.chats[chatIndex].lastActivity = new Date().toISOString();
    database.chats[chatIndex].updatedAt = new Date().toISOString();

    // Incrementar contador de não lidas para outros participantes
    // (isso seria melhor implementado com um sistema de usuários online/offline)

    if (writeChatsDatabase(database)) {
      return NextResponse.json({ 
        message: newMessage,
        chat: database.chats[chatIndex]
      }, { status: 201 });
    } else {
      return NextResponse.json({ error: 'Erro ao salvar mensagem' }, { status: 500 });
    }
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT - Editar mensagem
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: chatId } = await params;
    const body = await request.json();
    const { messageId, content, userId } = body;

    if (!messageId || !content || !userId) {
      return NextResponse.json({ 
        error: 'MessageId, content e userId são obrigatórios' 
      }, { status: 400 });
    }

    const database = readChatsDatabase();
    const chatIndex = database.chats.findIndex(c => c.id === chatId);

    if (chatIndex === -1) {
      return NextResponse.json({ error: 'Conversa não encontrada' }, { status: 404 });
    }

    const messageIndex = database.chats[chatIndex].messages.findIndex(m => m.id === messageId);

    if (messageIndex === -1) {
      return NextResponse.json({ error: 'Mensagem não encontrada' }, { status: 404 });
    }

    // Verificar se o usuário é o autor da mensagem
    if (database.chats[chatIndex].messages[messageIndex].senderId !== userId) {
      return NextResponse.json({ 
        error: 'Usuário não autorizado a editar esta mensagem' 
      }, { status: 403 });
    }

    // Editar mensagem
    database.chats[chatIndex].messages[messageIndex].content = content;
    database.chats[chatIndex].messages[messageIndex].edited = true;
    database.chats[chatIndex].messages[messageIndex].editedAt = new Date().toISOString();
    database.chats[chatIndex].updatedAt = new Date().toISOString();

    if (writeChatsDatabase(database)) {
      return NextResponse.json({ 
        message: database.chats[chatIndex].messages[messageIndex]
      });
    } else {
      return NextResponse.json({ error: 'Erro ao editar mensagem' }, { status: 500 });
    }
  } catch (error) {
    console.error('Erro ao editar mensagem:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE - Deletar mensagem
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: chatId } = await params;
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');
    const userId = searchParams.get('userId');

    if (!messageId || !userId) {
      return NextResponse.json({ 
        error: 'MessageId e userId são obrigatórios' 
      }, { status: 400 });
    }

    const database = readChatsDatabase();
    const chatIndex = database.chats.findIndex(c => c.id === chatId);

    if (chatIndex === -1) {
      return NextResponse.json({ error: 'Conversa não encontrada' }, { status: 404 });
    }

    const messageIndex = database.chats[chatIndex].messages.findIndex(m => m.id === messageId);

    if (messageIndex === -1) {
      return NextResponse.json({ error: 'Mensagem não encontrada' }, { status: 404 });
    }

    // Verificar se o usuário é o autor da mensagem
    if (database.chats[chatIndex].messages[messageIndex].senderId !== userId) {
      return NextResponse.json({ 
        error: 'Usuário não autorizado a deletar esta mensagem' 
      }, { status: 403 });
    }

    // Remover mensagem
    database.chats[chatIndex].messages.splice(messageIndex, 1);
    database.chats[chatIndex].updatedAt = new Date().toISOString();

    // Atualizar última mensagem se necessário
    if (database.chats[chatIndex].messages.length > 0) {
      const lastMessage = database.chats[chatIndex].messages[database.chats[chatIndex].messages.length - 1];
      database.chats[chatIndex].lastMessage = lastMessage;
    } else {
      delete database.chats[chatIndex].lastMessage;
    }

    if (writeChatsDatabase(database)) {
      return NextResponse.json({ 
        message: 'Mensagem deletada com sucesso'
      });
    } else {
      return NextResponse.json({ error: 'Erro ao deletar mensagem' }, { status: 500 });
    }
  } catch (error) {
    console.error('Erro ao deletar mensagem:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
