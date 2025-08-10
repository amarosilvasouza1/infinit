'use client';

import { useProfile } from '@/contexts/ProfileContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProfileIndicatorProps {
  showStatus?: boolean;
  showCustomStatus?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export default function ProfileIndicator({ 
  showStatus = true, 
  showCustomStatus = false, 
  size = 'sm',
  onClick 
}: ProfileIndicatorProps) {
  const { profile, loading } = useProfile();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'invisible': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const statusSizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  // Se ainda está carregando ou profile é null, mostrar skeleton
  if (loading || !profile) {
    return (
      <div className={`flex items-center space-x-3 animate-pulse`}>
        <div className={`${sizeClasses[size]} bg-gray-700 rounded-full`}></div>
        <div className="flex-1 min-w-0">
          <div className="h-4 bg-gray-700 rounded w-24 mb-1"></div>
          {showCustomStatus && <div className="h-3 bg-gray-700 rounded w-32"></div>}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`flex items-center space-x-3 ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
      onClick={onClick}
    >
      <div className="relative">
        <Avatar className={sizeClasses[size]}>
          <AvatarImage 
            src={
              profile.avatar.startsWith('http') || 
              profile.avatar.startsWith('data:') || 
              profile.avatar.startsWith('blob:') 
                ? profile.avatar 
                : undefined
            } 
            alt={profile.name} 
          />
          <AvatarFallback className={size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-lg' : 'text-sm'}>
            {profile.avatar.startsWith('http') || 
             profile.avatar.startsWith('data:') || 
             profile.avatar.startsWith('blob:') 
              ? profile.name.charAt(0).toUpperCase()
              : profile.avatar}
          </AvatarFallback>
        </Avatar>
        
        {showStatus && (
          <div className={`absolute -bottom-0.5 -right-0.5 ${statusSizeClasses[size]} ${getStatusColor(profile.status)} rounded-full border-2 border-gray-900`}></div>
        )}
        
        {/* Badge Premium/Dev */}
        {(profile.isPremium || profile.isDeveloper) && (
          <div className="absolute -top-1 -right-1">
            {profile.isDeveloper ? (
              <div className="w-4 h-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">D</span>
              </div>
            ) : profile.isPremium ? (
              <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">★</span>
              </div>
            ) : null}
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex flex-col">
          <p className="text-white font-medium truncate">{profile.name}</p>
          
          {/* Badges em linha separada para não cortar o nome */}
          {profile.badges && profile.badges.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {profile.badges.map((badge, index) => (
                <span 
                  key={index}
                  className={`px-1.5 py-0.5 text-xs font-bold rounded-full ${
                    badge === 'DEV' 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                      : badge === 'PREMIUM' 
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                      : badge === 'FOUNDER'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                      : 'bg-gray-500 text-white'
                  }`}
                >
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>
        {showCustomStatus && profile.customStatus && (
          <p className="text-gray-400 text-sm truncate italic mt-1">"{profile.customStatus}"</p>
        )}
      </div>
    </div>
  );
}
