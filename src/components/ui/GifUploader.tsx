'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Search, Star, Crown } from 'lucide-react';
import { useProfile } from '@/contexts/ProfileContext';

interface GifUploaderProps {
  onGifSelect: (gifUrl: string) => void;
  onClose: () => void;
}

const popularGifs = [
  'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif',
  'https://media.giphy.com/media/3o7TKF1fSIs1R19B8Y/giphy.gif',
  'https://media.giphy.com/media/26BRrSvJUa0crqw4E/giphy.gif',
  'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif',
  'https://media.giphy.com/media/26AHPxxnSw1L9T1rW/giphy.gif',
  'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
  'https://media.giphy.com/media/26xBI73gWquCBBCDe/giphy.gif',
  'https://media.giphy.com/media/3o7TKTDn976rzVgky4/giphy.gif',
];

export default function GifUploader({ onGifSelect, onClose }: GifUploaderProps) {
  const { profile } = useProfile();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedGif, setSelectedGif] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (!profile.isPremium) return;
    
    const files = Array.from(e.dataTransfer.files);
    const gifFile = files.find(file => file.type === 'image/gif');
    
    if (gifFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onGifSelect(e.target.result as string);
        }
      };
      reader.readAsDataURL(gifFile);
    }
  }, [profile.isPremium, onGifSelect]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile.isPremium) return;
    
    const file = e.target.files?.[0];
    if (file && file.type === 'image/gif') {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onGifSelect(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredGifs = popularGifs.filter(gif => 
    searchTerm === '' || gif.includes(searchTerm.toLowerCase())
  );

  if (!profile.isPremium) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              <span>GIFs Premium</span>
            </h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            
            <h4 className="text-white text-lg font-semibold mb-2">
              Recurso Premium
            </h4>
            
            <p className="text-gray-400 mb-4">
              GIFs animados são exclusivos para usuários Premium! 
              Faça upgrade para enviar GIFs personalizados e ter acesso a uma galeria exclusiva.
            </p>
            
            <button className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold py-2 px-4 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all">
              Fazer Upgrade Premium
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full h-3/4 mx-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-400" />
            <span>Galeria de GIFs Premium</span>
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de pesquisa */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar GIFs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
          />
        </div>

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-4 mb-4 transition-colors ${
            isDragging 
              ? 'border-purple-500 bg-purple-500/10' 
              : 'border-gray-600 hover:border-gray-500'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-400 mb-2">
              Arraste um GIF aqui ou{' '}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-purple-400 hover:text-purple-300 underline"
              >
                clique para selecionar
              </button>
            </p>
            <p className="text-xs text-gray-500">
              Apenas arquivos .gif são aceitos
            </p>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".gif"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Galeria de GIFs */}
        <div className="flex-1 overflow-y-auto">
          <h4 className="text-white font-medium mb-3">GIFs Populares</h4>
          <div className="grid grid-cols-3 gap-3">
            {filteredGifs.map((gif, index) => (
              <div
                key={index}
                className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer group ${
                  selectedGif === gif ? 'ring-2 ring-purple-500' : ''
                }`}
                onClick={() => {
                  setSelectedGif(gif);
                  onGifSelect(gif);
                }}
              >
                <img
                  src={gif}
                  alt={`GIF ${index + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-sm">✓</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredGifs.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400">Nenhum GIF encontrado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
