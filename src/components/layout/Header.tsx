'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const Header = () => {
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(false);
    
    const getPageTitle = () => {
        switch (pathname) {
            case '/conversas':
                return 'Conversas';
            case '/comunidade':
                return 'Comunidade';
            case '/festa':
                return 'Festa';
            case '/status':
                return 'Status';
            case '/reals':
                return 'Reals';
            case '/configuracoes':
                return 'Configurações';
            case '/perfil':
                return 'Perfil';
            default:
                return 'Infinit';
        }
    };

    const getPageIcon = () => {
        switch (pathname) {
            case '/conversas':
                return '💬';
            case '/comunidade':
                return '👥';
            case '/festa':
                return '🎉';
            case '/status':
                return '📋';
            case '/reals':
                return '📺';
            case '/configuracoes':
                return '⚙️';
            case '/perfil':
                return '👤';
            default:
                return '✨';
        }
    };

    useEffect(() => {
        setIsVisible(false);
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 100);
        
        return () => clearTimeout(timer);
    }, [pathname]);
    
    return (
        <header className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-800 via-gray-800 to-gray-900 text-white border-b border-gray-700 shadow-lg">
            <div className={`flex items-center space-x-3 transition-all duration-500 ease-out ${
                isVisible 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-0 -translate-x-4'
            }`}>
                <span className="text-2xl transition-transform duration-300 hover:scale-110">
                    {getPageIcon()}
                </span>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {getPageTitle()}
                </h1>
            </div>
            
            {/* Linha decorativa animada */}
            <div className={`h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full transition-all duration-700 ${
                isVisible ? 'w-20 opacity-100' : 'w-0 opacity-0'
            }`} />
        </header>
    );
};

export default Header;
