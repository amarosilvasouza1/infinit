'use client';

import { useState } from 'react';
import Header from "@/components/layout/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfile } from "@/contexts/ProfileContext";
import EditProfileModal from "@/components/profile/EditProfileModal";

export default function PerfilPage() {
  const { profile, loading, updateProfile } = useProfile();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFullImage, setShowFullImage] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'info' | 'gallery' | 'achievements' | 'activity'>('info');

  // Se ainda está carregando ou profile é null, mostrar loading
  if (loading || !profile) {
    return (
      <>
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Carregando perfil...</p>
          </div>
        </div>
      </>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'invisible': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'idle': return 'Ausente';
      case 'busy': return 'Ocupado';
      case 'invisible': return 'Invisível';
      default: return 'Offline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <>
      <Header />
      <div className="flex-1 p-4 text-white overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          
          {/* Banner e foto de perfil - bem compacto */}
          <div className="relative mb-4">
            {/* Banner bem menor */}
            <div 
              className="w-full h-32 rounded-lg bg-cover bg-center relative overflow-hidden"
              style={{
                background: profile.banner?.startsWith('http') || 
                           profile.banner?.startsWith('data:') || 
                           profile.banner?.startsWith('blob:')
                  ? `url(${profile.banner}) center/cover`
                  : profile.banner || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            >
              {/* Overlay gradiente mais sutil */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
            </div>
            
            {/* Avatar bem menor */}
            <div className="absolute -bottom-8 left-4">
              <div className="relative">
                <Avatar className="w-16 h-16 border-2 border-gray-900 shadow-lg">
                  <AvatarImage 
                    src={
                      profile.avatar?.startsWith('http') || 
                      profile.avatar?.startsWith('data:') || 
                      profile.avatar?.startsWith('blob:') 
                        ? profile.avatar 
                        : undefined
                    } 
                    alt={profile.name || 'User'} 
                  />
                  <AvatarFallback className="text-lg bg-gradient-to-br from-purple-600 to-blue-600">
                    {!profile.avatar?.startsWith('http') && 
                     !profile.avatar?.startsWith('data:') && 
                     !profile.avatar?.startsWith('blob:') 
                      ? profile.avatar || profile.name?.charAt(0).toUpperCase() || 'U'
                      : profile.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute bottom-0 right-0 w-4 h-4 ${getStatusColor(profile.status)} rounded-full border-2 border-gray-900`}></div>
                
                {/* Indicador Premium/Dev bem pequeno */}
                {(profile.isPremium || profile.isDeveloper) && (
                  <div className="absolute -top-1 -right-1">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shadow-lg ${
                      profile.isDeveloper 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600' 
                        : 'bg-gradient-to-r from-yellow-400 to-orange-500'
                    }`}>
                      <span className="text-white text-xs">
                        {profile.isDeveloper ? '💻' : '⭐'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Botões de ação bem pequenos */}
            <div className="absolute top-2 right-2 flex space-x-1">
              <button
                onClick={() => setShowEditModal(true)}
                className="bg-black/20 backdrop-blur-md hover:bg-black/40 text-white px-2 py-1 rounded-md transition-all duration-200 text-xs"
              >
                ✏️
              </button>
              <button className="bg-black/20 backdrop-blur-md hover:bg-black/40 text-white px-2 py-1 rounded-md transition-all duration-200 text-xs">
                ⚙️
              </button>
            </div>
          </div>

          {/* Informações principais bem compactas */}
          <div className="mt-10 mb-4">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-3">
              <div className="flex-1 mr-4">
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent truncate">
                  {profile.name || 'Usuário'}
                </h1>
                <p className="text-sm text-gray-400">{profile.username || '@user'} #{profile.id}</p>
                {profile.customStatus && (
                  <p className="text-purple-400 mt-1 text-xs italic">"{profile.customStatus}"</p>
                )}
                
                {/* Status bem compacto */}
                <div className="mt-1">
                  <span className={`${getStatusColor(profile.status)} text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 w-fit`}>
                    <span>{getStatusText(profile.status)}</span>
                  </span>
                </div>
              </div>
              
              {/* Estatísticas bem compactas */}
              <div className="grid grid-cols-4 gap-3 mt-3 lg:mt-0 min-w-fit">
                <div className="text-center">
                  <div className="text-sm font-bold text-purple-400">{profile.stats?.messagesCount || 0}</div>
                  <div className="text-gray-400 text-xs">Msgs</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-blue-400">{profile.stats?.friendsCount || 0}</div>
                  <div className="text-gray-400 text-xs">Amigos</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-green-400">{profile.stats?.groupsCount || 0}</div>
                  <div className="text-gray-400 text-xs">Grupos</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-orange-400">{profile.stats?.callTimeHours || 0}h</div>
                  <div className="text-gray-400 text-xs">Calls</div>
                </div>
              </div>
            </div>

            {/* Badges bem pequenas */}
            {profile.badges && profile.badges.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {profile.badges.map((badge, index) => (
                  <div
                    key={index}
                    className={`px-2 py-1 text-xs font-bold rounded-md shadow-md transform hover:scale-105 transition-all duration-200 ${
                      badge === 'DEV' 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                        : badge === 'PREMIUM' 
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                        : badge === 'FOUNDER'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                        : 'bg-gray-600 text-white'
                    }`}
                  >
                    {badge}
                  </div>
                ))}
              </div>
            )}

            {/* Bio bem compacta */}
            {profile.bio && (
              <div className="bg-gray-800/20 backdrop-blur-sm rounded-lg p-3 mb-3 border border-gray-700/20">
                <h3 className="text-sm font-semibold mb-2 flex items-center">
                  <span className="mr-2">📝</span> Sobre
                </h3>
                <p className="text-gray-300 text-xs leading-relaxed">{profile.bio}</p>
              </div>
            )}
          </div>

          {/* Navegação por abas bem compacta */}
          <div className="flex space-x-1 mb-4 bg-gray-800/20 backdrop-blur-sm rounded-lg p-1 border border-gray-700/20">
            {[
              { key: 'info', label: '📋', icon: '📋' },
              { key: 'gallery', label: '📸', icon: '📸' },
              { key: 'achievements', label: '🏆', icon: '🏆' },
              { key: 'activity', label: '🕒', icon: '🕒' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key as any)}
                className={`flex-1 px-3 py-2 rounded-md font-medium transition-all duration-200 text-xs ${
                  selectedTab === tab.key
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/20'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Conteúdo das abas bem compacto */}
          <div className="space-y-3">
            {selectedTab === 'info' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Informações pessoais */}
                <div className="bg-gray-800/20 backdrop-blur-sm rounded-lg p-3 border border-gray-700/20">
                  <h3 className="text-sm font-semibold mb-2 flex items-center">
                    <span className="mr-2">📋</span> Info
                  </h3>
                  <div className="space-y-1 text-xs">
                    {profile.location && (
                      <div className="flex items-center">
                        <span className="text-gray-400 w-12 text-xs">📍</span>
                        <span className="text-xs">{profile.location}</span>
                      </div>
                    )}
                    {profile.website && (
                      <div className="flex items-center">
                        <span className="text-gray-400 w-12 text-xs">🌐</span>
                        <a href={profile.website} className="text-purple-400 hover:text-purple-300 transition-colors text-xs truncate" target="_blank" rel="noopener noreferrer">
                          {profile.website}
                        </a>
                      </div>
                    )}
                    {profile.joinDate && (
                      <div className="flex items-center">
                        <span className="text-gray-400 w-12 text-xs">📅</span>
                        <span className="text-xs">{formatDate(profile.joinDate)}</span>
                      </div>
                    )}
                    {profile.email && (
                      <div className="flex items-center">
                        <span className="text-gray-400 w-12 text-xs">📧</span>
                        <span className="text-xs truncate">{profile.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Preferências */}
                <div className="bg-gray-800/20 backdrop-blur-sm rounded-lg p-3 border border-gray-700/20">
                  <h3 className="text-sm font-semibold mb-2 flex items-center">
                    <span className="mr-2">⚙️</span> Config
                  </h3>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center">
                      <span className="text-gray-400 w-12 text-xs">🎨</span>
                      <span className="capitalize text-xs">{profile.theme || 'dark'}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-400 w-12 text-xs">🌍</span>
                      <span className="text-xs">{profile.language || 'pt-BR'}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-400 w-12 text-xs">🕒</span>
                      <span className="text-xs">{profile.timezone || 'BR'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'gallery' && (
              <div className="bg-gray-800/20 backdrop-blur-sm rounded-lg p-3 border border-gray-700/20">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold flex items-center">
                    <span className="mr-2">📸</span> Galeria
                  </h3>
                  <button className="bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded-md text-xs transition-colors">
                    +
                  </button>
                </div>

                {/* Grid de imagens bem compacto */}
                <div className="grid grid-cols-5 lg:grid-cols-8 gap-1">
                  {[
                    'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0',
                    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
                    'https://images.unsplash.com/photo-1500380804539-4dcb63da6539',
                    'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d',
                    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
                    'https://images.unsplash.com/photo-1494790108755-2616c27fa6fa',
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
                    'https://images.unsplash.com/photo-1517841905240-472988babdf9'
                  ].map((img, index) => (
                    <div key={index} className="aspect-square rounded-md overflow-hidden hover:scale-105 transition-transform cursor-pointer group">
                      <img 
                        src={`${img}?w=100&h=100&fit=crop`} 
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-full object-cover group-hover:brightness-110 transition-all"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTab === 'achievements' && (
              <div className="bg-gray-800/20 backdrop-blur-sm rounded-lg p-3 border border-gray-700/20">
                <h3 className="text-sm font-semibold mb-3 flex items-center">
                  <span className="mr-2">🏆</span> Conquistas
                </h3>
                
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {[
                    { name: 'Login', icon: '🎯', rarity: 'common', unlocked: true },
                    { name: 'Chat', icon: '💬', rarity: 'common', unlocked: true },
                    { name: 'Social', icon: '👥', rarity: 'rare', unlocked: true },
                    { name: 'Vet', icon: '⏰', rarity: 'epic', unlocked: false },
                    { name: 'Dev', icon: '💻', rarity: 'legendary', unlocked: profile.isDeveloper },
                    { name: 'VIP', icon: '⭐', rarity: 'rare', unlocked: profile.isPremium }
                  ].map((achievement, index) => (
                    <div 
                      key={index}
                      className={`p-2 rounded-md border transition-all ${
                        achievement.unlocked 
                          ? `border-${achievement.rarity === 'common' ? 'gray' : achievement.rarity === 'rare' ? 'blue' : achievement.rarity === 'epic' ? 'purple' : 'yellow'}-500 bg-${achievement.rarity === 'common' ? 'gray' : achievement.rarity === 'rare' ? 'blue' : achievement.rarity === 'epic' ? 'purple' : 'yellow'}-500/10`
                          : 'border-gray-700 bg-gray-800/20 opacity-50'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg mb-1">{achievement.icon}</div>
                        <h4 className="font-medium text-xs">{achievement.name}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTab === 'activity' && (
              <div className="bg-gray-800/20 backdrop-blur-sm rounded-lg p-3 border border-gray-700/20">
                <h3 className="text-sm font-semibold mb-3 flex items-center">
                  <span className="mr-2">🕒</span> Atividade
                </h3>
                
                <div className="space-y-2">
                  {[
                    { text: 'Mensagem no #geral', time: '2min', icon: '💬' },
                    { text: 'Status Online', time: '15min', icon: '🟢' },
                    { text: 'Nova foto', time: '1h', icon: '🖼️' },
                    { text: 'Novo amigo', time: '3h', icon: '👥' },
                    { text: 'Grupo "Devs"', time: '1d', icon: '👨‍💻' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-700/10 transition-colors">
                      <div className="text-sm">{activity.icon}</div>
                      <div className="flex-1">
                        <p className="text-xs">{activity.text}</p>
                      </div>
                      <div className="text-xs text-gray-500">{activity.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de edição */}
      {showEditModal && (
        <EditProfileModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
}
