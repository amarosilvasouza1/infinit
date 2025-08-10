'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Download, RotateCcw, Maximize2 } from 'lucide-react';

interface MediaMessageProps {
  type: 'image' | 'video' | 'audio' | 'gif';
  url: string;
  fileName: string;
  duration?: number;
  onPreview?: (url: string) => void;
}

const MediaMessage = ({ type, url, fileName, duration, onPreview }: MediaMessageProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration || 0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (type === 'audio' && audioRef.current) {
      const audio = audioRef.current;
      
      const updateTime = () => setCurrentTime(audio.currentTime);
      const updateDuration = () => {
        setTotalDuration(audio.duration);
        setIsLoading(false);
      };
      const handleEnd = () => setIsPlaying(false);

      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('loadedmetadata', updateDuration);
      audio.addEventListener('ended', handleEnd);
      audio.addEventListener('canplay', () => setIsLoading(false));

      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('loadedmetadata', updateDuration);
        audio.removeEventListener('ended', handleEnd);
        audio.removeEventListener('canplay', () => setIsLoading(false));
      };
    }
  }, [type]);

  const togglePlayPause = () => {
    if (type === 'audio' && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const downloadMedia = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (type === 'image' || type === 'gif') {
    return (
      <div className="relative group">
        <img 
          src={url} 
          alt={fileName}
          className="max-w-full max-h-64 rounded-lg cursor-pointer transition-transform group-hover:scale-105"
          onClick={() => onPreview?.(url)}
          onLoad={() => setIsLoading(false)}
        />
        {type === 'gif' && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-2 py-1 rounded">
            GIF
          </div>
        )}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-700 rounded-lg flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        )}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onPreview?.(url);
            }}
            className="bg-black/50 hover:bg-black/70 p-1 rounded text-white"
            title="Visualizar"
          >
            <Maximize2 size={16} />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              downloadMedia();
            }}
            className="bg-black/50 hover:bg-black/70 p-1 rounded text-white"
            title="Baixar"
          >
            <Download size={16} />
          </button>
        </div>
      </div>
    );
  }

  if (type === 'video') {
    return (
      <div className="relative group">
        <video 
          ref={videoRef}
          src={url} 
          controls
          className="max-w-full max-h-64 rounded-lg"
          preload="metadata"
          onLoadedData={() => setIsLoading(false)}
        />
        {isLoading && (
          <div className="absolute inset-0 bg-gray-700 rounded-lg flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        )}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={downloadMedia}
            className="bg-black/50 hover:bg-black/70 p-1 rounded text-white"
            title="Baixar"
          >
            <Download size={16} />
          </button>
        </div>
      </div>
    );
  }

  if (type === 'audio') {
    return (
      <div className="bg-gray-600/50 rounded-lg p-3 min-w-[280px]">
        <audio ref={audioRef} src={url} preload="metadata" />
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={togglePlayPause}
            disabled={isLoading}
            className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50 p-2 rounded-full transition-colors"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : isPlaying ? (
              <Pause size={16} />
            ) : (
              <Play size={16} />
            )}
          </button>

          <div className="flex-1">
            <div className="flex justify-between text-xs text-gray-300 mb-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(totalDuration)}</span>
            </div>
            <input 
              type="range"
              min={0}
              max={totalDuration}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center space-x-1">
            <Volume2 size={14} className="text-gray-400" />
            <input 
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={volume}
              onChange={handleVolumeChange}
              className="w-12 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <button 
            onClick={downloadMedia}
            className="text-gray-400 hover:text-white p-1"
            title="Baixar"
          >
            <Download size={14} />
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-2 truncate">{fileName}</p>

        <style jsx>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            height: 12px;
            width: 12px;
            border-radius: 50%;
            background: #a855f7;
            cursor: pointer;
          }
          
          .slider::-moz-range-thumb {
            height: 12px;
            width: 12px;
            border-radius: 50%;
            background: #a855f7;
            cursor: pointer;
            border: none;
          }
        `}</style>
      </div>
    );
  }

  return null;
};

export default MediaMessage;
