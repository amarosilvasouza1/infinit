'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import StorageManager from '@/utils/StorageManager';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const storageManager = StorageManager.getInstance();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro no login');
      }

      const data = await response.json();
      const userData = data.user;
      
      storageManager.smartSave('infinit-current-user', userData);
      localStorage.setItem('infinit-user-id', userData.id);
      localStorage.setItem('infinit-authenticated', 'true');
      
      router.push('/conversas');
    } catch (err: any) {
      setError(err.message || 'Erro no login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          username: username.startsWith('@') ? username : `@${username}`,
          email,
          password,
          bio: '',
          location: '',
          website: '',
          birthDate: ''
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro no registro');
      }

      const data = await response.json();
      const userData = data.user;
      
      storageManager.smartSave('infinit-current-user', userData);
      localStorage.setItem('infinit-user-id', userData.id);
      localStorage.setItem('infinit-authenticated', 'true');
      
      router.push('/conversas');
    } catch (err: any) {
      setError(err.message || 'Erro no registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1f2937 0%, #7c3aed 50%, #be185d 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        background: 'rgba(17, 24, 39, 0.9)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '2rem',
        width: '100%',
        maxWidth: '400px',
        border: '1px solid rgba(75, 85, 99, 0.3)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(45deg, #7c3aed, #ec4899)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            fontSize: '32px',
            fontWeight: 'bold',
            color: 'white'
          }}>
            ∞
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', margin: '0 0 0.5rem' }}>
            Infinit
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '1.1rem' }}>
            Conecte-se com o infinito
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          background: 'rgba(31, 41, 55, 0.5)',
          borderRadius: '12px',
          padding: '4px',
          marginBottom: '2rem'
        }}>
          <button
            onClick={() => setIsLogin(true)}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              background: isLogin ? 'linear-gradient(45deg, #7c3aed, #ec4899)' : 'transparent',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            Entrar
          </button>
          <button
            onClick={() => setIsLogin(false)}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              background: !isLogin ? 'linear-gradient(45deg, #7c3aed, #ec4899)' : 'transparent',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            Registrar
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.5rem',
            color: '#fca5a5',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        {/* Forms */}
        {isLogin ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', color: '#d1d5db', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'rgba(31, 41, 55, 0.5)',
                  border: '1px solid rgba(75, 85, 99, 0.5)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', color: '#d1d5db', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                Senha
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'rgba(31, 41, 55, 0.5)',
                  border: '1px solid rgba(75, 85, 99, 0.5)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '1rem',
                background: loading ? '#6b7280' : 'linear-gradient(45deg, #7c3aed, #ec4899)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '0.5rem'
              }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', color: '#d1d5db', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                Nome
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'rgba(31, 41, 55, 0.5)',
                  border: '1px solid rgba(75, 85, 99, 0.5)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#d1d5db', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'rgba(31, 41, 55, 0.5)',
                  border: '1px solid rgba(75, 85, 99, 0.5)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', color: '#d1d5db', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'rgba(31, 41, 55, 0.5)',
                  border: '1px solid rgba(75, 85, 99, 0.5)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', color: '#d1d5db', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                Senha
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'rgba(31, 41, 55, 0.5)',
                  border: '1px solid rgba(75, 85, 99, 0.5)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '1rem',
                background: loading ? '#6b7280' : 'linear-gradient(45deg, #7c3aed, #ec4899)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '0.5rem'
              }}
            >
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <p style={{ color: '#6b7280', fontSize: '0.8rem' }}>
            Feito com ❤️ para conectar pessoas
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
