import React from 'react';
import { useParams } from 'react-router-dom';
import ChatSidebar from '../../components/chat/ChatSidebar';
import MessagePanel from '../../components/chat/MessagePanel';
import { MessageSquare } from 'lucide-react';

const ChatPage: React.FC = () => {
    // This component is now very simple. It just reads the ID from the URL.
    const { conversationId } = useParams<{ conversationId?: string }>();
    const activeConversationId = conversationId ? Number(conversationId) : null;

    return (
        <div className="flex h-[calc(100vh-100px)] bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
            <div className="w-1/3 lg:w-1/4 border-r dark:border-gray-700">
                <ChatSidebar />
            </div>

            <div className="w-2/3 lg:w-3/4 flex flex-col">
                 {activeConversationId ? (
                    // The key is essential to force MessagePanel to remount and re-connect when the ID changes
                    <MessagePanel key={activeConversationId} conversationId={activeConversationId} />
                 ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-gray-500 space-y-2">
                        <MessageSquare size={48} />
                        <p>Select a conversation to start chatting.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;