'use client';

import { useState } from 'react';
import { X, Download, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

interface MediaPreviewProps {
  isOpen: boolean;
  mediaUrl: string | null;
  mediaType: 'image' | 'video';
  onClose: () => void;
}

const MediaPreview = ({ isOpen, mediaUrl, mediaType, onClose }: MediaPreviewProps) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  if (!isOpen || !mediaUrl) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = mediaUrl;
    link.download = `media_${Date.now()}.${mediaType === 'image' ? 'jpg' : 'mp4'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 300));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 25));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(100);
    setRotation(0);
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      {/* Header com controles */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <div className="flex space-x-2">
          {mediaType === 'image' && (
            <>
              <button 
                onClick={handleZoomOut}
                className="bg-gray-800/80 hover:bg-gray-700 p-2 rounded-lg text-white transition-colors"
                title="Diminuir zoom"
              >
                <ZoomOut size={20} />
              </button>
              <button 
                onClick={handleZoomIn}
                className="bg-gray-800/80 hover:bg-gray-700 p-2 rounded-lg text-white transition-colors"
                title="Aumentar zoom"
              >
                <ZoomIn size={20} />
              </button>
              <button 
                onClick={handleRotate}
                className="bg-gray-800/80 hover:bg-gray-700 p-2 rounded-lg text-white transition-colors"
                title="Girar"
              >
                <RotateCcw size={20} />
              </button>
              <button 
                onClick={handleReset}
                className="bg-gray-800/80 hover:bg-gray-700 px-3 py-2 rounded-lg text-white transition-colors text-sm"
                title="Resetar"
              >
                Reset
              </button>
              <div className="bg-gray-800/80 px-3 py-2 rounded-lg text-white text-sm">
                {zoom}%
              </div>
            </>
          )}
        </div>

        <div className="flex space-x-2">
          <button 
            onClick={handleDownload}
            className="bg-gray-800/80 hover:bg-gray-700 p-2 rounded-lg text-white transition-colors"
            title="Baixar"
          >
            <Download size={20} />
          </button>
          <button 
            onClick={onClose}
            className="bg-gray-800/80 hover:bg-gray-700 p-2 rounded-lg text-white transition-colors"
            title="Fechar"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Conteúdo da mídia */}
      <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center">
        {mediaType === 'image' ? (
          <img 
            src={mediaUrl} 
            alt="Preview"
            className="max-w-full max-h-full object-contain transition-transform duration-200 cursor-move"
            style={{ 
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'center'
            }}
            draggable={false}
          />
        ) : (
          <video 
            src={mediaUrl} 
            controls
            autoPlay
            className="max-w-full max-h-full object-contain"
            style={{ transform: `rotate(${rotation}deg)` }}
          />
        )}
      </div>

      {/* Indicadores de navegação */}
      {mediaType === 'image' && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800/80 rounded-lg px-4 py-2 text-white text-sm">
          Use os controles acima para navegar • Clique fora para fechar
        </div>
      )}

      {/* Área clicável para fechar */}
      <div 
        className="absolute inset-0 -z-10"
        onClick={onClose}
      />
    </div>
  );
};

export default MediaPreview;
