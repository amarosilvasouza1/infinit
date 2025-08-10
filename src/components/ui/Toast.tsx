'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
  index?: number;
}

export default function Toast({ 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose,
  index = 0
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose?.(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <AlertCircle size={20} />;
      case 'warning':
        return <AlertCircle size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 border-green-500';
      case 'error':
        return 'bg-red-600 border-red-500';
      case 'warning':
        return 'bg-yellow-600 border-yellow-500';
      default:
        return 'bg-blue-600 border-blue-500';
    }
  };

  return (
    <div 
      className={`
        fixed right-4 z-50 max-w-sm w-full
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
      style={{ top: `${4 + (index * 80)}px` }}
    >
      <div className={`
        ${getColors()} text-white p-4 rounded-lg shadow-2xl border-l-4
        flex items-start space-x-3
      `}>
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium break-words">
            {message}
          </p>
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 ml-2 p-1 hover:bg-white/10 rounded transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
