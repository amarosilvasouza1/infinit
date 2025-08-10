'use client';

import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
import VoiceCall from '@/components/chat/VoiceCall';

interface Participant {
  id: string;
  name: string;
  avatar: string;
  isScreenSharing?: boolean;
  isMuted?: boolean;
  isOwner?: boolean;
  isCurrentUser?: boolean;
}

interface CallState {
  isActive: boolean;
  isIncoming: boolean;
  contactId: string | null;
  contactName: string;
  contactAvatar: string;
  startTime: Date | null;
  isMuted: boolean;
  isSpeakerOn: boolean;
  isScreenSharing: boolean;
  isReceivingScreen: boolean;
  isGroup?: boolean;
  participants?: Participant[];
  currentUserId?: string;
}

interface CallContextType {
  callState: CallState;
  startCall: (contactId: string, contactName: string, contactAvatar: string) => Promise<boolean>;
  startGroupCall: (groupName: string, groupAvatar: string, participants: Participant[], currentUserId: string) => Promise<boolean>;
  receiveCall: (contactId: string, contactName: string, contactAvatar: string) => boolean;
  answerCall: () => void;
  rejectCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleSpeaker: () => void;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => void;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  screenStream: MediaStream | null;
  canStartCall: () => boolean;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

const initialCallState: CallState = {
  isActive: false,
  isIncoming: false,
  contactId: null,
  contactName: '',
  contactAvatar: '',
  startTime: null,
  isMuted: false,
  isSpeakerOn: false,
  isScreenSharing: false,
  isReceivingScreen: false,
  isGroup: false,
  participants: [],
  currentUserId: 'current-user',
};

export function CallProvider({ children }: { children: ReactNode }) {
  const [callState, setCallState] = useState<CallState>(() => {
    // Tentar recuperar estado da chamada do localStorage
    if (typeof window !== 'undefined') {
      const savedCallState = localStorage.getItem('activeCall');
      if (savedCallState) {
        try {
          const parsed = JSON.parse(savedCallState);
          console.log('🔄 Recuperando chamada ativa do localStorage:', parsed);
          return parsed;
        } catch (error) {
          console.error('Erro ao recuperar chamada do localStorage:', error);
        }
      }
    }
    return initialCallState;
  });
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  // Debug log para monitorar mudanças no estado
  React.useEffect(() => {
    console.log('🔄 CallState mudou:', {
      isActive: callState.isActive,
      contactName: callState.contactName,
      isIncoming: callState.isIncoming,
      isGroup: callState.isGroup
    });
    
    // Salvar estado da chamada no localStorage
    if (callState.isActive) {
      localStorage.setItem('activeCall', JSON.stringify(callState));
    } else {
      localStorage.removeItem('activeCall');
    }
  }, [callState]);

  const startCall = async (contactId: string, contactName: string, contactAvatar: string): Promise<boolean> => {
    // Verificar se já há uma chamada ativa
    if (callState.isActive) {
      return false;
    }

    try {
      // Obter stream de áudio local
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setLocalStream(stream);
      
      setCallState({
        ...initialCallState,
        isActive: true,
        isIncoming: false,
        contactId,
        contactName,
        contactAvatar,
        startTime: new Date(),
      });
      return true;
    } catch (error) {
      console.error('Erro ao iniciar chamada:', error);
      return false;
    }
  };

  const startGroupCall = async (groupName: string, groupAvatar: string, participants: Participant[], currentUserId: string): Promise<boolean> => {
    // Verificar se já há uma chamada ativa
    if (callState.isActive) {
      return false;
    }

    try {
      // Obter stream de áudio local
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setLocalStream(stream);
      
      setCallState({
        ...initialCallState,
        isActive: true,
        isIncoming: false,
        contactId: 'group',
        contactName: groupName,
        contactAvatar: groupAvatar,
        startTime: new Date(),
        isGroup: true,
        participants,
        currentUserId,
      });
      return true;
    } catch (error) {
      console.error('Erro ao iniciar chamada em grupo:', error);
      return false;
    }
  };

  const receiveCall = (contactId: string, contactName: string, contactAvatar: string): boolean => {
    // Verificar se já há uma chamada ativa
    if (callState.isActive) {
      return false;
    }

    setCallState({
      ...initialCallState,
      isActive: true,
      isIncoming: true,
      contactId,
      contactName,
      contactAvatar,
    });
    return true;
  };

  const answerCall = async () => {
    try {
      // Obter stream de áudio local
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setLocalStream(stream);
      
      setCallState(prev => ({
        ...prev,
        isIncoming: false,
        startTime: new Date(),
      }));
    } catch (error) {
      console.error('Erro ao responder chamada:', error);
    }
  };

  const rejectCall = () => {
    endCall();
  };

  const endCall = () => {
    console.log('🔴 endCall chamado - encerrando chamada');
    
    // Limpar streams
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
      setRemoteStream(null);
    }
    
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
    }
    
    // Fechar conexão peer
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    
    setCallState(initialCallState);
    console.log('🔴 Chamada encerrada e estado resetado');
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = callState.isMuted;
        setCallState(prev => ({ ...prev, isMuted: !prev.isMuted }));
      }
    }
  };

  const toggleSpeaker = () => {
    setCallState(prev => ({ ...prev, isSpeakerOn: !prev.isSpeakerOn }));
    // Implementar lógica de alto-falante aqui
  };

  const startScreenShare = async () => {
    try {
      if (!callState.isScreenSharing) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        setScreenStream(stream);
        setCallState(prev => ({ ...prev, isScreenSharing: true }));
        
        // Listener para quando o usuário para o compartilhamento
        stream.getVideoTracks()[0].addEventListener('ended', () => {
          stopScreenShare();
        });
      }
    } catch (error) {
      console.error('Erro ao compartilhar tela:', error);
    }
  };

  const stopScreenShare = () => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
    }
    setCallState(prev => ({ ...prev, isScreenSharing: false }));
  };

  const canStartCall = (): boolean => {
    return !callState.isActive;
  };

  const value: CallContextType = {
    callState,
    startCall,
    startGroupCall,
    receiveCall,
    answerCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleSpeaker,
    startScreenShare,
    stopScreenShare,
    localStream,
    remoteStream,
    screenStream,
    canStartCall,
  };

  return (
    <CallContext.Provider value={value}>
      {children}
      
      {/* VoiceCall global - aparece em qualquer página quando há chamada ativa */}
      {callState.isActive && (
        <div style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none' }}>
          <div style={{ pointerEvents: 'auto' }}>
            <VoiceCall
              isOpen={callState.isActive}
              onClose={endCall}
              contactName={callState.contactName}
              contactAvatar={callState.contactAvatar}
              isIncoming={callState.isIncoming}
              onAnswer={answerCall}
              onReject={rejectCall}
              isGroup={callState.isGroup}
              participants={callState.participants}
              currentUserId={callState.currentUserId}
              startMinimized={!callState.isIncoming} // Minimizado se não for chamada recebida
            />
          </div>
        </div>
      )}
    </CallContext.Provider>
  );
}

export function useCall() {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
}
