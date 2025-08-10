'use client';

import { useEffect } from 'react';
import StorageManager from '@/utils/StorageManager';

export const useStorageTest = () => {
  useEffect(() => {
    const runTests = () => {
      console.log('🧪 Iniciando testes do sistema de armazenamento...');
      
      const storageManager = StorageManager.getInstance();
      
      // Teste 1: Verificar saúde inicial
      const initialHealth = storageManager.getStorageHealth();
      console.log('📊 Saúde inicial do storage:', initialHealth);
      
      // Teste 2: Salvar dados pequenos
      const smallData = { id: 'test', name: 'Teste Small' };
      const smallSave = storageManager.smartSave('test-small', smallData);
      console.log('💾 Teste dados pequenos:', smallSave ? '✅ Sucesso' : '❌ Falha');
      
      // Teste 3: Tentar carregar dados
      const loadedData = storageManager.smartLoad('test-small');
      console.log('📥 Teste carregamento:', loadedData ? '✅ Sucesso' : '❌ Falha');
      
      // Teste 4: Dados grandes (simular galeria)
      const largeData = {
        id: 'test-large',
        gallery: new Array(100).fill('data:image/jpeg;base64,' + 'x'.repeat(1000))
      };
      
      const largeSave = storageManager.smartSave('test-large', largeData);
      console.log('🗃️ Teste dados grandes:', largeSave ? '✅ Sucesso' : '❌ Falha');
      
      // Teste 5: Verificar fallbacks
      try {
        // Forçar um erro de quota
        localStorage.setItem('test-force-error', 'x'.repeat(10 * 1024 * 1024));
      } catch (error) {
        console.log('⚠️ Quota exceeded detectado (esperado)');
      }
      
      // Teste 6: Saúde final
      const finalHealth = storageManager.getStorageHealth();
      console.log('📊 Saúde final do storage:', finalHealth);
      
      // Limpeza
      try {
        localStorage.removeItem('test-small');
        localStorage.removeItem('test-large');
        localStorage.removeItem('test-force-error');
        sessionStorage.removeItem('test-small');
        sessionStorage.removeItem('test-large');
      } catch (error) {
        console.warn('Erro na limpeza dos testes:', error);
      }
      
      console.log('✅ Testes de armazenamento concluídos!');
    };
    
    // Executar testes após 2 segundos
    const timer = setTimeout(runTests, 2000);
    
    return () => clearTimeout(timer);
  }, []);
};
