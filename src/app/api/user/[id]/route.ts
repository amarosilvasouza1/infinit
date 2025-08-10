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

// GET - Buscar usuário por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = readDatabase();
    const user = db.users.find((user: any) => user.id === id);
    
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }
    
    // Remover senha antes de retornar
    const { password, ...userWithoutPassword } = user;
    
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Erro na API:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// GET todos os usuários (quando ID = 'all')
export async function POST() {
  try {
    const db = readDatabase();
    return NextResponse.json(db.users);
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
