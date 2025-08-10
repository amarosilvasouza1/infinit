'use client';

import { useState } from 'react';
import { Send, Mic, Smile, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChat } from '@/contexts/ChatContext';
import { useMedia } from '@/contexts/MediaContext';

const ChatInput = () => {
    const [message, setMessage] = useState('');
    const { sendMessage, state } = useChat();
    const { startScreenShare, state: mediaState } = useMedia();

    const handleSend = () => {
        if (message.trim() && state.currentChatId) {
            sendMessage(message);
            setMessage('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!state.currentChatId) {
        return (
            <div className="p-4 bg-gray-900 border-t border-gray-700 text-center text-gray-400">
                Selecione uma conversa para começar
            </div>
        );
    }

    return (
        <div className="p-4 bg-gray-900 border-t border-gray-700">
            {/* Botão de compartilhamento de tela - só aparece durante chamadas */}
            {(mediaState.isVoiceCall || mediaState.isVideoCall) && (
                <div className="flex justify-center mb-3">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={startScreenShare} 
                        className="bg-purple-600 hover:bg-purple-500 border-purple-600"
                        disabled={mediaState.isScreenSharing}
                    >
                        <Monitor className="w-4 h-4 mr-1" />
                        {mediaState.isScreenSharing ? 'Compartilhando...' : 'Compartilhar Tela'}
                    </Button>
                </div>
            )}

            {/* Input de mensagem */}
            <div className="flex items-center bg-gray-700 rounded-lg p-2">
                <input 
                    type="text" 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite uma mensagem..."
                    className="flex-grow bg-transparent text-white placeholder-gray-400 focus:outline-none px-2"
                />
                <Button variant="ghost" size="icon">
                    <Smile className="text-gray-400" />
                </Button>
                <Button variant="ghost" size="icon">
                    <Mic className="text-gray-400" />
                </Button>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="bg-indigo-600 hover:bg-indigo-500 rounded-full"
                    onClick={handleSend}
                    disabled={!message.trim()}
                >
                    <Send className="text-white" />
                </Button>
            </div>
        </div>
    );
};

export default ChatInput;
