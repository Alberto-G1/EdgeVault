import React, { useEffect, useState, useCallback} from 'react';
import { getAllUserDetails, deleteUser, activateUser, deactivateUser, resetUserPassword } from '../../api/userService';
import type { User } from '../../types/user';
import { useToast } from '../../context/ToastContext';
import { Edit, Trash2, Eye, EyeOff, UserCheck, UserX, Key } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import FullPageLoader from '../../components/common/FullPageLoader';
import HoverButton from '../../components/common/HoverButton';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';
import UserDetailsModal from '../../components/common/UserDetailsModal';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const resolveUserProfileImage = (userRecord: User) => {
    const candidates = [
        userRecord.profilePictureUrl,
        userRecord.profilePicture,
        userRecord.profile?.profilePictureUrl,
        userRecord.profile?.profilePicture,
    ];

    const validUrl = candidates.find((candidate): candidate is string => {
        if (!candidate) return false;
        const trimmed = candidate.trim();
        return trimmed.length > 0;
    });

    if (validUrl) {
        return validUrl;
    }

    const encodedName = encodeURIComponent(userRecord.username ?? 'User');
    return `https://ui-avatars.com/api/?name=${encodedName}&background=2E97C5&color=fff`;
};

const UserManagementPage: React.FC = () => {
    const { showError, showSuccess } = useToast();
    const { hasPermission, hasAnyPermission } = usePermissions();
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<number | null>(null);
    const [viewDetailsModalOpen, setViewDetailsModalOpen] = useState(false);
    const [userToView, setUserToView] = useState<User | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<'activate' | 'deactivate' | null>(null);
    const [userIdToConfirm, setUserIdToConfirm] = useState<number | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);
    const [passwordResetModalOpen, setPasswordResetModalOpen] = useState(false);
    const [userToResetPassword, setUserToResetPassword] = useState<User | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    

    // Wrap fetchUsers in useCallback to make it a stable function
    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getAllUserDetails();
            setUsers(data);
        } catch (error) {
            showError('Error', 'Failed to fetch detailed user list.');
        } finally {
            setLoading(false);
        }
    }, []); // Empty dependency array means this function is created only once

    // This useEffect now has stable dependencies and will only run once,
    // or if the user's permissions genuinely change (e.g., after re-login).
    useEffect(() => {
        if (hasPermission('USER_READ')) {
            fetchUsers();
        } else {
            setLoading(false); 
        }
    }, [hasPermission, fetchUsers]);
    // -----------------------

    const handleOpenModal = (userId?: number) => {
        if (userId) {
            navigate(`/admin/users/edit/${userId}`);
        } else {
            navigate('/admin/users/new');
        }
    };

    const handleActivateUser = (userId: number) => {
        setUserIdToConfirm(userId);
        setConfirmAction('activate');
        setIsConfirmModalOpen(true);
    };

    const handleDeactivateUser = (userId: number) => {
        setUserIdToConfirm(userId);
        setConfirmAction('deactivate');
        setIsConfirmModalOpen(true);
    };

    const handleConfirmAction = async () => {
        if (userIdToConfirm === null || confirmAction === null) return;

        setIsConfirming(true);
        try {
            if (confirmAction === 'activate') {
                await activateUser(userIdToConfirm);
                showSuccess('Success', 'User activated successfully!');
            } else if (confirmAction === 'deactivate') {
                await deactivateUser(userIdToConfirm);
                showSuccess('Success', 'User deactivated successfully!');
            }
            fetchUsers();
            setIsConfirmModalOpen(false);
        } catch (error: any) {
            showError('Error', error.response?.data?.message || `Failed to ${confirmAction} user.`);
        } finally {
            setIsConfirming(false);
            setUserIdToConfirm(null);
            setConfirmAction(null);
        }
    };

    const handleCloseConfirmModal = () => {
        if (!isConfirming) {
            setIsConfirmModalOpen(false);
            setUserIdToConfirm(null);
            setConfirmAction(null);
        }
    };
    
    const handleDeleteUser = async (userId: number) => {
        setUserToDelete(userId);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (userToDelete === null) return;
        
        try {
            await deleteUser(userToDelete);
            showSuccess('Success', 'User deleted successfully!');
            fetchUsers();
        } catch (error: any) {
            showError('Error', error.response?.data?.message || 'Failed to delete user.');
        } finally {
            setUserToDelete(null);
        }
    };

    const handleViewDetails = (user: User) => {
        setUserToView(user);
        setViewDetailsModalOpen(true);
    };

    const handleOpenPasswordResetModal = (user: User) => {
        setUserToResetPassword(user);
        setNewPassword('');
        setConfirmPassword('');
        setPasswordResetModalOpen(true);
    };

    const handleResetPassword = async () => {
        if (!userToResetPassword) return;

        // Validation
        if (!newPassword || newPassword.trim().length === 0) {
            showError('Validation Error', 'Please enter a new password.');
            return;
        }

        if (newPassword.length < 8) {
            showError('Validation Error', 'Password must be at least 8 characters long.');
            return;
        }

        if (newPassword !== confirmPassword) {
            showError('Validation Error', 'Passwords do not match.');
            return;
        }

        setIsResettingPassword(true);
        try {
            await resetUserPassword(userToResetPassword.id, newPassword);
            showSuccess('Success', `Password reset successfully for user ${userToResetPassword.username}. User will be required to change password on next login.`);
            setPasswordResetModalOpen(false);
            setUserToResetPassword(null);
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            showError('Error', error.response?.data?.message || 'Failed to reset password.');
        } finally {
            setIsResettingPassword(false);
        }
    };

    if (loading) return <FullPageLoader />;

    // Pagination calculations
    const totalItems = users.length;
    const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(totalItems / itemsPerPage);
    const startIndex = itemsPerPage === -1 ? 0 : (currentPage - 1) * itemsPerPage;
    const endIndex = itemsPerPage === -1 ? totalItems : startIndex + itemsPerPage;
    const currentUsers = users.slice(startIndex, endIndex);
    
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };
    
    const handleItemsPerPageChange = (value: number) => {
        setItemsPerPage(value);
        setCurrentPage(1); // Reset to first page
    };

    return (
        <PageContainer>
            <PageHeader>
                <h1 className="title">User Management</h1>
                {hasPermission('USER_CREATE') && (
                    <HoverButton 
                        onClick={() => handleOpenModal()}
                        textOne="Add User"
                        textTwo="Create New"
                    />
                )}
            </PageHeader>

            <TableContainer>
                <StyledTable>
                    <thead>
                        <tr>
                            <TableHeader>Profile</TableHeader>
                            <TableHeader>Username</TableHeader>
                            <TableHeader>Email</TableHeader>
                            <TableHeader>Department</TableHeader>
                            <TableHeader>Status</TableHeader>
                            <TableHeader>Roles</TableHeader>
                            {hasAnyPermission(['USER_UPDATE', 'USER_DELETE']) && (
                                <TableHeader style={{ textAlign: 'right' }}>Actions</TableHeader>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {currentUsers.map((user, index) => (
                            <TableRow key={user.id} style={{ animationDelay: `${0.2 + index * 0.05}s` }}>
                                <TableCell>
                                    <ProfileAvatar
                                        src={resolveUserProfileImage(user)}
                                        alt={user.username}
                                        onError={(event) => {
                                            const target = event.currentTarget;
                                            target.onerror = null;
                                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=2E97C5&color=fff`;
                                        }}
                                    />
                                </TableCell>
                                <TableCell className="font-medium">{user.username}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.departmentName || 'Not assigned'}</TableCell>
                                <TableCell>
                                    <StatusBadge $enabled={user.enabled ?? true}>
                                        {user.enabled ? 'Active' : 'Inactive'}
                                    </StatusBadge>
                                </TableCell>
                                <TableCell>
                                    <RolesCell>
                                        {(user.roles && user.roles.length > 0) ? (
                                            user.roles.slice(0, 2).map((r, idx) => (
                                                <RolePill key={idx}>{r}</RolePill>
                                            ))
                                        ) : (
                                            <span style={{ color: 'var(--text-secondary)' }}>No roles</span>
                                        )}
                                        {user.roles && user.roles.length > 2 && (
                                            <MoreBadge>+{user.roles.length - 2}</MoreBadge>
                                        )}
                                    </RolesCell>
                                </TableCell>
                                {hasAnyPermission(['USER_UPDATE', 'USER_DELETE']) && (
                                    <TableCell style={{ textAlign: 'right' }}>
                                        <ActionButtons>
                                            <ActionButton onClick={() => handleViewDetails(user)} className="view">
                                                <Eye size={18}/>
                                            </ActionButton>
                                            {hasPermission('USER_UPDATE') && (
                                                <>
                                                    <ActionButton onClick={() => handleOpenModal(user.id)} className="edit">
                                                        <Edit size={18}/>
                                                    </ActionButton>
                                                    <ActionButton onClick={() => handleOpenPasswordResetModal(user)} className="reset-password">
                                                        <Key size={18}/>
                                                    </ActionButton>
                                                    {user.enabled ? (
                                                        <ActionButton onClick={() => handleDeactivateUser(user.id)} className="deactivate">
                                                            <UserX size={18}/>
                                                        </ActionButton>
                                                    ) : (
                                                        <ActionButton onClick={() => handleActivateUser(user.id)} className="activate">
                                                            <UserCheck size={18}/>
                                                        </ActionButton>
                                                    )}
                                                </>
                                            )}
                                            {hasPermission('USER_DELETE') && (
                                                <ActionButton onClick={() => handleDeleteUser(user.id)} className="delete">
                                                    <Trash2 size={18}/>
                                                </ActionButton>
                                            )}
                                        </ActionButtons>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </tbody>
                </StyledTable>
            </TableContainer>
            
            {/* Mobile Card View */}
            <MobileCardsContainer>
                {currentUsers.map((user, index) => (
                    <MobileCard key={user.id} style={{ animationDelay: `${0.1 + index * 0.05}s` }}>
                        <MobileCardHeader>
                            <ProfileAvatar
                                src={resolveUserProfileImage(user)}
                                alt={user.username}
                                onError={(event) => {
                                    const target = event.currentTarget;
                                    target.onerror = null;
                                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=2E97C5&color=fff`;
                                }}
                            />
                            {hasAnyPermission(['USER_UPDATE', 'USER_DELETE']) && (
                                <MobileActions>
                                    <ActionButton onClick={() => handleViewDetails(user)} className="view">
                                        <Eye size={18}/>
                                    </ActionButton>
                                    {hasPermission('USER_UPDATE') && (
                                        <>
                                            <ActionButton onClick={() => handleOpenModal(user.id)} className="edit">
                                                <Edit size={18}/>
                                            </ActionButton>
                                            <ActionButton onClick={() => handleOpenPasswordResetModal(user)} className="reset-password">
                                                <Key size={18}/>
                                            </ActionButton>
                                            {user.enabled ? (
                                                <ActionButton onClick={() => handleDeactivateUser(user.id)} className="deactivate">
                                                    <UserX size={18}/>
                                                </ActionButton>
                                            ) : (
                                                <ActionButton onClick={() => handleActivateUser(user.id)} className="activate">
                                                    <UserCheck size={18}/>
                                                </ActionButton>
                                            )}
                                        </>
                                    )}
                                    {hasPermission('USER_DELETE') && (
                                        <ActionButton onClick={() => handleDeleteUser(user.id)} className="delete">
                                            <Trash2 size={18}/>
                                        </ActionButton>
                                    )}
                                </MobileActions>
                            )}
                        </MobileCardHeader>
                        <MobileCardBody>
                            <MobileCardRow>
                                <MobileCardLabel>Username</MobileCardLabel>
                                <MobileCardValue>{user.username}</MobileCardValue>
                            </MobileCardRow>
                            <MobileCardRow>
                                <MobileCardLabel>Email</MobileCardLabel>
                                <MobileCardValue>{user.email}</MobileCardValue>
                            </MobileCardRow>
                            <MobileCardRow>
                                <MobileCardLabel>Department</MobileCardLabel>
                                <MobileCardValue>{user.departmentName || 'Not assigned'}</MobileCardValue>
                            </MobileCardRow>
                            <MobileCardRow>
                                <MobileCardLabel>Status</MobileCardLabel>
                                <MobileCardValue>
                                    <StatusBadge $enabled={user.enabled ?? true}>
                                        {user.enabled ? 'Active' : 'Inactive'}
                                    </StatusBadge>
                                </MobileCardValue>
                            </MobileCardRow>
                            <MobileCardRow>
                                <MobileCardLabel>Roles</MobileCardLabel>
                                <MobileCardValue>
                                    <RolesCell>
                                        {(user.roles && user.roles.length > 0) ? (
                                            user.roles.slice(0, 2).map((r, idx) => (
                                                <RolePill key={idx}>{r}</RolePill>
                                            ))
                                        ) : (
                                            <span style={{ color: 'var(--text-secondary)' }}>No roles</span>
                                        )}
                                        {user.roles && user.roles.length > 2 && (
                                            <MoreBadge>+{user.roles.length - 2}</MoreBadge>
                                        )}
                                    </RolesCell>
                                </MobileCardValue>
                            </MobileCardRow>
                        </MobileCardBody>
                    </MobileCard>
                ))}
            </MobileCardsContainer>
            
            <PaginationContainer>
                <PaginationInfo>
                    Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} users
                </PaginationInfo>
                
                <PaginationControls>
                    <ItemsPerPageSelect 
                        value={itemsPerPage} 
                        onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    >
                        <option value={5}>5 per page</option>
                        <option value={10}>10 per page</option>
                        <option value={15}>15 per page</option>
                        <option value={20}>20 per page</option>
                        <option value={25}>25 per page</option>
                        <option value={35}>35 per page</option>
                        <option value={45}>45 per page</option>
                        <option value={50}>50 per page</option>
                        <option value={70}>70 per page</option>
                        <option value={80}>80 per page</option>
                        <option value={90}>90 per page</option>
                        <option value={100}>100 per page</option>
                        <option value={-1}>All</option>
                    </ItemsPerPageSelect>
                    
                    <PageButtons>
                        <PageButton 
                            onClick={() => handlePageChange(currentPage - 1)} 
                            disabled={currentPage === 1}
                        >
                            Previous
                        </PageButton>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(page => {
                                // Show first, last, current, and adjacent pages
                                return page === 1 || 
                                       page === totalPages || 
                                       (page >= currentPage - 1 && page <= currentPage + 1);
                            })
                            .map((page, index, array) => (
                                <React.Fragment key={page}>
                                    {index > 0 && array[index - 1] !== page - 1 && <PageEllipsis>...</PageEllipsis>}
                                    <PageButton
                                        onClick={() => handlePageChange(page)}
                                        $active={currentPage === page}
                                    >
                                        {page}
                                    </PageButton>
                                </React.Fragment>
                            ))}
                        
                        <PageButton 
                            onClick={() => handlePageChange(currentPage + 1)} 
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </PageButton>
                    </PageButtons>
                </PaginationControls>
            </PaginationContainer>

            <DeleteConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete User"
                message="Are you sure you want to delete this user? This action cannot be undone and will permanently remove all user data."
                confirmText="Delete"
                type="danger"
            />

            <UserDetailsModal
                isOpen={viewDetailsModalOpen}
                onClose={() => setViewDetailsModalOpen(false)}
                user={userToView}
            />

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={handleCloseConfirmModal}
                onConfirm={handleConfirmAction}
                title={confirmAction === 'activate' ? 'Activate User' : 'Deactivate User'}
                message={
                    confirmAction === 'activate'
                        ? 'Are you sure you want to activate this user? They will regain access to the system.'
                        : 'Are you sure you want to deactivate this user? They will lose access to the system until reactivated.'
                }
                confirmText={confirmAction === 'activate' ? 'Activate' : 'Deactivate'}
                isConfirming={isConfirming}
                isApprove={confirmAction === 'activate'}
                icon={confirmAction === 'activate' ? <UserCheck size={40} /> : <UserX size={40} />}
            />

            {/* Password Reset Modal */}
            {passwordResetModalOpen && (
                <PasswordResetModalOverlay onClick={() => !isResettingPassword && setPasswordResetModalOpen(false)}>
                    <PasswordResetModalContainer onClick={(e) => e.stopPropagation()}>
                        <PasswordResetModalHeader>
                            <h3>Reset Password</h3>
                            <button onClick={() => !isResettingPassword && setPasswordResetModalOpen(false)}>
                                ×
                            </button>
                        </PasswordResetModalHeader>
                        
                        <PasswordResetModalBody>
                            <UserInfo>
                                <ProfileAvatar
                                    src={userToResetPassword ? resolveUserProfileImage(userToResetPassword) : ''}
                                    alt={userToResetPassword?.username}
                                />
                                <div>
                                    <h4>{userToResetPassword?.username}</h4>
                                    <p>{userToResetPassword?.email}</p>
                                </div>
                            </UserInfo>

                            <InfoBox>
                                <Key size={20} />
                                <div>
                                    <strong>Important:</strong> The user will be required to change this password on their next login.
                                </div>
                            </InfoBox>

                            <FormGroup>
                                <Label>New Password</Label>
                                <PasswordWrapper>
                                    <PasswordInput
                                        type={showNewPassword ? 'text' : 'password'}
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        disabled={isResettingPassword}
                                    />
                                    <EyeToggle onClick={() => setShowNewPassword(!showNewPassword)}>
                                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </EyeToggle>
                                </PasswordWrapper>
                                <HelpText>Minimum 8 characters required</HelpText>
                            </FormGroup>

                            <FormGroup>
                                <Label>Confirm Password</Label>
                                <PasswordWrapper>
                                    <PasswordInput
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        disabled={isResettingPassword}
                                    />
                                    <EyeToggle onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </EyeToggle>
                                </PasswordWrapper>
                            </FormGroup>
                        </PasswordResetModalBody>

                        <PasswordResetModalFooter>
                            <CancelButton 
                                onClick={() => setPasswordResetModalOpen(false)}
                                disabled={isResettingPassword}
                            >
                                Cancel
                            </CancelButton>
                            <ResetButton 
                                onClick={handleResetPassword}
                                disabled={isResettingPassword}
                            >
                                {isResettingPassword ? 'Resetting...' : 'Reset Password'}
                            </ResetButton>
                        </PasswordResetModalFooter>
                    </PasswordResetModalContainer>
                </PasswordResetModalOverlay>
            )}
        </PageContainer>
    );
};

const PageContainer = styled.div`
    width: 100%;
    padding: 30px;
    font-family: 'Poppins', sans-serif;
    animation: fadeIn 0.4s ease-in;

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @media (max-width: 768px) {
        padding: 25px 20px;
    }

    @media (max-width: 480px) {
        padding: 20px 15px;
    }
`;

const PageHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
    animation: slideUp 0.5s ease-out backwards;

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

    .title {
        font-size: 36px;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0;

        @media (max-width: 768px) {
            font-size: 28px;
        }

        @media (max-width: 480px) {
            font-size: 24px;
        }
    }

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 20px;
        align-items: flex-start;
        margin-bottom: 24px;
    }
`;

const TableContainer = styled.div`
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 16px var(--shadow);
    animation: slideUp 0.5s ease-out 0.1s backwards;

    @media (max-width: 768px) {
        display: none;
    }
`;

const StyledTable = styled.table`
    width: 100%;
    border-collapse: collapse;

    @media (max-width: 768px) {
        min-width: 900px;
    }
`;

const TableHeader = styled.th`
    padding: 20px 24px;
    text-align: left;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 1px;
    background: var(--bg-primary);
    border-bottom: 2px solid var(--border-color);

    @media (max-width: 768px) {
        padding: 16px 20px;
        font-size: 11px;
    }
`;

const TableRow = styled.tr`
    transition: all 0.2s ease;
    animation: slideUp 0.4s ease-out backwards;

    &:hover {
        background: var(--bg-primary);
        transform: translateX(4px);
    }

    &:not(:last-child) {
        border-bottom: 1px solid var(--border-color);
    }
`;

const TableCell = styled.td`
    padding: 20px 24px;
    font-size: 14px;
    color: var(--text-primary);
    white-space: nowrap;

    &.font-medium {
        font-weight: 600;
    }

    @media (max-width: 768px) {
        padding: 16px 20px;
        font-size: 13px;
    }
`;

const StatusBadge = styled.span<{ $enabled: boolean }>`
    display: inline-flex;
    align-items: center;
    padding: 6px 14px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 20px;
    background: ${props => props.$enabled ? 'var(--success)' : 'var(--danger)'};
    color: white;

    @media (max-width: 768px) {
        padding: 4px 12px;
        font-size: 11px;
    }
`;

const ProfileAvatar = styled.img`
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 2px solid rgba(46, 151, 197, 0.2);
    object-fit: cover;
    box-shadow: 0 2px 8px rgba(46, 151, 197, 0.3);
    background: linear-gradient(135deg, var(--light-blue), var(--purple));

    @media (max-width: 768px) {
        width: 36px;
        height: 36px;
    }
`;

const RolesCell = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
`;

const RolePill = styled.span`
    padding: 4px 10px;
    font-size: 11px;
    font-weight: 600;
    border-radius: 12px;
    background: var(--orange);
    color: white;
`;

const MoreBadge = styled.span`
    padding: 4px 8px;
    font-size: 10px;
    font-weight: 600;
    border-radius: 10px;
    background: var(--bg-primary);
    color: var(--text-secondary);
    border: 1px solid var(--border-color);
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 8px;
    justify-content: flex-end;

    @media (max-width: 768px) {
        gap: 6px;
    }
`;

const PaginationContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
    padding: 20px;
    background: var(--bg-secondary);
    border-radius: 12px;
    border: 2px solid rgba(46, 151, 197, 0.1);
    flex-wrap: wrap;
    gap: 15px;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
    }
`;

const PaginationInfo = styled.div`
    color: var(--text-secondary);
    font-size: 14px;
    font-weight: 500;

    @media (max-width: 768px) {
        text-align: center;
    }
`;

const PaginationControls = styled.div`
    display: flex;
    align-items: center;
    gap: 15px;
    flex-wrap: wrap;

    @media (max-width: 768px) {
        flex-direction: column;
        width: 100%;
    }
`;

const ItemsPerPageSelect = styled.select`
    padding: 8px 12px;
    border: 2px solid rgba(46, 151, 197, 0.2);
    border-radius: 8px;
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Poppins', sans-serif;

    &:hover {
        border-color: rgba(46, 151, 197, 0.5);
    }

    &:focus {
        outline: none;
        border-color: var(--light-blue);
        box-shadow: 0 0 0 3px rgba(46, 151, 197, 0.1);
    }

    @media (max-width: 768px) {
        width: 100%;
    }
`;

const PageButtons = styled.div`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;

    @media (max-width: 768px) {
        justify-content: center;
        width: 100%;
    }
`;

const PageButton = styled.button<{ $active?: boolean }>`
    padding: 8px 14px;
    border: 2px solid ${props => props.$active ? 'var(--light-blue)' : 'rgba(46, 151, 197, 0.2)'};
    border-radius: 8px;
    background: ${props => props.$active ? 'var(--light-blue)' : 'var(--bg-primary)'};
    color: ${props => props.$active ? 'white' : 'var(--text-primary)'};
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Poppins', sans-serif;
    min-width: 40px;

    &:hover:not(:disabled) {
        background: ${props => props.$active ? 'var(--light-blue)' : 'var(--hover-color)'};
        border-color: var(--light-blue);
        transform: translateY(-1px);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    @media (max-width: 576px) {
        padding: 6px 10px;
        font-size: 13px;
        min-width: 36px;
    }
`;

const PageEllipsis = styled.span`
    padding: 8px 4px;
    color: var(--text-secondary);
    font-weight: 600;
`;

const ActionButton = styled.button`
    padding: 10px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 10px;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        transition: width 0.3s ease, height 0.3s ease;
        z-index: 0;
    }

    & > svg {
        position: relative;
        z-index: 1;
    }

    &.view {
        &:hover {
            background: var(--light-blue);
            color: white;
            transform: translateY(-2px) scale(1.1);
            box-shadow: 0 4px 12px rgba(46, 151, 197, 0.3);
            
            &::before {
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.1);
            }
        }
    }

    &.edit {
        &:hover {
            background: var(--purple);
            color: white;
            transform: translateY(-2px) scale(1.1);
            box-shadow: 0 4px 12px rgba(150, 129, 158, 0.3);
            
            &::before {
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.1);
            }
        }
    }

    &.delete {
        &:hover {
            background: var(--danger);
            color: white;
            transform: translateY(-2px) scale(1.1);
            box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
            
            &::before {
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.1);
            }
        }
    }

    &.activate {
        &:hover {
            background: #22c55e;
            color: white;
            transform: translateY(-2px) scale(1.1);
            box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
            
            &::before {
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.1);
            }
        }
    }

    &.deactivate {
        &:hover {
            background: #f59e0b;
            color: white;
            transform: translateY(-2px) scale(1.1);
            box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
            
            &::before {
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.1);
            }
        }
    }

    &.reset-password {
        &:hover {
            background: #8b5cf6;
            color: white;
            transform: translateY(-2px) scale(1.1);
            box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
            
            &::before {
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.1);
            }
        }
    }

    @media (max-width: 768px) {
        padding: 8px;
    }
`;

// Password Reset Modal Styled Components
const PasswordResetModalOverlay = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.2s ease;

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;

const PasswordResetModalContainer = styled.div`
    background: var(--bg-secondary);
    border-radius: 20px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s ease;
    border: 2px solid rgba(139, 92, 246, 0.2);
    overflow: hidden;

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

const PasswordResetModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    border-bottom: 2px solid var(--border-color);
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, transparent 100%);

    h3 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text-primary);
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    button {
        background: transparent;
        border: none;
        font-size: 2rem;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.2s;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;

        &:hover {
            background: rgba(139, 92, 246, 0.1);
            color: var(--text-primary);
        }
    }
`;

const PasswordResetModalBody = styled.div`
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const UserInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: var(--bg-primary);
    border-radius: 12px;
    border: 2px solid var(--border-color);

    h4 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text-primary);
    }

    p {
        margin: 0.25rem 0 0 0;
        font-size: 0.9rem;
        color: var(--text-secondary);
    }
`;

const InfoBox = styled.div`
    display: flex;
    gap: 0.75rem;
    padding: 1rem;
    background: rgba(139, 92, 246, 0.1);
    border: 2px solid rgba(139, 92, 246, 0.2);
    border-radius: 12px;
    color: var(--text-primary);
    font-size: 0.9rem;
    line-height: 1.5;

    svg {
        flex-shrink: 0;
        color: #8b5cf6;
        margin-top: 2px;
    }

    strong {
        color: #8b5cf6;
    }
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const Label = styled.label`
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
    display: block;
`;

const PasswordWrapper = styled.div`
    position: relative;
    width: 100%;
`;

const EyeToggle = styled.button`
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    border-radius: 6px;

    &:hover {
        color: var(--light-blue);
        background: rgba(46, 151, 197, 0.1);
    }

    &:active {
        transform: translateY(-50%) scale(0.95);
    }
`;

const PasswordInput = styled.input`
    width: 100%;
    padding: 0.875rem 3rem 0.875rem 1rem;
    border: 2px solid var(--border-color);
    border-radius: 12px;
    background: var(--bg-secondary);
    color: var(--text-primary);
    font-size: 1rem;
    font-family: 'Poppins', sans-serif;
    transition: all 0.3s ease;

    &:focus {
        outline: none;
        border-color: var(--light-blue);
        background: var(--bg-primary);
        box-shadow: 0 0 0 3px rgba(46, 151, 197, 0.1);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        background: var(--bg-primary);
    }

    &::placeholder {
        color: var(--text-secondary);
        opacity: 0.5;
    }
`;

const HelpText = styled.span`
    font-size: 0.85rem;
    color: var(--text-secondary);
`;

const PasswordResetModalFooter = styled.div`
    display: flex;
    gap: 1rem;
    padding: 1.5rem 2rem;
    border-top: 2px solid var(--border-color);
    background: var(--bg-primary);
`;

const CancelButton = styled.button`
    flex: 1;
    padding: 0.75rem 1.5rem;
    border: 2px solid var(--border-color);
    border-radius: 10px;
    background: transparent;
    color: var(--text-primary);
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Poppins', sans-serif;

    &:hover:not(:disabled) {
        background: var(--hover-color);
        border-color: var(--text-secondary);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const ResetButton = styled.button`
    flex: 1;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 10px;
    background: #8b5cf6;
    color: white;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Poppins', sans-serif;

    &:hover:not(:disabled) {
        background: #7c3aed;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

// Mobile Card Components
const MobileCardsContainer = styled.div`
    display: none;

    @media (max-width: 768px) {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }
`;

const MobileCard = styled.div`
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 2px 8px var(--shadow);
    animation: slideUp 0.4s ease-out backwards;

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

const MobileCardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: var(--bg-primary);
    border-bottom: 1px solid var(--border-color);
`;

const MobileActions = styled.div`
    display: flex;
    gap: 8px;
`;

const MobileCardBody = styled.div`
    padding: 16px;
`;

const MobileCardRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid var(--border-color);

    &:last-child {
        border-bottom: none;
        padding-bottom: 0;
    }

    &:first-child {
        padding-top: 0;
    }
`;

const MobileCardLabel = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const MobileCardValue = styled.div`
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
    text-align: right;
    max-width: 60%;
    overflow-wrap: break-word;
`;

export default UserManagementPage;