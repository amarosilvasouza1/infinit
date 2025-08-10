'use client';

import { useState } from "react";
import Header from "@/components/layout/Header";
import { useApp } from "@/contexts/AppContext";
import { useProfile } from "@/contexts/ProfileContext";
import AddPeopleModal from "@/components/modals/AddPeopleModal";
import { Plus, Users, Calendar, Search, Settings, UserPlus, MessageCircle, Hash, Pin } from "lucide-react";

// Função para gerar IDs únicos
let communityIdCounter = 0;
const generateUniqueCommunityId = () => {
  communityIdCounter++;
  return `community-${Date.now()}-${communityIdCounter}-${Math.random().toString(36).substr(2, 9)}`;
};

interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  members: string[];
  avatar: string;
  isPrivate: boolean;
  createdAt: Date;
  tags: string[];
}

export default function ComunidadePage() {
  const { users, currentUser } = useApp();
  const { profile } = useProfile();
  
  const [communities, setCommunities] = useState<Community[]>([
    {
      id: '1',
      name: 'Gaming Brasil',
      description: 'Comunidade para gamers brasileiros discutirem jogos, dicas e se conectarem!',
      category: '🎮 Gaming',
      members: ['1', '2', '3', '4', '5'],
      avatar: 'G',
      isPrivate: false,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      tags: ['gaming', 'brasil', 'jogos']
    },
    {
      id: '2',
      name: 'Tech Talk',
      description: 'Discussões sobre tecnologia, programação e inovação',
      category: '💻 Tecnologia',
      members: ['1', '2', '6', '7'],
      avatar: 'T',
      isPrivate: false,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      tags: ['tech', 'programação', 'inovação']
    },
    {
      id: '3',
      name: 'Música & Arte',
      description: 'Espaço para artistas e amantes da música compartilharem criações',
      category: '🎵 Arte',
      members: ['1', '3', '5', '8'],
      avatar: 'M',
      isPrivate: false,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      tags: ['música', 'arte', 'criatividade']
    }
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddPeople, setShowAddPeople] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [activeCommunity, setActiveCommunity] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    isPrivate: false,
    tags: ""
  });

  const categories = ["Todas", "🎮 Gaming", "💻 Tecnologia", "🎵 Arte", "📚 Educação", "💪 Fitness", "🍳 Culinária", "📺 Entretenimento"];

  const filteredCommunities = communities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         community.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todas" || community.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateCommunity = () => {
    if (formData.name && formData.category) {
      const newCommunity: Community = {
        id: generateUniqueCommunityId(),
        ...formData,
        members: [currentUser.id],
        avatar: formData.name[0].toUpperCase(),
        createdAt: new Date(),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      };
      
      setCommunities(prev => [newCommunity, ...prev]);
      setFormData({
        name: "",
        description: "",
        category: "",
        isPrivate: false,
        tags: ""
      });
      setShowCreateForm(false);
    }
  };

  const handleAddPeople = (userIds: string[]) => {
    if (selectedCommunity) {
      setCommunities(prev => prev.map(community => {
        if (community.id === selectedCommunity) {
          const newMembers = [...community.members];
          userIds.forEach(userId => {
            if (!newMembers.includes(userId)) {
              newMembers.push(userId);
            }
          });
          return { ...community, members: newMembers };
        }
        return community;
      }));
    }
  };

  const joinCommunity = (communityId: string) => {
    setCommunities(prev => prev.map(community => {
      if (community.id === communityId && !community.members.includes(currentUser.id)) {
        return {
          ...community,
          members: [...community.members, currentUser.id]
        };
      }
      return community;
    }));
  };

  if (activeCommunity) {
    const community = communities.find(c => c.id === activeCommunity);
    if (community) {
      return (
        <>
          <Header />
          <div className="flex-1 bg-gradient-to-br from-gray-900 to-black text-white">
            <div className="bg-gray-800 border-b border-gray-700 p-6">
              <div className="max-w-6xl mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => setActiveCommunity(null)}
                    className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg transition-colors"
                  >
                    ←
                  </button>
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl font-bold">
                    {community.avatar}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">{community.name}</h1>
                    <p className="text-gray-400">{community.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="flex items-center space-x-1">
                        <Users size={16} />
                        <span>{community.members.length} membros</span>
                      </span>
                      <span className="text-gray-500">•</span>
                      <span>{community.category}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => {
                      setSelectedCommunity(community.id);
                      setShowAddPeople(true);
                    }}
                    className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 transition-colors"
                  >
                    <UserPlus size={18} />
                    <span>Convidar</span>
                  </button>
                  <button className="bg-gray-600 hover:bg-gray-700 p-2 rounded-lg transition-colors">
                    <Settings size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div className="max-w-6xl mx-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-6">
                  <div className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <Hash size={20} className="text-gray-400" />
                      <h2 className="text-lg font-semibold">geral</h2>
                      <Pin size={16} className="text-gray-400" />
                    </div>
                    
                    <div className="h-64 bg-gray-900 rounded-lg p-4 mb-4 overflow-y-auto">
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm">
                            🧑‍💻
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-blue-400">Você</span>
                              <span className="text-xs text-gray-500">agora</span>
                            </div>
                            <p className="text-gray-300">Olá pessoal! Como estão? 👋</p>
                          </div>
                        </div>
                        
                        {community.members.slice(1, 3).map((memberId, index) => {
                          const member = users.find(u => u.id === memberId);
                          if (!member) return null;
                          return (
                            <div key={member.id} className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-sm">
                                {member.avatar}
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold text-green-400">{member.name}</span>
                                  <span className="text-xs text-gray-500">{index + 1}min atrás</span>
                                </div>
                                <p className="text-gray-300">
                                  {["Tudo bem! Bem-vindo à comunidade! 🎉", "Oi! Que bom ter você aqui! 😊"][index]}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <input 
                        type="text" 
                        placeholder="Digite sua mensagem..." 
                        className="flex-1 bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button className="bg-purple-600 hover:bg-purple-700 px-4 py-3 rounded-lg font-semibold transition-colors">
                        Enviar
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Users size={20} className="mr-2" />
                      Membros ({community.members.length})
                    </h3>
                    <div className="space-y-3">
                      {community.members.map(memberId => {
                        const member = users.find(u => u.id === memberId);
                        if (!member) return null;
                        return (
                          <div key={member.id} className="flex items-center space-x-3">
                            <div className="relative">
                              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-sm">
                                {member.avatar}
                              </div>
                              {member.isOnline && (
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{member.name}</p>
                              <p className="text-xs text-gray-400">
                                {member.id === currentUser.id ? "Você" : 
                                 member.isOnline ? "Online" : member.lastSeen}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      );
    }
  }

  return (
    <>
      <Header />
      <div className="flex-1 p-6 text-white bg-gradient-to-br from-gray-900 to-black">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Comunidades
              </h1>
              <p className="text-gray-400 mt-2">Conecte-se com pessoas que compartilham seus interesses</p>
            </div>
            <button 
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-all duration-200 transform hover:scale-105"
            >
              <Plus size={20} />
              <span>Criar Comunidade</span>
            </button>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Pesquisar comunidades..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-700 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex space-x-2 overflow-x-auto">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                      selectedCategory === category 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCommunities.map((community) => (
              <div key={community.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 transform hover:scale-105 transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-lg font-bold">
                      {community.avatar}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{community.name}</h3>
                      <p className="text-sm text-gray-400">{community.category}</p>
                    </div>
                  </div>
                  {community.isPrivate && (
                    <span className="bg-yellow-600 text-white px-2 py-1 rounded text-xs">
                      Privada
                    </span>
                  )}
                </div>

                <p className="text-gray-300 mb-4 line-clamp-2">{community.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span className="flex items-center space-x-1">
                      <Users size={16} />
                      <span>{community.members.length} membros</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar size={16} />
                      <span>
                        {Math.floor((Date.now() - community.createdAt.getTime()) / (1000 * 60 * 60 * 24))}d
                      </span>
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {community.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="bg-purple-600/20 text-purple-400 px-2 py-1 rounded text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex space-x-2">
                  {community.members.includes(currentUser.id) ? (
                    <button 
                      onClick={() => setActiveCommunity(community.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Abrir
                    </button>
                  ) : (
                    <button 
                      onClick={() => joinCommunity(community.id)}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Participar
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setSelectedCommunity(community.id);
                      setShowAddPeople(true);
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-lg transition-colors"
                  >
                    <UserPlus size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {showCreateForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Criar Nova Comunidade</h2>
                  <button 
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nome da Comunidade</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Ex: Gamers Brasil" 
                      className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Categoria</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.slice(1).map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Descrição</label>
                    <textarea 
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Descreva sua comunidade..." 
                      className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Tags (separadas por vírgula)</label>
                    <input 
                      type="text" 
                      value={formData.tags}
                      onChange={(e) => setFormData({...formData, tags: e.target.value})}
                      placeholder="gaming, brasil, diversão" 
                      className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <input 
                      type="checkbox" 
                      id="private"
                      checked={formData.isPrivate}
                      onChange={(e) => setFormData({...formData, isPrivate: e.target.checked})}
                      className="w-5 h-5"
                    />
                    <label htmlFor="private" className="text-sm">
                      Comunidade privada (apenas por convite)
                    </label>
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button 
                      onClick={() => setShowCreateForm(false)}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={handleCreateCommunity}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                      Criar Comunidade
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <AddPeopleModal
            isOpen={showAddPeople}
            onClose={() => setShowAddPeople(false)}
            onAddPeople={handleAddPeople}
            title="Adicionar Pessoas"
            description="Convide pessoas para participar da comunidade"
          />
        </div>
      </div>
    </>
  );
}
