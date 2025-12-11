import React from 'react';
import styled from 'styled-components';
import { X, Mail, Building, Shield, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { User } from '../../types/user';
import { format } from 'date-fns';

interface UserDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ isOpen, onClose, user }) => {
    if (!isOpen || !user) return null;

    const getUserInitials = (username: string) => {
        return username.substring(0, 2).toUpperCase();
    };

    return (
        <Overlay onClick={onClose}>
            <ModalContainer onClick={(e) => e.stopPropagation()}>
                <CloseButton onClick={onClose}>
                    <X size={24} />
                </CloseButton>

                <ModalHeader>
                    <ProfilePicture>
                        {getUserInitials(user.username)}
                    </ProfilePicture>
                    <UserName>{user.username}</UserName>
                    <StatusBadge $enabled={user.enabled}>
                        {user.enabled ? (
                            <>
                                <CheckCircle size={14} /> Active
                            </>
                        ) : (
                            <>
                                <XCircle size={14} /> Inactive
                            </>
                        )}
                    </StatusBadge>
                </ModalHeader>

                <DetailsGrid>
                    <DetailItem>
                        <DetailIcon className="email">
                            <Mail size={20} />
                        </DetailIcon>
                        <DetailContent>
                            <DetailLabel>Email Address</DetailLabel>
                            <DetailValue>{user.email}</DetailValue>
                        </DetailContent>
                    </DetailItem>

                    <DetailItem>
                        <DetailIcon className="department">
                            <Building size={20} />
                        </DetailIcon>
                        <DetailContent>
                            <DetailLabel>Department</DetailLabel>
                            <DetailValue>{user.departmentName || 'Not assigned'}</DetailValue>
                        </DetailContent>
                    </DetailItem>

                    <DetailItem>
                        <DetailIcon className="role">
                            <Shield size={20} />
                        </DetailIcon>
                        <DetailContent>
                            <DetailLabel>Roles</DetailLabel>
                            <RolesContainer>
                                {user.roles && user.roles.length > 0 ? (
                                    user.roles.map((role, index) => (
                                        <RoleBadge key={index}>{role.name}</RoleBadge>
                                    ))
                                ) : (
                                    <DetailValue>No roles assigned</DetailValue>
                                )}
                            </RolesContainer>
                        </DetailContent>
                    </DetailItem>

                    {user.createdAt && (
                        <DetailItem>
                            <DetailIcon className="date">
                                <Calendar size={20} />
                            </DetailIcon>
                            <DetailContent>
                                <DetailLabel>Created Date</DetailLabel>
                                <DetailValue>
                                    {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                                </DetailValue>
                            </DetailContent>
                        </DetailItem>
                    )}
                </DetailsGrid>
            </ModalContainer>
        </Overlay>
    );
};

const Overlay = styled.div`
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease-out;

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
`;

const ModalContainer = styled.div`
    background: var(--bg-secondary);
    border-radius: 20px;
    padding: 40px;
    max-width: 550px;
    width: 90%;
    position: relative;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    border: 1px solid var(--border-color);
    animation: slideUp 0.3s ease-out;
    font-family: 'Poppins', sans-serif;

    @keyframes slideUp {
        from {
            transform: translateY(20px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    @media (max-width: 576px) {
        padding: 30px 20px;
    }
`;

const CloseButton = styled.button`
    position: absolute;
    top: 20px;
    right: 20px;
    background: transparent;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
        background: var(--bg-primary);
        color: var(--text-primary);
    }
`;

const ModalHeader = styled.div`
    text-align: center;
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--border-color);
`;

const ProfilePicture = styled.div`
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--light-blue), var(--purple));
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 36px;
    margin: 0 auto 16px;
    box-shadow: 0 8px 24px rgba(46, 151, 197, 0.3);
`;

const UserName = styled.h2`
    font-size: 28px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 12px;

    @media (max-width: 576px) {
        font-size: 24px;
    }
`;

const StatusBadge = styled.span<{ $enabled: boolean }>`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    background: ${props => props.$enabled ? 'rgba(46, 211, 135, 0.1)' : 'rgba(231, 76, 60, 0.1)'};
    color: ${props => props.$enabled ? 'var(--success)' : 'var(--danger)'};
`;

const DetailsGrid = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const DetailItem = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 16px;
    background: var(--bg-primary);
    border-radius: 12px;
    transition: all 0.2s ease;

    &:hover {
        transform: translateX(4px);
        box-shadow: 0 4px 12px var(--shadow);
    }
`;

const DetailIcon = styled.div`
    width: 44px;
    height: 44px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: white;

    &.email {
        background: var(--light-blue);
    }

    &.department {
        background: var(--purple);
    }

    &.role {
        background: var(--orange);
    }

    &.date {
        background: var(--success);
    }
`;

const DetailContent = styled.div`
    flex: 1;
`;

const DetailLabel = styled.div`
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 6px;
`;

const DetailValue = styled.div`
    font-size: 16px;
    font-weight: 500;
    color: var(--text-primary);
`;

const RolesContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
`;

const RoleBadge = styled.span`
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    background: var(--orange);
    color: white;
`;

export default UserDetailsModal;
