'use client';

import { useState, useRef } from "react";
import Header from "@/components/layout/Header";
import { useApp } from "@/contexts/AppContext";
import { useProfile } from "@/contexts/ProfileContext";
import { useCurrentUser, useUserAvatar, useUserInitial } from "@/hooks/useUser";
import { Camera, Video, Smile, Send, Heart, MessageCircle, Share, Eye, Plus, X } from "lucide-react";

export default function StatusPage() {
  const { statusPosts, createStatus, likeStatus, commentStatus, currentUser } = useApp();
  const { profile } = useProfile();
  const currentUserData = useCurrentUser();
  const userAvatar = useUserAvatar();
  const userInitial = useUserInitial();
  
  const [newStatusText, setNewStatusText] = useState("");
  const [selectedMood, setSelectedMood] = useState("");
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [activeComments, setActiveComments] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const moods = [
    { emoji: "😊", label: "Feliz" },
    { emoji: "😍", label: "Apaixonado" },
    { emoji: "🤔", label: "Pensativo" },
    { emoji: "😴", label: "Cansado" },
    { emoji: "🎉", label: "Celebrando" },
    { emoji: "💪", label: "Motivado" },
    { emoji: "🌟", label: "Inspirado" },
    { emoji: "☕", label: "Café" },
    { emoji: "🎵", label: "Ouvindo música" },
    { emoji: "📚", label: "Estudando" },
    { emoji: "🏃‍♂️", label: "Exercitando" },
    { emoji: "🍕", label: "Comendo" }
  ];

  const handleCreateStatus = () => {
    if (newStatusText.trim()) {
      createStatus({
        content: newStatusText,
        mood: selectedMood
      });
      setNewStatusText("");
      setSelectedMood("");
    }
  };

  const handleComment = (statusId: string) => {
    if (commentText.trim()) {
      commentStatus(statusId, commentText);
      setCommentText("");
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "agora";
    if (diffInMinutes < 60) return `${diffInMinutes}min atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return `${Math.floor(diffInMinutes / 1440)}d atrás`;
  };

  return (
    <>
      <Header />
      <div className="flex-1 p-6 text-white bg-gradient-to-br from-gray-900 to-black">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent text-center">
            Status
          </h1>
          
          {/* Criar novo status */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-gray-700">
            <div className="flex items-start space-x-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center overflow-hidden">
                {userAvatar ? (
                  <img 
                    src={userAvatar} 
                    alt={currentUserData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-bold">{userInitial}</span>
                )}
              </div>
              <div className="flex-grow">
                <textarea 
                  value={newStatusText}
                  onChange={(e) => setNewStatusText(e.target.value)}
                  placeholder="No que você está pensando?" 
                  className="w-full bg-transparent text-white placeholder-gray-400 resize-none focus:outline-none text-lg"
                  rows={3}
                />
              </div>
            </div>
            
            {/* Mood Selector */}
            {selectedMood && (
              <div className="flex items-center space-x-2 mb-4 p-3 bg-gray-700/50 rounded-lg">
                <span className="text-2xl">{selectedMood}</span>
                <span className="text-sm text-gray-300">
                  {moods.find(m => m.emoji === selectedMood)?.label}
                </span>
                <button 
                  onClick={() => setSelectedMood("")}
                  className="ml-auto text-gray-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Camera size={20} />
                  <span>Foto</span>
                </button>
                <button className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors">
                  <Video size={20} />
                  <span>Vídeo</span>
                </button>
                <div className="relative">
                  <button 
                    onClick={() => setShowMoodPicker(!showMoodPicker)}
                    className="flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 transition-colors"
                  >
                    <Smile size={20} />
                    <span>Humor</span>
                  </button>
                  
                  {showMoodPicker && (
                    <div className="absolute top-full left-0 mt-2 bg-gray-800 rounded-lg p-4 shadow-xl z-10 grid grid-cols-4 gap-2 min-w-[200px]">
                      {moods.map((mood) => (
                        <button
                          key={mood.emoji}
                          onClick={() => {
                            setSelectedMood(mood.emoji);
                            setShowMoodPicker(false);
                          }}
                          className="p-2 rounded hover:bg-gray-700 transition-colors text-center"
                          title={mood.label}
                        >
                          <div className="text-xl">{mood.emoji}</div>
                          <div className="text-xs text-gray-400">{mood.label}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <button 
                onClick={handleCreateStatus}
                disabled={!newStatusText.trim()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2"
              >
                <Send size={16} />
                <span>Publicar</span>
              </button>
            </div>
            
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*,video/*" 
              className="hidden" 
            />
          </div>

          {/* Stories */}
          <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
            {/* Seu story */}
            <div className="flex-shrink-0">
              <div className="relative w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center cursor-pointer group">
                <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Plus size={32} className="text-white" />
              </div>
              <p className="text-xs text-center mt-2 text-gray-400">Seu story</p>
            </div>

            {/* Stories de amigos */}
            {statusPosts.slice(0, 6).map((post) => (
              <div key={`story-${post.id}`} className="flex-shrink-0">
                <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full p-1 cursor-pointer">
                  <div className="w-full h-full bg-gray-800 rounded-full flex items-center justify-center">
                    <span className="text-lg">{post.user.avatar}</span>
                  </div>
                  {post.user.isOnline && (
                    <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
                  )}
                </div>
                <p className="text-xs text-center mt-2 text-gray-400 truncate w-20">
                  {post.user.name}
                </p>
              </div>
            ))}
          </div>

          {/* Posts de status */}
          <div className="space-y-6">
            {statusPosts.map((post) => (
              <div key={post.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                {/* Header do post */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <span className="text-lg">{post.user.avatar}</span>
                    </div>
                    {post.user.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-white">{post.user.name}</h3>
                      {post.mood && (
                        <span className="text-lg">{post.mood}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">{formatTimeAgo(post.timestamp)}</p>
                  </div>
                  <button className="text-gray-400 hover:text-white">
                    •••
                  </button>
                </div>

                {/* Conteúdo do post */}
                <div className="mb-4">
                  <p className="text-white text-lg leading-relaxed">{post.content}</p>
                  
                  {post.media && (
                    <div className="mt-4 rounded-lg overflow-hidden">
                      {post.media.type === 'image' ? (
                        <div className="w-full h-64 bg-gray-700 rounded-lg flex items-center justify-center">
                          <Camera size={32} className="text-gray-400" />
                        </div>
                      ) : (
                        <div className="w-full h-64 bg-gray-700 rounded-lg flex items-center justify-center">
                          <Video size={32} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Estatísticas */}
                <div className="flex items-center justify-between mb-4 text-sm text-gray-400">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <Eye size={16} />
                      <span>{post.views}</span>
                    </span>
                    <span>{post.likes.length} curtidas</span>
                    <span>{post.comments.length} comentários</span>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center justify-between border-t border-gray-700 pt-4">
                  <button 
                    onClick={() => likeStatus(post.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      post.likes.includes(currentUser.id)
                        ? 'text-red-500 bg-red-500/10'
                        : 'text-gray-400 hover:text-red-500 hover:bg-red-500/10'
                    }`}
                  >
                    <Heart size={18} fill={post.likes.includes(currentUser.id) ? 'currentColor' : 'none'} />
                    <span>Curtir</span>
                  </button>
                  
                  <button 
                    onClick={() => setActiveComments(activeComments === post.id ? null : post.id)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 transition-all"
                  >
                    <MessageCircle size={18} />
                    <span>Comentar</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-400 hover:text-green-500 hover:bg-green-500/10 transition-all">
                    <Share size={18} />
                    <span>Compartilhar</span>
                  </button>
                </div>

                {/* Comentários */}
                {activeComments === post.id && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    {/* Comentários existentes */}
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="flex items-start space-x-3 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm">{comment.user.avatar}</span>
                        </div>
                        <div className="flex-grow">
                          <div className="bg-gray-700 rounded-lg p-3">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-semibold text-sm">{comment.user.name}</span>
                              <span className="text-xs text-gray-400">{formatTimeAgo(comment.timestamp)}</span>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                            <button className="hover:text-red-500">Curtir</button>
                            <button className="hover:text-blue-500">Responder</button>
                            <span>{comment.likes.length} curtidas</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Adicionar comentário */}
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {userAvatar ? (
                          <img 
                            src={userAvatar} 
                            alt={currentUserData.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm">{userInitial}</span>
                        )}
                      </div>
                      <div className="flex-grow flex space-x-2">
                        <input 
                          type="text" 
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Escreva um comentário..." 
                          className="flex-1 bg-gray-700 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          onKeyPress={(e) => e.key === 'Enter' && handleComment(post.id)}
                        />
                        <button 
                          onClick={() => handleComment(post.id)}
                          disabled={!commentText.trim()}
                          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
