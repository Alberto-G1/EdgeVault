import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatSidebar from '../../components/chat/ChatSidebar';
import MessagePanel from '../../components/chat/MessagePanel';
import apiClient from '../../api/axiosConfig';
import { toast } from 'react-hot-toast';

const ChatPage: React.FC = () => {
    // This component now acts as a controller to manage which conversation is active.
    const { conversationId, username } = useParams<{ conversationId?: string, username?: string }>();
    const navigate = useNavigate();
    const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
    const [loadingConversation, setLoadingConversation] = useState(false);
    
    useEffect(() => {
        const resolveConversation = async () => {
            if (username) { // This is a request for a Direct Message
                setLoadingConversation(true);
                try {
                    // Call the backend to get or create a DM conversation
                    const response = await apiClient.post(`/conversations/dm?withUser=${username}`);
                    const conversation = response.data;
                    // Navigate to the correct URL with the conversation ID, which will trigger the other effect
                    navigate(`/admin/chat/${conversation.id}`, { replace: true });
                } catch (error) {
                    toast.error(`Could not start conversation with ${username}.`);
                    navigate('/admin/chat');
                } finally {
                    setLoadingConversation(false);
                }
            } else if (conversationId) { // This is a direct link to a conversation
                setActiveConversationId(Number(conversationId));
            } else { // No conversation selected
                setActiveConversationId(null);
            }
        };
        resolveConversation();
    }, [conversationId, username, navigate]);


    return (
        <div className="flex h-[calc(100vh-100px)] bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
            <div className="w-1/3 lg:w-1/4 border-r dark:border-gray-700">
                <ChatSidebar />
            </div>

            <div className="w-2/3 lg:w-3/4 flex flex-col">
                 {loadingConversation ? (
                    <div className="flex-grow flex items-center justify-center text-gray-500">
                        <p>Starting conversation...</p>
                    </div>
                 ) : activeConversationId ? (
                    <MessagePanel key={activeConversationId} conversationId={activeConversationId} />
                 ) : (
                    <div className="flex-grow flex items-center justify-center text-gray-500">
                        <p>Select a conversation to start chatting.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;