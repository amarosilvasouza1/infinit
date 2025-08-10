'use client';

import { createContext, useContext, useState, useRef, ReactNode } from 'react';

interface MediaState {
  isScreenSharing: boolean;
  isVoiceCall: boolean;
  isVideoCall: boolean;
  remoteStream: MediaStream | null;
  localStream: MediaStream | null;
}

interface MediaContextType {
  state: MediaState;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => void;
  startVoiceCall: () => Promise<void>;
  startVideoCall: () => Promise<void>;
  endCall: () => void;
  requestRemoteControl: () => void;
  grantRemoteControl: () => void;
}

const MediaContext = createContext<MediaContextType | null>(null);

export function MediaProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MediaState>({
    isScreenSharing: false,
    isVoiceCall: false,
    isVideoCall: false,
    remoteStream: null,
    localStream: null
  });

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      setState(prev => ({
        ...prev,
        isScreenSharing: true,
        localStream: stream
      }));

      // Aqui você conectaria com o WebRTC para enviar o stream para outros usuários
      console.log('Compartilhamento de tela iniciado', stream);
      
      // Parar quando o usuário encerrar a captura
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };

    } catch (error) {
      console.error('Erro ao iniciar compartilhamento de tela:', error);
    }
  };

  const stopScreenShare = () => {
    if (state.localStream) {
      state.localStream.getTracks().forEach(track => track.stop());
    }

    setState(prev => ({
      ...prev,
      isScreenSharing: false,
      localStream: null
    }));
  };

  const startVoiceCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });

      setState(prev => ({
        ...prev,
        isVoiceCall: true,
        localStream: stream
      }));

      console.log('Chamada de voz iniciada', stream);

    } catch (error) {
      console.error('Erro ao iniciar chamada de voz:', error);
    }
  };

  const startVideoCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });

      setState(prev => ({
        ...prev,
        isVideoCall: true,
        localStream: stream
      }));

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      console.log('Chamada de vídeo iniciada', stream);

    } catch (error) {
      console.error('Erro ao iniciar chamada de vídeo:', error);
    }
  };

  const endCall = () => {
    if (state.localStream) {
      state.localStream.getTracks().forEach(track => track.stop());
    }

    setState({
      isScreenSharing: false,
      isVoiceCall: false,
      isVideoCall: false,
      remoteStream: null,
      localStream: null
    });
  };

  const requestRemoteControl = () => {
    // Aqui você implementaria a lógica para solicitar controle remoto
    alert('Solicitação de controle remoto enviada!');
  };

  const grantRemoteControl = () => {
    // Aqui você implementaria a lógica para conceder controle remoto
    alert('Controle remoto concedido!');
  };

  const value: MediaContextType = {
    state,
    startScreenShare,
    stopScreenShare,
    startVoiceCall,
    startVideoCall,
    endCall,
    requestRemoteControl,
    grantRemoteControl
  };

  return (
    <MediaContext.Provider value={value}>
      {children}
      
      {/* Overlay para chamadas de vídeo */}
      {state.isVideoCall && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Chamada de Vídeo</h3>
              <button
                onClick={endCall}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Encerrar
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Vídeo local */}
              <div className="relative">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  className="w-full rounded-lg bg-gray-900"
                />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                  Você
                </div>
              </div>
              
              {/* Vídeo remoto (placeholder) */}
              <div className="relative">
                <div className="w-full h-full bg-gray-900 rounded-lg flex items-center justify-center text-gray-400">
                  Aguardando conexão...
                </div>
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                  Contato
                </div>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4 mt-4">
              <button
                onClick={requestRemoteControl}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
              >
                Solicitar Controle
              </button>
              <button
                onClick={grantRemoteControl}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Conceder Controle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay para compartilhamento de tela */}
      {state.isScreenSharing && (
        <div className="fixed bottom-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg z-40">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span>Compartilhando tela</span>
            <button
              onClick={stopScreenShare}
              className="ml-2 bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-sm"
            >
              Parar
            </button>
          </div>
        </div>
      )}
    </MediaContext.Provider>
  );
}

export function useMedia() {
  const context = useContext(MediaContext);
  if (!context) {
    throw new Error('useMedia must be used within a MediaProvider');
  }
  return context;
}
