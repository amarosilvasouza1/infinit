'use client';

import { useProfile } from '@/contexts/ProfileContext';
import { useCallback } from 'react';

export function useProfileActions() {
  const { 
    profile, 
    updateProfile, 
    updateAvatar, 
    updateBanner, 
    updateStatus, 
    updateCustomStatus,
    addActivity,
    unlockAchievement,
    addToGallery
  } = useProfile();

  // Ações rápidas para usar em outros componentes
  const quickStatusChange = useCallback((status: 'online' | 'idle' | 'busy' | 'invisible') => {
    updateStatus(status);
    addActivity({
      type: 'message',
      description: `Mudou status para ${status}`,
      icon: '🔄'
    });
  }, [updateStatus, addActivity]);

  const quickCustomStatusChange = useCallback((customStatus: string) => {
    updateCustomStatus(customStatus);
    if (customStatus.trim()) {
      addActivity({
        type: 'message',
        description: 'Atualizou status personalizado',
        icon: '💭'
      });
    }
  }, [updateCustomStatus, addActivity]);

  const incrementMessageCount = useCallback(() => {
    updateProfile({
      stats: {
        ...profile.stats,
        messagesCount: profile.stats.messagesCount + 1
      }
    });
  }, [updateProfile, profile.stats]);

  const incrementCallTime = useCallback((minutes: number) => {
    const hours = minutes / 60;
    updateProfile({
      stats: {
        ...profile.stats,
        callTimeHours: Math.round((profile.stats.callTimeHours + hours) * 100) / 100
      }
    });
  }, [updateProfile, profile.stats]);

  const addFriend = useCallback(() => {
    updateProfile({
      stats: {
        ...profile.stats,
        friendsCount: profile.stats.friendsCount + 1
      }
    });
    addActivity({
      type: 'message',
      description: 'Adicionou um novo amigo',
      icon: '👫'
    });
  }, [updateProfile, profile.stats, addActivity]);

  const joinGroup = useCallback((groupName: string) => {
    updateProfile({
      stats: {
        ...profile.stats,
        groupsCount: profile.stats.groupsCount + 1
      }
    });
    addActivity({
      type: 'join_group',
      description: 'Entrou em um grupo',
      target: groupName,
      icon: '👥'
    });
  }, [updateProfile, profile.stats, addActivity]);

  const checkAchievements = useCallback(() => {
    // Verificar conquistas baseadas nas estatísticas
    if (profile.stats.messagesCount >= 1000 && !profile.achievements.find(a => a.id === 'talker')) {
      unlockAchievement('talker');
    }
    
    if (profile.stats.callTimeHours >= 100 && !profile.achievements.find(a => a.id === 'caller')) {
      unlockAchievement('caller');
    }
    
    if (profile.stats.groupsCount >= 10 && !profile.achievements.find(a => a.id === 'social')) {
      unlockAchievement('social');
    }
    
    // Conquista por horário
    const hour = new Date().getHours();
    if (hour >= 5 && hour <= 8 && !profile.achievements.find(a => a.id === 'early_bird')) {
      unlockAchievement('early_bird');
    }
    
    if ((hour >= 0 && hour <= 3) || hour === 23 && !profile.achievements.find(a => a.id === 'night_owl')) {
      unlockAchievement('night_owl');
    }
  }, [profile.stats, profile.achievements, unlockAchievement]);

  const getProfileSummary = useCallback(() => {
    return {
      name: profile.name,
      avatar: profile.avatar,
      status: profile.status,
      customStatus: profile.customStatus,
      totalActivity: profile.stats.messagesCount + profile.stats.callTimeHours + profile.stats.groupsCount,
      isVip: profile.achievements.some(a => a.id === 'vip'),
      joinedDaysAgo: Math.floor((new Date().getTime() - profile.joinDate.getTime()) / (1000 * 60 * 60 * 24))
    };
  }, [profile]);

  return {
    // Dados do perfil
    profile,
    
    // Ações rápidas
    quickStatusChange,
    quickCustomStatusChange,
    incrementMessageCount,
    incrementCallTime,
    addFriend,
    joinGroup,
    checkAchievements,
    
    // Utilitários
    getProfileSummary,
    
    // Ações diretas
    updateProfile,
    updateAvatar,
    updateBanner,
    addActivity,
    addToGallery
  };
}
