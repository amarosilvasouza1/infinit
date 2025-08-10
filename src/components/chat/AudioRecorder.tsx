'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Trash2, Play, Pause, Square } from 'lucide-react';

interface AudioRecorderProps {
  onSendAudio: (audioBlob: Blob, duration: number) => void;
  onCancel: () => void;
}

const AudioRecorder = ({ onSendAudio, onCancel }: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100); // Coleta dados a cada 100ms
      setIsRecording(true);
      setRecordingTime(0);
      setError(null);

      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Erro ao acessar microfone:', error);
      setError('Erro ao acessar o microfone. Verifique as permissões.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const playPreview = () => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const sendAudio = () => {
    if (audioUrl && audioChunksRef.current.length > 0) {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      onSendAudio(audioBlob, recordingTime);
      resetRecorder();
    }
  };

  const resetRecorder = () => {
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
    setIsPlaying(false);
    setError(null);
    
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    audioChunksRef.current = [];
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getRecordingStatus = () => {
    if (isRecording && isPaused) return 'Pausado';
    if (isRecording) return 'Gravando...';
    if (audioUrl) return 'Gravação finalizada';
    return 'Pronto para gravar';
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-600 w-full max-w-md">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">Gravação de Áudio</h3>
        <p className="text-sm text-gray-400">{getRecordingStatus()}</p>
      </div>

      {error && (
        <div className="bg-red-600/20 border border-red-600 rounded p-2 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="text-center mb-4">
        <div className="text-2xl font-mono text-white mb-2">
          {formatTime(recordingTime)}
        </div>
        
        {(isRecording || audioUrl) && (
          <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
            <div 
              className={`h-2 rounded-full transition-all duration-1000 ${
                isRecording && !isPaused ? 'bg-red-500' : 'bg-purple-500'
              }`}
              style={{ width: `${Math.min((recordingTime / 120) * 100, 100)}%` }}
            />
          </div>
        )}
      </div>

      <div className="flex justify-center space-x-3 mb-4">
        {!isRecording && !audioUrl && (
          <button 
            onClick={startRecording}
            className="bg-red-600 hover:bg-red-700 p-3 rounded-full transition-colors"
            title="Iniciar gravação"
          >
            <Mic size={24} />
          </button>
        )}

        {isRecording && (
          <>
            {isPaused ? (
              <button 
                onClick={resumeRecording}
                className="bg-green-600 hover:bg-green-700 p-3 rounded-full transition-colors"
                title="Continuar gravação"
              >
                <Mic size={24} />
              </button>
            ) : (
              <button 
                onClick={pauseRecording}
                className="bg-yellow-600 hover:bg-yellow-700 p-3 rounded-full transition-colors"
                title="Pausar gravação"
              >
                <MicOff size={24} />
              </button>
            )}

            <button 
              onClick={stopRecording}
              className="bg-gray-600 hover:bg-gray-700 p-3 rounded-full transition-colors"
              title="Parar gravação"
            >
              <Square size={24} />
            </button>
          </>
        )}

        {audioUrl && (
          <button 
            onClick={playPreview}
            className="bg-purple-600 hover:bg-purple-700 p-3 rounded-full transition-colors"
            title={isPlaying ? "Pausar" : "Reproduzir"}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
        )}
      </div>

      {audioUrl && (
        <audio 
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}

      <div className="flex space-x-2">
        <button 
          onClick={() => {
            resetRecorder();
            onCancel();
          }}
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
        >
          <Trash2 size={18} />
          <span>Cancelar</span>
        </button>

        {audioUrl && (
          <button 
            onClick={sendAudio}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
          >
            <Send size={18} />
            <span>Enviar</span>
          </button>
        )}
      </div>

      <div className="mt-3 text-xs text-gray-400 text-center">
        {isRecording ? 'Toque em Parar para finalizar' : 
         audioUrl ? 'Reproduza para verificar ou envie o áudio' :
         'Toque no microfone para começar a gravar'}
      </div>
    </div>
  );
};

export default AudioRecorder;
