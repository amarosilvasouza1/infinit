'use client';

import { useState, useRef } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ImageUploader from '@/components/ui/ImageUploader';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { 
    profile, 
    loading, 
    error,
    updateProfile, 
    updateAvatar, 
    updateBanner, 
    updateBio, 
    updateStatus, 
    updateCustomStatus, 
    clearLocalStorageData 
  } = useProfile();

  if (!profile) return null;
  
  const [formData, setFormData] = useState({
    name: profile.name,
    username: profile.username,
    email: profile.email,
    bio: profile.bio,
    location: profile.location,
    website: profile.website,
    customStatus: profile.customStatus,
    status: profile.status
  });

  const [selectedTab, setSelectedTab] = useState<'basic' | 'appearance' | 'uploads'>('basic');
  const [selectedBanner, setSelectedBanner] = useState(profile.banner);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar);
  const [customBannerImage, setCustomBannerImage] = useState<string | null>(null);
  const [customAvatarImage, setCustomAvatarImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const profileData = {
        ...formData,
        avatar: customAvatarImage || selectedAvatar,
        banner: customBannerImage || selectedBanner
      };

      // Verificar tamanho total dos dados (aumentado para 25MB)
      const dataSize = JSON.stringify(profileData).length;
      if (dataSize > 25 * 1024 * 1024) { // 25MB
        throw new Error('Dados do perfil muito grandes. Reduza o tamanho das imagens.');
      }

      await updateProfile(profileData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar perfil. Tente novamente.';
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = (emoji: string) => {
    setSelectedAvatar(emoji);
    setCustomAvatarImage(null); // Limpa a imagem personalizada se selecionou emoji
  };

  const handleBannerChange = (gradient: string) => {
    setSelectedBanner(gradient);
    setCustomBannerImage(null); // Limpa a imagem personalizada se selecionou gradiente
  };

  const handleAvatarImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCustomAvatarImage(result);
        setSelectedAvatar(result); // Define como avatar selecionado
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Verificar tamanho do arquivo (máximo 15MB para GIFs, 5MB para outros)
      const maxSize = file.type === 'image/gif' ? 15 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > maxSize) {
        const limit = file.type === 'image/gif' ? '15MB' : '5MB';
        alert(`Arquivo muito grande. Máximo permitido: ${limit}`);
        return;
      }

      // Verificar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Tipo de arquivo não suportado. Use: JPG, PNG, GIF ou WEBP');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        
        // Para GIFs, verificar se é muito grande em base64
        if (file.type === 'image/gif') {
          // Calcular tamanho aproximado em base64
          const base64Size = (result.length * 3) / 4;
          if (base64Size > 12 * 1024 * 1024) { // 12MB em base64
            const shouldContinue = confirm(`GIF grande (${(base64Size / (1024 * 1024)).toFixed(1)}MB processado). Continuar?`);
            if (!shouldContinue) return;
          }
        }
        
        setCustomBannerImage(result);
        setSelectedBanner(result); // Define como banner selecionado
      };
      
      reader.onerror = () => {
        alert('Erro ao ler o arquivo. Tente novamente.');
      };
      
      reader.readAsDataURL(file);
    }
  };

  const predefinedBanners = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(135deg, #ff8a80 0%, #ea80fc 100%)',
    'linear-gradient(135deg, #8fd3f4 0%, #84fab0 100%)'
  ];

  const predefinedAvatars = [
    '🧑‍💻', '👩‍🎨', '👨‍🚀', '👩‍🔬', '👨‍🎵', '👩‍🏫', '👨‍💼', '👩‍⚕️',
    '🧙‍♂️', '🧙‍♀️', '🦸‍♂️', '🦸‍♀️', '🤖', '👽', '🐱', '🐶',
    '🦄', '🐲', '🔥', '⭐', '🌟', '💎', '🎭', '🎨'
  ];

  const statusOptions = [
    { value: 'online', label: 'Online', color: 'bg-green-500', icon: '🟢' },
    { value: 'idle', label: 'Ausente', color: 'bg-yellow-500', icon: '🟡' },
    { value: 'busy', label: 'Ocupado', color: 'bg-red-500', icon: '🔴' },
    { value: 'invisible', label: 'Invisível', color: 'bg-gray-500', icon: '⚫' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">✏️ Editar Perfil</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl transition-colors"
            >
              ×
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-4 mt-4">
            {[
              { key: 'basic', label: '📝 Básico', icon: '📝' },
              { key: 'uploads', label: '📷 Imagens', icon: '📷' },
              { key: 'appearance', label: '🎨 Aparência', icon: '🎨' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key as any)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedTab === tab.key
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {selectedTab === 'basic' && (
            <div className="space-y-6">
              {/* Informações básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Seu nome"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nome de usuário
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="@seunome"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Localização
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Sua cidade, País"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://seusite.com"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={4}
                  placeholder="Conte um pouco sobre você..."
                />
                <p className="text-xs text-gray-400 mt-1">
                  {formData.bio.length}/500 caracteres
                </p>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {statusOptions.map((status) => (
                    <button
                      key={status.value}
                      onClick={() => setFormData(prev => ({ ...prev, status: status.value as any }))}
                      className={`p-3 rounded-lg border transition-all ${
                        formData.status === status.value
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-gray-700 bg-gray-800 hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                        <span className="text-white text-sm">{status.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Status personalizado */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status personalizado
                </label>
                <input
                  type="text"
                  value={formData.customStatus}
                  onChange={(e) => setFormData(prev => ({ ...prev, customStatus: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="O que você está fazendo?"
                />
              </div>

              {/* Badges */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Suas Badges
                </label>
                <div className="flex flex-wrap gap-2">
                  {profile.badges.map((badge: string, index: number) => (
                    <span 
                      key={index}
                      className={`px-3 py-1.5 text-sm font-bold rounded-full ${
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
                {profile.isPremium && (
                  <div className="mt-2 p-3 bg-gradient-to-r from-yellow-400/10 to-orange-500/10 border border-yellow-400/20 rounded-lg">
                    <p className="text-yellow-400 text-sm">
                      ⭐ Você tem acesso premium! Agora pode enviar GIFs animados nas conversas.
                    </p>
                  </div>
                )}
                {profile.isDeveloper && (
                  <div className="mt-2 p-3 bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-500/20 rounded-lg">
                    <p className="text-purple-400 text-sm">
                      💎 Badge de desenvolvedor ativa! Obrigado por contribuir com o projeto.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedTab === 'uploads' && (
            <div className="space-y-8">
              <h3 className="text-lg font-semibold text-white mb-6">📷 Upload de Imagens</h3>
              
              {/* Upload do Avatar */}
              <div className="bg-gray-800 rounded-lg p-6">
                <ImageUploader
                  currentImage={customAvatarImage || selectedAvatar}
                  onImageChange={(imageUrl) => {
                    if (imageUrl) {
                      setCustomAvatarImage(imageUrl);
                      setSelectedAvatar(imageUrl);
                    } else {
                      setCustomAvatarImage(null);
                      setSelectedAvatar('🧑‍💻');
                    }
                  }}
                  title="👤 Foto de Perfil"
                  description="Faça upload de uma foto para usar como avatar"
                  uploadButtonText="Selecionar Foto de Perfil"
                  isCircular={true}
                  maxSizeMB={5}
                />
              </div>

              {/* Upload do Banner */}
              <div className="bg-gray-800 rounded-lg p-6">
                <ImageUploader
                  currentImage={customBannerImage || (
                    profile.banner.startsWith('http') || 
                    profile.banner.startsWith('data:') 
                      ? profile.banner 
                      : undefined
                  )}
                  onImageChange={(imageUrl) => {
                    if (imageUrl) {
                      setCustomBannerImage(imageUrl);
                      setSelectedBanner(imageUrl);
                    } else {
                      setCustomBannerImage(null);
                      setSelectedBanner('linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
                    }
                  }}
                  title="🖼️ Imagem de Banner"
                  description="Faça upload de uma imagem para usar como banner do perfil"
                  uploadButtonText="Selecionar Imagem de Banner"
                  isCircular={false}
                  maxSizeMB={15}
                />
                
                {/* Preview do banner */}
                <div className="mt-4">
                  <p className="text-gray-400 text-sm mb-2">Preview do banner:</p>
                  <div 
                    className="w-full h-24 rounded-lg bg-cover bg-center border border-gray-600"
                    style={{ 
                      background: customBannerImage || selectedBanner.startsWith('http') || selectedBanner.startsWith('data:')
                        ? `url(${customBannerImage || selectedBanner}) center/cover`
                        : selectedBanner
                    }}
                  ></div>
                </div>
              </div>

              {/* Dicas */}
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <h4 className="text-blue-400 font-medium mb-2">💡 Dicas para melhores resultados</h4>
                <ul className="text-blue-200 text-sm space-y-1">
                  <li>• <strong>Avatar:</strong> Use imagens quadradas (1:1) para melhor resultado</li>
                  <li>• <strong>Banner:</strong> Imagens em formato 16:9 ficam melhores</li>
                  <li>• <strong>Qualidade:</strong> Prefira imagens com boa resolução</li>
                  <li>• <strong>Formato:</strong> JPG, PNG e GIF são suportados</li>
                </ul>
              </div>

              {/* Orientações específicas para GIFs */}
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                <h4 className="text-purple-400 font-medium mb-2 flex items-center">
                  <span className="mr-2">🎬</span> Usando GIFs Animados (Premium)
                </h4>
                <div className="text-purple-200 text-sm space-y-2">
                  <p><strong>📏 Tamanho permitido:</strong> Até 15MB para GIFs de alta qualidade</p>
                  <p><strong>⏱️ Duração:</strong> GIFs de 1-5 segundos funcionam melhor</p>
                  <p><strong>🔄 Loop:</strong> Certifique-se que o GIF tenha loop suave</p>
                  <p><strong>🎯 Qualidade:</strong> Pode usar GIFs de alta resolução e qualidade</p>
                  
                  {!profile.isPremium && (
                    <div className="mt-3 p-3 bg-yellow-900/30 border border-yellow-600/50 rounded-lg">
                      <p className="text-yellow-300 text-xs">
                        <span className="mr-1">⭐</span>
                        <strong>Recurso Premium:</strong> GIFs animados estão disponíveis apenas para usuários Premium
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'appearance' && (
            <div className="space-y-6">
              {/* Avatar */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">👤 Avatar</h3>
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={
                      customAvatarImage || 
                      (selectedAvatar.startsWith('http') || selectedAvatar.startsWith('data:') ? selectedAvatar : undefined)
                    } />
                    <AvatarFallback className="text-3xl">
                      {!customAvatarImage && !selectedAvatar.startsWith('http') && !selectedAvatar.startsWith('data:') ? selectedAvatar : '👤'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-white font-medium">Avatar atual</p>
                    <p className="text-gray-400 text-sm mb-3">Escolha um emoji ou faça upload de uma imagem</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => avatarInputRef.current?.click()}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                      >
                        📷 Upload Foto
                      </button>
                      {(customAvatarImage || selectedAvatar.startsWith('http') || selectedAvatar.startsWith('data:')) && (
                        <button
                          onClick={() => {
                            setCustomAvatarImage(null);
                            setSelectedAvatar('🧑‍💻');
                          }}
                          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                        >
                          🗑️ Remover
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-6 md:grid-cols-8 gap-2">
                  {predefinedAvatars.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleAvatarChange(emoji)}
                      className={`aspect-square p-2 rounded-lg text-2xl transition-all ${
                        selectedAvatar === emoji && !customAvatarImage
                          ? 'bg-purple-600 scale-110'
                          : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarImageUpload}
                  className="hidden"
                />
              </div>

              {/* Banner */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">🖼️ Banner</h3>
                <div className="mb-4">
                  <div 
                    className="w-full h-32 rounded-lg bg-cover bg-center"
                    style={{ 
                      background: customBannerImage 
                        ? `url(${customBannerImage}) center/cover` 
                        : selectedBanner 
                    }}
                  ></div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-gray-400 text-sm">Banner atual</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => bannerInputRef.current?.click()}
                        className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                      >
                        📷 Upload Imagem
                      </button>
                      {(customBannerImage || selectedBanner.startsWith('http') || selectedBanner.startsWith('data:')) && (
                        <button
                          onClick={() => {
                            setCustomBannerImage(null);
                            setSelectedBanner('linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
                          }}
                          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                        >
                          🗑️ Remover
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm mb-3">Ou escolha um gradiente:</p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {predefinedBanners.map((gradient, index) => (
                    <button
                      key={index}
                      onClick={() => handleBannerChange(gradient)}
                      className={`aspect-video rounded-lg transition-all ${
                        selectedBanner === gradient && !customBannerImage
                          ? 'ring-2 ring-purple-500 scale-105' 
                          : 'hover:scale-105'
                      }`}
                      style={{ background: gradient }}
                    ></button>
                  ))}
                </div>

                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBannerImageUpload}
                  className="hidden"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex justify-between items-center">
          {/* Botão de limpar dados */}
          <button
            onClick={() => {
              if (confirm('Tem certeza que deseja limpar todos os dados salvos? Esta ação não pode ser desfeita.')) {
                clearLocalStorageData();
                alert('Dados salvos foram limpos com sucesso! Recarregue a página.');
              }
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
            title="Limpar dados salvos do navegador"
          >
            Limpar Dados
          </button>
          
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
