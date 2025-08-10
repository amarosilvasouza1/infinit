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
  currentUserId = 'current-user'
}: VoiceCallProps) {
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
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState('top-right');
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

  // Carregar posição salva
  useEffect(() => {
    const savedPosition = localStorage.getItem('voiceCall-position');
    if (savedPosition) {
      setPosition(savedPosition);
    }
  }, []);

  // Salvar posição
  useEffect(() => {
    localStorage.setItem('voiceCall-position', position);
  }, [position]);

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

  // Funções de arrastar
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isMinimized) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !isMinimized) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    // Área magnética nos cantos
    const magnetZone = 100;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    let newX = deltaX;
    let newY = deltaY;
    
    // Magnetismo horizontal
    if (e.clientX < magnetZone) {
      newX = 20 - dragStart.x;
    } else if (e.clientX > windowWidth - magnetZone) {
      newX = windowWidth - 320 - dragStart.x;
    }
    
    // Magnetismo vertical
    if (e.clientY < magnetZone) {
      newY = 20 - dragStart.y;
    } else if (e.clientY > windowHeight - magnetZone) {
      newY = windowHeight - 140 - dragStart.y;
    }
    
    setPosition(`translate(${newX}px, ${newY}px)`);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    
    // Magnetismo aos cantos após soltar
    if (isMinimized) {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const element = callWindowRef.current;
      
      if (element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        let newPosition = 'top-right';
        
        if (centerX < windowWidth / 2 && centerY < windowHeight / 2) {
          newPosition = 'top-left';
        } else if (centerX >= windowWidth / 2 && centerY < windowHeight / 2) {
          newPosition = 'top-right';
        } else if (centerX < windowWidth / 2 && centerY >= windowHeight / 2) {
          newPosition = 'bottom-left';
        } else {
          newPosition = 'bottom-right';
        }
        
        setPosition(newPosition);
      }
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

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
          isMinimized 
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
          isMinimized ? 'w-80 h-28' : 'w-[800px] h-[600px]'
        }`}
        style={position.startsWith('translate') ? { transform: position } : {}}
      >
        {/* Versão minimizada */}
        {isMinimized && (
          <>
            <div 
              className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 rounded-2xl shadow-2xl border border-purple-400 p-4 h-full cursor-move relative overflow-hidden backdrop-blur-xl"
              onMouseDown={handleMouseDown}
            >
              {/* Efeito de brilho animado */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
              
              <div className="flex items-center justify-between h-full relative z-10">
                {/* Avatar e info */}
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {contactAvatar.startsWith('http') ? (
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
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {isGroup ? contactName : contactName}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      {formatDuration(callDuration)}
                      {isGroup && <span className="ml-2">• {participants.length} participantes</span>}
                      {isScreenSharing && <span className="ml-2 text-green-400">• Compartilhando</span>}
                      {isScreenReceiving && <span className="ml-2 text-blue-400">• Recebendo tela</span>}
                      {isGroup && currentlyWatching && !isScreenSharing && (
                        <span className="ml-2 text-blue-400">• Assistindo {participants.find(p => p.id === currentlyWatching)?.name}</span>
                      )}
                      {isGroup && Object.keys(activeStreams).length > 0 && !currentlyWatching && !isScreenSharing && (
                        <span className="ml-2 text-orange-400">• {Object.keys(activeStreams).length} transmitindo</span>
                      )}
                      {isDragging && <span className="ml-2 text-purple-400">• Arraste para reposicionar</span>}
                    </p>
                  </div>
                </div>
                
                {/* Botões */}
                <div className="flex space-x-2">
                  {/* Indicador de multi-transmissão */}
                  {isGroup && Object.keys(activeStreams).length > 1 && (
                    <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center animate-pulse" title={`${Object.keys(activeStreams).length} pessoas transmitindo`}>
                      <span className="text-xs font-bold">{Object.keys(activeStreams).length}</span>
                    </div>
                  )}
                  
                  {isScreenSharing && (
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center animate-pulse" title="Compartilhando tela">
                      <Monitor size={12} />
                    </div>
                  )}
                  
                  {/* Indicador de recebimento de transmissão */}
                  {currentlyWatching && !isScreenSharing && (
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center animate-pulse" title={`Assistindo ${participants.find(p => p.id === currentlyWatching)?.name}`}>
                      <Monitor size={12} />
                    </div>
                  )}
                  
                  <button
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
                    className="w-8 h-8 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center transition-all hover:scale-110 duration-200"
                    title="Expandir chamada"
                  >
                    <Maximize2 size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEndCall();
                    }}
                    className="w-8 h-8 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    title="Encerrar chamada"
                  >
                    <PhoneOff size={14} />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Versão expandida */}
        {!isMinimized && (
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl shadow-2xl backdrop-blur-xl border border-gray-700 h-full flex flex-col">
            {/* Header da chamada */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  {contactAvatar.startsWith('http') ? (
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

            {/* Área principal da chamada */}
            <div className="flex-1 relative overflow-hidden">
              {isGroup ? (
                <div className="flex flex-col h-full space-y-4 p-4">
                  {/* Participante principal */}
                  {getMainParticipant() && (
                    <div className="flex-1 bg-gray-800 rounded-xl border border-gray-600 overflow-hidden relative">
                      {/* Avatar e info do participante principal */}
                      {!getMainParticipant()?.isScreenSharing && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="relative">
                            {getMainParticipant()?.avatar.startsWith('http') ? (
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
                              {participant.avatar.startsWith('http') ? (
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
                                {streamer.avatar.startsWith('http') ? (
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
                          {contactAvatar.startsWith('http') ? (
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
