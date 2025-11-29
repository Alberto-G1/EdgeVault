import React, { useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { ChatMessage } from '../../types/chat';
import { getChatHistory } from '../../api/chatService';
import { useAuth } from '../../hooks/useAuth';
import { Send } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface DocumentChatProps {
    documentId: number;
}

const DocumentChat: React.FC<DocumentChatProps> = ({ documentId }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const { user, token } = useAuth();
    const stompClientRef = useRef<Client | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        // Fetch initial chat history
        const fetchHistory = async () => {
            try {
                const history = await getChatHistory(documentId);
                setMessages(history);
            } catch (error) {
                toast.error("Could not load chat history.");
            }
        };
        fetchHistory();

        // Setup WebSocket client
        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8082/ws'),
            connectHeaders: {
                Authorization: `Bearer ${token}`, // Pass token for potential future security checks
            },
            onConnect: () => {
                console.log('Connected to WebSocket');
                // Subscribe to the topic for this document
                client.subscribe(`/topic/chat/${documentId}`, (message) => {
                    const receivedMessage = JSON.parse(message.body) as ChatMessage;
                    setMessages((prevMessages) => [...prevMessages, receivedMessage]);
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
        });

        stompClientRef.current = client;
        client.activate();

        // Cleanup on component unmount
        return () => {
            client.deactivate();
        };
    }, [documentId, token]);
    
    // Auto-scroll to the latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() && stompClientRef.current?.connected) {
            stompClientRef.current.publish({
                destination: `/app/chat/${documentId}`,
                body: JSON.stringify({ content: newMessage }),
            });
            setNewMessage('');
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg flex flex-col h-[600px]">
            <h2 className="text-xl font-semibold p-4 border-b dark:border-gray-700 text-gray-800 dark:text-gray-200">
                Collaboration Chat
            </h2>
            <div className="flex-grow p-4 overflow-y-auto">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex items-start gap-3 my-4 ${msg.senderUsername === user?.sub ? 'flex-row-reverse' : ''}`}>
                        <img
                            src={msg.senderProfilePictureUrl || `https://ui-avatars.com/api/?name=${msg.senderUsername}&background=random`}
                            alt={msg.senderUsername}
                            className="w-8 h-8 rounded-full"
                        />
                        <div className={`p-3 rounded-lg max-w-xs ${msg.senderUsername === user?.sub ? 'bg-cyan-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                            <p className="font-bold text-sm">{msg.senderUsername}</p>
                            <p className="text-sm">{msg.content}</p>
                            <p className="text-xs opacity-70 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString()}</p>
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
                <button type="submit" className="btn-primary ml-2 flex-shrink-0">
                    <Send size={20}/>
                </button>
            </form>
        </div>
    );
};

export default DocumentChat;