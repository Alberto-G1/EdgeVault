import React, { useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { ChatMessage } from '../../types/chat';
import { getChatHistory } from '../../api/chatService';
import { useAuth } from '../../hooks/useAuth';
import { Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface MessagePanelProps {
    conversationId: number;
}

const MessagePanel: React.FC<MessagePanelProps> = ({ conversationId }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingHistory, setLoadingHistory] = useState(true);
    const { user, token } = useAuth(); // We need the token here
    const stompClientRef = useRef<Client | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!token) return; // Don't try to connect without a token

        setMessages([]);
        setLoadingHistory(true);

        const fetchHistory = async () => {
            try {
                const history = await getChatHistory(conversationId);
                setMessages(history);
            } catch (error) {
                toast.error("Could not load chat history.");
            } finally {
                setLoadingHistory(false);
            }
        };
        fetchHistory();

        // --- THIS IS THE DEFINITIVE FIX ---
        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8082/ws'), // URL does NOT need the token
            
            // Explicitly add the JWT token to the STOMP CONNECT frame headers.
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },

            debug: (str) => { console.log(new Date(), str); },
            reconnectDelay: 5000,
            onConnect: () => {
                console.log(`STOMP client connected for conversation ${conversationId}`);
                client.subscribe(`/topic/chat/${conversationId}`, (message) => {
                    const receivedMessage = JSON.parse(message.body) as ChatMessage;
                    setMessages((prevMessages) => [...prevMessages, receivedMessage]);
                });
            },
            onStompError: (frame) => { console.error('STOMP Error:', frame); },
        });
        // ---------------------------------

        stompClientRef.current = client;
        client.activate();

        return () => {
            if (client) {
                client.deactivate();
                console.log(`STOMP client deactivated for conversation ${conversationId}`);
            }
        };
    }, [conversationId, token]); // Effect now correctly depends on the token
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() && stompClientRef.current?.connected) {
            stompClientRef.current.publish({
                destination: `/app/chat/${conversationId}`,
                body: JSON.stringify({ content: newMessage }),
            });
            setNewMessage('');
        } else {
            toast.error("Cannot send message. Not connected to chat server.");
        }
    };

    if (loadingHistory) {
        return <div className="flex-grow flex items-center justify-center text-gray-500">Loading messages...</div>;
    }

    return (
        <div className="bg-white dark:bg-gray-800 flex flex-col h-full">
            <div className="flex-grow p-4 overflow-y-auto">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex items-start gap-3 my-4 ${msg.senderUsername === user?.sub ? 'flex-row-reverse' : ''}`}>
                        <img
                            src={msg.senderProfilePictureUrl || `https://ui-avatars.com/api/?name=${msg.senderUsername}&background=random&color=fff`}
                            alt={msg.senderUsername}
                            className="w-8 h-8 rounded-full"
                        />
                        <div className={`p-3 rounded-lg max-w-md ${msg.senderUsername === user?.sub ? 'bg-cyan-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                            <p className="font-bold text-sm">{msg.senderUsername}</p>
                            <p className="text-sm break-words">{msg.content}</p>
                            <p className="text-xs opacity-70 mt-1 text-right">{format(new Date(msg.timestamp), 'p')}</p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t dark:border-gray-700 flex items-center">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="input-style flex-grow"
                />
                <button type="submit" className="btn-primary ml-2 flex-shrink-0" aria-label="Send Message">
                    <Send size={20}/>
                </button>
            </form>
        </div>
    );
};

export default MessagePanel;