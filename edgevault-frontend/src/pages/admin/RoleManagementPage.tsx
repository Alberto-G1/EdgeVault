import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllRoles, deleteRole } from '../../api/roleService';
import type { Role } from '../../types/user';
import { toast } from 'react-hot-toast';
import { Edit, Trash2, ShieldCheck, Users, Key, Crown } from 'lucide-react';
import styled from 'styled-components';
import Loader from '../../components/common/Loader';
import HoverButton from '../../components/common/HoverButton';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const RoleManagementPage: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'system' | 'custom'>('all');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const navigate = useNavigate();

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const data = await getAllRoles();
            setRoles(data);
        } catch (error) {
            toast.error('Failed to fetch roles.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);
    
    const handleDeleteRole = async (roleId: number) => {
        setRoleToDelete(roleId);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (roleToDelete === null) return;
        
        setIsDeleting(true);
        try {
            await toast.promise(deleteRole(roleToDelete), {
                loading: 'Deleting role...',
                success: 'Role deleted successfully!',
                error: (err) => err.response?.data?.message || 'Failed to delete role.',
            });
            fetchRoles();
            setIsDeleteModalOpen(false);
            setRoleToDelete(null);
        } catch (error) {
            console.error(error);
        } finally {
            setIsDeleting(false);
        }
    };

    const cancelDelete = () => {
        setIsDeleteModalOpen(false);
        setRoleToDelete(null);
    };

    const filteredRoles = roles.filter(role => {
        if (filter === 'all') return true;
        if (filter === 'system') return ['Admin', 'Administrator', 'Super Admin'].includes(role.name);
        if (filter === 'custom') return !['Admin', 'Administrator', 'Super Admin'].includes(role.name);
        return true;
    });

    const getRoleColor = (roleName: string) => {
        const systemRoles = ['Admin', 'Administrator', 'Super Admin'];
        if (systemRoles.includes(roleName)) {
            return {
                bg: 'rgba(46, 151, 197, 0.1)',
                border: 'rgba(46, 151, 197, 0.3)',
                icon: 'linear-gradient(135deg, rgb(46, 151, 197), rgb(36, 121, 167))',
                text: 'rgb(46, 151, 197)'
            };
        }
        return {
            bg: 'rgba(150, 129, 158, 0.1)',
            border: 'rgba(150, 129, 158, 0.3)',
            icon: 'linear-gradient(135deg, rgb(150, 129, 158), rgb(120, 99, 128))',
            text: 'rgb(150, 129, 158)'
        };
    };

    const getRoleIcon = (roleName: string) => {
        switch (roleName.toLowerCase()) {
            case 'admin':
            case 'administrator':
                return <Crown size={24} />;
            case 'auditor':
                return <ShieldCheck size={24} />;
            case 'manager':
                return <Users size={24} />;
            default:
                return <Key size={24} />;
        }
    };

    if (loading) {
        return (
            <LoaderContainer>
                <Loader />
            </LoaderContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader>
                <HeaderContent>
                    <PageTitle>
                        <Crown size={32} />
                        Role Management
                    </PageTitle>
                    <PageSubtitle>Manage user roles and permissions</PageSubtitle>
                </HeaderContent>
                
                <AddRoleButton 
                    onClick={() => navigate('/admin/roles/new')}
                    textOne="Add New Role"
                    textTwo="Create Role"
                    width="200px"
                    height="55px"
                />
            </PageHeader>

            <FilterTabs>
                <FilterTab 
                    active={filter === 'all'} 
                    onClick={() => setFilter('all')}
                >
                    All Roles ({roles.length})
                </FilterTab>
                <FilterTab 
                    active={filter === 'system'} 
                    onClick={() => setFilter('system')}
                >
                    System Roles
                </FilterTab>
                <FilterTab 
                    active={filter === 'custom'} 
                    onClick={() => setFilter('custom')}
                >
                    Custom Roles
                </FilterTab>
            </FilterTabs>

            <RoleGrid>
                {filteredRoles.map((role) => {
                    const colors = getRoleColor(role.name);
                    const isSystemRole = ['Admin', 'Administrator', 'Super Admin'].includes(role.name);
                    
                    return (
                        <RoleCard key={role.id} style={{ borderColor: colors.border, background: colors.bg }}>
                            <RoleHeader>
                                <RoleIcon style={{ background: colors.icon }}>
                                    {getRoleIcon(role.name)}
                                </RoleIcon>
                                <RoleInfo>
                                    <RoleName style={{ color: colors.text }}>{role.name}</RoleName>
                                    {isSystemRole && <SystemBadge>System</SystemBadge>}
                                </RoleInfo>
                            </RoleHeader>
                            
                            <PermissionCount>
                                <ShieldCheck size={16} />
                                {role.permissions.length} permissions
                            </PermissionCount>
                            
                            <PermissionPreview>
                                {role.permissions.slice(0, 3).map((perm, idx) => (
                                    <PermissionTag key={idx}>
                                        {perm.split('_')[1]}
                                    </PermissionTag>
                                ))}
                                {role.permissions.length > 3 && (
                                    <MorePermissions>+{role.permissions.length - 3} more</MorePermissions>
                                )}
                            </PermissionPreview>
                            
                            <RoleActions>
                                <ActionButton 
                                    onClick={() => navigate(`/admin/roles/edit/${role.id}`)}
                                    style={{ color: colors.text, borderColor: colors.border }}
                                >
                                    <Edit size={18} />
                                    Edit
                                </ActionButton>
                                {!isSystemRole && (
                                    <DeleteButton onClick={() => handleDeleteRole(role.id)}>
                                        <Trash2 size={18} />
                                        Delete
                                    </DeleteButton>
                                )}
                            </RoleActions>
                        </RoleCard>
                    );
                })}
            </RoleGrid>

            {filteredRoles.length === 0 && (
                <EmptyState>
                    <EmptyIcon>
                        <ShieldCheck size={48} />
                    </EmptyIcon>
                    <EmptyText>No roles found</EmptyText>
                    <EmptySubtext>Click "Add New Role" to create your first role</EmptySubtext>
                </EmptyState>
            )}

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={cancelDelete}
                onConfirm={confirmDelete}
                title="Delete Role"
                message="Are you sure you want to delete this role? This action cannot be undone and may affect users assigned to this role."
                confirmText="Delete"
                isConfirming={isDeleting}
            />
        </PageContainer>
    );
};

// Styled Components
const PageContainer = styled.div`
    animation: fadeInUp 0.4s ease;
    padding: 2rem;

    @keyframes fadeInUp {
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

const LoaderContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
`;

const PageHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding: 1.5rem 2rem;
    background: linear-gradient(135deg, rgba(46, 151, 197, 0.05), rgba(150, 129, 158, 0.05));
    border-radius: 20px;
    border: 2px solid rgba(46, 151, 197, 0.2);

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 1.5rem;
        align-items: stretch;
        padding: 1rem;
    }
`;

const HeaderContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const PageTitle = styled.h1`
    font-size: 2rem;
    font-weight: 800;
    background: linear-gradient(135deg, rgb(46, 151, 197), rgb(150, 129, 158));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-family: 'Poppins', sans-serif;
    display: flex;
    align-items: center;
    gap: 1rem;

    @media (max-width: 768px) {
        font-size: 1.5rem;
    }
`;

const PageSubtitle = styled.p`
    font-size: 1rem;
    color: var(--text-secondary);
    font-family: 'Poppins', sans-serif;
    margin-left: 3.5rem;

    @media (max-width: 768px) {
        margin-left: 0;
    }
`;

const AddRoleButton = styled(HoverButton)`
    @media (max-width: 768px) {
        width: 100% !important;
    }
`;

const FilterTabs = styled.div`
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    padding: 1rem;
    background: var(--bg-secondary);
    border-radius: 12px;
    border: 2px solid rgba(46, 151, 197, 0.2);
    box-shadow: 0 4px 12px var(--shadow);
`;

const FilterTab = styled.button<{ active: boolean }>`
    padding: 0.75rem 1.5rem;
    background: ${props => props.active ? 'linear-gradient(135deg, rgb(46, 151, 197), rgb(150, 129, 158))' : 'transparent'};
    color: ${props => props.active ? 'white' : 'var(--text-secondary)'};
    border: 2px solid ${props => props.active ? 'transparent' : 'rgba(46, 151, 197, 0.2)'};
    border-radius: 10px;
    font-size: 0.9375rem;
    font-weight: 600;
    font-family: 'Poppins', sans-serif;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${props => props.active 
            ? '0 4px 12px rgba(46, 151, 197, 0.3)' 
            : '0 4px 12px rgba(46, 151, 197, 0.1)'
        };
    }
`;

const RoleGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const RoleCard = styled.div`
    background: var(--bg-secondary);
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 8px 24px var(--shadow);
    transition: all 0.3s ease;
    border: 2px solid;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 32px var(--shadow);
    }
`;

const RoleHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
`;

const RoleIcon = styled.div`
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
`;

const RoleInfo = styled.div`
    flex: 1;
`;

const RoleName = styled.h3`
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
    font-family: 'Poppins', sans-serif;
    color: var(--text-primary);
`;

const SystemBadge = styled.span`
    padding: 0.25rem 0.75rem;
    background: rgba(46, 151, 197, 0.1);
    color: rgb(46, 151, 197);
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    font-family: 'Poppins', sans-serif;
`;

const PermissionCount = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: rgba(46, 151, 197, 0.05);
    border-radius: 10px;
    font-size: 0.875rem;
    font-weight: 600;
    color: rgb(46, 151, 197);
    font-family: 'Poppins', sans-serif;
    margin-bottom: 1rem;
`;

const PermissionPreview = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    min-height: 40px;
`;

const PermissionTag = styled.span`
    padding: 0.375rem 0.75rem;
    background: rgba(46, 151, 197, 0.1);
    color: rgb(46, 151, 197);
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 500;
    font-family: 'Poppins', sans-serif;
`;

const MorePermissions = styled.span`
    padding: 0.375rem 0.75rem;
    background: rgba(150, 129, 158, 0.1);
    color: rgb(150, 129, 158);
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 500;
    font-family: 'Poppins', sans-serif;
`;

const RoleActions = styled.div`
    display: flex;
    gap: 0.75rem;
`;

const ActionButton = styled.button`
    flex: 1;
    padding: 0.75rem 1rem;
    background: var(--bg-secondary);
    border: 2px solid;
    border-radius: 10px;
    font-size: 0.875rem;
    font-weight: 600;
    font-family: 'Poppins', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(46, 151, 197, 0.1);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px var(--shadow);
    }
`;

const DeleteButton = styled.button`
    flex: 1;
    padding: 0.75rem 1rem;
    background: var(--bg-secondary);
    border: 2px solid rgba(239, 68, 68, 0.3);
    color: #EF4444;
    border-radius: 10px;
    font-size: 0.875rem;
    font-weight: 600;
    font-family: 'Poppins', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(239, 68, 68, 0.1);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);
    }
`;

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    background: var(--bg-secondary);
    border-radius: 20px;
    border: 2px dashed rgba(46, 151, 197, 0.2);
    text-align: center;
`;

const EmptyIcon = styled.div`
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, rgba(46, 151, 197, 0.1), rgba(150, 129, 158, 0.1));
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgb(46, 151, 197);
    margin-bottom: 1.5rem;
`;

const EmptyText = styled.h3`
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
    font-family: 'Poppins', sans-serif;
`;

const EmptySubtext = styled.p`
    font-size: 1rem;
    color: var(--text-secondary);
    font-family: 'Poppins', sans-serif;
`;

export default RoleManagementPage;