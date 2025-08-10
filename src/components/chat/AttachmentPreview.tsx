'use client';

import { useState } from 'react';
import { X, Download, Eye } from 'lucide-react';

interface AttachmentPreviewProps {
  file: File;
  onRemove: () => void;
  onSend: (file: File) => void;
}

export default function AttachmentPreview({ file, onRemove, onSend }: AttachmentPreviewProps) {
  const [preview, setPreview] = useState<string | null>(null);

  // Gerar preview para imagens
  useState(() => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string): string => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType.startsWith('audio/')) return '🎵';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('text')) return '📝';
    if (fileType.includes('zip') || fileType.includes('rar')) return '🗜️';
    return '📎';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4 border border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Preview do Anexo</h3>
          <button
            onClick={onRemove}
            className="text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Preview da imagem */}
          {preview && (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
                <Eye size={16} className="text-white" />
              </div>
            </div>
          )}

          {/* Info do arquivo */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">
                {getFileIcon(file.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{file.name}</p>
                <p className="text-sm text-gray-400">
                  {formatFileSize(file.size)} • {file.type || 'Tipo desconhecido'}
                </p>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex space-x-3">
            <button
              onClick={onRemove}
              className="flex-1 bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => onSend(file)}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
