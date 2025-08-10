'use client';

import Header from "@/components/layout/Header";
import { useProfile } from "@/contexts/ProfileContext";

export default function RealsPage() {
  const { profile } = useProfile();
  
  return (
    <>
      <Header />
      <div className="flex-1 p-6 text-white">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Reals</h1>
          
          {/* Criar novo real */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Compartilhe um momento real</h2>
              <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-colors">
                📸 Criar Real
              </button>
            </div>
            <p className="text-gray-400">Mostre o que você está fazendo agora, sem filtros, sem edição!</p>
          </div>

          {/* Grid de reals */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Real 1 */}
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="relative">
                {/* Simulação de foto/vídeo */}
                <div className="w-full h-80 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-6xl mb-2 block">🍕</span>
                    <p className="text-lg font-semibold">Jantar da noite!</p>
                  </div>
                </div>
                
                {/* Avatar e nome */}
                <div className="absolute top-4 left-4 flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
                    J
                  </div>
                  <span className="text-white font-semibold text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                    João
                  </span>
                </div>
                
                {/* Timestamp */}
                <div className="absolute top-4 right-4">
                  <span className="text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                    2h atrás
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <p className="text-sm mb-3">Pizza caseira que eu fiz! Ficou uma delícia 😋</p>
                
                <div className="flex justify-between items-center">
                  <div className="flex space-x-4">
                    <button className="flex items-center space-x-1 text-red-400 hover:text-red-300">
                      <span>❤️</span>
                      <span className="text-sm">18</span>
                    </button>
                    <button className="flex items-center space-x-1 text-blue-400 hover:text-blue-300">
                      <span>💬</span>
                      <span className="text-sm">5</span>
                    </button>
                  </div>
                  <button className="text-gray-400 hover:text-white">
                    <span>⚡</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Real 2 */}
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="relative">
                <div className="w-full h-80 bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-6xl mb-2 block">🎮</span>
                    <p className="text-lg font-semibold">Gaming time!</p>
                  </div>
                </div>
                
                <div className="absolute top-4 left-4 flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-sm font-bold">
                    M
                  </div>
                  <span className="text-white font-semibold text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                    Maria
                  </span>
                </div>
                
                <div className="absolute top-4 right-4">
                  <span className="text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                    30min atrás
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <p className="text-sm mb-3">Zerando mais um jogo hoje! Quem quer jogar comigo?</p>
                
                <div className="flex justify-between items-center">
                  <div className="flex space-x-4">
                    <button className="flex items-center space-x-1 text-red-400 hover:text-red-300">
                      <span>❤️</span>
                      <span className="text-sm">12</span>
                    </button>
                    <button className="flex items-center space-x-1 text-blue-400 hover:text-blue-300">
                      <span>💬</span>
                      <span className="text-sm">8</span>
                    </button>
                  </div>
                  <button className="text-gray-400 hover:text-white">
                    <span>⚡</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Real 3 */}
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="relative">
                <div className="w-full h-80 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-6xl mb-2 block">☕</span>
                    <p className="text-lg font-semibold">Café da manhã</p>
                  </div>
                </div>
                
                <div className="absolute top-4 left-4 flex items-center space-x-2">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold">
                    A
                  </div>
                  <span className="text-white font-semibold text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                    Ana
                  </span>
                </div>
                
                <div className="absolute top-4 right-4">
                  <span className="text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                    1h atrás
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <p className="text-sm mb-3">Começando o dia com energia! ☀️</p>
                
                <div className="flex justify-between items-center">
                  <div className="flex space-x-4">
                    <button className="flex items-center space-x-1 text-red-400 hover:text-red-300">
                      <span>❤️</span>
                      <span className="text-sm">25</span>
                    </button>
                    <button className="flex items-center space-x-1 text-blue-400 hover:text-blue-300">
                      <span>💬</span>
                      <span className="text-sm">3</span>
                    </button>
                  </div>
                  <button className="text-gray-400 hover:text-white">
                    <span>⚡</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Real 4 */}
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="relative">
                <div className="w-full h-80 bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-6xl mb-2 block">🏋️</span>
                    <p className="text-lg font-semibold">Treino pesado!</p>
                  </div>
                </div>
                
                <div className="absolute top-4 left-4 flex items-center space-x-2">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-sm font-bold">
                    C
                  </div>
                  <span className="text-white font-semibold text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                    Carlos
                  </span>
                </div>
                
                <div className="absolute top-4 right-4">
                  <span className="text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                    45min atrás
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <p className="text-sm mb-3">Academia liberada! 💪 Quem vem treinar comigo amanhã?</p>
                
                <div className="flex justify-between items-center">
                  <div className="flex space-x-4">
                    <button className="flex items-center space-x-1 text-red-400 hover:text-red-300">
                      <span>❤️</span>
                      <span className="text-sm">15</span>
                    </button>
                    <button className="flex items-center space-x-1 text-blue-400 hover:text-blue-300">
                      <span>💬</span>
                      <span className="text-sm">12</span>
                    </button>
                  </div>
                  <button className="text-gray-400 hover:text-white">
                    <span>⚡</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Real 5 */}
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="relative">
                <div className="w-full h-80 bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-6xl mb-2 block">📚</span>
                    <p className="text-lg font-semibold">Estudando</p>
                  </div>
                </div>
                
                <div className="absolute top-4 left-4 flex items-center space-x-2">
                  <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-sm font-bold">
                    L
                  </div>
                  <span className="text-white font-semibold text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                    Lucas
                  </span>
                </div>
                
                <div className="absolute top-4 right-4">
                  <span className="text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                    3h atrás
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <p className="text-sm mb-3">Foco total nos estudos hoje! 🎯</p>
                
                <div className="flex justify-between items-center">
                  <div className="flex space-x-4">
                    <button className="flex items-center space-x-1 text-red-400 hover:text-red-300">
                      <span>❤️</span>
                      <span className="text-sm">9</span>
                    </button>
                    <button className="flex items-center space-x-1 text-blue-400 hover:text-blue-300">
                      <span>💬</span>
                      <span className="text-sm">4</span>
                    </button>
                  </div>
                  <button className="text-gray-400 hover:text-white">
                    <span>⚡</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Real 6 */}
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="relative">
                <div className="w-full h-80 bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-6xl mb-2 block">🎵</span>
                    <p className="text-lg font-semibold">Show ao vivo!</p>
                  </div>
                </div>
                
                <div className="absolute top-4 left-4 flex items-center space-x-2">
                  <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-sm font-bold">
                    R
                  </div>
                  <span className="text-white font-semibold text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                    Roberta
                  </span>
                </div>
                
                <div className="absolute top-4 right-4">
                  <span className="text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                    AO VIVO
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <p className="text-sm mb-3">Curtindo esse show incrível! A música está demais! 🔥</p>
                
                <div className="flex justify-between items-center">
                  <div className="flex space-x-4">
                    <button className="flex items-center space-x-1 text-red-400 hover:text-red-300">
                      <span>❤️</span>
                      <span className="text-sm">42</span>
                    </button>
                    <button className="flex items-center space-x-1 text-blue-400 hover:text-blue-300">
                      <span>💬</span>
                      <span className="text-sm">18</span>
                    </button>
                  </div>
                  <button className="text-gray-400 hover:text-white">
                    <span>⚡</span>
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
