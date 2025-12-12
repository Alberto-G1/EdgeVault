import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { ChatMessage, TypingIndicator, UserPresence } from '../../types/chat';
import { getChatHistory, markConversationAsRead, getAllUserPresences } from '../../api/chatService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { Send, Loader, Paperclip, Smile, MoreVertical, ChevronUp, ChevronDown, ArrowLeft } from 'lucide-react';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import styled, { keyframes, css } from 'styled-components';

interface MessagePanelProps {
    conversationId: number;
    onBack?: () => void;
}

const MessagePanel: React.FC<MessagePanelProps> = ({ conversationId, onBack }) => {
    const { showError } = useToast();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const [userPresences, setUserPresences] = useState<Map<string, UserPresence>>(new Map());
    const [showScrollButton, setShowScrollButton] = useState(false);
    const { user, token } = useAuth();
    const stompClientRef = useRef<Client | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const messagesContainerRef = useRef<HTMLDivElement | null>(null);
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
                showError('Error', 'Could not load chat history.');
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
        if (messagesContainerRef.current) {
            const handleScroll = () => {
                const container = messagesContainerRef.current;
                if (container) {
                    const isScrolledUp = container.scrollTop + container.clientHeight < container.scrollHeight - 100;
                    setShowScrollButton(isScrolledUp);
                }
            };

            const container = messagesContainerRef.current;
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, []);

    useEffect(() => {
        if (!loadingHistory && messages.length > 0) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, loadingHistory]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

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
            showError('Connection Error', 'Cannot send message. Not connected to chat server.');
        }
    };

    const formatMessageTime = (timestamp: string) => {
        const date = new Date(timestamp);
        if (isToday(date)) {
            return format(date, 'h:mm a');
        } else if (isYesterday(date)) {
            return `Yesterday ${format(date, 'h:mm a')}`;
        } else {
            return format(date, 'MMM d, h:mm a');
        }
    };

    const getUserPresenceStatus = (username: string) => {
        const presence = userPresences.get(username);
        return presence?.status || 'OFFLINE';
    };

    const groupMessagesByDate = (messages: ChatMessage[]) => {
        const groups: { [key: string]: ChatMessage[] } = {};
        
        messages.forEach(msg => {
            const date = new Date(msg.timestamp).toDateString();
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(msg);
        });
        
        return groups;
    };

    if (loadingHistory) {
        return (
            <LoadingContainer>
                <Spinner>
                    <Loader size={32} />
                </Spinner>
                <LoadingText>Loading messages...</LoadingText>
                <LoadingSubtext>Secure connection established</LoadingSubtext>
            </LoadingContainer>
        );
    }

    const groupedMessages = groupMessagesByDate(messages);

    return (
        <PanelContainer>
            <MessagesHeader>
                {onBack && (
                    <BackButton onClick={onBack}>
                        <ArrowLeft size={20} />
                        <span>Back</span>
                    </BackButton>
                )}
                <ConnectionStatus>
                    <StatusDot $connected={stompClientRef.current?.connected || false} />
                    <StatusText>
                        {stompClientRef.current?.connected ? 'Connected' : 'Connecting...'}
                    </StatusText>
                </ConnectionStatus>
            </MessagesHeader>

            <MessagesContainer ref={messagesContainerRef}>
                {messages.length === 0 ? (
                    <EmptyMessagesState>
                        <EmptyLogo src="/chat-logo.png" alt="EdgeVault Chat" />
                        <EmptyTitle>Start Secure Conversation</EmptyTitle>
                        <EmptyDescription>
                            Send your first message to begin an encrypted conversation.
                            All messages are end-to-end encrypted and secure.
                        </EmptyDescription>
                    </EmptyMessagesState>
                ) : (
                    Object.entries(groupedMessages).map(([date, dateMessages]) => (
                    <DateGroup key={date}>
                        <DateDivider>
                            <DateLabel>
                                {isToday(new Date(date)) ? 'Today' : 
                                 isYesterday(new Date(date)) ? 'Yesterday' : 
                                 format(new Date(date), 'EEEE, MMMM d, yyyy')}
                            </DateLabel>
                        </DateDivider>
                        
                        {dateMessages.map((msg, index) => {
                            const isOwnMessage = msg.senderUsername === user?.sub;
                            const showAvatar = index === 0 || dateMessages[index - 1].senderUsername !== msg.senderUsername;
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
                                            <PresenceIndicator $status={presenceStatus} />
                                        </AvatarContainer>
                                    )}
                                    
                                    <MessageContent isOwn={isOwnMessage}>
                                        {showAvatar && !isOwnMessage && (
                                            <SenderInfo>
                                                <SenderName>{msg.senderUsername}</SenderName>
                                                <SenderTime>{formatMessageTime(msg.timestamp)}</SenderTime>
                                            </SenderInfo>
                                        )}
                                        <MessageBubble isOwn={isOwnMessage}>
                                            <MessageText>{msg.content}</MessageText>
                                            {isOwnMessage && (
                                                <MessageStatus>
                                                    <MessageTime>{formatMessageTime(msg.timestamp)}</MessageTime>
                                                    <ReadReceipt 
                                                        isRead={msg.readCount >= msg.totalRecipients && msg.totalRecipients > 0}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                            <path d="M1 8L5 12L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                            <path d="M5 8L9 12L15 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        </svg>
                                                    </ReadReceipt>
                                                </MessageStatus>
                                            )}
                                        </MessageBubble>
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
                        })}
                    </DateGroup>
                    ))
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

            {showScrollButton && (
                <ScrollToBottomButton onClick={scrollToBottom}>
                    <ChevronDown size={20} />
                </ScrollToBottomButton>
            )}
            
            <InputForm onSubmit={handleSendMessage}>
                <AttachmentButton type="button">
                    <Paperclip size={20} />
                </AttachmentButton>
                
                <EmojiButton type="button">
                    <Smile size={20} />
                </EmojiButton>
                
                <MessageInput
                    type="text"
                    value={newMessage}
                    onChange={handleInputChange}
                    placeholder="Type a secure message..."
                />
                
                <SendButton type="submit" disabled={!newMessage.trim()}>
                    <Send size={20} />
                </SendButton>
            </InputForm>
        </PanelContainer>
    );
};

// Styled Components
const spin = keyframes`
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
`;

const bounceAnimation = keyframes`
    0%, 60%, 100% {
        transform: translateY(0);
        opacity: 0.5;
    }
    30% {
        transform: translateY(-8px);
        opacity: 1;
    }
`;

const PanelContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--bg-secondary);
    position: relative;
`;

const MessagesHeader = styled.div`
    padding: 1rem 1.5rem;
    border-bottom: 2px solid rgba(46, 151, 197, 0.1);
    background: linear-gradient(135deg, 
        rgba(46, 151, 197, 0.05) 0%, 
        rgba(150, 129, 158, 0.05) 100%
    );
    backdrop-filter: blur(10px);
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const BackButton = styled.button`
    display: none;
    
    @media (max-width: 768px) {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: var(--bg-primary);
        border: 2px solid rgba(46, 151, 197, 0.2);
        border-radius: 8px;
        color: var(--text-primary);
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
            background: var(--hover-color);
            border-color: rgba(46, 151, 197, 0.4);
            transform: translateX(-2px);
        }
        
        &:active {
            transform: translateX(0);
        }
        
        span {
            font-family: 'Poppins', sans-serif;
        }
    }
`;

const ConnectionStatus = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const StatusDot = styled.div<{ $connected: boolean }>`
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${props => props.$connected ? '#10b981' : '#f59e0b'};
    box-shadow: 0 0 0 3px ${props => props.$connected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'};
    ${props => !props.$connected && css`
        animation: ${spin} 2s linear infinite;
    `}
`;

const StatusText = styled.div`
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-secondary);
`;

const MessagesContainer = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    position: relative;
    
    /* Watermark logo background */
    &::before {
        content: '';
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 300px;
        height: 300px;
        background-image: url('/chat-logo.png');
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        opacity: 0.3;
        pointer-events: none;
        z-index: 0;
    }
    
    /* Gradient background effect */
    background: 
        radial-gradient(circle at 20% 80%, rgba(46, 151, 197, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(150, 129, 158, 0.05) 0%, transparent 50%),
        var(--bg-secondary);
    
    /* Custom scrollbar styling */
    &::-webkit-scrollbar {
        width: 8px;
    }
    
    &::-webkit-scrollbar-track {
        background: transparent;
        margin: 8px 0;
    }
    
    &::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, 
            rgba(46, 151, 197, 0.3), 
            rgba(150, 129, 158, 0.3)
        );
        border-radius: 10px;
        transition: all 0.2s;
    }
    
    &::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(135deg, 
            rgba(46, 151, 197, 0.5), 
            rgba(150, 129, 158, 0.5)
        );
    }
`;

const EmptyMessagesState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 3rem;
    text-align: center;
    position: relative;
    z-index: 1;
    animation: ${float} 3s ease-in-out infinite;
`;

const EmptyLogo = styled.img`
    width: 180px;
    height: 180px;
    opacity: 0.3;
    margin-bottom: 2rem;
    filter: grayscale(0.3);
    
    @media (max-width: 768px) {
        width: 120px;
        height: 120px;
    }
`;

const EmptyTitle = styled.h3`
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 1rem;
    font-family: 'Poppins', sans-serif;
    background: linear-gradient(135deg, rgb(46, 151, 197), rgb(150, 129, 158));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    
    @media (max-width: 768px) {
        font-size: 1.25rem;
    }
`;

const EmptyDescription = styled.p`
    font-size: 1rem;
    color: var(--text-secondary);
    max-width: 400px;
    line-height: 1.6;
    font-family: 'Poppins', sans-serif;
    
    @media (max-width: 768px) {
        font-size: 0.9rem;
        padding: 0 1rem;
    }
`;

const DateGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const DateDivider = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 1rem 0;
    position: relative;
    
    &::before {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        top: 50%;
        height: 1px;
        background: linear-gradient(90deg, 
            transparent 0%, 
            rgba(46, 151, 197, 0.2) 20%, 
            rgba(46, 151, 197, 0.2) 80%, 
            transparent 100%
        );
        z-index: 1;
    }
`;

const DateLabel = styled.div`
    background: var(--bg-primary);
    padding: 0.5rem 1.5rem;
    border-radius: 20px;
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--text-secondary);
    border: 2px solid rgba(46, 151, 197, 0.1);
    z-index: 2;
    backdrop-filter: blur(10px);
`;

const MessageGroup = styled.div<{ isOwn: boolean }>`
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    ${props => props.isOwn ? 'flex-direction: row-reverse;' : ''}
    position: relative;
`;

const AvatarContainer = styled.div`
    position: relative;
    flex-shrink: 0;
    margin-top: 0.25rem;
`;

const Avatar = styled.img`
    width: 42px;
    height: 42px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid rgba(46, 151, 197, 0.2);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    
    ${MessageGroup}:hover & {
        transform: scale(1.05);
        border-color: rgba(46, 151, 197, 0.4);
    }
`;

const PresenceIndicator = styled.div<{ $status: string }>`
    position: absolute;
    bottom: 0;
    right: 0;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${props => props.$status === 'ONLINE' ? '#10b981' : '#6b7280'};
    border: 2px solid var(--bg-secondary);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
`;

const MessageContent = styled.div<{ isOwn: boolean }>`
    display: flex;
    flex-direction: column;
    max-width: 70%;
    gap: 0.25rem;
    ${props => props.isOwn ? 'align-items: flex-end;' : 'align-items: flex-start;'}
`;

const SenderInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.25rem;
`;

const SenderName = styled.div`
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--text-primary);
`;

const SenderTime = styled.div`
    font-size: 0.75rem;
    color: var(--text-tertiary);
`;

const MessageBubble = styled.div<{ isOwn: boolean }>`
    padding: 1rem 1.25rem;
    border-radius: 20px;
    position: relative;
    ${props => props.isOwn 
        ? `
            background: linear-gradient(135deg, rgb(46, 151, 197), rgb(150, 129, 158));
            color: white;
            box-shadow: 0 4px 16px rgba(46, 151, 197, 0.3);
            border-bottom-right-radius: 6px;
        `
        : `
            background: var(--bg-primary);
            color: var(--text-primary);
            border: 2px solid rgba(46, 151, 197, 0.1);
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
            border-bottom-left-radius: 6px;
        `
    }
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:hover {
        transform: translateY(-1px);
        ${props => props.isOwn 
            ? 'box-shadow: 0 6px 20px rgba(46, 151, 197, 0.4);'
            : 'box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);'
        }
    }
`;

const MessageText = styled.div`
    font-size: 0.96rem;
    line-height: 1.6;
    word-wrap: break-word;
    letter-spacing: 0.01em;
`;

const MessageStatus = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
    justify-content: flex-end;
`;

const MessageTime = styled.div`
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.7);
    font-weight: 500;
`;

const ReadReceipt = styled.div<{ isRead: boolean }>`
    display: flex;
    align-items: center;
    color: ${props => props.isRead ? '#ffffff' : 'rgba(255, 255, 255, 0.5)'};
    transition: all 0.3s ease;
    
    svg {
        width: 14px;
        height: 14px;
    }
`;

const TypingIndicatorContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 1rem 1.5rem;
    margin-left: 48px;
    background: var(--bg-primary);
    border-radius: 20px;
    border-bottom-left-radius: 6px;
    max-width: fit-content;
    border: 2px solid rgba(46, 151, 197, 0.1);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
`;

const TypingDots = styled.div`
    display: flex;
    gap: 0.3rem;
    padding: 0.2rem 0;
`;

const Dot = styled.div<{ delay: number }>`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgb(46, 151, 197), rgb(150, 129, 158));
    animation: ${bounceAnimation} 1.4s infinite ease-in-out;
    animation-delay: ${props => props.delay}s;
    box-shadow: 0 1px 3px rgba(46, 151, 197, 0.3);
`;

const TypingText = styled.div`
    font-size: 0.86rem;
    color: var(--text-secondary);
    font-weight: 500;
`;

const InputForm = styled.form`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1.25rem 1.5rem;
    border-top: 2px solid rgba(46, 151, 197, 0.1);
    background: var(--bg-primary);
    backdrop-filter: blur(10px);
    position: relative;
    z-index: 10;
`;

const AttachmentButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: var(--bg-secondary);
    color: var(--text-secondary);
    border: 2px solid rgba(46, 151, 197, 0.1);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(46, 151, 197, 0.1);
        color: rgb(46, 151, 197);
        border-color: rgba(46, 151, 197, 0.3);
        transform: translateY(-2px);
    }
`;

const EmojiButton = styled(AttachmentButton)``;

const MessageInput = styled.input`
    flex: 1;
    padding: 1rem 1.25rem;
    border: 2px solid var(--border-color);
    border-radius: 16px;
    background: var(--bg-secondary);
    color: var(--text-primary);
    font-size: 0.96rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:focus {
        outline: none;
        border-color: rgb(46, 151, 197);
        box-shadow: 0 0 0 4px rgba(46, 151, 197, 0.15), 0 4px 16px rgba(46, 151, 197, 0.1);
        background: var(--bg-primary);
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
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgb(46, 151, 197), rgb(150, 129, 158));
    color: white;
    border: none;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 16px rgba(46, 151, 197, 0.3);

    &:hover:not(:disabled) {
        transform: scale(1.1) translateY(-2px);
        box-shadow: 0 6px 24px rgba(46, 151, 197, 0.4);
    }

    &:active:not(:disabled) {
        transform: scale(0.98);
    }

    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
        transform: scale(1);
    }
`;

const ScrollToBottomButton = styled.button`
    position: absolute;
    bottom: 90px;
    right: 1.5rem;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgb(46, 151, 197), rgb(150, 129, 158));
    color: white;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 16px rgba(46, 151, 197, 0.4);
    z-index: 20;
    animation: ${float} 3s ease-in-out infinite;
    
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        transform: scale(1.1) translateY(-2px);
        box-shadow: 0 6px 24px rgba(46, 151, 197, 0.5);
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

const Spinner = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.div`
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
`;

const LoadingSubtext = styled.div`
    font-size: 0.875rem;
    color: var(--text-secondary);
`;

export default MessagePanel;