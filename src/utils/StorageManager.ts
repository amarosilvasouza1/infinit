'use client';

// Utility para gerenciar storage de forma inteligente
class StorageManager {
  private static instance: StorageManager;
  
  static getInstance() {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  // Verificar espaço disponível no localStorage
  getAvailableSpace(): number {
    try {
      const testKey = 'test-storage-space';
      let currentSize = 0;
      
      // Calcular tamanho atual
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          if (value) {
            currentSize += key.length + value.length;
          }
        }
      }
      
      // Tentar adicionar dados até dar erro
      let testSize = 0;
      const testData = 'x'.repeat(1024); // 1KB
      
      try {
        while (true) {
          localStorage.setItem(testKey + testSize, testData);
          testSize += testData.length;
          
          // Limite de segurança para evitar travamento
          if (testSize > 5 * 1024 * 1024) break; // 5MB
        }
      } catch (e) {
        // Chegou no limite
      }
      
      // Limpar dados de teste
      for (let i = 0; i < testSize / testData.length; i++) {
        localStorage.removeItem(testKey + i);
      }
      
      return testSize;
    } catch (error) {
      console.warn('Erro ao verificar espaço do localStorage:', error);
      return 0;
    }
  }

  // Salvar dados de forma inteligente
  smartSave(key: string, data: any): boolean {
    try {
      const jsonData = JSON.stringify(data);
      
      // Tentar salvar normalmente primeiro
      localStorage.setItem(key, jsonData);
      return true;
    } catch (error) {
      console.warn(`Erro ao salvar ${key}, tentando estratégias alternativas:`, error);
      
      // Estratégia 1: Limpar dados não essenciais
      this.cleanupNonEssentialData();
      
      try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
      } catch (error2) {
        console.warn('Falha na estratégia 1, tentando estratégia 2...');
        
        // Estratégia 2: Salvar versão compacta
        const compactData = this.createCompactVersion(data);
        try {
          localStorage.setItem(key, JSON.stringify(compactData));
          console.log('Dados salvos em versão compacta');
          return true;
        } catch (error3) {
          console.warn('Falha na estratégia 2, tentando sessionStorage...');
          
          // Estratégia 3: Fallback para sessionStorage
          try {
            sessionStorage.setItem(key, JSON.stringify(data));
            localStorage.setItem(key + '-fallback', 'session');
            console.log('Dados salvos no sessionStorage como fallback');
            return true;
          } catch (error4) {
            console.error('Todas as estratégias de salvamento falharam:', error4);
            return false;
          }
        }
      }
    }
  }

  // Recuperar dados de forma inteligente
  smartLoad(key: string): any | null {
    try {
      // Verificar se há fallback para sessionStorage
      const fallbackFlag = localStorage.getItem(key + '-fallback');
      if (fallbackFlag === 'session') {
        const sessionData = sessionStorage.getItem(key);
        if (sessionData) {
          return JSON.parse(sessionData);
        }
      }
      
      // Tentar localStorage normal
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
      
      return null;
    } catch (error) {
      console.warn(`Erro ao carregar ${key}:`, error);
      return null;
    }
  }

  // Limpar dados não essenciais
  cleanupNonEssentialData(): void {
    const essentialKeys = [
      'infinit-authenticated',
      'infinit-current-user',
      'infinit-user-id'
    ];
    
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !essentialKeys.includes(key)) {
        // Remover dados temporários, cache, etc.
        if (key.includes('temp') || key.includes('cache') || key.includes('backup')) {
          keysToRemove.push(key);
        }
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log(`Removidos ${keysToRemove.length} itens não essenciais do localStorage`);
  }

  // Criar versão compacta dos dados do usuário
  private createCompactVersion(userData: any): any {
    if (!userData || typeof userData !== 'object') {
      return userData;
    }
    
    return {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      avatar: userData.avatar ? this.compressString(userData.avatar) : '',
      banner: userData.banner ? this.compressString(userData.banner) : '',
      bio: userData.bio || '',
      status: userData.status,
      customStatus: userData.customStatus || '',
      isPremium: userData.isPremium,
      isDeveloper: userData.isDeveloper,
      badges: userData.badges || [],
      stats: userData.stats || {},
      // Remover galeria e outros dados grandes
      compact: true
    };
  }

  // Comprimir strings longas (URLs de imagem, etc.)
  private compressString(str: string): string {
    if (!str || str.length < 100) return str;
    
    // Se for uma URL muito longa, manter apenas o essencial
    if (str.startsWith('data:image/') && str.length > 1000) {
      return str.substring(0, 500) + '...[compressed]';
    }
    
    return str;
  }

  // Verificar saúde do storage
  getStorageHealth(): { total: number; used: number; available: number; percentage: number } {
    let totalUsed = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          totalUsed += key.length + value.length;
        }
      }
    }
    
    const estimatedTotal = 10 * 1024 * 1024; // 10MB estimado
    const available = Math.max(0, estimatedTotal - totalUsed);
    const percentage = (totalUsed / estimatedTotal) * 100;
    
    return {
      total: estimatedTotal,
      used: totalUsed,
      available,
      percentage: Math.round(percentage * 100) / 100
    };
  }
}

export default StorageManager;
