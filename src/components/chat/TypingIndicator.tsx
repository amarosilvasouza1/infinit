'use client';

import { useEffect, useState } from 'react';

interface TypingIndicatorProps {
  userName?: string;
}

const TypingIndicator = ({ userName = "Alguém" }: TypingIndicatorProps) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center space-x-3 py-2 px-4">
      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-sm">
        {userName[0].toUpperCase()}
      </div>
      <div className="bg-gray-700 rounded-lg px-3 py-2">
        <div className="flex items-center space-x-1">
          <span className="text-gray-400 text-sm">{userName} está digitando</span>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
