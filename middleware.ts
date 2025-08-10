import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Rotas públicas que não precisam de autenticação
  const publicPaths = ['/auth', '/api/auth/login', '/api/auth/register'];
  
  // Se a rota é pública, permitir acesso
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Se é uma rota de API (exceto auth), permitir acesso
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // Para rotas protegidas, verificar autenticação no lado do cliente
  // O middleware do Next.js não tem acesso ao localStorage, então vamos 
  // fazer a verificação no lado do cliente usando um componente
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
