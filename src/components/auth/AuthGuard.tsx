'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Rotas públicas que não precisam de autenticação
  const publicPaths = ['/auth'];

  useEffect(() => {
    // Se é uma rota pública, permitir acesso
    if (publicPaths.includes(pathname)) {
      setIsAuthenticated(true);
      return;
    }

    // Verificar se o usuário está autenticado
    const authenticated = localStorage.getItem('infinit-authenticated');
    const currentUser = localStorage.getItem('infinit-current-user');

    if (authenticated === 'true' && currentUser) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      router.push('/auth');
    }
  }, [pathname, router]);

  // Mostrar loading enquanto verifica autenticação
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não está autenticado e não é uma rota pública, não renderizar nada
  // (o redirect já foi feito)
  if (!isAuthenticated && !publicPaths.includes(pathname)) {
    return null;
  }

  return <>{children}</>;
}
