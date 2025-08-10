'use client';

import { useEffect, useRef } from 'react';
import { Phone, Video } from 'lucide-react';
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { useChat } from '@/contexts/ChatContext';
import { useMedia } from '@/contexts/MediaContext';

const ChatView = () => {
    const { state } = useChat();
    const { startVoiceCall, startVideoCall } = useMedia();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [state.messages, state.currentChatId]);

    if (!state.currentChatId) {
        return (
            <div className="flex flex-col h-full items-center justify-center text-gray-400">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Bem-vindo ao Infinit!</h2>
                    <p>Selecione uma conversa para começar a conversar</p>
                </div>
            </div>
        );
    }

    const currentChat = state.chats.find(chat => chat.id === state.currentChatId);
    const messages = state.messages[state.currentChatId] || [];

    return (
        <div className="flex flex-col h-full">
            {/* Header do chat atual */}
            <div className="p-4 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-white">{currentChat?.name}</h3>
                    <p className="text-sm text-gray-400">
                        {currentChat?.type === 'group' ? `${currentChat.participants.length} participantes` : 
                         currentChat?.isOnline ? 'Online' : 'Offline'}
                    </p>
                </div>
                
                {/* Botões de ação */}
                <div className="flex space-x-2">
                    <button
                        onClick={() => startVoiceCall()}
                        className="p-2 bg-green-600 hover:bg-green-700 rounded-full transition-colors"
                        title="Chamada de voz"
                    >
                        <Phone className="w-5 h-5 text-white" />
                    </button>
                    <button
                        onClick={() => startVideoCall()}
                        className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
                        title="Chamada de vídeo"
                    >
                        <Video className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>

            {/* Área de mensagens */}
            <div className="flex-grow p-4 space-y-6 overflow-y-auto">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-400 mt-10">
                        <p>Nenhuma mensagem ainda. Comece a conversa!</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <ChatMessage
                            key={msg.id}
                            variant={msg.senderId === state.user.id ? "sent" : "received"}
                            avatarSrc={msg.senderId === state.user.id ? state.user.avatar : currentChat?.avatar || ''}
                            avatarFallback={msg.senderName.charAt(0)}
                            message={msg.content}
                            isGroupMessage={currentChat?.type === 'group' && msg.senderId !== state.user.id}
                            senderName={msg.senderName}
                            animated={Math.random() > 0.7} // 30% chance de animação para dar vida
                        />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <ChatInput />
        </div>
    );
};

export default ChatView;
