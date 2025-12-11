import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { ChatMessage, TypingIndicator, UserPresence } from '../../types/chat';
import { getChatHistory, markConversationAsRead, getAllUserPresences } from '../../api/chatService';
import { useAuth } from '../../hooks/useAuth';
import { Send, Loader } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import styled from 'styled-components';

interface MessagePanelProps {
    conversationId: number;
}

const MessagePanel: React.FC<MessagePanelProps> = ({ conversationId }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const [userPresences, setUserPresences] = useState<Map<string, UserPresence>>(new Map());
    const { user, token } = useAuth();
    const stompClientRef = useRef<Client | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastTypingSentRef = useRef<number>(0);

    // Fetch user presences
    useEffect(() => {
        const fetchPresences = async () => {
            try {
                const presences = await getAllUserPresences();
                const presenceMap = new Map(presences.map(p => [p.username, p]));
                setUserPresences(presenceMap);
            } catch (error) {
                console.error('Failed to fetch presences');
            }
        };
        fetchPresences();
    }, []);

    // Main effect for WebSocket connection and message history
    useEffect(() => {
        if (!token) return;

        setMessages([]);
        setLoadingHistory(true);
        setTypingUsers([]);

        const fetchHistory = async () => {
            try {
                const history = await getChatHistory(conversationId);
                setMessages(history);
                
                // Mark conversation as read
                await markConversationAsRead(conversationId);
            } catch (error) {
                toast.error("Could not load chat history.");
            } finally {
                setLoadingHistory(false);
            }
        };
        fetchHistory();

        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8082/ws'),
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            debug: (str) => { console.log(new Date(), str); },
            reconnectDelay: 5000,
            onConnect: () => {
                console.log(`STOMP client connected for conversation ${conversationId}`);
                
                // Subscribe to messages
                client.subscribe(`/topic/chat/${conversationId}`, (message) => {
                    const receivedMessage = JSON.parse(message.body) as ChatMessage;
                    setMessages((prevMessages) => [...prevMessages, receivedMessage]);
                    
                    // Auto-mark as read when receiving messages
                    markConversationAsRead(conversationId).catch(console.error);
                });
                
                // Subscribe to typing indicators
                client.subscribe(`/topic/chat/${conversationId}/typing`, (message) => {
                    const indicator = JSON.parse(message.body) as TypingIndicator;
                    
                    if (indicator.username !== user?.sub) {
                        if (indicator.typing) {
                            setTypingUsers(prev => [...new Set([...prev, indicator.username])]);
                        } else {
                            setTypingUsers(prev => prev.filter(u => u !== indicator.username));
                        }
                        
                        // Auto-clear typing indicator after 3 seconds
                        setTimeout(() => {
                            setTypingUsers(prev => prev.filter(u => u !== indicator.username));
                        }, 3000);
                    }
                });
                
                // Subscribe to presence updates
                client.subscribe('/topic/presence', (message) => {
                    const presence = JSON.parse(message.body) as UserPresence;
                    setUserPresences(prev => new Map(prev).set(presence.username, presence));
                });
            },
            onStompError: (frame) => { console.error('STOMP Error:', frame); },
        });

        stompClientRef.current = client;
        client.activate();

        return () => {
            if (client) {
                client.deactivate();
                console.log(`STOMP client deactivated for conversation ${conversationId}`);
            }
        };
    }, [conversationId, token, user?.sub]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendTypingIndicator = useCallback((typing: boolean) => {
        if (stompClientRef.current?.connected) {
            stompClientRef.current.publish({
                destination: `/app/chat/${conversationId}/typing`,
                body: JSON.stringify({ typing }),
            });
        }
    }, [conversationId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);
        
        // Throttle typing indicator to once per second
        const now = Date.now();
        if (now - lastTypingSentRef.current > 1000) {
            sendTypingIndicator(true);
            lastTypingSentRef.current = now;
        }
        
        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        
        // Send "stopped typing" after 2 seconds of no input
        typingTimeoutRef.current = setTimeout(() => {
            sendTypingIndicator(false);
        }, 2000);
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() && stompClientRef.current?.connected) {
            stompClientRef.current.publish({
                destination: `/app/chat/${conversationId}`,
                body: JSON.stringify({ content: newMessage }),
            });
            setNewMessage('');
            sendTypingIndicator(false);
            
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        } else if (!stompClientRef.current?.connected) {
            toast.error("Cannot send message. Not connected to chat server.");
        }
    };

    const formatMessageTime = (timestamp: string) => {
        const date = new Date(timestamp);
        if (isToday(date)) {
            return format(date, 'p');
        } else if (isYesterday(date)) {
            return `Yesterday ${format(date, 'p')}`;
        } else {
            return format(date, 'MMM d, p');
        }
    };

    const getUserPresenceStatus = (username: string) => {
        const presence = userPresences.get(username);
        return presence?.status || 'OFFLINE';
    };

    if (loadingHistory) {
        return (
            <LoadingContainer>
                <Loader className="animate-spin" size={32} />
                <LoadingText>Loading messages...</LoadingText>
            </LoadingContainer>
        );
    }

    return (
        <PanelContainer>
            <MessagesContainer>
                {messages.length === 0 ? (
                    <EmptyState>
                        <EmptyText>No messages yet</EmptyText>
                        <EmptySubtext>Send a message to start the conversation</EmptySubtext>
                    </EmptyState>
                ) : (
                    messages.map((msg, index) => {
                        const isOwnMessage = msg.senderUsername === user?.sub;
                        const showAvatar = index === 0 || messages[index - 1].senderUsername !== msg.senderUsername;
                        const presenceStatus = getUserPresenceStatus(msg.senderUsername);
                        
                        return (
                            <MessageGroup key={msg.id} isOwn={isOwnMessage}>
                                {/* Always show avatar for received messages */}
                                {!isOwnMessage && (
                                    <AvatarContainer>
                                        <Avatar
                                            src={msg.senderProfilePictureUrl || `https://ui-avatars.com/api/?name=${msg.senderUsername}&background=random&color=fff`}
                                            alt={msg.senderUsername}
                                        />
                                        <PresenceIndicator status={presenceStatus} />
                                    </AvatarContainer>
                                )}
                                
                                <MessageContent isOwn={isOwnMessage}>
                                    {showAvatar && !isOwnMessage && (
                                        <SenderName>{msg.senderUsername}</SenderName>
                                    )}
                                    <MessageBubble isOwn={isOwnMessage}>
                                        <MessageText>{msg.content}</MessageText>
                                    </MessageBubble>
                                    {/* Timestamp and read receipt outside bubble */}
                                    <MessageFooter>
                                        <MessageTime>{formatMessageTime(msg.timestamp)}</MessageTime>
                                        {isOwnMessage && (
                                            <ReadReceipt 
                                                isRead={msg.readCount >= msg.totalRecipients && msg.totalRecipients > 0}
                                            >
                                                {/* Double check marks */}
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                    <path d="M1 8L5 12L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <path d="M5 8L9 12L15 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </ReadReceipt>
                                        )}
                                    </MessageFooter>
                                </MessageContent>
                                
                                {/* Always show avatar for own messages */}
                                {isOwnMessage && (
                                    <AvatarContainer>
                                        <Avatar
                                            src={msg.senderProfilePictureUrl || `https://ui-avatars.com/api/?name=${msg.senderUsername}&background=random&color=fff`}
                                            alt={msg.senderUsername}
                                        />
                                    </AvatarContainer>
                                )}
                            </MessageGroup>
                        );
                    })
                )}
                
                {typingUsers.length > 0 && (
                    <TypingIndicatorContainer>
                        <TypingDots>
                            <Dot delay={0} />
                            <Dot delay={0.2} />
                            <Dot delay={0.4} />
                        </TypingDots>
                        <TypingText>
                            {typingUsers.length === 1 
                                ? `${typingUsers[0]} is typing...`
                                : `${typingUsers.length} people are typing...`
                            }
                        </TypingText>
                    </TypingIndicatorContainer>
                )}
                
                <div ref={messagesEndRef} />
            </MessagesContainer>
            
            <InputForm onSubmit={handleSendMessage}>
                <MessageInput
                    type="text"
                    value={newMessage}
                    onChange={handleInputChange}
                    placeholder="Type a message..."
                />
                <SendButton type="submit" disabled={!newMessage.trim()}>
                    <Send size={20} />
                </SendButton>
            </InputForm>
        </PanelContainer>
    );
};

// Styled Components
const PanelContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--bg-secondary);
`;

const MessagesContainer = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    position: relative;
    
    /* Logo watermark background */
    &::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 300px;
        height: 300px;
        background-image: url('/chat-logo.png');
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        opacity: 0.4;
        pointer-events: none;
        z-index: 0;
    }
    
    /* Custom scrollbar styling */
    &::-webkit-scrollbar {
        width: 8px;
    }
    
    &::-webkit-scrollbar-track {
        background: transparent;
        margin: 8px 0;
    }
    
    &::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, rgba(46, 151, 197, 0.3), rgba(150, 129, 158, 0.3));
        border-radius: 10px;
        transition: all 0.2s;
    }
    
    &::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(135deg, rgba(46, 151, 197, 0.5), rgba(150, 129, 158, 0.5));
    }
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 1rem;
    color: var(--text-secondary);
`;

const LoadingText = styled.div`
    font-size: 0.95rem;
`;

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
`;

const EmptyText = styled.div`
    font-size: 1.1rem;
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
`;

const EmptySubtext = styled.div`
    font-size: 0.9rem;
    color: var(--text-secondary);
`;

const MessageGroup = styled.div<{ isOwn: boolean }>`
    display: flex;
    align-items: flex-end;
    gap: 0.75rem;
    ${props => props.isOwn ? 'flex-direction: row-reverse;' : ''}
    margin-bottom: 0.75rem;
    position: relative;
    z-index: 1;
`;

const AvatarContainer = styled.div`
    position: relative;
    flex-shrink: 0;
    margin-bottom: 0.25rem;
`;

const Avatar = styled.img`
    width: 42px;
    height: 42px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(46, 151, 197, 0.2);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
`;

const PresenceIndicator = styled.div<{ status: string }>`
    position: absolute;
    bottom: 0;
    right: 0;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${props => props.status === 'ONLINE' ? '#10b981' : '#6b7280'};
    border: 2px solid var(--bg-secondary);
`;

const AvatarSpacer = styled.div`
    width: 40px;
    flex-shrink: 0;
`;

const MessageContent = styled.div<{ isOwn: boolean }>`
    display: flex;
    flex-direction: column;
    max-width: 65%;
    gap: 0.35rem;
    ${props => props.isOwn ? 'align-items: flex-end;' : 'align-items: flex-start;'}
`;

const SenderName = styled.div`
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 0.25rem;
    padding: 0 0.75rem;
`;

const MessageBubble = styled.div<{ isOwn: boolean }>`
    padding: 1rem 1.25rem;
    border-radius: 20px;
    position: relative;
    ${props => props.isOwn 
        ? `
            background: linear-gradient(135deg, rgb(46, 151, 197), rgb(150, 129, 158));
            color: white;
            box-shadow: 0 3px 10px rgba(46, 151, 197, 0.3);
            
            /* Tail pointer for sent messages */
            &::after {
                content: '';
                position: absolute;
                bottom: 4px;
                right: -6px;
                width: 0;
                height: 0;
                border-style: solid;
                border-width: 0 0 14px 10px;
                border-color: transparent transparent rgb(150, 129, 158) transparent;
            }
        `
        : `
            background: #f5f7f9;
            color: var(--text-primary);
            border: 1px solid #e3e8ef;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
            
            /* Tail pointer for received messages */
            &::after {
                content: '';
                position: absolute;
                bottom: 4px;
                left: -6px;
                width: 0;
                height: 0;
                border-style: solid;
                border-width: 0 10px 14px 0;
                border-color: transparent #f5f7f9 transparent transparent;
            }
            
            &::before {
                content: '';
                position: absolute;
                bottom: 4px;
                left: -7px;
                width: 0;
                height: 0;
                border-style: solid;
                border-width: 0 10px 14px 0;
                border-color: transparent #e3e8ef transparent transparent;
            }
        `
    }
    transition: all 0.2s ease;
    
    &:hover {
        transform: translateY(-1px);
        ${props => props.isOwn 
            ? 'box-shadow: 0 5px 15px rgba(46, 151, 197, 0.4);'
            : 'box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);'
        }
    }
`;

const MessageText = styled.div`
    font-size: 0.96rem;
    line-height: 1.6;
    word-wrap: break-word;
    letter-spacing: 0.01em;
`;

const MessageFooter = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.72rem;
    color: var(--text-tertiary);
    opacity: 0.85;
    padding: 0 0.35rem;
`;

const MessageTime = styled.div`
    font-size: 0.72rem;
    color: var(--text-tertiary);
    font-weight: 500;
`;

const ReadReceipt = styled.div<{ isRead: boolean }>`
    display: flex;
    align-items: center;
    color: ${props => props.isRead ? '#ef4444' : '#f97316'};
    opacity: ${props => props.isRead ? 1 : 0.75};
    transition: all 0.3s ease;
    transform: ${props => props.isRead ? 'scale(1.1)' : 'scale(1)'};
    
    svg {
        width: 15px;
        height: 15px;
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
    }
`;

const TypingIndicatorContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 0.65rem 1.2rem;
    margin-left: 48px;
    background: var(--bg-primary);
    border-radius: 18px;
    border-bottom-left-radius: 6px;
    max-width: fit-content;
    border: 1px solid var(--border-color);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
`;

const TypingDots = styled.div`
    display: flex;
    gap: 0.3rem;
    padding: 0.2rem 0;
`;

const Dot = styled.div<{ delay: number }>`
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgb(46, 151, 197), rgb(150, 129, 158));
    animation: bounce 1.4s infinite ease-in-out;
    animation-delay: ${props => props.delay}s;
    box-shadow: 0 1px 3px rgba(46, 151, 197, 0.3);

    @keyframes bounce {
        0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.5;
        }
        30% {
            transform: translateY(-8px);
            opacity: 1;
        }
    }
`;

const TypingText = styled.div`
    font-size: 0.86rem;
    color: var(--text-secondary);
    font-style: italic;
    font-weight: 500;
`;

const InputForm = styled.form`
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 1.5rem;
    border-top: 1px solid var(--border-color);
    background: var(--bg-primary);
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
    position: relative;
    z-index: 10;
`;

const MessageInput = styled.input`
    flex: 1;
    padding: 0.85rem 1.2rem;
    border: 2px solid var(--border-color);
    border-radius: 26px;
    background: var(--bg-secondary);
    color: var(--text-primary);
    font-size: 0.96rem;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    letter-spacing: 0.01em;

    &:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 4px rgba(46, 151, 197, 0.12), 0 2px 8px rgba(46, 151, 197, 0.15);
        background: var(--bg-primary);
        transform: translateY(-1px);
    }

    &::placeholder {
        color: var(--text-tertiary);
        font-weight: 400;
    }
`;

const SendButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgb(46, 151, 197), rgb(150, 129, 158));
    color: white;
    border: none;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 8px rgba(46, 151, 197, 0.3);

    &:hover:not(:disabled) {
        transform: scale(1.08) translateY(-1px);
        box-shadow: 0 4px 16px rgba(46, 151, 197, 0.4);
    }

    &:active:not(:disabled) {
        transform: scale(0.98);
        box-shadow: 0 2px 6px rgba(46, 151, 197, 0.3);
    }

    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
        transform: scale(1);
    }
`;

export default MessagePanel;