'use client';

import { useEffect } from 'react';

export function useDataPersistence() {
  useEffect(() => {
    // Função para limpar dados antigos e gerenciar quota
    const cleanupStorage = () => {
      try {
        // Limpar dados temporários antigos
        const keysToCheck = ['infinit-temp-', 'infinit-cache-', 'infinit-backup-'];
        
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            for (const prefix of keysToCheck) {
              if (key.startsWith(prefix)) {
                localStorage.removeItem(key);
              }
            }
          }
        }
        
        // Verificar tamanho atual do localStorage
        let totalSize = 0;
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            const value = localStorage.getItem(key);
            if (value) {
              totalSize += value.length;
            }
          }
        }
        
        console.log(`LocalStorage usage: ${(totalSize / 1024).toFixed(2)} KB`);
        
        // Se estiver muito cheio, fazer limpeza agressiva
        if (totalSize > 8 * 1024 * 1024) { // 8MB
          console.warn('LocalStorage quase cheio, fazendo limpeza...');
          
          // Manter apenas dados essenciais
          const essential = localStorage.getItem('infinit-current-user');
          const auth = localStorage.getItem('infinit-authenticated');
          const userId = localStorage.getItem('infinit-user-id');
          
          // Limpar tudo
          localStorage.clear();
          
          // Restaurar apenas o essencial
          if (essential) localStorage.setItem('infinit-current-user', essential);
          if (auth) localStorage.setItem('infinit-authenticated', auth);
          if (userId) localStorage.setItem('infinit-user-id', userId);
        }
      } catch (error) {
        console.warn('Erro na limpeza do storage:', error);
      }
    };

    // Função para sincronizar dados quando a página é carregada
    const syncUserData = async () => {
      try {
        // Primeiro verificar sessionStorage (dados completos da sessão)
        const sessionUser = sessionStorage.getItem('infinit-session-user');
        if (sessionUser) {
          try {
            const userData = JSON.parse(sessionUser);
            window.dispatchEvent(new CustomEvent('userDataUpdated', { 
              detail: userData 
            }));
            return; // Se tem dados da sessão, usar eles
          } catch (error) {
            console.warn('Erro ao processar dados da sessão:', error);
            sessionStorage.removeItem('infinit-session-user');
          }
        }

        // Se não tem dados da sessão, buscar do localStorage e API
        const storedUser = localStorage.getItem('infinit-current-user');
        const isAuthenticated = localStorage.getItem('infinit-authenticated');
        const userId = localStorage.getItem('infinit-user-id');
        
        if ((storedUser || userId) && isAuthenticated === 'true') {
          let userIdToFetch = userId;
          
          if (storedUser) {
            try {
              const userData = JSON.parse(storedUser);
              userIdToFetch = userData.id;
            } catch (error) {
              console.warn('Erro ao processar dados do localStorage:', error);
            }
          }
          
          if (userIdToFetch) {
            // Buscar dados completos da API
            const response = await fetch(`/api/user/${userIdToFetch}`);
            if (response.ok) {
              const dbUser = await response.json();
              
              // Salvar na sessão para próximas consultas
              try {
                sessionStorage.setItem('infinit-session-user', JSON.stringify(dbUser));
              } catch (sessionError) {
                console.warn('Erro ao salvar na sessão:', sessionError);
              }
              
              // Disparar evento para atualizar componentes
              window.dispatchEvent(new CustomEvent('userDataUpdated', { 
                detail: dbUser 
              }));
            }
          }
        }
      } catch (error) {
        console.warn('Erro ao sincronizar dados do usuário:', error);
      }
    };

    // Executar limpeza e sincronização
    cleanupStorage();
    syncUserData();

    // Sincronizar dados quando o foco retorna à aba
    const handleFocus = () => {
      syncUserData();
    };

    // Sincronizar dados quando o localStorage é atualizado em outra aba
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'infinit-current-user' && e.newValue) {
        try {
          const newUserData = JSON.parse(e.newValue);
          window.dispatchEvent(new CustomEvent('userDataUpdated', { 
            detail: newUserData 
          }));
        } catch (error) {
          console.warn('Erro ao processar mudança no localStorage:', error);
        }
      }
    };

    // Limpeza periódica (a cada 30 minutos)
    const cleanupInterval = setInterval(cleanupStorage, 30 * 60 * 1000);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(cleanupInterval);
    };
  }, []);
}

// Hook para garantir que as alterações sejam salvas no banco
export function useAutoSave() {
  const saveToDatabase = async (userData: any) => {
    try {
      const response = await fetch('/api/user/current', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.id,
          ...userData
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao salvar dados');
      }

      const result = await response.json();
      
      // Salvar na sessão após sucesso
      try {
        sessionStorage.setItem('infinit-session-user', JSON.stringify(result));
      } catch (sessionError) {
        console.warn('Erro ao salvar na sessão:', sessionError);
      }

      return result;
    } catch (error) {
      console.error('Erro ao salvar dados no banco:', error);
      throw error;
    }
  };

  return { saveToDatabase };
}
