'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Monitor,
  MonitorOff,
  Minimize2,
  Maximize2,
  Settings,
  Maximize
} from 'lucide-react';
import { useCallSounds } from '@/hooks/useCallSounds';
import { useProfile } from '@/contexts/ProfileContext';

interface Participant {
  id: string;
  name: string;
  avatar: string;
  isScreenSharing?: boolean;
  isMuted?: boolean;
  isOwner?: boolean;
  isCurrentUser?: boolean;
}

interface VoiceCallProps {
  isOpen: boolean;
  onClose: () => void;
  contactName: string;
  contactAvatar: string;
  isIncoming?: boolean;
  onAnswer?: () => void;
  onReject?: () => void;
  isGroup?: boolean;
  participants?: Participant[];
  currentUserId?: string;
  startMinimized?: boolean; // Nova prop para controlar se inicia minimizado
}

export default function VoiceCall({ 
  isOpen, 
  onClose, 
  contactName, 
  contactAvatar,
  isIncoming = false,
  onAnswer,
  onReject,
  isGroup = false,
  participants = [],
  currentUserId = 'current-user',
  startMinimized = false
}: VoiceCallProps) {
  const { profile } = useProfile();
  
  // Estados existentes
  const [isConnected, setIsConnected] = useState(!isIncoming);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isScreenReceiving, setIsScreenReceiving] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [screenShareQuality, setScreenShareQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor'>('excellent');
  
  // Estados de posição e minimização
  const [isMinimized, setIsMinimized] = useState(startMinimized);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [position, setPosition] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('top-right');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Novos estados para multi-transmissão
  const [activeStreams, setActiveStreams] = useState<{[key: string]: boolean}>({});
  const [currentlyWatching, setCurrentlyWatching] = useState<string | null>(null);
  const [availableStreams, setAvailableStreams] = useState<string[]>([]);

  // Refs
  const callWindowRef = useRef<HTMLDivElement>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Hooks
  const { playMuteSound, playSpeakerSound, initSounds } = useCallSounds();

  // Funções para gerenciar múltiplas transmissões
  const getActiveStreamers = () => {
    return Object.keys(activeStreams).filter(id => activeStreams[id]);
  };

  const getCurrentStreamProvider = () => {
    if (isScreenSharing) return currentUserId;
    return currentlyWatching;
  };

  const switchToStream = (participantId: string) => {
    if (activeStreams[participantId]) {
      setCurrentlyWatching(participantId);
      console.log(`🔄 Mudando para assistir transmissão de: ${participants.find(p => p.id === participantId)?.name}`);
    }
  };

  const startMyScreenShare = async () => {
    try {
      await startScreenShare();
      // Atualizar estado local
      setActiveStreams(prev => ({
        ...prev,
        [currentUserId]: true
      }));
    } catch (error) {
      console.error('Erro ao iniciar compartilhamento:', error);
    }
  };

  // Função helper para verificar se o avatar é uma imagem válida
  const isValidImageUrl = (url: string) => {
    return url.startsWith('http') || url.startsWith('data:image');
  };

  const stopMyScreenShare = () => {
    stopScreenShare();
    // Remover do estado de transmissões ativas
    setActiveStreams(prev => {
      const newStreams = { ...prev };
      delete newStreams[currentUserId];
      return newStreams;
    });
    
    // Se estávamos assistindo nossa própria transmissão, mudar para outro
    if (currentlyWatching === currentUserId) {
      const otherStreamers = Object.keys(activeStreams).filter(id => id !== currentUserId && activeStreams[id]);
      setCurrentlyWatching(otherStreamers.length > 0 ? otherStreamers[0] : null);
    }
  };

  // Organizar participantes
  const getMainParticipant = () => {
    if (!isGroup) return null;
    
    // Prioridade: quem está assistindo > quem está transmitindo > dono do grupo > primeiro da lista
    const watching = currentlyWatching ? participants.find(p => p.id === currentlyWatching) : null;
    if (watching) return watching;
    
    const streaming = participants.find(p => activeStreams[p.id] || (p.id === currentUserId && isScreenSharing));
    if (streaming) return streaming;
    
    const owner = participants.find(p => p.isOwner);
    if (owner) return owner;
    
    return participants[0];
  };

  const getSecondaryParticipants = () => {
    if (!isGroup) return [];
    const main = getMainParticipant();
    return participants.filter(p => p.id !== main?.id);
  };

  // useEffect para gerenciar minimização baseado em chamadas recebidas
  useEffect(() => {
    if (isIncoming) {
      setIsMinimized(false); // Chamadas recebidas sempre expandidas
    } else if (startMinimized) {
      setIsMinimized(true); // Chamadas feitas começam minimizadas
    }
  }, [isIncoming, startMinimized]);

  // Carregar posição salva
  useEffect(() => {
    const savedPosition = localStorage.getItem('voiceCall-position');
    if (savedPosition && ['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(savedPosition)) {
      setPosition(savedPosition as 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right');
    } else {
      setPosition('top-right');
    }
  }, []);

  // Salvar posição
  useEffect(() => {
    localStorage.setItem('voiceCall-position', position);
  }, [position]);

  // Função para alternar entre os cantos
  const switchCorner = () => {
    const corners: ('top-left' | 'top-right' | 'bottom-left' | 'bottom-right')[] = 
      ['top-right', 'bottom-right', 'bottom-left', 'top-left'];
    const currentIndex = corners.indexOf(position);
    const nextIndex = (currentIndex + 1) % corners.length;
    setPosition(corners[nextIndex]);
  };

  // Simular transmissões de outros usuários (para demonstração)
  useEffect(() => {
    if (isOpen && isConnected && isGroup && participants.length > 0) {
      const timer = setTimeout(() => {
        // Simular alguns usuários começando a transmitir
        const streamingUsers: {[key: string]: boolean} = {};
        
        participants.forEach(participant => {
          if (participant.isScreenSharing && participant.id !== currentUserId) {
            streamingUsers[participant.id] = true;
          }
        });
        
        setActiveStreams(streamingUsers);
        
        // Se há transmissões e não estamos assistindo nenhuma, assistir a primeira
        const streamers = Object.keys(streamingUsers);
        if (streamers.length > 0 && !currentlyWatching && !isScreenSharing) {
          setCurrentlyWatching(streamers[0]);
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, isConnected, isGroup, participants, currentUserId, currentlyWatching, isScreenSharing]);

  // Inicializar sons e timer
  useEffect(() => {
    if (isOpen) {
      initSounds();
    }

    let interval: NodeJS.Timeout;
    if (isConnected) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    // Cleanup
    return () => {
      if (interval) clearInterval(interval);
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen, initSounds, isConnected]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Funções de chamada
  const handleAnswer = () => {
    setIsConnected(true);
    onAnswer?.();
  };

  const handleReject = () => {
    onReject?.();
    handleEndCall();
  };

  const handleEndCall = () => {
    setIsConnected(false);
    setCallDuration(0);
    setIsScreenSharing(false);
    setIsScreenReceiving(false);
    onClose();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    playMuteSound();
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    playSpeakerSound();
  };

  const startScreenShare = async () => {
    try {
      const constraints = {
        video: {
          mediaSource: 'screen' as const,
          width: { ideal: screenShareQuality === 'high' ? 1440 : screenShareQuality === 'medium' ? 1080 : 720 },
          height: { ideal: screenShareQuality === 'high' ? 900 : screenShareQuality === 'medium' ? 720 : 480 },
          frameRate: { ideal: 30, max: 60 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      };

      const stream = await navigator.mediaDevices.getDisplayMedia(constraints);
      
      screenStreamRef.current = stream;
      setIsScreenSharing(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        stopScreenShare();
      });
      
      console.log('🔴 Compartilhamento de tela iniciado:', {
        quality: screenShareQuality,
        tracks: stream.getTracks().length,
        video: stream.getVideoTracks().length > 0,
        audio: stream.getAudioTracks().length > 0
      });
      
    } catch (error) {
      console.error('Erro ao compartilhar tela:', error);
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          alert('Permissão negada para compartilhar tela.');
        } else if (error.name === 'NotSupportedError') {
          alert('Compartilhamento de tela não é suportado.');
        } else {
          alert('Erro ao iniciar compartilhamento: ' + error.message);
        }
      }
    }
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsScreenSharing(false);
    setIsScreenReceiving(false);
    
    console.log('⏹️ Compartilhamento de tela parado');
  };

  const toggleFullScreen = () => {
    if (!isFullScreen) {
      // Entrar em tela cheia
      if (callWindowRef.current) {
        if (callWindowRef.current.requestFullscreen) {
          callWindowRef.current.requestFullscreen();
        } else if ((callWindowRef.current as any).webkitRequestFullscreen) {
          (callWindowRef.current as any).webkitRequestFullscreen();
        } else if ((callWindowRef.current as any).msRequestFullscreen) {
          (callWindowRef.current as any).msRequestFullscreen();
        }
      }
    } else {
      // Sair da tela cheia
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
    setIsFullScreen(!isFullScreen);
  };

  // Detectar mudanças na tela cheia
  useEffect(() => {
    const handleFullScreenChange = () => {
      const isCurrentlyFullScreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullScreen(isCurrentlyFullScreen);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
    document.addEventListener('msfullscreenchange', handleFullScreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
      document.removeEventListener('msfullscreenchange', handleFullScreenChange);
    };
  }, []);

  const getConnectionIcon = () => {
    switch (connectionQuality) {
      case 'excellent':
        return <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full"></div>;
      case 'good':
        return <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-yellow-500 border-2 border-gray-800 rounded-full"></div>;
      case 'poor':
        return <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 border-2 border-gray-800 rounded-full"></div>;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        ref={callWindowRef}
        className={`fixed z-50 transition-all duration-500 ease-out ${
          isFullScreen 
            ? 'inset-0 w-full h-full'
            : isMinimized 
              ? position.startsWith('translate') 
                ? '' 
                : {
                    'top-left': 'top-4 left-4',
                    'top-right': 'top-4 right-4',
                    'bottom-left': 'bottom-4 left-4',
                    'bottom-right': 'bottom-4 right-4'
                  }[position] || 'top-4 right-4'
              : 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
        } ${
          isFullScreen 
            ? 'w-full h-full'
            : isMinimized 
              ? 'w-80 h-28' 
              : 'w-[800px] h-[600px]'
        } ${isMinimized ? 'transition-all duration-300 ease-out' : ''}`}
      >
        {/* Versão minimizada */}
        {isMinimized && (
          <div 
            className={`bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 rounded-2xl shadow-2xl border border-purple-400 h-full relative overflow-hidden backdrop-blur-xl transition-all duration-200 hover:scale-105`}
          >
            {/* Efeito de brilho animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
            
            {/* Área clicável para mudar de canto (só a parte vazia) */}
            <div 
              className="absolute inset-0 cursor-pointer"
              onClick={switchCorner}
              title="Clique para mudar de canto"
            ></div>
            
            <div className="flex items-center justify-between h-full px-4 py-2 relative z-10 pointer-events-none">{/* Conteúdo não clicável */}
              {/* Avatar e info - lado esquerdo */}
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                  {(contactAvatar.startsWith('http') || contactAvatar.startsWith('data:image')) ? (
                    <img
                      src={contactAvatar}
                      alt={contactName}
                      className="w-8 h-8 rounded-full border border-purple-300 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-sm font-bold border border-purple-400">
                      {contactAvatar}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full animate-pulse"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {isGroup ? contactName : contactName}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    <span className="inline-flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      {formatDuration(callDuration)}
                    </span>
                    {isGroup && <span className="ml-2">• {participants.length}p</span>}
                    {isScreenSharing && <span className="ml-2 text-green-400">• Transm.</span>}
                    {currentlyWatching && !isScreenSharing && (
                      <span className="ml-2 text-blue-400">• Assist.</span>
                    )}
                    {isGroup && Object.keys(activeStreams).length > 0 && !currentlyWatching && !isScreenSharing && (
                      <span className="ml-2 text-orange-400">• {Object.keys(activeStreams).length}📡</span>
                    )}
                  </p>
                </div>
              </div>
              
              {/* Indicadores e botões - lado direito */}
              <div className="flex items-center space-x-2 flex-shrink-0">
                {/* Indicadores compactos */}
                {isGroup && Object.keys(activeStreams).length > 1 && (
                  <div className="w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center animate-pulse" title={`${Object.keys(activeStreams).length} transmitindo`}>
                    <span className="text-xs font-bold">{Object.keys(activeStreams).length}</span>
                  </div>
                )}
                
                {isScreenSharing && (
                  <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center animate-pulse" title="Compartilhando">
                    <Monitor size={10} />
                  </div>
                )}
                
                {currentlyWatching && !isScreenSharing && (
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center animate-pulse" title="Assistindo">
                    <Monitor size={10} />
                  </div>
                )}
                
                {/* Botões de ação */}
                <button
                  className="pointer-events-auto w-7 h-7 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center transition-all hover:scale-110 duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMinimized(false);
                    setTimeout(() => {
                      if (callWindowRef.current) {
                        callWindowRef.current.style.animation = 'fadeIn 0.3s ease-out';
                        setTimeout(() => {
                          if (callWindowRef.current) {
                            callWindowRef.current.style.animation = '';
                          }
                        }, 300);
                      }
                    }, 50);
                  }}
                  title="Expandir"
                >
                  <Maximize2 size={12} />
                </button>
                <button
                  className="pointer-events-auto w-7 h-7 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEndCall();
                  }}
                  title="Encerrar"
                >
                  <PhoneOff size={12} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Versão expandida */}
        {!isMinimized && (
          <div className={`bg-gradient-to-br from-gray-900 via-gray-800 to-black shadow-2xl backdrop-blur-xl border border-gray-700 h-full flex flex-col ${
            isFullScreen ? 'rounded-none' : 'rounded-3xl'
          }`}>
            
            {/* Controles especiais para tela cheia */}
            {isFullScreen && (
              <div className="absolute top-4 right-4 z-50 flex space-x-2">
                <button
                  onClick={toggleFullScreen}
                  className="p-3 bg-black bg-opacity-75 hover:bg-opacity-90 rounded-full transition-all hover:scale-110"
                  title="Sair da tela cheia"
                >
                  <Minimize2 size={20} className="text-white" />
                </button>
                <button
                  onClick={handleEndCall}
                  className="p-3 bg-red-600 hover:bg-red-700 rounded-full transition-all hover:scale-110"
                  title="Encerrar chamada"
                >
                  <PhoneOff size={20} className="text-white" />
                </button>
              </div>
            )}
            
            {/* Header da chamada - oculto em tela cheia */}
            {!isFullScreen && (
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    {(contactAvatar.startsWith('http') || contactAvatar.startsWith('data:image')) ? (
                      <img
                        src={contactAvatar}
                        alt={contactName}
                        className="w-16 h-16 rounded-full border-2 border-purple-400 object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl font-bold border-2 border-purple-400">
                        {contactAvatar}
                      </div>
                    )}
                    {getConnectionIcon()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{contactName}</h3>
                    <p className="text-gray-400 flex items-center space-x-2">
                      {isIncoming && !isConnected ? (
                        <span>Chamada recebida...</span>
                      ) : isConnected ? (
                        <>
                          <span>{formatDuration(callDuration)}</span>
                          <span>•</span>
                          <span className="capitalize">{connectionQuality}</span>
                        </>
                      ) : (
                        <span>Conectando...</span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
                    title="Configurações"
                  >
                    <Settings size={20} />
                  </button>
                  <button
                    onClick={() => {
                      setIsMinimized(true);
                      setTimeout(() => {
                        if (callWindowRef.current) {
                          callWindowRef.current.style.animation = 'slideIn 0.3s ease-out';
                          setTimeout(() => {
                            if (callWindowRef.current) {
                              callWindowRef.current.style.animation = '';
                            }
                          }, 300);
                        }
                      }, 50);
                    }}
                    className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
                    title="Minimizar"
                  >
                    <Minimize2 size={20} />
                  </button>
                </div>
              </div>
            )}

            {/* Área principal da chamada */}
            <div className="flex-1 relative overflow-hidden">
              {isGroup ? (
                <div className="flex flex-col h-full space-y-4 p-4">
                  {/* Participante principal */}
                  {getMainParticipant() && (
                    <div className="flex-1 bg-gray-800 rounded-xl border border-gray-600 overflow-hidden relative">
                      
                      {/* Área de transmissão de tela */}
                      {((getMainParticipant()?.id === currentUserId && isScreenSharing && screenStreamRef.current) ||
                        (currentlyWatching && activeStreams[currentlyWatching])) && (
                        <div className="absolute inset-0 bg-black rounded-xl overflow-hidden">
                          {/* Controles de transmissão */}
                          <div className="absolute top-4 right-4 flex space-x-2 z-10">
                            <button
                              onClick={toggleFullScreen}
                              className="p-2 bg-black bg-opacity-75 hover:bg-opacity-90 rounded-full transition-all hover:scale-110"
                              title={isFullScreen ? "Sair da tela cheia" : "Tela cheia"}
                            >
                              <Maximize size={16} className="text-white" />
                            </button>
                          </div>
                          
                          {/* Vídeo da transmissão própria */}
                          {getMainParticipant()?.id === currentUserId && isScreenSharing && screenStreamRef.current && (
                            <video
                              ref={videoRef}
                              autoPlay
                              muted
                              className="w-full h-full object-contain bg-black"
                              onLoadedMetadata={() => {
                                if (videoRef.current && screenStreamRef.current) {
                                  videoRef.current.srcObject = screenStreamRef.current;
                                }
                              }}
                            />
                          )}
                          
                          {/* Simulação de transmissão de outros (placeholder) */}
                          {currentlyWatching && activeStreams[currentlyWatching] && currentlyWatching !== currentUserId && (
                            <div className="w-full h-full bg-gradient-to-br from-blue-900 via-purple-900 to-black flex items-center justify-center">
                              <div className="text-center space-y-4">
                                <Monitor size={64} className="text-blue-400 mx-auto animate-pulse" />
                                <div>
                                  <h3 className="text-white text-2xl font-bold">
                                    {participants.find(p => p.id === currentlyWatching)?.name}
                                  </h3>
                                  <p className="text-blue-400">está compartilhando a tela</p>
                                </div>
                                <div className="text-sm text-gray-400">
                                  Em uma implementação real, aqui seria mostrado o stream de vídeo do participante
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Avatar e info do participante principal (quando não há transmissão) */}
                      {!((getMainParticipant()?.id === currentUserId && isScreenSharing) || 
                          (currentlyWatching && activeStreams[currentlyWatching])) && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="relative">
                            {(getMainParticipant()?.avatar.startsWith('http') || getMainParticipant()?.avatar.startsWith('data:image')) ? (
                              <img
                                src={getMainParticipant()?.avatar}
                                alt={getMainParticipant()?.name}
                                className="w-32 h-32 rounded-full border-4 border-purple-400 object-cover"
                              />
                            ) : (
                              <div className="w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-4xl font-bold border-4 border-purple-400">
                                {getMainParticipant()?.avatar}
                              </div>
                            )}
                            {getMainParticipant()?.isOwner && (
                              <div className="absolute -top-2 -right-2 bg-yellow-500 p-2 rounded-full">
                                <span className="text-black text-sm">👑</span>
                              </div>
                            )}
                            {getMainParticipant()?.isMuted && (
                              <div className="absolute -bottom-2 -right-2 bg-red-600 p-2 rounded-full">
                                <MicOff size={16} className="text-white" />
                              </div>
                            )}
                          </div>
                          <h3 className="text-white text-2xl font-bold">{getMainParticipant()?.name}</h3>
                          {getMainParticipant()?.isCurrentUser && <p className="text-gray-400">Você</p>}
                        </div>
                      )}
                      
                      {/* Indicador de status */}
                      <div className="absolute top-4 left-4 bg-black bg-opacity-75 px-3 py-1 rounded-full flex items-center space-x-2">
                        {((getMainParticipant()?.id === currentUserId && isScreenSharing) || 
                          (getMainParticipant()?.id && activeStreams[getMainParticipant()!.id])) && (
                          <>
                            <Monitor size={16} className="text-red-400 animate-pulse" />
                            <span className="text-red-400 font-semibold">Transmitindo</span>
                          </>
                        )}
                        {getMainParticipant()?.isOwner && 
                         !((getMainParticipant()?.id === currentUserId && isScreenSharing) || 
                           (getMainParticipant()?.id && activeStreams[getMainParticipant()!.id])) && (
                          <>
                            <span className="text-yellow-400">👑</span>
                            <span className="text-yellow-400 font-semibold">Dono do Grupo</span>
                          </>
                        )}
                        {currentlyWatching === getMainParticipant()?.id && 
                         getMainParticipant()?.id !== currentUserId && (
                          <>
                            <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
                            <span className="text-blue-400 font-semibold">Assistindo</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Participantes secundários */}
                  {getSecondaryParticipants().length > 0 && (
                    <div className="h-32 flex space-x-4 overflow-x-auto">
                      {getSecondaryParticipants().map((participant) => (
                        <div
                          key={participant.id}
                          className={`flex-shrink-0 w-28 h-full bg-gray-700 rounded-lg border overflow-hidden relative group transition-all cursor-pointer ${
                            activeStreams[participant.id] 
                              ? 'border-red-500 hover:border-red-400' 
                              : currentlyWatching === participant.id
                                ? 'border-blue-500 hover:border-blue-400'
                                : 'border-gray-600 hover:border-purple-400'
                          }`}
                          onClick={() => {
                            if (activeStreams[participant.id]) {
                              switchToStream(participant.id);
                            }
                          }}
                          title={
                            activeStreams[participant.id] 
                              ? `Clique para assistir ${participant.name}` 
                              : currentlyWatching === participant.id
                                ? `Assistindo ${participant.name}`
                                : participant.name
                          }
                        >
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <div className="relative mb-2">
                              {(participant.avatar.startsWith('http') || participant.avatar.startsWith('data:image')) ? (
                                <img
                                  src={participant.avatar}
                                  alt={participant.name}
                                  className="w-12 h-12 rounded-full border-2 border-gray-500 object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center text-lg font-bold border-2 border-gray-500">
                                  {participant.avatar}
                                </div>
                              )}
                              
                              {/* Indicador de transmissão */}
                              {activeStreams[participant.id] && (
                                <div className="absolute -top-1 -left-1 w-4 h-4 bg-red-500 rounded-full animate-pulse flex items-center justify-center">
                                  <Monitor size={8} className="text-white" />
                                </div>
                              )}
                              
                              {/* Indicador de que está sendo assistido */}
                              {currentlyWatching === participant.id && (
                                <div className="absolute -top-1 -left-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                </div>
                              )}
                              
                              {participant.isOwner && (
                                <div className="absolute -top-1 -right-1 bg-yellow-500 p-1 rounded-full">
                                  <span className="text-black text-xs">👑</span>
                                </div>
                              )}
                              {participant.isMuted && (
                                <div className="absolute -bottom-1 -right-1 bg-red-600 p-1 rounded-full">
                                  <MicOff size={10} className="text-white" />
                                </div>
                              )}
                            </div>
                            <p className="text-white text-xs font-semibold text-center truncate w-full px-1">
                              {participant.isCurrentUser ? 'Você' : participant.name.split(' ')[0]}
                            </p>
                            
                            {/* Status da transmissão */}
                            {activeStreams[participant.id] && (
                              <p className="text-red-400 text-xs text-center">Transmitindo</p>
                            )}
                            {currentlyWatching === participant.id && !activeStreams[participant.id] && (
                              <p className="text-blue-400 text-xs text-center">Assistindo</p>
                            )}
                          </div>
                          
                          {/* Indicador de hover para transmissões ativas */}
                          {activeStreams[participant.id] && (
                            <div className="absolute inset-0 border-2 border-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Painel de transmissões ativas */}
                  {Object.keys(activeStreams).length > 1 && (
                    <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-90 rounded-full px-4 py-2 border border-gray-600">
                      <div className="flex items-center space-x-3">
                        <span className="text-white text-sm font-semibold">
                          {Object.keys(activeStreams).length} transmitindo
                        </span>
                        <div className="flex space-x-2">
                          {Object.keys(activeStreams).map(streamerId => {
                            const streamer = participants.find(p => p.id === streamerId);
                            if (!streamer) return null;
                            
                            return (
                              <button
                                key={streamerId}
                                onClick={() => switchToStream(streamerId)}
                                className={`w-8 h-8 rounded-full border-2 transition-all ${
                                  currentlyWatching === streamerId
                                    ? 'border-blue-400 scale-110'
                                    : 'border-gray-400 hover:border-white hover:scale-105'
                                }`}
                                title={`Assistir ${streamer.name}`}
                              >
                                {(streamer.avatar.startsWith('http') || streamer.avatar.startsWith('data:image')) ? (
                                  <img
                                    src={streamer.avatar}
                                    alt={streamer.name}
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-bold">
                                    {streamer.avatar}
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Layout Individual */}
                  {isScreenSharing && screenStreamRef.current && (
                    <div className="absolute inset-4 bg-gray-900 rounded-xl border border-green-500 overflow-hidden">
                      <div className="relative w-full h-full">
                        {/* Controles de transmissão */}
                        <div className="absolute top-4 right-4 flex space-x-2 z-10">
                          <button
                            onClick={toggleFullScreen}
                            className="p-2 bg-black bg-opacity-75 hover:bg-opacity-90 rounded-full transition-all hover:scale-110"
                            title={isFullScreen ? "Sair da tela cheia" : "Tela cheia"}
                          >
                            <Maximize size={16} className="text-white" />
                          </button>
                        </div>
                        
                        <video
                          ref={videoRef}
                          autoPlay
                          muted
                          className="w-full h-full object-contain bg-black rounded-xl"
                          onLoadedMetadata={() => {
                            if (videoRef.current && screenStreamRef.current) {
                              videoRef.current.srcObject = screenStreamRef.current;
                            }
                          }}
                        />
                        <div className="absolute top-4 left-4 bg-black bg-opacity-75 px-3 py-1 rounded-full flex items-center space-x-2">
                          <Monitor size={16} className="text-green-400" />
                          <span className="text-green-400 font-semibold">Compartilhando Tela</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {!isScreenSharing && !isScreenReceiving && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <div className="relative">
                          {(contactAvatar.startsWith('http') || contactAvatar.startsWith('data:image')) ? (
                            <img
                              src={contactAvatar}
                              alt={contactName}
                              className="w-48 h-48 rounded-full border-4 border-purple-400 object-cover mx-auto"
                            />
                          ) : (
                            <div className="w-48 h-48 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-6xl font-bold border-4 border-purple-400 mx-auto">
                              {contactAvatar}
                            </div>
                          )}
                          {getConnectionIcon()}
                        </div>
                        <h2 className="text-3xl font-bold text-white">{contactName}</h2>
                        <div className="flex items-center justify-center space-x-4 text-gray-400">
                          <span>Chamada de voz ativa</span>
                          <span>•</span>
                          <span>{formatDuration(callDuration)}</span>
                        </div>
                        <div className="text-gray-500 text-sm">
                          <p>Clique no botão de compartilhamento para transmitir sua tela</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Painel de configurações */}
              {showSettings && (
                <div className="absolute top-4 right-4 bg-gray-800 border border-gray-600 rounded-xl p-4 shadow-xl min-w-64">
                  <h4 className="text-white font-semibold mb-3">Configurações da Chamada</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Qualidade do Compartilhamento</label>
                      <select
                        value={screenShareQuality}
                        onChange={(e) => setScreenShareQuality(e.target.value as any)}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white"
                      >
                        <option value="low">Baixa (720p)</option>
                        <option value="medium">Média (1080p)</option>
                        <option value="high">Alta (1440p)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Status da Conexão</label>
                      <div className="flex items-center space-x-2">
                        {getConnectionIcon()}
                        <span className="text-white capitalize">{connectionQuality}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Controles da chamada */}
            <div className="p-6 border-t border-gray-700">
              {isIncoming && !isConnected ? (
                <div className="flex justify-center space-x-6">
                  <button
                    onClick={handleReject}
                    className="w-16 h-16 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                  >
                    <PhoneOff size={24} />
                  </button>
                  <button
                    onClick={handleAnswer}
                    className="w-16 h-16 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                  >
                    <Phone size={24} />
                  </button>
                </div>
              ) : (
                <div className="flex justify-center items-center space-x-4">
                  <button
                    onClick={toggleMute}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-105 ${
                      isMuted 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                    title={isMuted ? 'Ativar microfone' : 'Mutar microfone'}
                  >
                    {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                  </button>
                  
                  <button
                    onClick={handleEndCall}
                    className="w-16 h-16 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                    title="Encerrar chamada"
                  >
                    <PhoneOff size={24} />
                  </button>
                  
                  <button
                    onClick={toggleSpeaker}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-105 ${
                      !isSpeakerOn 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                    title={isSpeakerOn ? 'Desativar alto-falante' : 'Ativar alto-falante'}
                  >
                    {isSpeakerOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
                  </button>
                  
                  <button
                    onClick={isScreenSharing ? stopMyScreenShare : startMyScreenShare}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-105 ${
                      isScreenSharing 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                    title={isScreenSharing ? 'Parar compartilhamento' : 'Compartilhar tela'}
                  >
                    {isScreenSharing ? <MonitorOff size={20} /> : <Monitor size={20} />}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
