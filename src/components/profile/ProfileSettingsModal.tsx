'use client';

import { useState } from 'react';
import { useProfile } from '@/contexts/ProfileContext';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileSettingsModal({ isOpen, onClose }: ProfileSettingsModalProps) {
  const { profile, updateProfile, exportProfile, importProfile } = useProfile();
  const [selectedTab, setSelectedTab] = useState<'general' | 'backup' | 'advanced'>('general');
  const [showExportModal, setShowExportModal] = useState(false);
  const [importData, setImportData] = useState('');
  const [exportedData, setExportedData] = useState('');

  if (!isOpen) return null;

  const handleExport = () => {
    const data = exportProfile();
    setExportedData(data);
    setShowExportModal(true);
  };

  const handleImport = () => {
    try {
      importProfile(importData);
      setImportData('');
      alert('Perfil importado com sucesso!');
      onClose();
    } catch (error) {
      alert('Erro ao importar perfil. Verifique se os dados estão corretos.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copiado para a área de transferência!');
  };

  const downloadBackup = () => {
    const data = exportProfile();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `infinit-profile-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">⚙️ Configurações do Perfil</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl transition-colors"
            >
              ×
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-4 mt-4">
            {[
              { key: 'general', label: '🔧 Geral', icon: '🔧' },
              { key: 'backup', label: '💾 Backup', icon: '💾' },
              { key: 'advanced', label: '🚀 Avançado', icon: '🚀' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key as any)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedTab === tab.key
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {selectedTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white mb-4">🔧 Configurações Gerais</h3>
              
              {/* Theme */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">🎨 Tema</h4>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'dark', label: 'Escuro', icon: '🌙' },
                    { value: 'light', label: 'Claro', icon: '☀️' },
                    { value: 'auto', label: 'Automático', icon: '🌓' }
                  ].map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() => updateProfile({ theme: theme.value as any })}
                      className={`p-3 rounded-lg border transition-all ${
                        profile?.theme === theme.value
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-gray-700 bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      <div className="text-2xl mb-1">{theme.icon}</div>
                      <div className="text-white text-sm">{theme.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">🌍 Idioma</h4>
                <select
                  value={profile.language}
                  onChange={(e) => updateProfile({ language: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="pt-BR">🇧🇷 Português (Brasil)</option>
                  <option value="en-US">🇺🇸 English (US)</option>
                  <option value="es-ES">🇪🇸 Español</option>
                  <option value="fr-FR">🇫🇷 Français</option>
                </select>
              </div>

              {/* Timezone */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">🕒 Fuso Horário</h4>
                <select
                  value={profile.timezone}
                  onChange={(e) => updateProfile({ timezone: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="America/Sao_Paulo">🇧🇷 Brasília (UTC-3)</option>
                  <option value="America/New_York">🇺🇸 Nova York (UTC-5)</option>
                  <option value="Europe/London">🇬🇧 Londres (UTC+0)</option>
                  <option value="Europe/Paris">🇫🇷 Paris (UTC+1)</option>
                  <option value="Asia/Tokyo">🇯🇵 Tóquio (UTC+9)</option>
                </select>
              </div>
            </div>
          )}

          {selectedTab === 'backup' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white mb-4">💾 Backup e Sincronização</h3>
              
              {/* Export */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">📤 Exportar Perfil</h4>
                <p className="text-gray-400 text-sm mb-4">
                  Exporte todos os seus dados do perfil para fazer backup ou transferir para outro dispositivo.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={handleExport}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Exportar Dados
                  </button>
                  <button
                    onClick={downloadBackup}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    Download Backup
                  </button>
                </div>
              </div>

              {/* Import */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">📥 Importar Perfil</h4>
                <p className="text-gray-400 text-sm mb-4">
                  Importe dados de perfil de um backup anterior. Isso substituirá todos os dados atuais.
                </p>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder="Cole aqui os dados do backup..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={6}
                />
                <div className="flex justify-end mt-3">
                  <button
                    onClick={handleImport}
                    disabled={!importData.trim()}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    Importar Dados
                  </button>
                </div>
              </div>

              {/* Auto Backup */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">🔄 Backup Automático</h4>
                <p className="text-gray-400 text-sm mb-4">
                  Salva automaticamente seus dados no armazenamento local do navegador.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-green-400">✅ Ativo</span>
                  <span className="text-gray-400 text-sm">
                    Último backup: {new Date().toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'advanced' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white mb-4">🚀 Configurações Avançadas</h3>
              
              {/* Profile Stats */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">📊 Estatísticas do Perfil</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">ID do Usuário:</span>
                    <span className="text-white ml-2">{profile.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Data de Criação:</span>
                    <span className="text-white ml-2">{profile.joinDate.toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Itens na Galeria:</span>
                    <span className="text-white ml-2">{profile.gallery.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Conquistas:</span>
                    <span className="text-white ml-2">{profile.achievements.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Atividades:</span>
                    <span className="text-white ml-2">{profile.recentActivity.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Status:</span>
                    <span className="text-white ml-2">{profile.status}</span>
                  </div>
                </div>
              </div>

              {/* Debug Options */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">🔧 Opções de Debug</h4>
                <div className="space-y-3">
                  <button
                    onClick={() => console.log('Profile Data:', profile)}
                    className="w-full text-left px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    📝 Log Profile Data
                  </button>
                  <button
                    onClick={() => localStorage.clear()}
                    className="w-full text-left px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    🗑️ Limpar Cache Local
                  </button>
                </div>
              </div>

              {/* Reset Profile */}
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <h4 className="text-red-400 font-medium mb-3">⚠️ Zona de Perigo</h4>
                <p className="text-gray-400 text-sm mb-4">
                  Estas ações não podem ser desfeitas. Use com cuidado.
                </p>
                <button
                  onClick={() => {
                    if (confirm('Tem certeza que deseja resetar todo o perfil? Esta ação não pode ser desfeita.')) {
                      localStorage.removeItem('infinit-profile');
                      window.location.reload();
                    }
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  🔄 Resetar Perfil Completo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60 p-4">
          <div className="bg-gray-900 rounded-xl max-w-2xl w-full border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">📤 Dados Exportados</h3>
            </div>
            <div className="p-6">
              <textarea
                value={exportedData}
                readOnly
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none resize-none"
                rows={10}
              />
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => copyToClipboard(exportedData)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  📋 Copiar
                </button>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
