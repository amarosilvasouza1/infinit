'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChat } from "@/contexts/ChatContext";

const ChatList = () => {
    const { state, selectChat } = useChat();

    return (
        <div className="flex flex-col bg-gray-800 text-white w-80 p-4 border-r border-gray-700">
            <h2 className="text-xl font-bold mb-4">Conversas</h2>
            <div className="flex-grow space-y-2 overflow-y-auto">
                {state.chats.map((chat) => (
                    <div 
                        key={chat.id} 
                        className={`flex items-center p-2 space-x-3 rounded-md hover:bg-gray-700 cursor-pointer transition-colors ${
                            state.currentChatId === chat.id ? 'bg-gray-700' : ''
                        }`}
                        onClick={() => selectChat(chat.id)}
                    >
                        <Avatar>
                            <AvatarImage src={chat.avatar} alt={chat.name} />
                            <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                            <p className="font-semibold">{chat.name}</p>
                            <p className="text-sm text-gray-400 truncate">
                                {state.messages[chat.id]?.[state.messages[chat.id].length - 1]?.content || "Nenhuma mensagem"}
                            </p>
                        </div>
                        {chat.isOnline && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChatList;
