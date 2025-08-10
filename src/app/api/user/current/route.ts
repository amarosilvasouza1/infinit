import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Caminho para o arquivo de banco de dados
const dbPath = path.join(process.cwd(), 'src', 'data', 'database.json');

// Função para ler o banco de dados
function readDatabase() {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao ler banco de dados:', error);
    return { users: [] };
  }
}

// Função para escrever no banco de dados
function writeDatabase(data: any) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Erro ao escrever banco de dados:', error);
    return false;
  }
}

// GET - Buscar usuário atual
export async function GET(request: NextRequest) {
  try {
    const db = readDatabase();
    
    // Verificar se há informações de autenticação no cabeçalho ou query
    const url = new URL(request.url);
    const authUserId = url.searchParams.get('userId');
    
    let currentUser = null;
    
    if (authUserId) {
      // Buscar pelo ID específico fornecido
      currentUser = db.users.find((user: any) => user.id === authUserId);
    } else {
      // Buscar pelo usuário padrão ou primeiro usuário founder
      currentUser = db.users.find((user: any) => user.id === 'current-user') ||
                   db.users.find((user: any) => user.id === 'amaro-founder') ||
                   db.users.find((user: any) => user.id === 'fauder-user');
    }
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }
    
    // Remover senha antes de retornar
    const { password, ...userWithoutPassword } = currentUser;
    
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Erro na API:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT - Atualizar usuário atual
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...updates } = body;
    
    // Validar tamanho dos dados (aumentado para 25MB)
    const dataSize = JSON.stringify(updates).length;
    if (dataSize > 25 * 1024 * 1024) { // 25MB
      return NextResponse.json({ 
        error: 'Dados muito grandes. Reduza o tamanho das imagens.' 
      }, { status: 413 });
    }

    const db = readDatabase();
    
    // Buscar o usuário pelo ID fornecido ou tentar IDs conhecidos
    let userIndex = -1;
    if (userId) {
      userIndex = db.users.findIndex((user: any) => user.id === userId);
    } else {
      // Tentar encontrar por IDs conhecidos se não foi fornecido
      userIndex = db.users.findIndex((user: any) => 
        user.id === 'current-user' || 
        user.id === 'amaro-founder' || 
        user.id === 'fauder-user'
      );
    }
    
    if (userIndex === -1) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }
    
    // Atualizar dados do usuário
    db.users[userIndex] = { ...db.users[userIndex], ...updates };
    
    // Salvar no banco de dados
    const success = writeDatabase(db);
    
    if (!success) {
      return NextResponse.json({ error: 'Erro ao salvar dados' }, { status: 500 });
    }
    
    return NextResponse.json(db.users[userIndex]);
  } catch (error) {
    console.error('Erro na API:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor. Verifique se o arquivo não é muito grande.' 
    }, { status: 500 });
  }
}
