'use client';

import { useState } from "react";
import Header from "@/components/layout/Header";
import { useApp } from "@/contexts/AppContext";
import { useProfile } from "@/contexts/ProfileContext";
import { Plus, Users, Calendar, Clock, Star, Search, Filter, Volume2, Mic, Video, Settings } from "lucide-react";

export default function FestaPage() {
  const { parties, createParty, joinParty, currentUser } = useApp();
  const { profile } = useProfile();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    maxParticipants: 20,
    tags: "",
    background: "from-purple-800 to-pink-800"
  });
  const [selectedParty, setSelectedParty] = useState<string | null>(null);

  const categories = ["Todas", "🎵 Música", "🎤 Karaokê", "🎮 Gaming", "💬 Bate-papo", "🎬 Assistir juntos"];
  const backgrounds = [
    "from-purple-800 to-pink-800",
    "from-blue-800 to-cyan-800", 
    "from-green-800 to-emerald-800",
    "from-red-800 to-orange-800",
    "from-indigo-800 to-purple-800",
    "from-pink-800 to-rose-800"
  ];

  const filteredParties = parties.filter(party => {
    const matchesSearch = party.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todas" || party.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateParty = () => {
    if (formData.name && formData.type) {
      createParty({
        ...formData,
        isLive: true,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      });
      setFormData({
        name: "",
        description: "",
        type: "",
        maxParticipants: 20,
        tags: "",
        background: "from-purple-800 to-pink-800"
      });
      setShowCreateForm(false);
    }
  };

  const handleJoinParty = (partyId: string) => {
    joinParty(partyId);
    setSelectedParty(partyId);
  };

  if (selectedParty) {
    const party = parties.find(p => p.id === selectedParty);
    if (party) {
      return (
        <>
          <Header />
          <div className="flex-1 bg-gradient-to-br from-gray-900 to-black text-white">
            {/* Party Room Header */}
            <div className={`bg-gradient-to-r ${party.background} p-6 border-b border-gray-700`}>
              <div className="max-w-6xl mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => setSelectedParty(null)}
                    className="bg-black/20 hover:bg-black/40 p-2 rounded-lg transition-colors"
                  >
                    ←
                  </button>
                  <div>
                    <h1 className="text-2xl font-bold">{party.name}</h1>
                    <p className="text-white/80">{party.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="flex items-center space-x-1">
                        <Users size={16} />
                        <span>{party.participants.length}/{party.maxParticipants}</span>
                      </span>
                      {party.isLive && (
                        <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                          AO VIVO
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button className="bg-green-600 hover:bg-green-700 p-3 rounded-lg transition-colors">
                    <Mic size={20} />
                  </button>
                  <button className="bg-blue-600 hover:bg-blue-700 p-3 rounded-lg transition-colors">
                    <Video size={20} />
                  </button>
                  <button className="bg-gray-600 hover:bg-gray-700 p-3 rounded-lg transition-colors">
                    <Settings size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div className="max-w-6xl mx-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-3">
                  <div className="bg-gray-800 rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Área Principal</h2>
                    <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Volume2 size={64} className="mx-auto mb-4 text-purple-500" />
                        <h3 className="text-xl font-semibold mb-2">Festa em Andamento</h3>
                        <p className="text-gray-400">
                          {party.type === "🎵 Música" ? "Música tocando ao vivo" :
                           party.type === "🎤 Karaokê" ? "Sessão de karaokê ativa" :
                           "Atividade em andamento"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Chat da Festa */}
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Chat da Festa</h3>
                    <div className="h-64 bg-gray-900 rounded-lg p-4 mb-4 overflow-y-auto">
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-sm">
                            {party.creator.avatar}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-purple-400">{party.creator.name}</span>
                              <span className="text-xs text-gray-500">agora</span>
                            </div>
                            <p className="text-gray-300">Bem-vindos à festa! 🎉</p>
                          </div>
                        </div>
                        
                        {party.participants.slice(1).map((participant, index) => (
                          <div key={participant.id} className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm">
                              {participant.avatar}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-blue-400">{participant.name}</span>
                                <span className="text-xs text-gray-500">{index + 1}min atrás</span>
                              </div>
                              <p className="text-gray-300">
                                {["Que legal! 😍", "Adorando a festa!", "Som perfeito! 🎵"][index % 3]}
                              </p>
                            </div>
                          </div>
                        ))}
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

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Participantes */}
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Users size={20} className="mr-2" />
                      Participantes ({party.participants.length})
                    </h3>
                    <div className="space-y-3">
                      {party.participants.map((participant) => (
                        <div key={participant.id} className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                              {participant.avatar}
                            </div>
                            {participant.isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold">{participant.name}</p>
                            <p className="text-xs text-gray-400">
                              {participant.id === party.creator.id ? "Organizador" : "Participante"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Controles */}
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Controles</h3>
                    <div className="space-y-3">
                      <button className="w-full bg-red-600 hover:bg-red-700 p-3 rounded-lg font-semibold transition-colors">
                        Sair da Festa
                      </button>
                      <button className="w-full bg-gray-600 hover:bg-gray-700 p-3 rounded-lg font-semibold transition-colors">
                        Convidar Amigos
                      </button>
                      <button className="w-full bg-yellow-600 hover:bg-yellow-700 p-3 rounded-lg font-semibold transition-colors">
                        Denunciar
                      </button>
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
          {/* Header Section */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Festas
              </h1>
              <p className="text-gray-400 mt-2">Conecte-se, divirta-se e compartilhe momentos especiais</p>
            </div>
            <button 
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-all duration-200 transform hover:scale-105"
            >
              <Plus size={20} />
              <span>Criar Festa</span>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Pesquisar festas..." 
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

          {/* Active Parties */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredParties.map((party) => (
              <div key={party.id} className={`bg-gradient-to-br ${party.background} rounded-lg p-6 transform hover:scale-105 transition-all duration-200`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold mb-1">{party.name}</h2>
                    <p className="text-white/80 text-sm">{party.description}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {party.isLive && (
                      <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                        AO VIVO
                      </span>
                    )}
                    <div className="flex items-center space-x-1 text-xs">
                      <Star size={12} className="text-yellow-400" />
                      <span>4.8</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Users size={16} />
                    <span className="text-sm">{party.participants.length}/{party.maxParticipants}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock size={16} />
                    <span className="text-xs">
                      {Math.floor((Date.now() - party.createdAt.getTime()) / 60000)}min
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {party.participants.slice(0, 4).map((participant, index) => (
                      <div 
                        key={participant.id} 
                        className="w-8 h-8 bg-white/20 rounded-full border-2 border-white flex items-center justify-center text-xs"
                      >
                        {participant.avatar}
                      </div>
                    ))}
                    {party.participants.length > 4 && (
                      <div className="w-8 h-8 bg-white/20 rounded-full border-2 border-white flex items-center justify-center text-xs">
                        +{party.participants.length - 4}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => handleJoinParty(party.id)}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-full font-semibold transition-all duration-200"
                  >
                    Entrar
                  </button>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-4">
                  {party.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="bg-white/20 text-xs px-2 py-1 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Create Party Modal */}
          {showCreateForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Criar Nova Festa</h2>
                  <button 
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nome da Festa</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Ex: 🎵 Festa de Música Eletrônica" 
                      className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Tipo de Festa</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Selecione o tipo</option>
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
                      placeholder="Descreva sua festa..." 
                      className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Máximo de Participantes</label>
                    <input 
                      type="number" 
                      value={formData.maxParticipants}
                      onChange={(e) => setFormData({...formData, maxParticipants: parseInt(e.target.value) || 20})}
                      min="2" 
                      max="100"
                      className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Tags (separadas por vírgula)</label>
                    <input 
                      type="text" 
                      value={formData.tags}
                      onChange={(e) => setFormData({...formData, tags: e.target.value})}
                      placeholder="música, eletrônica, dj, festa" 
                      className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Tema/Cor</label>
                    <div className="grid grid-cols-3 gap-3">
                      {backgrounds.map((bg) => (
                        <button
                          key={bg}
                          onClick={() => setFormData({...formData, background: bg})}
                          className={`h-12 rounded-lg bg-gradient-to-r ${bg} ${formData.background === bg ? 'ring-2 ring-white' : ''}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button 
                      onClick={() => setShowCreateForm(false)}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={handleCreateParty}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                      Criar Festa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
