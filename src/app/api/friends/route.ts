import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface Friendship {
  id: string;
  user1: string;
  user2: string;
  status: 'pending' | 'accepted' | 'blocked';
  requestedBy?: string;
  createdAt: string;
  acceptedAt?: string;
}

interface FriendRequest {
  id: string;
  from: string;
  to: string;
  message: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'declined';
}

interface FriendsDatabase {
  friendships: Friendship[];
  friend_requests: FriendRequest[];
  blocked_users: any[];
  lastUpdated: string;
}

function getFriendsData(): FriendsDatabase {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'friends.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Erro ao ler dados dos amigos:', error);
    return {
      friendships: [],
      friend_requests: [],
      blocked_users: [],
      lastUpdated: new Date().toISOString()
    };
  }
}

function saveFriendsData(data: FriendsDatabase) {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'friends.json');
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Erro ao salvar dados dos amigos:', error);
  }
}

// GET - Buscar amigos de um usuário
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type') || 'friends'; // 'friends', 'requests', 'sent_requests'

    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 });
    }

    const data = getFriendsData();

    switch (type) {
      case 'friends':
        // Retornar amigos aceitos
        const friends = data.friendships
          .filter(f => f.status === 'accepted' && (f.user1 === userId || f.user2 === userId))
          .map(f => ({
            id: f.id,
            friendId: f.user1 === userId ? f.user2 : f.user1,
            acceptedAt: f.acceptedAt,
            createdAt: f.createdAt
          }));
        
        return NextResponse.json({ friends });

      case 'requests':
        // Retornar solicitações recebidas
        const receivedRequests = data.friend_requests
          .filter(r => r.to === userId && r.status === 'pending');
        
        return NextResponse.json({ requests: receivedRequests });

      case 'sent_requests':
        // Retornar solicitações enviadas
        const sentRequests = data.friend_requests
          .filter(r => r.from === userId && r.status === 'pending');
        
        return NextResponse.json({ requests: sentRequests });

      default:
        return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 });
    }

  } catch (error) {
    console.error('Erro ao buscar amigos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Enviar solicitação de amizade
export async function POST(request: NextRequest) {
  try {
    const { from, to, message } = await request.json();

    if (!from || !to) {
      return NextResponse.json({ error: 'from e to são obrigatórios' }, { status: 400 });
    }

    if (from === to) {
      return NextResponse.json({ error: 'Não é possível adicionar a si mesmo' }, { status: 400 });
    }

    const data = getFriendsData();

    // Verificar se já existe amizade
    const existingFriendship = data.friendships.find(f => 
      (f.user1 === from && f.user2 === to) || (f.user1 === to && f.user2 === from)
    );

    if (existingFriendship) {
      return NextResponse.json({ error: 'Amizade já existe' }, { status: 400 });
    }

    // Verificar se já existe solicitação
    const existingRequest = data.friend_requests.find(r => 
      (r.from === from && r.to === to) || (r.from === to && r.to === from)
    );

    if (existingRequest) {
      return NextResponse.json({ error: 'Solicitação já existe' }, { status: 400 });
    }

    // Criar nova solicitação
    const newRequest: FriendRequest = {
      id: `request-${Date.now()}`,
      from,
      to,
      message: message || '',
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    data.friend_requests.push(newRequest);
    saveFriendsData(data);

    return NextResponse.json({ request: newRequest });

  } catch (error) {
    console.error('Erro ao enviar solicitação:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT - Aceitar/Recusar solicitação de amizade
export async function PUT(request: NextRequest) {
  try {
    const { requestId, action } = await request.json(); // action: 'accept' | 'decline'

    if (!requestId || !action) {
      return NextResponse.json({ error: 'requestId e action são obrigatórios' }, { status: 400 });
    }

    const data = getFriendsData();

    const requestIndex = data.friend_requests.findIndex(r => r.id === requestId);
    
    if (requestIndex === -1) {
      return NextResponse.json({ error: 'Solicitação não encontrada' }, { status: 404 });
    }

    const friendRequest = data.friend_requests[requestIndex];

    if (action === 'accept') {
      // Criar amizade
      const newFriendship: Friendship = {
        id: `friendship-${Date.now()}`,
        user1: friendRequest.from,
        user2: friendRequest.to,
        status: 'accepted',
        requestedBy: friendRequest.from,
        createdAt: friendRequest.createdAt,
        acceptedAt: new Date().toISOString()
      };

      data.friendships.push(newFriendship);
      friendRequest.status = 'accepted';
    } else if (action === 'decline') {
      friendRequest.status = 'declined';
    }

    // Remover da lista de pendentes
    data.friend_requests.splice(requestIndex, 1);
    
    saveFriendsData(data);

    return NextResponse.json({ success: true, action });

  } catch (error) {
    console.error('Erro ao processar solicitação:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE - Remover amigo
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId1 = searchParams.get('user1');
    const userId2 = searchParams.get('user2');

    if (!userId1 || !userId2) {
      return NextResponse.json({ error: 'user1 e user2 são obrigatórios' }, { status: 400 });
    }

    const data = getFriendsData();

    const friendshipIndex = data.friendships.findIndex(f => 
      (f.user1 === userId1 && f.user2 === userId2) || 
      (f.user1 === userId2 && f.user2 === userId1)
    );

    if (friendshipIndex === -1) {
      return NextResponse.json({ error: 'Amizade não encontrada' }, { status: 404 });
    }

    data.friendships.splice(friendshipIndex, 1);
    saveFriendsData(data);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erro ao remover amigo:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
