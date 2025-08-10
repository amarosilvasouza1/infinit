'use client';

import { useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';

interface NotificationProps {
  message: string;
  senderName: string;
  avatar: string;
  onClose: () => void;
  onClick: () => void;
}

const MessageNotification = ({ message, senderName, avatar, onClose, onClick }: NotificationProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 bg-gray-800 border border-gray-600 rounded-lg shadow-lg p-4 max-w-sm cursor-pointer z-50 animate-fade-in">
      <div className="flex items-start space-x-3" onClick={onClick}>
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-sm font-bold">
          {avatar}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <MessageCircle size={14} className="text-purple-400" />
            <p className="text-sm font-semibold text-white truncate">{senderName}</p>
          </div>
          <p className="text-sm text-gray-300 line-clamp-2">{message}</p>
        </div>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="text-gray-400 hover:text-white p-1"
        >
          <X size={14} />
        </button>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default MessageNotification;
