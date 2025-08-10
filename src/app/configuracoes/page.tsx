'use client';

import Header from "@/components/layout/Header";
import { useProfile } from "@/contexts/ProfileContext";
import { useCurrentUser } from '@/hooks/useUserAPI';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import StorageHealth from '@/components/StorageHealth';
import { useState } from 'react';

export default function ConfiguracoesPage() {
  const { profile, updateProfile } = useProfile();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('perfil');

  const handleLogout = () => {
    if (confirm('Tem certeza que deseja sair da sua conta?')) {
      // Limpar todos os dados de sessão
      try {
        localStorage.removeItem('infinit-authenticated');
        localStorage.removeItem('infinit-current-user');
        localStorage.removeItem('infinit-user-id');
        sessionStorage.removeItem('infinit-session-user');
        
        console.log('Dados de sessão limpos com sucesso');
      } catch (error) {
        console.warn('Erro ao limpar dados de sessão:', error);
      }
      
      router.push('/auth');
    }
  };

  const sections = [
    { id: 'perfil', name: 'Perfil', icon: '👤' },
    { id: 'privacidade', name: 'Privacidade', icon: '🔒' },
    { id: 'notificacoes', name: 'Notificações', icon: '🔔' },
    { id: 'aparencia', name: 'Aparência', icon: '🎨' },
    { id: 'conta', name: 'Conta', icon: '⚙️' }
  ];
  
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
          <div className="max-w-6xl mx-auto">
            
            {/* Header da página */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                ⚙️ Configurações
              </h1>
              <p className="text-gray-400">Personalize sua experiência no Infinit Chat</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              
              {/* Menu lateral */}
              <div className="lg:col-span-1">
                <div className="bg-gray-900/40 backdrop-blur-xl rounded-2xl p-4 border border-gray-700/30">
                  <nav className="space-y-2">
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center space-x-3 ${
                          activeSection === section.id
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                        }`}
                      >
                        <span className="text-lg">{section.icon}</span>
                        <span className="font-medium">{section.name}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Conteúdo principal */}
              <div className="lg:col-span-3">
                <div className="bg-gray-900/40 backdrop-blur-xl rounded-2xl border border-gray-700/30 overflow-hidden">
                  <div className="p-6">
                    
                    {activeSection === 'perfil' && (
                      <div>
                        <h2 className="text-2xl font-bold mb-6 flex items-center">
                          <span className="mr-3">👤</span>
                          Configurações do Perfil
                        </h2>
                        
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-300">Nome de usuário</label>
                              <input 
                                type="text" 
                                defaultValue={profile?.name || "Seu Nome"}
                                className="w-full bg-gray-800/50 text-white p-3 rounded-lg border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
                              <input 
                                type="email" 
                                defaultValue={profile?.email || "seuemail@exemplo.com"}
                                className="w-full bg-gray-800/50 text-white p-3 rounded-lg border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-300">Bio</label>
                            <textarea 
                              rows={3}
                              defaultValue={profile?.bio || "Conte um pouco sobre você..."}
                              className="w-full bg-gray-800/50 text-white p-3 rounded-lg border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {activeSection === 'privacidade' && (
                      <div>
                        <h2 className="text-2xl font-bold mb-6 flex items-center">
                          <span className="mr-3">🔒</span>
                          Privacidade e Segurança
                        </h2>
                        
                        <div className="space-y-6">
                          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                            <div>
                              <h3 className="font-semibold">Perfil público</h3>
                              <p className="text-sm text-gray-400">Permitir que outros vejam seu perfil</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" defaultChecked />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                            <div>
                              <h3 className="font-semibold">Status de atividade</h3>
                              <p className="text-sm text-gray-400">Mostrar quando você está online</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" defaultChecked />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeSection === 'notificacoes' && (
                      <div>
                        <h2 className="text-2xl font-bold mb-6 flex items-center">
                          <span className="mr-3">🔔</span>
                          Notificações
                        </h2>
                        
                        <div className="space-y-6">
                          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                            <div>
                              <h3 className="font-semibold">Notificações push</h3>
                              <p className="text-sm text-gray-400">Receber notificações no desktop</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" defaultChecked />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                            <div>
                              <h3 className="font-semibold">Sons de notificação</h3>
                              <p className="text-sm text-gray-400">Reproduzir som ao receber mensagens</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" defaultChecked />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeSection === 'aparencia' && (
                      <div>
                        <h2 className="text-2xl font-bold mb-6 flex items-center">
                          <span className="mr-3">🎨</span>
                          Aparência
                        </h2>
                        
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium mb-3 text-gray-300">Tema</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="p-4 bg-gray-800/30 rounded-lg border-2 border-purple-500 cursor-pointer">
                                <div className="w-full h-20 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg mb-2"></div>
                                <p className="text-center font-medium">Escuro</p>
                              </div>
                              <div className="p-4 bg-gray-800/30 rounded-lg border-2 border-gray-600 cursor-pointer opacity-50">
                                <div className="w-full h-20 bg-gradient-to-br from-gray-100 to-gray-300 rounded-lg mb-2"></div>
                                <p className="text-center font-medium">Claro</p>
                              </div>
                              <div className="p-4 bg-gray-800/30 rounded-lg border-2 border-gray-600 cursor-pointer opacity-50">
                                <div className="w-full h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg mb-2"></div>
                                <p className="text-center font-medium">Colorido</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                            <div>
                              <h3 className="font-semibold">Animações</h3>
                              <p className="text-sm text-gray-400">Ativar animações da interface</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" defaultChecked />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeSection === 'conta' && (
                      <div>
                        <h2 className="text-2xl font-bold mb-6 flex items-center">
                          <span className="mr-3">⚙️</span>
                          Configurações da Conta
                        </h2>
                        
                        <div className="space-y-6">
                          <div className="p-6 bg-gray-800/30 rounded-lg border border-gray-600/30">
                            <h3 className="text-lg font-semibold mb-2">Informações da conta</h3>
                            <div className="space-y-2 text-sm text-gray-400">
                              <p><span className="font-medium">ID:</span> {profile?.id}</p>
                              <p><span className="font-medium">Membro desde:</span> {new Date(profile?.joinDate || '').toLocaleDateString('pt-BR')}</p>
                              <p><span className="font-medium">Plano:</span> {profile?.isPremium ? '⭐ Premium' : 'Gratuito'}</p>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
                            <button className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg">
                              💾 Salvar Configurações
                            </button>
                            
                            <button 
                              onClick={handleLogout}
                              className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-3 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
                            >
                              <span>🚪</span>
                              <span>Sair da Conta</span>
                            </button>
                          </div>

                          {/* Monitor de Armazenamento */}
                          <div className="mt-6 pt-4 border-t border-gray-700/50">
                            <h4 className="text-lg font-semibold text-white mb-3">🗄️ Monitoramento de Armazenamento</h4>
                            <StorageHealth />
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            </div>
            
            {/* Espaçamento final */}
            <div className="h-8"></div>
          </div>
        </div>
      </div>
    </>
  );
}
