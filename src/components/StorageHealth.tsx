'use client';

import { useState, useEffect } from 'react';
import StorageManager from '@/utils/StorageManager';

interface StorageHealthProps {
  className?: string;
}

export default function StorageHealth({ className = '' }: StorageHealthProps) {
  const [health, setHealth] = useState({
    total: 0,
    used: 0,
    available: 0,
    percentage: 0
  });
  const [showDetails, setShowDetails] = useState(false);
  
  const storageManager = StorageManager.getInstance();

  useEffect(() => {
    updateHealth();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(updateHealth, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const updateHealth = () => {
    const healthData = storageManager.getStorageHealth();
    setHealth(healthData);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getHealthColor = (percentage: number): string => {
    if (percentage < 50) return 'text-green-400';
    if (percentage < 80) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getHealthStatus = (percentage: number): string => {
    if (percentage < 50) return 'Saudável';
    if (percentage < 80) return 'Atenção';
    return 'Crítico';
  };

  if (!showDetails) {
    return (
      <button
        onClick={() => setShowDetails(true)}
        className={`text-xs opacity-60 hover:opacity-100 transition-opacity ${className}`}
        title="Ver saúde do armazenamento"
      >
        Storage: {health.percentage.toFixed(0)}%
      </button>
    );
  }

  return (
    <div className={`bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-white">Saúde do Armazenamento</h3>
        <button
          onClick={() => setShowDetails(false)}
          className="text-gray-400 hover:text-white text-xs"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        {/* Barra de progresso */}
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              health.percentage < 50 
                ? 'bg-green-500' 
                : health.percentage < 80 
                ? 'bg-yellow-500' 
                : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(health.percentage, 100)}%` }}
          />
        </div>

        {/* Status */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-300">Status:</span>
          <span className={getHealthColor(health.percentage)}>
            {getHealthStatus(health.percentage)} ({health.percentage.toFixed(1)}%)
          </span>
        </div>

        {/* Detalhes */}
        <div className="space-y-1 text-xs text-gray-400">
          <div className="flex justify-between">
            <span>Usado:</span>
            <span>{formatBytes(health.used)}</span>
          </div>
          <div className="flex justify-between">
            <span>Disponível:</span>
            <span>{formatBytes(health.available)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total (est.):</span>
            <span>{formatBytes(health.total)}</span>
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => {
              storageManager.cleanupNonEssentialData();
              updateHealth();
            }}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs py-1 px-2 rounded transition-colors"
          >
            Limpar
          </button>
          <button
            onClick={updateHealth}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-xs py-1 px-2 rounded transition-colors"
          >
            Atualizar
          </button>
        </div>

        {/* Avisos */}
        {health.percentage > 80 && (
          <div className="bg-red-900/30 border border-red-700/50 rounded p-2 mt-2">
            <p className="text-xs text-red-300">
              ⚠️ Armazenamento quase cheio! Considere limpar dados não essenciais.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
