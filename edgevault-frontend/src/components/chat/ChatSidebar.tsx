import React, { useEffect, useState } from 'react';
import { getAllConversations } from '../../api/chatService';
import type { ConversationSummary } from '../../types/chat';
import { useToast } from '../../context/ToastContext';
import { Users, MessageCircle, Plus, Hash } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styled from 'styled-components';
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

    return (
        <>
            <SidebarContainer>
                <ConversationList>
                    {loading ? (
                        <LoadingMessage>Loading conversations...</LoadingMessage>
                    ) : conversations.length === 0 ? (
                        <EmptyState>
                            <MessageCircle size={48} />
                            <EmptyText>No conversations yet</EmptyText>
                            <EmptySubtext>Start a new message to chat</EmptySubtext>
                        </EmptyState>
                    ) : (
                        <>
                            {/* Group Chat Section */}
                            {conversations.filter(c => c.type === 'GROUP').map((conv) => (
                                <ConversationLink
                                    key={conv.id}
                                    to={`/admin/chat/${conv.id}`}
                                    className={({ isActive }) => isActive ? 'active' : ''}
                                >
                                    <ConversationAvatar $hasUnread={conv.unreadCount > 0}>
                                        <GroupIcon>
                                            <Users size={20} />
                                        </GroupIcon>
                                    </ConversationAvatar>

                                    <ConversationInfo>
                                        <ConversationHeader>
                                            <ConversationName>
                                                {conv.name || 'Global Chat'}
                                            </ConversationName>
                                            {conv.unreadCount > 0 && (
                                                <UnreadBadge>{conv.unreadCount}</UnreadBadge>
                                            )}
                                        </ConversationHeader>

                                        <LastMessage $hasUnread={conv.unreadCount > 0}>
                                            {conv.lastMessageSender && (
                                                <Sender>{conv.lastMessageSender}: </Sender>
                                            )}
                                            {truncateMessage(conv.lastMessage)}
                                        </LastMessage>

                                        {conv.lastMessageTime && (
                                            <Timestamp>{formatLastMessageTime(conv.lastMessageTime)}</Timestamp>
                                        )}
                                    </ConversationInfo>
                                </ConversationLink>
                            ))}

                            {/* Direct Messages Section */}
                            {conversations.filter(c => c.type === 'DIRECT_MESSAGE').length > 0 && (
                                <>
                                    <SectionDivider>
                                        <DividerLine />
                                        <SectionTitle>Direct Messages</SectionTitle>
                                        <DividerLine />
                                        <NewChatButton onClick={() => setShowUserSearch(true)}>
                                            <Plus size={16} />
                                        </NewChatButton>
                                    </SectionDivider>

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
                                            </ConversationAvatar>

                                            <ConversationInfo>
                                                <ConversationHeader>
                                                    <ConversationName>{conv.name || 'Unknown'}</ConversationName>
                                                    {conv.unreadCount > 0 && (
                                                        <UnreadBadge>{conv.unreadCount}</UnreadBadge>
                                                    )}
                                                </ConversationHeader>

                                                <LastMessage $hasUnread={conv.unreadCount > 0}>
                                                    {conv.lastMessageSender && (
                                                        <Sender>{conv.lastMessageSender}: </Sender>
                                                    )}
                                                    {truncateMessage(conv.lastMessage)}
                                                </LastMessage>

                                                {conv.lastMessageTime && (
                                                    <Timestamp>{formatLastMessageTime(conv.lastMessageTime)}</Timestamp>
                                                )}
                                            </ConversationInfo>
                                        </ConversationLink>
                                    ))}
                                </>
                            )}

                            {/* Show New Message button if no DMs exist */}
                            {conversations.filter(c => c.type === 'DIRECT_MESSAGE').length === 0 && (
                                <>
                                    <SectionDivider>
                                        <DividerLine />
                                        <SectionTitle>Direct Messages</SectionTitle>
                                        <DividerLine />
                                    </SectionDivider>
                                    <EmptyDMState>
                                        <EmptyDMText>No direct messages yet</EmptyDMText>
                                        <NewMessageButtonLarge onClick={() => setShowUserSearch(true)}>
                                            <Plus size={18} />
                                            <span>Start New Chat</span>
                                        </NewMessageButtonLarge>
                                    </EmptyDMState>
                                </>
                            )}
                        </>
                    )}
                </ConversationList>
            </SidebarContainer>

            <UserSearchModal 
                isOpen={showUserSearch} 
                onClose={() => setShowUserSearch(false)} 
            />
        </>
    );
};

// Styled Components
const SidebarContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--bg-secondary);
`;

const ConversationList = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem 0;
    
    /* Custom scrollbar styling */
    &::-webkit-scrollbar {
        width: 6px;
    }
    
    &::-webkit-scrollbar-track {
        background: transparent;
    }
    
    &::-webkit-scrollbar-thumb {
        background: rgba(46, 151, 197, 0.3);
        border-radius: 10px;
        transition: background 0.2s;
    }
    
    &::-webkit-scrollbar-thumb:hover {
        background: rgba(46, 151, 197, 0.5);
    }
`;

const SectionDivider = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1rem 0.5rem 1rem;
    margin-top: 0.5rem;
`;

const DividerLine = styled.div`
    flex: 1;
    height: 1px;
    background: var(--border-color);
`;

const SectionTitle = styled.div`
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    white-space: nowrap;
`;

const NewChatButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgb(46, 151, 197), rgb(150, 129, 158));
    color: white;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;

    &:hover {
        transform: scale(1.1);
        box-shadow: 0 2px 8px rgba(46, 151, 197, 0.3);
    }

    &:active {
        transform: scale(0.95);
    }
`;

const EmptyDMState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 2rem 1rem;
    text-align: center;
`;

const EmptyDMText = styled.div`
    font-size: 0.9rem;
    color: var(--text-secondary);
`;

const NewMessageButtonLarge = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, rgb(46, 151, 197), rgb(150, 129, 158));
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(46, 151, 197, 0.3);
    }

    &:active {
        transform: translateY(0);
    }
`;

const ConversationLink = styled(NavLink)`
    display: flex;
    align-items: flex-start;
    gap: 0.85rem;
    padding: 0.85rem;
    border-radius: 12px;
    text-decoration: none;
    color: var(--text-primary);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    margin: 0.15rem 0.5rem;
    position: relative;
    border: 1px solid transparent;

    &:hover {
        background: var(--hover-color);
        transform: translateX(2px);
        border-color: rgba(46, 151, 197, 0.1);
    }

    &.active {
        background: linear-gradient(135deg, rgba(46, 151, 197, 0.12), rgba(150, 129, 158, 0.08));
        border-left: 3px solid rgb(46, 151, 197);
        box-shadow: 0 2px 8px rgba(46, 151, 197, 0.15);
        
        &::before {
            content: '';
            position: absolute;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 3px;
            height: 60%;
            background: linear-gradient(180deg, rgb(46, 151, 197), rgb(150, 129, 158));
            border-radius: 3px 0 0 3px;
        }
    }
`;

const ConversationAvatar = styled.div<{ $hasUnread?: boolean }>`
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    
    ${props => props.hasUnread && `
        &::after {
            content: '';
            position: absolute;
            top: -2px;
            right: -2px;
            width: 12px;
            height: 12px;
            background: linear-gradient(135deg, #ef4444, #dc2626);
            border-radius: 50%;
            border: 2px solid var(--bg-secondary);
            box-shadow: 0 2px 4px rgba(239, 68, 68, 0.4);
            animation: notificationPulse 2s ease-in-out infinite;
        }
        
        @keyframes notificationPulse {
            0%, 100% {
                transform: scale(1);
                opacity: 1;
            }
            50% {
                transform: scale(1.1);
                opacity: 0.9;
            }
        }
    `}
`;

const UserAvatar = styled.img`
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(46, 151, 197, 0.2);
    transition: all 0.2s ease;
    
    ${ConversationLink}:hover & {
        transform: scale(1.05);
        border-color: rgba(46, 151, 197, 0.4);
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
    border: 2px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 2px 8px rgba(46, 151, 197, 0.3);
    transition: all 0.2s ease;
    
    ${ConversationLink}:hover & {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(46, 151, 197, 0.4);
    }
`;

const DocumentIcon = styled.div`
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: linear-gradient(135deg, rgb(229, 151, 54), rgb(197, 46, 138));
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
`;

const ConversationInfo = styled.div`
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
`;

const ConversationHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
`;

const ConversationName = styled.div`
    font-weight: 600;
    font-size: 0.975rem;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: flex;
    align-items: center;
    letter-spacing: 0.01em;
    line-height: 1.3;
`;

const UnreadBadge = styled.div`
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    font-size: 0.7rem;
    font-weight: 700;
    padding: 0.25rem 0.65rem;
    border-radius: 12px;
    min-width: 24px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.5);
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    flex-shrink: 0;
    border: 2px solid rgba(255, 255, 255, 0.3);

    @keyframes pulse {
        0%, 100% {
            opacity: 1;
            transform: scale(1);
        }
        50% {
            opacity: 0.85;
            transform: scale(1.05);
        }
    }
`;

const LastMessage = styled.div<{ $hasUnread: boolean }>`
    font-size: 0.875rem;
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: ${props => props.hasUnread ? '600' : '400'};
    line-height: 1.4;
    opacity: ${props => props.hasUnread ? '1' : '0.85'};
    
    strong {
        font-weight: 600;
        color: var(--text-primary);
    }
`;

const Sender = styled.span`
    font-weight: 500;
    color: var(--text-tertiary);
`;

const Timestamp = styled.div`
    font-size: 0.75rem;
    color: var(--text-tertiary);
`;

const LoadingMessage = styled.div`
    text-align: center;
    color: var(--text-secondary);
    padding: 2rem 1rem;
    font-size: 0.9rem;
`;

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
    text-align: center;
    color: var(--text-secondary);
`;

const EmptyText = styled.div`
    font-size: 1rem;
    font-weight: 500;
    margin-top: 1rem;
    color: var(--text-primary);
`;

const EmptySubtext = styled.div`
    font-size: 0.85rem;
    margin-top: 0.5rem;
`;

export default ChatSidebar;