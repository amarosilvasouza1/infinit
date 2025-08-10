'use client';

import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const redirectToAuth = () => {
    router.push('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
      <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md border border-gray-700/50 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">∞</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Infinit</h1>
          <p className="text-gray-400 mb-8">Página de redirecionamento</p>
          
          <div className="space-y-4">
            <p className="text-gray-300">
              Esta é uma página de redirecionamento simples.
            </p>
            <p className="text-gray-400 text-sm">
              Para funcionalidade completa de login e registro, clique no botão abaixo:
            </p>
            
            <button
              onClick={redirectToAuth}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Ir para Login Completo (/auth)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
