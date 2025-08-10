'use client';

import { useState } from 'react';
import { 
  X, 
  Camera, 
  Edit3, 
  Users, 
  Settings, 
  Crown, 
  UserMinus, 
  Plus,
  Shield,
  Eye,
  EyeOff,
  Trash2,
  Save,
  Upload
} from 'lucide-react';

interface GroupMember {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isOnline: boolean;
  isAdmin: boolean;
  joinedAt: string;
}

interface GroupSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupData: {
    id: string;
    name: string;
    description: string;
    avatar: string;
    members: GroupMember[];
    admins: string[];
    createdBy: string;
    settings: {
      canAllMembersAdd: boolean;
      canAllMembersEdit: boolean;
      isPublic: boolean;
    };
  };
  currentUserId: string;
  onUpdateGroup: (updates: any) => void;
}

export default function GroupSettingsModal({ 
  isOpen, 
  onClose, 
  groupData, 
  currentUserId,
  onUpdateGroup 
}: GroupSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'members' | 'settings' | 'privacy'>('info');
  const [groupName, setGroupName] = useState(groupData.name);
  const [groupDescription, setGroupDescription] = useState(groupData.description);
  const [groupAvatar, setGroupAvatar] = useState(groupData.avatar);
  const [settings, setSettings] = useState(groupData.settings);
  const [hasChanges, setHasChanges] = useState(false);

  const isCurrentUserAdmin = groupData.admins.includes(currentUserId);
  const isCurrentUserOwner = groupData.createdBy === currentUserId;

  const handleSaveChanges = () => {
    const updates = {
      name: groupName,
      description: groupDescription,
      avatar: groupAvatar,
      settings
    };
    onUpdateGroup(updates);
    setHasChanges(false);
  };

  const toggleAdmin = (memberId: string) => {
    if (!isCurrentUserOwner) return;
    
    const updatedAdmins = groupData.admins.includes(memberId)
      ? groupData.admins.filter(id => id !== memberId)
      : [...groupData.admins, memberId];
    
    onUpdateGroup({ admins: updatedAdmins });
  };

  const removeMember = (memberId: string) => {
    if (!isCurrentUserAdmin || memberId === groupData.createdBy) return;
    
    const updatedMembers = groupData.members.filter(m => m.id !== memberId);
    onUpdateGroup({ members: updatedMembers });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50 flex-shrink-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-xl font-bold text-white">
                {groupAvatar}
              </div>
              {isCurrentUserAdmin && (
                <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center text-white transition-colors">
                  <Camera size={12} />
                </button>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{groupData.name}</h2>
              <p className="text-sm text-gray-400">{groupData.members.length} membros</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {hasChanges && (
              <button
                onClick={handleSaveChanges}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <Save size={16} />
                <span>Salvar</span>
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700/30 flex-shrink-0">
          {[
            { id: 'info', label: 'Informações', icon: Edit3 },
            { id: 'members', label: 'Membros', icon: Users },
            { id: 'settings', label: 'Configurações', icon: Settings },
            { id: 'privacy', label: 'Privacidade', icon: Shield }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 transition-colors ${
                activeTab === tab.id
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/10'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
              }`}
            >
              <tab.icon size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Group Avatar Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Avatar do Grupo
                </label>
                <div className="flex space-x-2 mb-4">
                  {['👥', '🎮', '💼', '🎵', '📚', '🏃', '🎨', '🚀', '⚽', '🍕'].map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => {
                        setGroupAvatar(emoji);
                        setHasChanges(true);
                      }}
                      disabled={!isCurrentUserAdmin}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        groupAvatar === emoji
                          ? 'bg-purple-600 scale-110'
                          : 'bg-gray-700/50 hover:bg-gray-600/50'
                      } ${!isCurrentUserAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {emoji}
                    </button>
                  ))}
                  {isCurrentUserAdmin && (
                    <button className="w-10 h-10 bg-gray-700/50 hover:bg-gray-600/50 rounded-xl flex items-center justify-center transition-colors">
                      <Upload size={16} className="text-gray-300" />
                    </button>
                  )}
                </div>
              </div>

              {/* Group Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome do Grupo
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => {
                    setGroupName(e.target.value);
                    setHasChanges(true);
                  }}
                  disabled={!isCurrentUserAdmin}
                  maxLength={50}
                  className={`w-full bg-gray-800/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    !isCurrentUserAdmin ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                />
                <p className="text-xs text-gray-500 mt-1">{groupName.length}/50 caracteres</p>
              </div>

              {/* Group Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descrição
                </label>
                <textarea
                  value={groupDescription}
                  onChange={(e) => {
                    setGroupDescription(e.target.value);
                    setHasChanges(true);
                  }}
                  disabled={!isCurrentUserAdmin}
                  maxLength={200}
                  rows={3}
                  className={`w-full bg-gray-800/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${
                    !isCurrentUserAdmin ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                />
                <p className="text-xs text-gray-500 mt-1">{groupDescription.length}/200 caracteres</p>
              </div>

              {/* Group Stats */}
              <div className="bg-gray-800/30 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-3">Estatísticas do Grupo</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-purple-400">{groupData.members.length}</p>
                    <p className="text-sm text-gray-400">Membros</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-400">{groupData.admins.length}</p>
                    <p className="text-sm text-gray-400">Administradores</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-4">
              {/* Add Member Button */}
              {isCurrentUserAdmin && (
                <button className="w-full p-3 border-2 border-dashed border-gray-600 hover:border-purple-500 rounded-xl text-gray-400 hover:text-purple-400 transition-colors flex items-center justify-center space-x-2">
                  <Plus size={20} />
                  <span>Adicionar Membro</span>
                </button>
              )}

              {/* Members List */}
              <div className="space-y-2">
                {groupData.members.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                        {member.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-gray-900 rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-white">{member.name}</h3>
                          {member.id === groupData.createdBy && (
                            <Crown size={16} className="text-yellow-500" />
                          )}
                          {member.isAdmin && member.id !== groupData.createdBy && (
                            <Shield size={16} className="text-purple-400" />
                          )}
                        </div>
                        <p className="text-sm text-gray-400">{member.username}</p>
                        <p className="text-xs text-gray-500">Entrou em {new Date(member.joinedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    {isCurrentUserAdmin && member.id !== currentUserId && (
                      <div className="flex items-center space-x-2">
                        {isCurrentUserOwner && member.id !== groupData.createdBy && (
                          <button
                            onClick={() => toggleAdmin(member.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              member.isAdmin
                                ? 'bg-purple-600/20 text-purple-400 hover:bg-purple-600/30'
                                : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50 hover:text-purple-400'
                            }`}
                            title={member.isAdmin ? 'Remover admin' : 'Tornar admin'}
                          >
                            <Shield size={16} />
                          </button>
                        )}
                        {member.id !== groupData.createdBy && (
                          <button
                            onClick={() => removeMember(member.id)}
                            className="p-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg transition-colors"
                            title="Remover membro"
                          >
                            <UserMinus size={16} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Group Permissions */}
              <div>
                <h3 className="font-semibold text-white mb-4">Permissões do Grupo</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                    <div>
                      <h4 className="font-medium text-white">Todos podem adicionar membros</h4>
                      <p className="text-sm text-gray-400">Permite que qualquer membro adicione novos usuários</p>
                    </div>
                    <button
                      onClick={() => {
                        setSettings(prev => ({ ...prev, canAllMembersAdd: !prev.canAllMembersAdd }));
                        setHasChanges(true);
                      }}
                      disabled={!isCurrentUserAdmin}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.canAllMembersAdd ? 'bg-purple-600' : 'bg-gray-600'
                      } ${!isCurrentUserAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        settings.canAllMembersAdd ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                    <div>
                      <h4 className="font-medium text-white">Todos podem editar informações</h4>
                      <p className="text-sm text-gray-400">Permite que qualquer membro edite nome e descrição</p>
                    </div>
                    <button
                      onClick={() => {
                        setSettings(prev => ({ ...prev, canAllMembersEdit: !prev.canAllMembersEdit }));
                        setHasChanges(true);
                      }}
                      disabled={!isCurrentUserAdmin}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.canAllMembersEdit ? 'bg-purple-600' : 'bg-gray-600'
                      } ${!isCurrentUserAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        settings.canAllMembersEdit ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              {isCurrentUserOwner && (
                <div className="border border-red-600/30 bg-red-600/10 rounded-xl p-4">
                  <h3 className="font-semibold text-red-400 mb-3">Zona de Perigo</h3>
                  <div className="space-y-3">
                    <button className="w-full p-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors flex items-center justify-center space-x-2">
                      <Trash2 size={16} />
                      <span>Excluir Grupo</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              {/* Group Visibility */}
              <div>
                <h3 className="font-semibold text-white mb-4">Visibilidade</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                    <div className="flex items-center space-x-3">
                      {settings.isPublic ? <Eye size={20} className="text-green-400" /> : <EyeOff size={20} className="text-red-400" />}
                      <div>
                        <h4 className="font-medium text-white">
                          {settings.isPublic ? 'Grupo Público' : 'Grupo Privado'}
                        </h4>
                        <p className="text-sm text-gray-400">
                          {settings.isPublic 
                            ? 'Qualquer pessoa pode encontrar e solicitar entrada'
                            : 'Apenas membros convidados podem participar'
                          }
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSettings(prev => ({ ...prev, isPublic: !prev.isPublic }));
                        setHasChanges(true);
                      }}
                      disabled={!isCurrentUserAdmin}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.isPublic ? 'bg-green-600' : 'bg-red-600'
                      } ${!isCurrentUserAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        settings.isPublic ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Group Link */}
              <div>
                <h3 className="font-semibold text-white mb-4">Link de Convite</h3>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={`https://infinit.dev/group/${groupData.id}`}
                    readOnly
                    className="flex-1 bg-gray-800/50 border border-gray-600/50 rounded-xl px-4 py-3 text-gray-300 focus:outline-none"
                  />
                  <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors font-medium">
                    Copiar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
