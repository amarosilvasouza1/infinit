'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [currentPath, setCurrentPath] = useState(pathname);

  useEffect(() => {
    // Quando a rota muda, iniciar a transição
    if (pathname !== currentPath) {
      setIsVisible(false);
      
      const timer = setTimeout(() => {
        setCurrentPath(pathname);
        setIsVisible(true);
      }, 150); // Pequeno delay para a transição de saída
      
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [pathname, currentPath]);

  return (
    <div 
      className={`w-full h-full transition-all duration-300 ease-out ${
        isVisible 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-2 scale-98'
      }`}
      style={{
        transitionProperty: 'opacity, transform',
        transitionTimingFunction: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      }}
    >
      {isVisible && children}
    </div>
  );
}
