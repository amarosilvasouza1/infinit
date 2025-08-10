'use client';

import { useState, useRef } from 'react';
import { useProfile } from '@/contexts/ProfileContext';

interface GalleryManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GalleryManager({ isOpen, onClose }: GalleryManagerProps) {
  const { profile, addToGallery, removeFromGallery } = useProfile();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = () => {
    if (uploadPreview) {
      addToGallery({
        type: 'image',
        url: uploadPreview,
        caption: caption.trim() || undefined
      });
      setUploadPreview(null);
      setCaption('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const toggleSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleDeleteSelected = () => {
    selectedItems.forEach(id => removeFromGallery(id));
    setSelectedItems([]);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">📸 Gerenciar Galeria</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl transition-colors"
            >
              ×
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <p className="text-gray-400">
              {profile?.gallery?.length || 0} itens na galeria
            </p>
            
            <div className="flex space-x-3">
              {selectedItems.length > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  <span>🗑️</span>
                  <span>Excluir ({selectedItems.length})</span>
                </button>
              )}
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <span>📷</span>
                <span>Adicionar Foto</span>
              </button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Upload Preview */}
        {uploadPreview && (
          <div className="p-6 border-b border-gray-700 bg-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">📎 Nova Mídia</h3>
            <div className="flex items-start space-x-4">
              <div className="relative">
                <img
                  src={uploadPreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg"
                />
              </div>
              <div className="flex-1">
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Adicione uma legenda..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={3}
                />
                <div className="flex justify-end space-x-3 mt-3">
                  <button
                    onClick={() => setUploadPreview(null)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleUpload}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    Adicionar à Galeria
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gallery Grid */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {(profile?.gallery?.length || 0) === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📷</div>
              <h3 className="text-xl font-semibold text-white mb-2">Galeria vazia</h3>
              <p className="text-gray-400 mb-6">Adicione suas primeiras fotos e vídeos!</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Adicionar primeira foto
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(profile?.gallery || []).map((item) => (
                <div
                  key={item.id}
                  className={`relative group cursor-pointer rounded-lg overflow-hidden transition-all ${
                    selectedItems.includes(String(item.id)) 
                      ? 'ring-2 ring-purple-500 scale-95' 
                      : 'hover:scale-105'
                  }`}
                  onClick={() => toggleSelection(String(item.id))}
                >
                  {/* Image/Video */}
                  <div className="aspect-square">
                    {item.type === 'image' ? (
                      <img
                        src={item.url}
                        alt={item.title || 'Galeria'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={item.url}
                        className="w-full h-full object-cover"
                        muted
                      />
                    )}
                  </div>

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200">
                    {/* Type indicator */}
                    <div className="absolute top-2 left-2">
                      <span className="bg-black/60 text-white px-2 py-1 rounded text-xs">
                        {item.type === 'image' ? '📷' : '🎥'}
                      </span>
                    </div>

                    {/* Selection checkbox */}
                    <div className="absolute top-2 right-2">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedItems.includes(String(item.id))
                          ? 'bg-purple-600 border-purple-600'
                          : 'border-white bg-black/40'
                      }`}>
                        {selectedItems.includes(String(item.id)) && (
                          <span className="text-white text-xs">✓</span>
                        )}
                      </div>
                    </div>

                    {/* Info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.title && (
                        <p className="text-white text-sm mb-1 line-clamp-2">{item.title}</p>
                      )}
                      <p className="text-gray-300 text-xs">
                        {formatDate(new Date(item.date))}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              {selectedItems.length > 0 ? (
                `${selectedItems.length} item${selectedItems.length > 1 ? 's' : ''} selecionado${selectedItems.length > 1 ? 's' : ''}`
              ) : (
                'Clique nos itens para selecioná-los'
              )}
            </div>
            
            <button
              onClick={onClose}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
