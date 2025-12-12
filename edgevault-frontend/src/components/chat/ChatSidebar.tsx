import React, { useEffect, useState } from 'react';
import { getAllConversations } from '../../api/chatService';
import type { ConversationSummary } from '../../types/chat';
import { useToast } from '../../context/ToastContext';
import { Users, MessageCircle, Plus, Hash, ChevronRight, Clock, Check, CheckCheck } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styled, { keyframes } from 'styled-components';
import UserSearchModal from './UserSearchModal';
import { formatDistanceToNow } from 'date-fns';

interface ChatSidebarProps {
    onNewMessage?: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ onNewMessage }) => {
    const [conversations, setConversations] = useState<ConversationSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [showUserSearch, setShowUserSearch] = useState(false);
    const { user: currentUser } = useAuth();
    const { showError } = useToast();

    const fetchConversations = async () => {
        try {
            const data = await getAllConversations();
            // Separate group and direct message conversations
            const groupChats = data.filter(c => c.type === 'GROUP');
            const directMessages = data.filter(c => c.type === 'DIRECT_MESSAGE');
            setConversations([...groupChats, ...directMessages]);
        } catch (error) {
            showError("Connection Error", "Failed to fetch conversations");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
        
        // Refresh conversations periodically
        const interval = setInterval(fetchConversations, 10000);
        return () => clearInterval(interval);
    }, [currentUser]);

    const formatLastMessageTime = (timestamp?: string) => {
        if (!timestamp) return '';
        try {
            return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
        } catch {
            return '';
        }
    };

    const truncateMessage = (message?: string, maxLength = 35) => {
        if (!message) return 'No messages yet';
        if (message.length <= maxLength) return message;
        return message.substring(0, maxLength) + '...';
    };

    const getReadStatusIcon = (unreadCount: number, isLastMessageFromCurrentUser?: boolean) => {
        if (unreadCount > 0) {
            return <UnreadIndicator />;
        }
        if (isLastMessageFromCurrentUser) {
            return <CheckCheck size={14} color="var(--success)" />;
        }
        return <Check size={14} color="var(--text-tertiary)" />;
    };

    return (
        <>
            <SidebarContainer>
                <SidebarHeader>
                    <HeaderTitle>
                        <Hash size={20} />
                        <span>Conversations</span>
                    </HeaderTitle>
                    <HeaderActions>
                        <NewChatButton onClick={() => setShowUserSearch(true)}>
                            <Plus size={18} />
                            <span>New</span>
                        </NewChatButton>
                    </HeaderActions>
                </SidebarHeader>

                <ConversationList>
                    {loading ? (
                        <LoadingContainer>
                            <Spinner />
                            <LoadingText>Loading conversations...</LoadingText>
                        </LoadingContainer>
                    ) : conversations.length === 0 ? (
                        <EmptyState>
                            <MessageCircle size={64} />
                            <EmptyText>No conversations yet</EmptyText>
                            <EmptySubtext>Start a new chat to begin messaging</EmptySubtext>
                            <StartChatButton onClick={() => setShowUserSearch(true)}>
                                <Plus size={18} />
                                Start New Chat
                            </StartChatButton>
                        </EmptyState>
                    ) : (
                        <>
                            {/* Group Chat Section */}
                            {conversations.filter(c => c.type === 'GROUP').length > 0 && (
                                <SectionHeader>
                                    <SectionTitle>Group Chats</SectionTitle>
                                    <SectionCount>{conversations.filter(c => c.type === 'GROUP').length}</SectionCount>
                                </SectionHeader>
                            )}
                            
                            {conversations.filter(c => c.type === 'GROUP').map((conv) => (
                                <ConversationLink
                                    key={conv.id}
                                    to={`/admin/chat/${conv.id}`}
                                    className={({ isActive }) => isActive ? 'active' : ''}
                                >
                                    <ConversationAvatar $hasUnread={conv.unreadCount > 0}>
                                        <GroupIcon>
                                            <Users size={22} />
                                        </GroupIcon>
                                    </ConversationAvatar>

                                    <ConversationInfo>
                                        <ConversationHeader>
                                            <ConversationName>
                                                {conv.name || 'Global Chat'}
                                            </ConversationName>
                                            <ConversationMeta>
                                                {conv.lastMessageTime && (
                                                    <Timestamp>{formatLastMessageTime(conv.lastMessageTime)}</Timestamp>
                                                )}
                                                {conv.unreadCount > 0 ? (
                                                    <UnreadBadge>{conv.unreadCount}</UnreadBadge>
                                                ) : (
                                                    getReadStatusIcon(conv.unreadCount, conv.lastMessageSender === currentUser?.sub)
                                                )}
                                            </ConversationMeta>
                                        </ConversationHeader>

                                        <LastMessage $hasUnread={conv.unreadCount > 0}>
                                            <MessageContent>
                                                {conv.lastMessageSender && (
                                                    <Sender>{conv.lastMessageSender}: </Sender>
                                                )}
                                                {truncateMessage(conv.lastMessage)}
                                            </MessageContent>
                                        </LastMessage>
                                    </ConversationInfo>
                                </ConversationLink>
                            ))}

                            {/* Direct Messages Section */}
                            {conversations.filter(c => c.type === 'DIRECT_MESSAGE').length > 0 && (
                                <SectionHeader>
                                    <SectionTitle>Direct Messages</SectionTitle>
                                    <SectionCount>{conversations.filter(c => c.type === 'DIRECT_MESSAGE').length}</SectionCount>
                                </SectionHeader>
                            )}

                            {conversations.filter(c => c.type === 'DIRECT_MESSAGE').map((conv) => (
                                <ConversationLink
                                    key={conv.id}
                                    to={`/admin/chat/${conv.id}`}
                                    className={({ isActive }) => isActive ? 'active' : ''}
                                >
                                    <ConversationAvatar $hasUnread={conv.unreadCount > 0}>
                                        <UserAvatar
                                            src={conv.otherParticipantProfilePicture || `https://ui-avatars.com/api/?name=${conv.otherParticipantUsername}&background=random&color=fff`}
                                            alt={conv.name || ''}
                                        />
                                        {conv.unreadCount > 0 && (
                                            <UnreadDot />
                                        )}
                                    </ConversationAvatar>

                                    <ConversationInfo>
                                        <ConversationHeader>
                                            <ConversationName>{conv.name || 'Unknown'}</ConversationName>
                                            <ConversationMeta>
                                                {conv.lastMessageTime && (
                                                    <Timestamp>{formatLastMessageTime(conv.lastMessageTime)}</Timestamp>
                                                )}
                                                {conv.unreadCount > 0 ? (
                                                    <UnreadBadge>{conv.unreadCount}</UnreadBadge>
                                                ) : (
                                                    getReadStatusIcon(conv.unreadCount, conv.lastMessageSender === currentUser?.sub)
                                                )}
                                            </ConversationMeta>
                                        </ConversationHeader>

                                        <LastMessage $hasUnread={conv.unreadCount > 0}>
                                            <MessageContent>
                                                {conv.lastMessageSender && (
                                                    <Sender>{conv.lastMessageSender}: </Sender>
                                                )}
                                                {truncateMessage(conv.lastMessage)}
                                            </MessageContent>
                                        </LastMessage>
                                    </ConversationInfo>
                                    
                                    <ChevronRight size={16} color="var(--text-tertiary)" />
                                </ConversationLink>
                            ))}

                            {/* Empty state for no conversations */}
                            {conversations.length === 0 && (
                                <EmptyDMState>
                                    <EmptyDMText>No conversations found</EmptyDMText>
                                    <NewMessageButtonLarge onClick={() => setShowUserSearch(true)}>
                                        <Plus size={18} />
                                        <span>Start New Chat</span>
                                    </NewMessageButtonLarge>
                                </EmptyDMState>
                            )}
                        </>
                    )}
                </ConversationList>

                <SidebarFooter>
                    <OnlineStatus>
                        <StatusDot $status="online" />
                        <StatusText>Online</StatusText>
                    </OnlineStatus>
                    <RefreshButton onClick={fetchConversations}>
                        Refresh
                    </RefreshButton>
                </SidebarFooter>
            </SidebarContainer>

            <UserSearchModal 
                isOpen={showUserSearch} 
                onClose={() => setShowUserSearch(false)} 
            />
        </>
    );
};

// Styled Components
const spin = keyframes`
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
`;

const SidebarContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--bg-secondary);
`;

const SidebarHeader = styled.div`
    padding: 1.5rem;
    border-bottom: 2px solid rgba(46, 151, 197, 0.1);
    background: linear-gradient(135deg, 
        rgba(46, 151, 197, 0.05) 0%, 
        rgba(150, 129, 158, 0.05) 100%
    );
    backdrop-filter: blur(10px);
`;

const HeaderTitle = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 1rem;
    font-family: 'Poppins', sans-serif;
`;

const HeaderActions = styled.div`
    display: flex;
    justify-content: flex-end;
`;

const NewChatButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: linear-gradient(135deg, rgb(46, 151, 197), rgb(150, 129, 158));
    color: white;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    font-size: 0.9375rem;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 16px rgba(46, 151, 197, 0.3);

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(46, 151, 197, 0.4);
    }

    &:active {
        transform: translateY(0);
    }
`;

const ConversationList = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 1rem 0;
    
    /* Custom scrollbar styling */
    &::-webkit-scrollbar {
        width: 6px;
    }
    
    &::-webkit-scrollbar-track {
        background: transparent;
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

const SectionHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1.5rem;
    margin-top: 0.5rem;
`;

const SectionTitle = styled.div`
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
`;

const SectionCount = styled.div`
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-tertiary);
    background: var(--bg-primary);
    padding: 0.25rem 0.5rem;
    border-radius: 10px;
`;

const ConversationLink = styled(NavLink)`
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.5rem;
    text-decoration: none;
    color: var(--text-primary);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    border-left: 4px solid transparent;
    background: transparent;

    &:hover {
        background: linear-gradient(90deg, 
            rgba(46, 151, 197, 0.05) 0%, 
            transparent 100%
        );
        padding-left: 1.75rem;
    }

    &.active {
        background: linear-gradient(90deg, 
            rgba(46, 151, 197, 0.12) 0%, 
            rgba(150, 129, 158, 0.08) 100%
        );
        border-left: 4px solid rgb(46, 151, 197);
        
        &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 4px;
            background: linear-gradient(180deg, 
                rgb(46, 151, 197), 
                rgb(150, 129, 158)
            );
            border-radius: 0 2px 2px 0;
        }
    }
`;

const ConversationAvatar = styled.div<{ $hasUnread?: boolean }>`
    position: relative;
    flex-shrink: 0;
    width: 52px;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const UserAvatar = styled.img`
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid rgba(46, 151, 197, 0.2);
    transition: all 0.3s ease;
    
    ${ConversationLink}:hover & {
        transform: scale(1.05);
        border-color: rgba(46, 151, 197, 0.4);
    }
    
    ${ConversationLink}.active & {
        border-color: rgba(46, 151, 197, 0.6);
        box-shadow: 0 4px 12px rgba(46, 151, 197, 0.2);
    }
`;

const GroupIcon = styled.div`
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: linear-gradient(135deg, rgb(46, 151, 197), rgb(150, 129, 158));
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.4rem;
    border: 3px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 12px rgba(46, 151, 197, 0.3);
    transition: all 0.3s ease;
    
    ${ConversationLink}:hover & {
        transform: scale(1.05);
        box-shadow: 0 6px 16px rgba(46, 151, 197, 0.4);
    }
`;

const UnreadDot = styled.div`
    position: absolute;
    top: -2px;
    right: -2px;
    width: 14px;
    height: 14px;
    background: linear-gradient(135deg, #ef4444, #dc2626);
    border-radius: 50%;
    border: 2px solid var(--bg-secondary);
    box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);
    animation: ${pulse} 2s ease-in-out infinite;
`;

const UnreadIndicator = styled.div`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ef4444, #dc2626);
    animation: ${pulse} 2s ease-in-out infinite;
`;

const ConversationInfo = styled.div`
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
`;

const ConversationHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
`;

const ConversationName = styled.div`
    font-weight: 700;
    font-size: 1rem;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const ConversationMeta = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const Timestamp = styled.div`
    font-size: 0.75rem;
    color: var(--text-tertiary);
    white-space: nowrap;
`;

const UnreadBadge = styled.div`
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    min-width: 24px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
    border: 2px solid rgba(255, 255, 255, 0.3);
`;

const LastMessage = styled.div<{ $hasUnread: boolean }>`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: ${props => props.$hasUnread ? '600' : '400'};
`;

const MessageContent = styled.div`
    display: flex;
    align-items: center;
    gap: 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const Sender = styled.span`
    font-weight: 500;
    color: var(--text-primary);
    flex-shrink: 0;
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
    gap: 1rem;
`;

const Spinner = styled.div`
    width: 40px;
    height: 40px;
    border: 3px solid rgba(46, 151, 197, 0.2);
    border-top-color: rgb(46, 151, 197);
    border-radius: 50%;
    animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.div`
    text-align: center;
    color: var(--text-secondary);
    font-size: 0.95rem;
`;

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
    text-align: center;
`;

const EmptyText = styled.div`
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-top: 1rem;
`;

const EmptySubtext = styled.div`
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin-top: 0.5rem;
    margin-bottom: 1.5rem;
`;

const StartChatButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 1.5rem;
    background: linear-gradient(135deg, rgb(46, 151, 197), rgb(150, 129, 158));
    color: white;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    font-size: 0.9375rem;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(46, 151, 197, 0.3);
    }
`;

const EmptyDMState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    padding: 3rem 1rem;
    text-align: center;
`;

const EmptyDMText = styled.div`
    font-size: 0.95rem;
    color: var(--text-secondary);
`;

const NewMessageButtonLarge = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.875rem 1.75rem;
    background: linear-gradient(135deg, rgb(46, 151, 197), rgb(150, 129, 158));
    color: white;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    font-size: 0.9375rem;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(46, 151, 197, 0.3);
    }
`;

const SidebarFooter = styled.div`
    padding: 1rem 1.5rem;
    border-top: 2px solid rgba(46, 151, 197, 0.1);
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: linear-gradient(135deg, 
        rgba(46, 151, 197, 0.05) 0%, 
        rgba(150, 129, 158, 0.05) 100%
    );
`;

const OnlineStatus = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const StatusDot = styled.div<{ $status: string }>`
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${props => props.$status === 'online' ? '#10b981' : '#6b7280'};
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
`;

const StatusText = styled.div`
    font-size: 0.875rem;
    color: var(--text-secondary);
    font-weight: 500;
`;

const RefreshButton = styled.button`
    padding: 0.5rem 1rem;
    background: var(--bg-primary);
    border: 2px solid rgba(46, 151, 197, 0.2);
    border-radius: 8px;
    color: var(--text-primary);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background: rgba(46, 151, 197, 0.1);
        border-color: rgba(46, 151, 197, 0.4);
    }
`;

export default ChatSidebar;