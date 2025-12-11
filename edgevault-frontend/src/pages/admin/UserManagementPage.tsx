import React, { useEffect, useState, useCallback} from 'react';
import { getAllUserDetails, createUser, updateUser, deleteUser } from '../../api/userService'; // <-- CRITICAL: Use getAllUserDetails
import type { User } from '../../types/user';
import { toast } from 'react-hot-toast';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import Modal from '../../components/common/Modal';
import UserForm from '../../components/admin/UserForm';
import { usePermissions } from '../../hooks/usePermissions';
import styled from 'styled-components';
import FullPageLoader from '../../components/common/FullPageLoader';
import HoverButton from '../../components/common/HoverButton';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';
import UserDetailsModal from '../../components/common/UserDetailsModal';

const UserManagementPage: React.FC = () => {
    const { hasPermission, hasAnyPermission } = usePermissions();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<number | null>(null);
    const [viewDetailsModalOpen, setViewDetailsModalOpen] = useState(false);
    const [userToView, setUserToView] = useState<User | null>(null);
    

    // Wrap fetchUsers in useCallback to make it a stable function
    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getAllUserDetails();
            setUsers(data);
        } catch (error) {
            toast.error('Failed to fetch detailed user list.');
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

    const handleOpenModal = (user: User | null = null) => {
        setUserToEdit(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setUserToEdit(null);
    };

    const handleSaveUser = async (formData: any) => {
        setIsSubmitting(true);
        const payload = { 
            email: formData.email, 
            enabled: formData.enabled, 
            roles: formData.roles, 
            departmentId: formData.departmentId 
        };

        const promise = userToEdit
            ? updateUser(userToEdit.id, payload)
            : createUser({ ...payload, username: formData.username }); // Password is not sent

        try {
            await toast.promise(promise, {
                loading: 'Saving user...',
                success: `User ${userToEdit ? 'updated' : 'created'} successfully!`,
                error: (err) => err.response?.data?.message || 'Failed to save user.',
            });
            handleCloseModal();
            fetchUsers();
        } catch (error: any) {
            console.error(error.response?.data?.message || error.message);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDeleteUser = async (userId: number) => {
        setUserToDelete(userId);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (userToDelete === null) return;
        
        try {
            await toast.promise(deleteUser(userToDelete), {
                loading: 'Deleting user...',
                success: 'User deleted successfully!',
                error: (err) => err.response?.data?.message || 'Failed to delete user.',
            });
            fetchUsers();
        } catch (error) {
            console.error(error);
        } finally {
            setUserToDelete(null);
        }
    };

    const handleViewDetails = (user: User) => {
        setUserToView(user);
        setViewDetailsModalOpen(true);
    };

    if (loading) return <FullPageLoader />;

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
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <ProfileAvatar
                                        src={user.profilePictureUrl || `https://ui-avatars.com/api/?name=${user.username}&background=2E97C5&color=fff`}
                                        alt={user.username}
                                    />
                                </TableCell>
                                <TableCell className="font-medium">{user.username}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.departmentName || 'Not assigned'}</TableCell>
                                <TableCell>
                                    <StatusBadge enabled={user.enabled}>
                                        {user.enabled ? 'Active' : 'Inactive'}
                                    </StatusBadge>
                                </TableCell>
                                <TableCell>
                                    <RolesCell>
                                        {(user.roles || []).length > 0 ? (
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
                                                <ActionButton onClick={() => handleOpenModal(user)} className="edit">
                                                    <Edit size={18}/>
                                                </ActionButton>
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

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={userToEdit ? 'Edit User' : 'Create New User'}>
                <UserForm 
                    userToEdit={userToEdit} 
                    onSave={handleSaveUser} 
                    onCancel={handleCloseModal} 
                    isLoading={isSubmitting} 
                />
            </Modal>

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
        </PageContainer>
    );
};

const PageContainer = styled.div`
    width: 100%;
    padding: 30px;
    font-family: 'Poppins', sans-serif;

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

    @media (max-width: 768px) {
        overflow-x: auto;
    }
`;

const StyledTable = styled.table`
    width: 100%;
    border-collapse: collapse;

    @media (max-width: 768px) {
        min-width: 800px;
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
    transition: background 0.2s ease;

    &:hover {
        background: var(--bg-primary);
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

const StatusBadge = styled.span<{ enabled: boolean }>`
    display: inline-flex;
    align-items: center;
    padding: 6px 14px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 20px;
    background: ${props => props.enabled ? 'var(--success)' : 'var(--danger)'};
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

    &.view {
        &:hover {
            background: var(--light-blue);
            color: white;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(46, 151, 197, 0.3);
        }
    }

    &.edit {
        &:hover {
            background: var(--purple);
            color: white;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(150, 129, 158, 0.3);
        }
    }

    &.delete {
        &:hover {
            background: var(--danger);
            color: white;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
        }
    }

    @media (max-width: 768px) {
        padding: 8px;
    }
`;

export default UserManagementPage;