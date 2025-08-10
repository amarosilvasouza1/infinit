'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const handleRedirectToAuth = () => {
    router.push('/auth');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1f2937 0%, #7c3aed 50%, #be185d 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: 'rgba(17, 24, 39, 0.9)',
        padding: '2rem',
        borderRadius: '16px',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center' as const
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>∞ Infinit</h1>
        <p style={{ marginBottom: '2rem', color: '#9ca3af' }}>
          Login simplificado - Use /auth para funcionalidade completa
        </p>
        
        <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="email"
            placeholder="Email"
            style={{
              padding: '1rem',
              borderRadius: '8px',
              border: 'none',
              background: 'rgba(31, 41, 55, 0.8)',
              color: 'white',
              fontSize: '1rem'
            }}
          />
          <input
            type="password"
            placeholder="Senha"
            style={{
              padding: '1rem',
              borderRadius: '8px',
              border: 'none',
              background: 'rgba(31, 41, 55, 0.8)',
              color: 'white',
              fontSize: '1rem'
            }}
          />
          <button
            type="button"
            onClick={handleRedirectToAuth}
            style={{
              padding: '1rem',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #7c3aed, #be185d)',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Ir para Login Completo (/auth)
          </button
            type="submit"
            style={{
              padding: '1rem',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(45deg, #7c3aed, #ec4899)',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('Erro ao fazer parse do JSON login:', responseText);
        throw new Error(`Erro de resposta do servidor: ${responseText.substring(0, 100)}`);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Erro no login');
      }

      // Salvar dados do usuário usando StorageManager
      const userData = data.user;
      const success = storageManager.smartSave('infinit-current-user', userData);
      
      if (success) {
        localStorage.setItem('infinit-user-id', userData.id);
        localStorage.setItem('infinit-authenticated', 'true');
        console.log('✅ Login realizado com sucesso!');
      } else {
        console.warn('⚠️ Dados salvos com limitações de armazenamento');
      }

      // Redirecionar para a página principal
      router.push('/conversas');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado no login');
      console.error('Erro no login:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validações
    if (registerData.password !== registerData.confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: registerData.name,
          username: registerData.username,
          email: registerData.email,
          password: registerData.password,
          bio: registerData.bio,
          location: registerData.location,
          website: registerData.website,
          birthDate: registerData.birthDate
        }),
      });

      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('Erro ao fazer parse do JSON register:', responseText);
        throw new Error(`Erro de resposta do servidor: ${responseText.substring(0, 100)}`);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Erro no registro');
      }

      // Salvar dados do usuário usando StorageManager
      const userData = data.user;
      const success = storageManager.smartSave('infinit-current-user', userData);
      
      if (success) {
        localStorage.setItem('infinit-user-id', userData.id);
        localStorage.setItem('infinit-authenticated', 'true');
        console.log('✅ Registro realizado com sucesso!');
      } else {
        console.warn('⚠️ Dados salvos com limitações de armazenamento');
      }

      // Redirecionar para a página principal
      router.push('/conversas');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado no registro');
      console.error('Erro no registro:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
      <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md border border-gray-700/50">
        {/* Header with Tabs */}
        <div className="p-8 pb-0">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">∞</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Infinit</h1>
            <p className="text-gray-400">Conecte-se com o mundo</p>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl bg-gray-800/50 p-1 mb-6">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'login'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'register'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              Registrar
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 pt-0">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    required
                    placeholder="seu@email.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl pl-11 pr-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Sua senha"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl pl-11 pr-12 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Entrando...
                  </div>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nome
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      required
                      placeholder="Seu nome"
                      value={registerData.name}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="@username"
                    value={registerData.username}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    required
                    placeholder="seu@email.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Senha"
                      value={registerData.password}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirmar
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Confirmar senha"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bio (opcional)
                </label>
                <textarea
                  placeholder="Conte sobre você..."
                  rows={3}
                  value={registerData.bio}
                  onChange={(e) => setRegisterData(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Localização
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Cidade, Estado"
                      value={registerData.location}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Website
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="url"
                      placeholder="https://..."
                      value={registerData.website}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Data de Nascimento
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="date"
                    value={registerData.birthDate}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, birthDate: e.target.value }))}
                    className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Registrando...
                  </div>
                ) : (
                  'Criar Conta'
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              {showPassword ? '🙈 Ocultar senhas' : '👁️ Mostrar senhas'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
