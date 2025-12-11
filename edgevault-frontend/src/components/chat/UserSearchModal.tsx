import React, { useState, useEffect } from 'react';
import { searchUsers, startDirectMessage } from '../../api/chatService';
import type { User } from '../../types/user';
import { X, Search, Loader } from 'lucide-react';
import styled from 'styled-components';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';

interface UserSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const UserSearchModal: React.FC<UserSearchModalProps> = ({ isOpen, onClose }) => {
    const { showError } = useToast();
    const [query, setQuery] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [topUsers, setTopUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Load top 5 recent users when modal opens
    useEffect(() => {
        if (isOpen) {
            const fetchTopUsers = async () => {
                try {
                    const results = await searchUsers('');
                    setTopUsers(results.slice(0, 5));
                } catch (error) {
                    console.error('Failed to fetch top users');
                }
            };
            fetchTopUsers();
        } else {
            setQuery('');
            setUsers([]);
        }
    }, [isOpen]);

    // Search users when query changes
    useEffect(() => {
        if (!isOpen || query.trim().length === 0) {
            setUsers([]);
            return;
        }

        const timeoutId = setTimeout(async () => {
            setLoading(true);
            try {
                const results = await searchUsers(query);
                setUsers(results);
            } catch (error) {
                showError('Error', 'Failed to search users');
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query, isOpen]);

    const handleUserSelect = async (username: string) => {
        try {
            const conversation = await startDirectMessage(username);
            navigate(`/admin/chat/${conversation.id}`);
            onClose();
        } catch (error) {
            showError('Error', `Could not start conversation with ${username}`);
        }
    };

    if (!isOpen) return null;

    return (
        <Overlay onClick={onClose}>
            <ModalContainer onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>New Message</ModalTitle>
                    <CloseButton onClick={onClose}>
                        <X size={20} />
                    </CloseButton>
                </ModalHeader>

                <SearchInputContainer>
                    <SearchIcon>
                        <Search size={18} />
                    </SearchIcon>
                    <SearchInput
                        type="text"
                        placeholder="Search users by name..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                    />
                </SearchInputContainer>

                <UserList>
                    {loading && (
                        <LoadingContainer>
                            <Loader className="animate-spin" size={24} />
                            <LoadingText>Searching...</LoadingText>
                        </LoadingContainer>
                    )}

                    {!loading && query.trim().length === 0 && (
                        <>
                            <SectionHeader>Recent Users</SectionHeader>
                            {topUsers.length === 0 ? (
                                <EmptyMessage>No users available</EmptyMessage>
                            ) : (
                                topUsers.map((user) => (
                                    <UserItem key={user.id} onClick={() => handleUserSelect(user.username)}>
                                        <UserAvatar
                                            src={user.profilePictureUrl || `https://ui-avatars.com/api/?name=${user.username}&background=random&color=fff`}
                                            alt={user.username}
                                        />
                                        <UserInfo>
                                            <UserName>{user.username}</UserName>
                                            {(user.firstName || user.lastName) && (
                                                <UserFullName>
                                                    {user.firstName} {user.lastName}
                                                </UserFullName>
                                            )}
                                        </UserInfo>
                                    </UserItem>
                                ))
                            )}
                        </>
                    )}

                    {!loading && query.trim().length > 0 && users.length === 0 && (
                        <EmptyMessage>No users found</EmptyMessage>
                    )}

                    {!loading && query.trim().length > 0 && users.length > 0 && (
                        <>
                            <SectionHeader>Search Results</SectionHeader>
                            {users.map((user) => (
                                <UserItem key={user.id} onClick={() => handleUserSelect(user.username)}>
                                    <UserAvatar
                                        src={user.profilePictureUrl || `https://ui-avatars.com/api/?name=${user.username}&background=random&color=fff`}
                                        alt={user.username}
                                    />
                                    <UserInfo>
                                        <UserName>{user.username}</UserName>
                                        {(user.firstName || user.lastName) && (
                                            <UserFullName>
                                                {user.firstName} {user.lastName}
                                            </UserFullName>
                                        )}
                                    </UserInfo>
                                </UserItem>
                            ))}
                        </>
                    )}
                </UserList>
            </ModalContainer>
        </Overlay>
    );
};

// Styled Components
const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease;

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;

const ModalContainer = styled.div`
    background: var(--bg-secondary);
    border-radius: 16px;
    width: 90%;
    max-width: 500px;
    max-height: 600px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s ease;

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

const ModalHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-color);
`;

const ModalTitle = styled.h2`
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
`;

const CloseButton = styled.button`
    background: transparent;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 8px;
    transition: all 0.2s;

    &:hover {
        background: var(--hover-color);
        color: var(--text-primary);
    }
`;

const SearchInputContainer = styled.div`
    position: relative;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--border-color);
`;

const SearchIcon = styled.div`
    position: absolute;
    left: 2rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-secondary);
    pointer-events: none;
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 0.75rem 0.75rem 0.75rem 2.5rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 0.95rem;
    transition: all 0.2s;

    &:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(46, 151, 197, 0.1);
    }

    &::placeholder {
        color: var(--text-tertiary);
    }
`;

const UserList = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem;
`;

const UserItem = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background: var(--hover-color);
    }
`;

const UserAvatar = styled.img`
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
`;

const UserInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

const UserName = styled.div`
    font-weight: 500;
    color: var(--text-primary);
    font-size: 0.95rem;
`;

const UserFullName = styled.div`
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-top: 0.15rem;
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    gap: 1rem;
`;

const LoadingText = styled.div`
    color: var(--text-secondary);
    font-size: 0.9rem;
`;

const EmptyMessage = styled.div`
    text-align: center;
    color: var(--text-secondary);
    padding: 3rem 1rem;
    font-size: 0.9rem;
`;

const SectionHeader = styled.div`
    padding: 0.75rem 1rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background: var(--bg-primary);
    border-bottom: 1px solid var(--border-color);
`;

export default UserSearchModal;
