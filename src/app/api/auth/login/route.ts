import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface LoginRequest {
  email: string;
  password: string;
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

export async function POST(request: NextRequest) {
  try {
    const { email, password }: LoginRequest = await request.json();

    // Validar campos obrigatórios
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Ler dados do banco de dados
    const dbPath = path.join(process.cwd(), 'src', 'data', 'database.json');
    const fileContents = fs.readFileSync(dbPath, 'utf8');
    const data = JSON.parse(fileContents);

    // Procurar usuário
    const user = data.users.find((u: User) => 
      u.email === email && u.password === password
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }

    // Remover senha da resposta
    const { password: _, ...userWithoutPassword } = user;

    // Atualizar status para online
    user.isOnline = true;
    user.status = 'online';

    // Salvar alterações
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

    return NextResponse.json({
      message: 'Login realizado com sucesso',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
