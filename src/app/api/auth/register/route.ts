import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface RegisterRequest {
  name: string;
  username: string;
  email: string;
  password: string;
  bio?: string;
  location?: string;
  website?: string;
  birthDate?: string;
}

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  password?: string;
  avatar: string;
  banner: string;
  bio: string;
  location: string;
  website: string;
  joinDate: string;
  birthDate: string;
  isOnline: boolean;
  status: string;
  customStatus: string;
  theme: string;
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

// Função para gerar ID único
function generateUserId(): string {
  return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Função para gerar avatar aleatório
function generateRandomAvatar(): string {
  const avatars = [
    'https://images.unsplash.com/photo-1494790108755-2616b612b5bb?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=150&h=150&fit=crop&crop=face'
  ];
  return avatars[Math.floor(Math.random() * avatars.length)];
}

// Função para gerar banner aleatório
function generateRandomBanner(): string {
  const banners = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
    'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  ];
  return banners[Math.floor(Math.random() * banners.length)];
}

export async function POST(request: NextRequest) {
  try {
    const {
      name,
      username,
      email,
      password,
      bio = '',
      location = '',
      website = '',
      birthDate = ''
    }: RegisterRequest = await request.json();

    // Validar campos obrigatórios
    if (!name || !username || !email || !password) {
      return NextResponse.json(
        { error: 'Nome, username, email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar formato do username
    if (!username.startsWith('@')) {
      return NextResponse.json(
        { error: 'Username deve começar com @' },
        { status: 400 }
      );
    }

    // Validar senha
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Ler dados do banco de dados
    const dbPath = path.join(process.cwd(), 'src', 'data', 'database.json');
    const fileContents = fs.readFileSync(dbPath, 'utf8');
    const data = JSON.parse(fileContents);

    // Verificar se email já existe
    const existingEmail = data.users.find((u: User) => u.email === email);
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Este email já está cadastrado' },
        { status: 409 }
      );
    }

    // Verificar se username já existe
    const existingUsername = data.users.find((u: User) => u.username === username);
    if (existingUsername) {
      return NextResponse.json(
        { error: 'Este username já está em uso' },
        { status: 409 }
      );
    }

    // Criar novo usuário
    const userId = generateUserId();
    const newUser: User = {
      id: userId,
      name,
      username,
      email,
      password,
      avatar: generateRandomAvatar(),
      banner: generateRandomBanner(),
      bio,
      location,
      website,
      joinDate: new Date().toISOString(),
      birthDate: birthDate || '',
      isOnline: true,
      status: 'online',
      customStatus: '',
      theme: 'dark',
      language: 'pt-BR',
      timezone: 'America/Sao_Paulo',
      isPremium: false,
      isDeveloper: false,
      badges: [],
      stats: {
        messagesCount: 0,
        friendsCount: 0,
        groupsCount: 0,
        callTimeHours: 0,
        postsCount: 0
      }
    };

    // Adicionar usuário ao banco
    data.users.push(newUser);

    // Salvar alterações
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

    // Remover senha da resposta
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      message: 'Usuário registrado com sucesso',
      user: userWithoutPassword
    }, { status: 201 });

  } catch (error) {
    console.error('Erro no registro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
