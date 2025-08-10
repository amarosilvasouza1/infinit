'use client';

import { useState, useRef } from 'react';
import Header from "@/components/layout/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfile } from "@/contexts/ProfileContext";
import EditProfileModal from "@/components/profile/EditProfileModal";

export default function PerfilPage() {
  const { profile, loading, updateProfile } = useProfile();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFullImage, setShowFullImage] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'info' | 'gallery' | 'achievements' | 'activity'>('info');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estado da galeria
  const [userGallery, setUserGallery] = useState<any[]>(profile?.gallery || []);
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Funções da galeria
  const addPhotoToGallery = (photoData: string, title: string = 'Nova Foto') => {
    const newPhoto = {
      id: Date.now(),
      url: photoData,
      title,
      date: new Date().toISOString(),
      favorite: false,
      type: 'image'
    };
    
    const updatedGallery = [...userGallery, newPhoto];
    setUserGallery(updatedGallery);
    
    // Atualizar no perfil
    updateProfile({ gallery: updatedGallery });
  };

  const removePhotoFromGallery = (photoId: number) => {
    const updatedGallery = userGallery.filter(photo => photo.id !== photoId);
    setUserGallery(updatedGallery);
    
    // Atualizar no perfil
    updateProfile({ gallery: updatedGallery });
  };

  const toggleFavorite = (photoId: number) => {
    const updatedGallery = userGallery.map(photo => 
      photo.id === photoId ? { ...photo, favorite: !photo.favorite } : photo
    );
    setUserGallery(updatedGallery);
    
    // Atualizar no perfil
    updateProfile({ gallery: updatedGallery });
  };

  const handlePhotoUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        // Verificar tamanho (15MB para GIFs, 5MB para outros)
        const maxSize = file.type === 'image/gif' ? 15 * 1024 * 1024 : 5 * 1024 * 1024;
        if (file.size > maxSize) {
          const limit = file.type === 'image/gif' ? '15MB' : '5MB';
          alert(`Arquivo ${file.name} muito grande. Máximo: ${limit}`);
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          addPhotoToGallery(result, file.name.split('.')[0]);
        };
        reader.readAsDataURL(file);
      });
    }
    // Limpar o input para permitir selecionar o mesmo arquivo novamente
    e.target.value = '';
  };

  // Filtrar fotos
  const getFilteredPhotos = () => {
    switch (selectedFilter) {
      case 'recent':
        return userGallery.slice(-5);
      case 'favorites':
        return userGallery.filter(photo => photo.favorite);
      case 'shared':
        return userGallery.filter(photo => photo.shared);
      default:
        return userGallery;
    }
  };

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
      case 'online': return '🟢 Online';
      case 'idle': return '🟡 Ausente';
      case 'busy': return '🔴 Ocupado';
      case 'invisible': return '⚫ Invisível';
      default: return '⚪ Offline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Dados mockados para galeria e conquistas
  const mockGallery = [
    { id: 1, url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=300&h=300&fit=crop', type: 'image', title: 'Paisagem' },
    { id: 2, url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop', type: 'image', title: 'Montanha' },
    { id: 3, url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop', type: 'image', title: 'Floresta' },
    { id: 4, url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop', type: 'image', title: 'Céu' },
    { id: 5, url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=300&h=300&fit=crop', type: 'image', title: 'Mar' },
    { id: 6, url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop', type: 'image', title: 'Natureza' },
  ];

  const mockAchievements = [
    { id: 1, icon: '🏆', title: 'Primeiro Login', description: 'Bem-vindo ao Infinit Chat!', rarity: 'common', date: '2025-01-01' },
    { id: 2, icon: '💬', title: 'Conversador', description: 'Enviou 100 mensagens', rarity: 'rare', date: '2025-01-05' },
    { id: 3, icon: '👑', title: 'Premium', description: 'Usuário Premium ativo', rarity: 'epic', date: '2025-01-01' },
    { id: 4, icon: '💻', title: 'Desenvolvedor', description: 'Acesso de desenvolvedor', rarity: 'legendary', date: '2025-01-01' },
    { id: 5, icon: '🚀', title: 'Early Adopter', description: 'Um dos primeiros usuários', rarity: 'epic', date: '2025-01-01' },
  ];

  const mockActivity = [
    { id: 1, icon: '💬', description: 'Enviou uma mensagem em #geral', timestamp: '2025-01-15T10:30:00Z' },
    { id: 2, icon: '📸', description: 'Adicionou uma nova foto à galeria', timestamp: '2025-01-15T09:15:00Z' },
    { id: 3, icon: '🎮', description: 'Atualizou status para "Jogando"', timestamp: '2025-01-15T08:45:00Z' },
    { id: 4, icon: '🏆', description: 'Desbloqueou conquista "Conversador"', timestamp: '2025-01-14T16:20:00Z' },
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-500 bg-gray-500/20';
      case 'rare': return 'border-blue-500 bg-blue-500/20';
      case 'epic': return 'border-purple-500 bg-purple-500/20';
      case 'legendary': return 'border-yellow-500 bg-yellow-500/20';
      default: return 'border-gray-500 bg-gray-500/20';
    }
  };

  return (
    <>
      <Header />
      <div 
        className="h-screen overflow-y-scroll text-white"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#8b5cf6 rgba(17, 24, 39, 0.5)'
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            width: 8px;
          }
          div::-webkit-scrollbar-track {
            background: rgba(17, 24, 39, 0.5);
            border-radius: 10px;
            margin: 4px;
          }
          div::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #8b5cf6, #a855f7, #c084fc);
            border-radius: 10px;
            border: 1px solid rgba(75, 85, 99, 0.3);
            box-shadow: 0 2px 4px rgba(139, 92, 246, 0.3);
          }
          div::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #7c3aed, #9333ea, #a855f7);
            box-shadow: 0 2px 8px rgba(139, 92, 246, 0.5);
          }
        `}</style>
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
          
            {/* Banner e foto de perfil - proporção 16:9 normal */}
          <div className="relative mb-6">
            {/* Banner com altura proporcional */}
            <div 
              className="w-full h-48 rounded-xl bg-cover bg-center relative overflow-hidden"
              style={{
                background: profile.banner?.startsWith('http') || 
                           profile.banner?.startsWith('data:') || 
                           profile.banner?.startsWith('blob:')
                  ? `url(${profile.banner}) center/cover`
                  : profile.banner || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            >
              {/* Overlay gradiente */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            </div>
            
            {/* Avatar proporcional */}
            <div className="absolute -bottom-12 left-6">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-gray-900 shadow-xl">
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
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-600 to-blue-600">
                    {!profile.avatar?.startsWith('http') && 
                     !profile.avatar?.startsWith('data:') && 
                     !profile.avatar?.startsWith('blob:') 
                      ? profile.avatar || profile.name?.charAt(0).toUpperCase() || 'U'
                      : profile.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute bottom-1 right-1 w-6 h-6 ${getStatusColor(profile.status)} rounded-full border-2 border-gray-900 shadow-lg`}></div>
                
                {/* Indicador Premium/Dev */}
                {(profile.isPremium || profile.isDeveloper) && (
                  <div className="absolute -top-1 -right-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shadow-lg ${
                      profile.isDeveloper 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600' 
                        : 'bg-gradient-to-r from-yellow-400 to-orange-500'
                    }`}>
                      <span className="text-white text-sm">
                        {profile.isDeveloper ? '💻' : '⭐'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Botões de ação */}
            <div className="absolute top-4 right-4 flex space-x-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="bg-black/30 backdrop-blur-md hover:bg-black/50 text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm"
              >
                ✏️ Editar
              </button>
              <button className="bg-black/30 backdrop-blur-md hover:bg-black/50 text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm">
                ⚙️
              </button>
            </div>
          </div>

          {/* Informações principais proporcionais */}
          <div className="mt-16 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
              <div className="flex-1 mr-4">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent truncate">
                  {profile.name || 'Usuário'}
                </h1>
                <p className="text-lg text-gray-400">{profile.username || '@user'} #{profile.id}</p>
                {profile.customStatus && (
                  <p className="text-purple-400 mt-1 text-sm italic">"{profile.customStatus}"</p>
                )}
                
                {/* Status */}
                <div className="mt-2">
                  <span className={`${getStatusColor(profile.status)} text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 w-fit shadow-lg`}>
                    <span>{getStatusText(profile.status)}</span>
                  </span>
                </div>
              </div>
              
              {/* Estatísticas */}
              <div className="grid grid-cols-4 gap-4 mt-4 lg:mt-0 min-w-fit">
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-400">{profile.stats?.messagesCount || 0}</div>
                  <div className="text-gray-400 text-xs">Msgs</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-400">{profile.stats?.friendsCount || 0}</div>
                  <div className="text-gray-400 text-xs">Amigos</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">{profile.stats?.groupsCount || 0}</div>
                  <div className="text-gray-400 text-xs">Grupos</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-400">{profile.stats?.callTimeHours || 0}h</div>
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

          {/* Navegação por abas proporcionais */}
          <div className="flex space-x-1 mb-6 bg-gray-800/30 backdrop-blur-sm rounded-xl p-1 border border-gray-700/30">
            {[
              { key: 'info', label: '📋 Info', icon: '📋' },
              { key: 'gallery', label: '📸 Galeria', icon: '📸' },
              { key: 'achievements', label: '🏆 Conquistas', icon: '🏆' },
              { key: 'activity', label: '🕒 Atividade', icon: '🕒' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key as any)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                  selectedTab === tab.key
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Conteúdo das abas mais compacto */}
          <div className="space-y-4">
            {selectedTab === 'info' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Sobre - Seção principal */}
                <div className="lg:col-span-2 bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <span className="mr-2">👤</span> Sobre
                  </h3>
                  <div className="space-y-4">
                    {profile.bio ? (
                      <p className="text-gray-300 leading-relaxed">{profile.bio}</p>
                    ) : (
                      <p className="text-gray-500 italic">Adicione uma descrição sobre você...</p>
                    )}
                    
                    {/* Badges e Tags */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {profile.isDeveloper && (
                        <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                          💻 Desenvolvedor
                        </span>
                      )}
                      {profile.isPremium && (
                        <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                          ⭐ Premium
                        </span>
                      )}
                      <span className="bg-gray-700/50 text-gray-300 px-3 py-1 rounded-full text-sm">
                        🎮 Gamer
                      </span>
                      <span className="bg-gray-700/50 text-gray-300 px-3 py-1 rounded-full text-sm">
                        🎵 Música
                      </span>
                      <span className="bg-gray-700/50 text-gray-300 px-3 py-1 rounded-full text-sm">
                        📚 Livros
                      </span>
                    </div>

                    {/* Estatísticas detalhadas */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 p-4 bg-gray-900/30 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">{profile.stats?.messagesCount || 0}</div>
                        <div className="text-gray-400 text-sm">Mensagens</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">{profile.stats?.friendsCount || 0}</div>
                        <div className="text-gray-400 text-sm">Amigos</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">{profile.stats?.groupsCount || 0}</div>
                        <div className="text-gray-400 text-sm">Grupos</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400">95%</div>
                        <div className="text-gray-400 text-sm">Atividade</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informações pessoais */}
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30">
                  <h3 className="text-md font-semibold mb-3 flex items-center">
                    <span className="mr-2">📋</span> Informações Pessoais
                  </h3>
                  <div className="space-y-3 text-sm">
                    {profile.location && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 flex items-center">
                          <span className="mr-2">📍</span> Localização
                        </span>
                        <span className="text-white">{profile.location}</span>
                      </div>
                    )}
                    {profile.website && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 flex items-center">
                          <span className="mr-2">🌐</span> Website
                        </span>
                        <a href={profile.website} className="text-purple-400 hover:text-purple-300 transition-colors truncate max-w-32" target="_blank" rel="noopener noreferrer">
                          {profile.website.replace('https://', '').replace('http://', '')}
                        </a>
                      </div>
                    )}
                    {profile.joinDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 flex items-center">
                          <span className="mr-2">📅</span> Membro desde
                        </span>
                        <span className="text-white">{formatDate(profile.joinDate)}</span>
                      </div>
                    )}
                    {profile.email && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 flex items-center">
                          <span className="mr-2">📧</span> Email
                        </span>
                        <span className="text-white truncate max-w-32">{profile.email}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 flex items-center">
                        <span className="mr-2">🎂</span> Aniversário
                      </span>
                      <span className="text-white">15 de Março</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 flex items-center">
                        <span className="mr-2">⚡</span> Último online
                      </span>
                      <span className="text-green-400">Agora</span>
                    </div>
                  </div>
                </div>

                {/* Preferências e Configurações */}
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30">
                  <h3 className="text-md font-semibold mb-3 flex items-center">
                    <span className="mr-2">⚙️</span> Preferências
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 flex items-center">
                        <span className="mr-2">🎨</span> Tema
                      </span>
                      <span className="text-white capitalize">{profile.theme || 'Escuro'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 flex items-center">
                        <span className="mr-2">🌍</span> Idioma
                      </span>
                      <span className="text-white">Português</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 flex items-center">
                        <span className="mr-2">🕒</span> Fuso horário
                      </span>
                      <span className="text-white">GMT-3</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 flex items-center">
                        <span className="mr-2">�</span> Notificações
                      </span>
                      <span className="text-green-400">Ativadas</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 flex items-center">
                        <span className="mr-2">🔒</span> Privacidade
                      </span>
                      <span className="text-yellow-400">Amigos</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'gallery' && (
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-semibold flex items-center">
                    <span className="mr-2">�</span> Galeria
                  </h3>
                  <button className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded-lg text-sm transition-colors">
                    + Adicionar
                  </button>
                </div>

                {/* Grid de imagens funcionais */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {getFilteredPhotos().map((photo) => (
                    <div key={photo.id} className="group relative aspect-square rounded-lg overflow-hidden bg-gray-700/30 hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                      <img 
                        src={photo.url} 
                        alt={photo.title}
                        className="w-full h-full object-cover group-hover:brightness-110 transition-all"
                        onClick={() => setShowFullImage(photo.url)}
                      />
                      
                      {/* Overlay com botões */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex flex-col justify-between p-2 opacity-0 group-hover:opacity-100">
                        <div className="flex justify-between items-start">
                          <button 
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                              photo.favorite ? 'bg-red-500 text-white' : 'bg-gray-800/80 text-gray-300'
                            } hover:scale-110 transition-transform`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(photo.id);
                            }}
                          >
                            {photo.favorite ? '❤️' : '🤍'}
                          </button>
                          <button 
                            className="w-6 h-6 bg-red-600/80 rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Remover "${photo.title}" da galeria?`)) {
                                removePhotoFromGallery(photo.id);
                              }
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                        
                        <div className="text-white">
                          <div className="text-sm font-medium truncate">{photo.title}</div>
                          <div className="text-xs text-gray-300">{formatDate(photo.date)}</div>
                        </div>
                      </div>
                      
                      {/* Indicador de favorito */}
                      {photo.favorite && (
                        <div className="absolute top-2 left-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs">
                          ❤️
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Botão para adicionar nova foto */}
                  <button 
                    className="aspect-square rounded-lg border-2 border-dashed border-gray-600 hover:border-purple-500 bg-gray-800/20 hover:bg-purple-900/20 transition-all duration-300 flex flex-col items-center justify-center group"
                    onClick={handlePhotoUpload}
                  >
                    <div className="text-3xl text-gray-500 group-hover:text-purple-400 transition-colors mb-2">
                      📷
                    </div>
                    <div className="text-sm text-gray-500 group-hover:text-purple-400 transition-colors text-center">
                      Adicionar<br />Foto
                    </div>
                  </button>
                </div>

                {/* Estado vazio */}
                {userGallery.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl text-gray-500 mb-4">📸</div>
                    <h4 className="text-xl font-semibold text-gray-300 mb-2">Galeria vazia</h4>
                    <p className="text-gray-500 mb-6">Adicione suas primeiras fotos à galeria</p>
                    <button 
                      className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg text-white font-medium transition-colors"
                      onClick={handlePhotoUpload}
                    >
                      📁 Adicionar Primeira Foto
                    </button>
                  </div>
                )}

                {/* Informações da galeria */}
                {userGallery.length > 0 && (
                  <div className="mt-6 p-4 bg-gray-900/30 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-purple-400">{userGallery.length}</div>
                        <div className="text-xs text-gray-400">Total de fotos</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-blue-400">{userGallery.filter(p => p.favorite).length}</div>
                        <div className="text-xs text-gray-400">Favoritas</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-400">
                          {((JSON.stringify(userGallery).length / (1024 * 1024))).toFixed(1)} MB
                        </div>
                        <div className="text-xs text-gray-400">Espaço usado</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-yellow-400">
                          {(25 - (JSON.stringify(userGallery).length / (1024 * 1024))).toFixed(1)} MB
                        </div>
                        <div className="text-xs text-gray-400">Disponível</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedTab === 'achievements' && (
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30">
                <h3 className="text-md font-semibold mb-4 flex items-center">
                  <span className="mr-2">🏆</span> Conquistas
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { name: 'Primeiro Login', icon: '🎯', rarity: 'common', unlocked: true },
                    { name: 'Conversador', icon: '💬', rarity: 'common', unlocked: true },
                    { name: 'Social', icon: '👥', rarity: 'rare', unlocked: true },
                    { name: 'Veterano', icon: '⏰', rarity: 'epic', unlocked: false },
                    { name: 'Desenvolvedor', icon: '💻', rarity: 'legendary', unlocked: profile.isDeveloper },
                    { name: 'Premium', icon: '⭐', rarity: 'rare', unlocked: profile.isPremium }
                  ].map((achievement, index) => (
                    <div 
                      key={index}
                      className={`p-3 rounded-lg border transition-all ${
                        achievement.unlocked 
                          ? `border-${achievement.rarity === 'common' ? 'gray' : achievement.rarity === 'rare' ? 'blue' : achievement.rarity === 'epic' ? 'purple' : 'yellow'}-500 bg-${achievement.rarity === 'common' ? 'gray' : achievement.rarity === 'rare' ? 'blue' : achievement.rarity === 'epic' ? 'purple' : 'yellow'}-500/10`
                          : 'border-gray-700 bg-gray-800/30 opacity-50'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-1">{achievement.icon}</div>
                        <h4 className="font-medium text-sm mb-1">{achievement.name}</h4>
                        <div className={`text-xs px-2 py-1 rounded-full w-fit mx-auto ${
                          achievement.rarity === 'common' ? 'bg-gray-600' :
                          achievement.rarity === 'rare' ? 'bg-blue-600' :
                          achievement.rarity === 'epic' ? 'bg-purple-600' : 'bg-yellow-600'
                        }`}>
                          {achievement.rarity.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTab === 'activity' && (
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30">
                <h3 className="text-md font-semibold mb-4 flex items-center">
                  <span className="mr-2">🕒</span> Atividade Recente
                </h3>
                
                <div className="space-y-3">
                  {[
                    { text: 'Enviou uma mensagem no #geral', time: '2min', icon: '💬' },
                    { text: 'Alterou status para Online', time: '15min', icon: '🟢' },
                    { text: 'Atualizou foto de perfil', time: '1h', icon: '🖼️' },
                    { text: 'Adicionou novo amigo', time: '3h', icon: '👥' },
                    { text: 'Entrou no grupo "Devs"', time: '1d', icon: '👨‍💻' },
                    { text: 'Desbloqueou "Social"', time: '2d', icon: '🏆' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700/20 transition-colors">
                      <div className="text-lg">{activity.icon}</div>
                      <div className="flex-1">
                        <p className="text-sm">{activity.text}</p>
                      </div>
                      <div className="text-xs text-gray-500">{activity.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Espaçamento final */}
          <div className="h-8"></div>
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

      {/* Input de upload de arquivo (oculto) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Modal de visualização de imagem em tela cheia */}
      {showFullImage && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowFullImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img 
              src={showFullImage} 
              alt="Visualização completa"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button 
              className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
              onClick={() => setShowFullImage(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
