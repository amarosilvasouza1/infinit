'use client';

import { MessageSquare, Users, Rss, Tv, Calendar, Settings, User, Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import ProfileIndicator from '@/components/profile/ProfileIndicator';

const Sidebar = () => {
  const pathname = usePathname();

  const navigationItems = [
    { href: '/conversas', icon: MessageSquare, label: 'Conversas' },
    { href: '/comunidade', icon: Users, label: 'Comunidade' },
    { href: '/festa', icon: Calendar, label: 'Festa' },
    { href: '/status', icon: Rss, label: 'Status' },
    { href: '/reals', icon: Tv, label: 'Reals' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white w-64 p-4 space-y-6 fixed left-0 top-0">
      <div className="text-2xl font-bold text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        infinit
      </div>
      
      <nav className="flex-grow space-y-2">
        {navigationItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center p-3 space-x-3 rounded-xl transition-all duration-300 ease-out group relative ${
              isActive(href)
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                : 'hover:bg-gray-800 hover:scale-102 hover:translate-x-1'
            }`}
          >
            {/* Indicador de página ativa */}
            {isActive(href) && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 to-pink-400 rounded-r-full" />
            )}
            
            <Icon 
              className={`transition-all duration-300 ${
                isActive(href) 
                  ? 'text-white scale-110' 
                  : 'text-gray-300 group-hover:text-white group-hover:scale-110'
              }`}
              size={20}
            />
            <span className={`transition-all duration-300 ${
              isActive(href) 
                ? 'font-semibold' 
                : 'group-hover:font-medium'
            }`}>
              {label}
            </span>
            
            {/* Efeito de hover brilho */}
            <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${
              !isActive(href) ? 'bg-gradient-to-r from-purple-400 to-pink-400' : ''
            }`} />
          </Link>
        ))}
      </nav>
      
      <div className="border-t border-gray-700 pt-4 space-y-4">
        <Link href="/perfil" className="block">
          <ProfileIndicator 
            size="md" 
            showCustomStatus={true}
            onClick={() => {}} 
          />
        </Link>
        
        <div className="flex justify-around">
          <button className="p-3 rounded-xl hover:bg-gray-800 transition-all duration-300 hover:scale-110 group">
            <Bell size={20} className="text-gray-300 group-hover:text-white transition-colors duration-300" />
          </button>
          <Link 
            href="/configuracoes" 
            className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 group ${
              isActive('/configuracoes') 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                : 'hover:bg-gray-800'
            }`}
          >
            <Settings 
              size={20} 
              className={`transition-colors duration-300 ${
                isActive('/configuracoes') 
                  ? 'text-white' 
                  : 'text-gray-300 group-hover:text-white'
              }`} 
            />
          </Link>
          <Link 
            href="/perfil" 
            className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 group ${
              isActive('/perfil') 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                : 'hover:bg-gray-800'
            }`}
          >
            <User 
              size={20} 
              className={`transition-colors duration-300 ${
                isActive('/perfil') 
                  ? 'text-white' 
                  : 'text-gray-300 group-hover:text-white'
              }`} 
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
