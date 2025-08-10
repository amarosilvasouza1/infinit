'use client';

import { useState, useRef, useCallback } from 'react';

interface ImageCropperProps {
  imageUrl: string;
  onCropComplete: (croppedImageUrl: string) => void;
  onCancel: () => void;
  aspectRatio?: number; // 1 para quadrado, 16/9 para banner, etc.
  title?: string;
}

export default function ImageCropper({
  imageUrl,
  onCropComplete,
  onCancel,
  aspectRatio = 1,
  title = 'Ajustar Imagem'
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 200, height: 200 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleImageLoad = useCallback(() => {
    if (imageRef.current) {
      const { naturalWidth, naturalHeight } = imageRef.current;
      setImageSize({ width: naturalWidth, height: naturalHeight });
      
      // Definir crop inicial baseado no aspect ratio
      const size = Math.min(naturalWidth, naturalHeight);
      setCrop({
        x: (naturalWidth - size) / 2,
        y: (naturalHeight - size) / 2,
        width: size,
        height: aspectRatio === 1 ? size : size / aspectRatio
      });
    }
  }, [aspectRatio]);

  const handleCropSubmit = useCallback(() => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calcular escala da imagem exibida vs tamanho natural
    const displayedImage = imageRef.current;
    const scaleX = imageSize.width / displayedImage.width;
    const scaleY = imageSize.height / displayedImage.height;

    // Ajustar dimensões do canvas
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;

    // Desenhar a parte cortada da imagem
    ctx.drawImage(
      displayedImage,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    // Converter para data URL
    const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.9);
    onCropComplete(croppedImageUrl);
  }, [crop, imageSize, onCropComplete]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-white text-2xl transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Crop Area */}
        <div className="p-6 overflow-auto max-h-[60vh]">
          <div className="relative inline-block">
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Imagem para cortar"
              className="max-w-full max-h-96 object-contain"
              onLoad={handleImageLoad}
            />
            
            {/* Crop overlay */}
            <div
              className="absolute border-2 border-purple-500 bg-purple-500/20"
              style={{
                left: crop.x,
                top: crop.y,
                width: crop.width,
                height: crop.height,
                cursor: 'move'
              }}
            >
              {/* Handles para redimensionar */}
              <div className="absolute -top-1 -left-1 w-3 h-3 bg-purple-500 rounded-full cursor-nw-resize"></div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full cursor-ne-resize"></div>
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-purple-500 rounded-full cursor-sw-resize"></div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-purple-500 rounded-full cursor-se-resize"></div>
            </div>
          </div>

          {/* Controles de ajuste */}
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Posição X</label>
                <input
                  type="range"
                  min="0"
                  max={Math.max(0, imageSize.width - crop.width)}
                  value={crop.x}
                  onChange={(e) => setCrop(prev => ({ ...prev, x: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Posição Y</label>
                <input
                  type="range"
                  min="0"
                  max={Math.max(0, imageSize.height - crop.height)}
                  value={crop.y}
                  onChange={(e) => setCrop(prev => ({ ...prev, y: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tamanho</label>
              <input
                type="range"
                min="50"
                max={Math.min(imageSize.width, imageSize.height)}
                value={crop.width}
                onChange={(e) => {
                  const width = parseInt(e.target.value);
                  const height = aspectRatio === 1 ? width : width / aspectRatio;
                  setCrop(prev => ({ 
                    ...prev, 
                    width, 
                    height,
                    x: Math.min(prev.x, imageSize.width - width),
                    y: Math.min(prev.y, imageSize.height - height)
                  }));
                }}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Canvas oculto para gerar a imagem cortada */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleCropSubmit}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Aplicar Corte
          </button>
        </div>
      </div>
    </div>
  );
}
