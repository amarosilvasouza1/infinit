'use client';

import Link from 'next/link';
import Header from '@/components/layout/Header';
import { useStorageTest } from '@/hooks/useStorageTest';

export default function Home() {
  // Executar testes de storage em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    useStorageTest();
  }
  return (
    <>
      <Header />
      <div className="flex-1 flex items-center justify-center p-6 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              infinit
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Sua nova experiência de comunicação e conexão social
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Link href="/conversas" className="group">
              <div className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">💬</div>
                <h3 className="text-lg font-semibold mb-2">Conversas</h3>
                <p className="text-gray-400 text-sm">Chat com suporte a mídias, áudio e chamadas em grupo</p>
              </div>
            </Link>

            <Link href="/perfil" className="group">
              <div className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">👤</div>
                <h3 className="text-lg font-semibold mb-2">Perfil</h3>
                <p className="text-gray-400 text-sm">Personalize seu perfil com avatar, banner, galeria e conquistas</p>
              </div>
            </Link>

            <Link href="/status" className="group">
              <div className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📸</div>
                <h3 className="text-lg font-semibold mb-2">Status & Reals</h3>
                <p className="text-gray-400 text-sm">Compartilhe momentos e acompanhe atualizações</p>
              </div>
            </Link>

            <Link href="/festa" className="group">
              <div className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🎉</div>
                <h3 className="text-lg font-semibold mb-2">Festas</h3>
                <p className="text-gray-400 text-sm">Participe de eventos e celebrações ao vivo</p>
              </div>
            </Link>

            <Link href="/comunidade" className="group">
              <div className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">👥</div>
                <h3 className="text-lg font-semibold mb-2">Comunidade</h3>
                <p className="text-gray-400 text-sm">Conecte-se com pessoas que compartilham seus interesses</p>
              </div>
            </Link>

            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-lg font-semibold mb-2">Recursos Premium</h3>
              <p className="text-gray-200 text-sm">Temas personalizados, backup na nuvem e muito mais</p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-4">🚀 Funcionalidades Implementadas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div>
                <h3 className="text-lg font-semibold text-purple-400 mb-3">Chat & Comunicação</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>✅ Mensagens de texto, áudio e mídia</li>
                  <li>✅ Chamadas de voz individuais e em grupo</li>
                  <li>✅ Compartilhamento de tela múltiplo</li>
                  <li>✅ Interface minimizável e arrastável</li>
                  <li>✅ Efeitos sonoros e animações</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-purple-400 mb-3">Perfil & Personalização</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>✅ Avatar e banner personalizáveis</li>
                  <li>✅ Galeria de fotos e vídeos</li>
                  <li>✅ Sistema de conquistas</li>
                  <li>✅ Status personalizados</li>
                  <li>✅ Backup e sincronização</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-gray-700 rounded-lg">
              <h3 className="text-lg font-semibold text-green-400 mb-3">🎯 Destaques Técnicos</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
                <div>
                  <h4 className="font-medium mb-2">Interface</h4>
                  <p>Transições suaves, animações fluidas e responsividade completa</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Estado Global</h4>
                  <p>Contextos React para gerenciar dados persistentes e sincronizados</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Performance</h4>
                  <p>Otimizações de renderização e carregamento lazy de componentes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
