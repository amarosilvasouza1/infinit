'use client';

import { useState, useRef } from 'react';
import ImageCropper from './ImageCropper';

interface ImageUploaderProps {
  currentImage?: string;
  onImageChange: (imageUrl: string | null) => void;
  className?: string;
  acceptedTypes?: string;
  maxSizeMB?: number;
  title?: string;
  description?: string;
  uploadButtonText?: string;
  removeButtonText?: string;
  isCircular?: boolean;
  enableCrop?: boolean;
  aspectRatio?: number;
}

export default function ImageUploader({
  currentImage,
  onImageChange,
  className = '',
  acceptedTypes = 'image/*',
  maxSizeMB = 10,
  title = 'Upload de Imagem',
  description = 'Selecione uma imagem do seu dispositivo',
  uploadButtonText = '📷 Selecionar Imagem',
  removeButtonText = '🗑️ Remover',
  isCircular = false,
  enableCrop = false,
  aspectRatio = 1
}: ImageUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file) return;

    // Verificar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    // Verificar se é GIF e aplicar validações específicas
    if (file.type === 'image/gif') {
      if (file.size > 15 * 1024 * 1024) { // 15MB para GIFs
        alert(`❌ GIF muito grande!\n\nTamanho atual: ${(file.size / (1024 * 1024)).toFixed(1)}MB\nLimite para GIFs: 15MB\n\nTente comprimir o arquivo se necessário.`);
        return;
      }
      
      // Informar sobre funcionalidade premium
      console.log('🎬 GIF detectado - funcionalidade disponível para usuários Premium');
    }

    // Verificar tamanho do arquivo para outros tipos
    if (file.type !== 'image/gif' && file.size > maxSizeMB * 1024 * 1024) {
      alert(`❌ Arquivo muito grande!\n\nTamanho atual: ${(file.size / (1024 * 1024)).toFixed(1)}MB\nLimite máximo: ${maxSizeMB}MB\n\nTente comprimir a imagem ou escolha um arquivo menor.`);
      return;
    }

    setUploading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      
      // Para GIFs, avisar sobre tamanho em base64
      if (file.type === 'image/gif') {
        const base64Size = (result.length * 3) / 4;
        if (base64Size > 10 * 1024 * 1024) { // 10MB em base64
          const shouldContinue = confirm(`⚠️ GIF grande detectado\n\nTamanho processado: ${(base64Size / (1024 * 1024)).toFixed(1)}MB\n\nContinuar? (Arquivo será processado normalmente)`);
          if (!shouldContinue) {
            setUploading(false);
            return;
          }
        }
      }
      
      if (enableCrop) {
        setTempImageUrl(result);
        setShowCropper(true);
        setUploading(false);
      } else {
        onImageChange(result);
        setUploading(false);
      }
    };
    reader.onerror = () => {
      alert('Erro ao carregar a imagem. Tente novamente.');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const removeImage = () => {
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isImageUrl = (url?: string) => {
    return url && (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:'));
  };

  const handleCropComplete = (croppedImageUrl: string) => {
    onImageChange(croppedImageUrl);
    setShowCropper(false);
    setTempImageUrl(null);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setTempImageUrl(null);
  };

  return (
    <>
      <div className={`space-y-4 ${className}`}>
      <div>
        <h4 className="text-white font-medium mb-2">{title}</h4>
        <p className="text-gray-400 text-sm mb-4">{description}</p>
      </div>

      {/* Preview da imagem atual */}
      {currentImage && (
        <div className="flex items-center space-x-4">
          <div className={`relative ${isCircular ? 'rounded-full' : 'rounded-lg'} overflow-hidden bg-gray-700`}>
            {isImageUrl(currentImage) ? (
              <img
                src={currentImage}
                alt="Preview"
                className={`w-20 h-20 object-cover ${isCircular ? 'rounded-full' : 'rounded-lg'}`}
              />
            ) : (
              <div className={`w-20 h-20 flex items-center justify-center text-2xl ${isCircular ? 'rounded-full' : 'rounded-lg'} bg-gray-600`}>
                {currentImage}
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="text-white font-medium">Imagem atual</p>
            <p className="text-gray-400 text-sm">
              {isImageUrl(currentImage) ? 'Imagem personalizada' : 'Emoji/Ícone'}
            </p>
          </div>
          {isImageUrl(currentImage) && (
            <button
              onClick={removeImage}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
            >
              {removeButtonText}
            </button>
          )}
        </div>
      )}

      {/* Área de upload */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${
          dragOver
            ? 'border-purple-400 bg-purple-400/10'
            : 'border-gray-600 hover:border-gray-500 bg-gray-800 hover:bg-gray-700'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        {uploading ? (
          <div className="space-y-2">
            <div className="text-3xl">⏳</div>
            <p className="text-white">Carregando imagem...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-4xl text-gray-400">📷</div>
            <div>
              <p className="text-white font-medium">{uploadButtonText}</p>
              <p className="text-gray-400 text-sm mt-1">
                Arraste e solte aqui ou clique para selecionar
              </p>
              <p className="text-gray-500 text-xs mt-2">
                Máximo {maxSizeMB}MB • JPG, PNG, GIF
              </p>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          onChange={handleInputChange}
          className="hidden"
          disabled={uploading}
        />
      </div>

      {/* Botões de ação */}
      {!currentImage && (
        <div className="flex justify-center">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            {uploadButtonText}
          </button>
        </div>
      )}
      </div>

      {/* Image Cropper Modal */}
      {showCropper && tempImageUrl && (
        <ImageCropper
          imageUrl={tempImageUrl}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={aspectRatio}
          title={`Ajustar ${isCircular ? 'Avatar' : 'Banner'}`}
        />
      )}
    </>
  );
}
