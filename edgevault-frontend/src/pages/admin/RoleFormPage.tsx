import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoleById, createRole, updateRole } from '../../api/roleService';
import { getAllPermissions } from '../../api/permissionService';
import { toast } from 'react-hot-toast';
import { ArrowLeft, ShieldCheck, Crown, Key, Lock, Check, X } from 'lucide-react';
import styled from 'styled-components';
import type { Role } from '../../types/user';
import Loader from '../../components/common/Loader';
import HoverButton from '../../components/common/HoverButton';

const RoleFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const isEditMode = !!id;
    const [role, setRole] = useState<Role | null>(null);
    const [name, setName] = useState('');
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [availablePermissions, setAvailablePermissions] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const perms = await getAllPermissions();
                setAvailablePermissions(perms);

                if (isEditMode) {
                    const roleData = await getRoleById(Number(id));
                    setRole(roleData);
                    setName(roleData.name);
                    setSelectedPermissions(roleData.permissions);
                }
            } catch (error) {
                toast.error("Failed to load data. Redirecting...");
                navigate('/admin/roles');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, isEditMode, navigate]);

    const groupedPermissions = useMemo(() => {
        const groups: { [key: string]: string[] } = {};
        availablePermissions.forEach(p => {
            const module = p.split('_')[0];
            if (!groups[module]) {
                groups[module] = [];
            }
            groups[module].push(p);
        });
        return groups;
    }, [availablePermissions]);
    
    const handlePermissionToggle = (permission: string) => {
        setSelectedPermissions(prev =>
            prev.includes(permission)
                ? prev.filter(p => p !== permission)
                : [...prev, permission]
        );
    };

    const handleSelectAllModule = (module: string, permissions: string[]) => {
        const modulePermissionsInSelection = selectedPermissions.filter(p => p.startsWith(module));
        
        if (modulePermissionsInSelection.length === permissions.length) {
            setSelectedPermissions(prev => prev.filter(p => !p.startsWith(module)));
        } else {
            setSelectedPermissions(prev => [...prev.filter(p => !p.startsWith(module)), ...permissions]);
        }
    };

    const handleSelectAll = () => {
        if (selectedPermissions.length === availablePermissions.length) {
            setSelectedPermissions([]);
        } else {
            setSelectedPermissions([...availablePermissions]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const roleData = { name, permissions: selectedPermissions };

        const promise = isEditMode
            ? updateRole(Number(id), roleData)
            : createRole(roleData);

        try {
            await toast.promise(promise, {
                loading: 'Saving role...',
                success: `Role ${isEditMode ? 'updated' : 'created'} successfully!`,
                error: (err) => err.response?.data?.message || 'Failed to save role.',
            });
            navigate('/admin/roles');
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
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
            <FormContainer onSubmit={handleSubmit}>
                <PageHeader>
                    <HeaderContent>
                        <BackButton onClick={() => navigate('/admin/roles')}>
                            <ArrowLeft size={24} />
                        </BackButton>
                        <PageTitle>
                            {isEditMode ? (
                                <>
                                    <Crown size={32} />
                                    Edit Role: {role?.name}
                                </>
                            ) : (
                                <>
                                    <Key size={32} />
                                    Create New Role
                                </>
                            )}
                        </PageTitle>
                    </HeaderContent>
                    
                    <ButtonGroup>
                        <HoverButton 
                            type="button"
                            onClick={() => navigate('/admin/roles')}
                            textOne="Cancel"
                            textTwo="Go Back"
                            width="160px"
                            height="55px"
                        />
                        <SaveButton type="submit" disabled={isSubmitting}>
                            <div className="svg-wrapper-1">
                                <div className="svg-wrapper">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={30} height={30} className="icon">
                                        <path d="M22,15.04C22,17.23 20.24,19 18.07,19H5.93C3.76,19 2,17.23 2,15.04C2,13.07 3.43,11.44 5.31,11.14C5.28,11 5.27,10.86 5.27,10.71C5.27,9.33 6.38,8.2 7.76,8.2C8.37,8.2 8.94,8.43 9.37,8.8C10.14,7.05 11.13,5.44 13.91,5.44C17.28,5.44 18.87,8.06 18.87,10.83C18.87,10.94 18.87,11.06 18.86,11.17C20.65,11.54 22,13.13 22,15.04Z" />
                                    </svg>
                                </div>
                            </div>
                            <span>{isSubmitting ? "Saving..." : (isEditMode ? "Update Role" : "Save Role")}</span>
                        </SaveButton>
                    </ButtonGroup>
                </PageHeader>

                <ScrollableContent>
                    <ContentGrid>
                        {/* Left Column - Role Details */}
                        <LeftColumn>
                            <FormCard>
                                <CardHeader>
                                    <CardIcon style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }}>
                                        <ShieldCheck size={24} />
                                    </CardIcon>
                                    <CardTitle>Role Details</CardTitle>
                                </CardHeader>
                                
                                <FormGroup>
                                    <Label>
                                        <LabelIcon style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }}>
                                            <Key size={16} />
                                        </LabelIcon>
                                        Role Name
                                    </Label>
                                    <Input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter role name (e.g., Manager, Auditor)"
                                        required
                                        style={{ borderLeft: '4px solid #06b6d4' }}
                                    />
                                </FormGroup>

                                <RoleStats>
                                    <StatCard style={{ background: 'rgba(6, 182, 212, 0.05)', borderColor: 'rgba(6, 182, 212, 0.2)' }}>
                                        <StatIcon style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }}>
                                            <ShieldCheck size={20} />
                                        </StatIcon>
                                        <StatContent>
                                            <StatLabel>Permissions Selected</StatLabel>
                                            <StatValue>{selectedPermissions.length}</StatValue>
                                        </StatContent>
                                    </StatCard>
                                    
                                    <StatCard style={{ background: 'rgba(14, 165, 233, 0.05)', borderColor: 'rgba(14, 165, 233, 0.2)' }}>
                                        <StatIcon style={{ background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9' }}>
                                            <Lock size={20} />
                                        </StatIcon>
                                        <StatContent>
                                            <StatLabel>Available</StatLabel>
                                            <StatValue>{availablePermissions.length}</StatValue>
                                        </StatContent>
                                    </StatCard>
                                </RoleStats>

                                <SelectAllButton type="button" onClick={handleSelectAll}>
                                    {selectedPermissions.length === availablePermissions.length ? (
                                        <>
                                            <X size={16} />
                                            Deselect All Permissions
                                        </>
                                    ) : (
                                        <>
                                            <Check size={16} />
                                            Select All Permissions
                                        </>
                                    )}
                                </SelectAllButton>
                            </FormCard>
                        </LeftColumn>

                        {/* Right Column - Permissions */}
                        <RightColumn>
                            <FormCard>
                                <CardHeader>
                                    <CardIcon style={{ background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9' }}>
                                        <Lock size={24} />
                                    </CardIcon>
                                    <CardTitle>Permissions</CardTitle>
                                    <SelectedCount>
                                        {selectedPermissions.length} selected
                                    </SelectedCount>
                                </CardHeader>
                                
                                <PermissionsContainer>
                                    {Object.entries(groupedPermissions).map(([module, permissions]) => {
                                        const allSelected = permissions.every(p => selectedPermissions.includes(p));
                                        const someSelected = permissions.some(p => selectedPermissions.includes(p));
                                        
                                        return (
                                            <ModuleCard key={module} style={{ 
                                                borderColor: someSelected ? '#0ea5e9' : 'rgba(14, 165, 233, 0.1)',
                                                background: someSelected ? 'rgba(14, 165, 233, 0.02)' : 'white'
                                            }}>
                                                <ModuleHeader onClick={() => handleSelectAllModule(module, permissions)}>
                                                    <ModuleCheckbox checked={allSelected}>
                                                        {allSelected && <Check size={12} />}
                                                    </ModuleCheckbox>
                                                    <ModuleName>{module}</ModuleName>
                                                    <ModuleCount>{permissions.length} permissions</ModuleCount>
                                                </ModuleHeader>
                                                
                                                <PermissionGrid>
                                                    {permissions.map(permission => {
                                                        const isSelected = selectedPermissions.includes(permission);
                                                        const action = permission.split('_')[1];
                                                        
                                                        return (
                                                            <PermissionCard 
                                                                key={permission}
                                                                selected={isSelected}
                                                                onClick={() => handlePermissionToggle(permission)}
                                                            >
                                                                <PermissionCheckbox selected={isSelected}>
                                                                    {isSelected && <Check size={10} />}
                                                                </PermissionCheckbox>
                                                                <PermissionInfo>
                                                                    <PermissionName>{action}</PermissionName>
                                                                    <PermissionDescription>
                                                                        {permission.toLowerCase().replace('_', ' ')}
                                                                    </PermissionDescription>
                                                                </PermissionInfo>
                                                            </PermissionCard>
                                                        );
                                                    })}
                                                </PermissionGrid>
                                            </ModuleCard>
                                        );
                                    })}
                                </PermissionsContainer>
                            </FormCard>
                        </RightColumn>
                    </ContentGrid>
                </ScrollableContent>
            </FormContainer>
        </PageContainer>
    );
};

// Styled Components
const PageContainer = styled.div`
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    animation: fadeInUp 0.4s ease;

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

const FormContainer = styled.form`
    display: flex;
    flex-direction: column;
    flex: 1;
`;

const PageHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    background: linear-gradient(135deg, rgba(46, 151, 197, 0.05), rgba(150, 129, 158, 0.05));
    border-bottom: 2px solid rgba(46, 151, 197, 0.1);
    position: sticky;
    top: 0;
    z-index: 10;
    backdrop-filter: blur(10px);

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 1.5rem;
        align-items: stretch;
        padding: 1rem;
    }
`;

const HeaderContent = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const BackButton = styled.button`
    width: 48px;
    height: 48px;
    background: var(--bg-secondary);
    border: 2px solid rgba(46, 151, 197, 0.2);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgb(46, 151, 197);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(46, 151, 197, 0.1);
        transform: translateX(-4px);
    }
`;

const PageTitle = styled.h1`
    font-size: 1.75rem;
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

const ButtonGroup = styled.div`
    display: flex;
    gap: 1rem;

    @media (max-width: 768px) {
        width: 100%;
        
        button {
            flex: 1;
        }
    }
`;

const SaveButton = styled.button`
    font-family: 'Poppins', sans-serif;
    font-size: 18px;
    background: linear-gradient(135deg, rgb(46, 151, 197), rgb(150, 129, 158));
    color: white;
    fill: rgb(200, 200, 200);
    padding: 0.7em 1.5em;
    padding-left: 0.9em;
    display: flex;
    align-items: center;
    cursor: pointer;
    border: none;
    border-radius: 15px;
    font-weight: 700;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(46, 151, 197, 0.3);

    span {
        display: block;
        margin-left: 0.3em;
        transition: all 0.3s ease-in-out;
    }

    .svg-wrapper-1 {
        display: flex;
        align-items: center;
    }

    .svg-wrapper {
        display: flex;
        align-items: center;
        transform-origin: center center;
        transition: transform 0.3s ease-in-out;
    }

    svg {
        display: block;
        transform-origin: center center;
        transition: transform 0.3s ease-in-out;
    }

    &:hover:not(:disabled) {
        background: linear-gradient(135deg, rgb(36, 121, 167), rgb(120, 99, 128));
        box-shadow: 0 6px 20px rgba(46, 151, 197, 0.4);
    }

    &:hover:not(:disabled) .svg-wrapper {
        transform: scale(1.25);
        transition: 0.5s linear;
    }

    &:hover:not(:disabled) svg {
        transform: translateX(1.2em) scale(1.1);
        fill: #fff;
    }

    &:hover:not(:disabled) span {
        opacity: 0;
        transition: 0.5s linear;
    }

    &:active:not(:disabled) {
        transform: scale(0.95);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }

    @media (max-width: 768px) {
        font-size: 16px;
        padding: 0.65em 1.25em;
    }
`;

const ScrollableContent = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 2rem;

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(14, 165, 233, 0.05);
        border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(14, 165, 233, 0.2);
        border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb:hover {
        background: rgba(14, 165, 233, 0.3);
    }
`;

const ContentGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 2rem;
    min-height: 100%;

    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
    }
`;

const LeftColumn = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const RightColumn = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const FormCard = styled.div`
    background: var(--bg-secondary);
    border: 2px solid rgba(46, 151, 197, 0.2);
    border-radius: 20px;
    padding: 1.75rem;
    box-shadow: 0 8px 24px var(--shadow);
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 32px var(--shadow);
    }
`;

const CardHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
`;

const CardIcon = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const CardTitle = styled.h2`
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary);
    font-family: 'Poppins', sans-serif;
    flex: 1;
`;

const SelectedCount = styled.span`
    font-size: 0.875rem;
    font-weight: 600;
    color: #0ea5e9;
    background: rgba(14, 165, 233, 0.1);
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
`;

const Label = styled.label`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
    font-family: 'Poppins', sans-serif;
`;

const LabelIcon = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 6px;
`;

const Input = styled.input`
    width: 100%;
    background: var(--bg-primary);
    border: 2px solid var(--border-color);
    color: var(--text-primary);
    padding: 0.875rem 1rem;
    border-radius: 10px;
    font-size: 0.9375rem;
    font-family: 'Poppins', sans-serif;
    transition: all 0.3s ease;

    &::placeholder {
        color: var(--text-tertiary);
    }

    &:focus {
        outline: none;
        border-color: rgb(46, 151, 197);
        box-shadow: 0 0 0 3px rgba(46, 151, 197, 0.1);
    }
`;

const RoleStats = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
`;

const StatCard = styled.div`
    padding: 1rem;
    border: 2px solid;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const StatIcon = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const StatContent = styled.div`
    flex: 1;
`;

const StatLabel = styled.div`
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.25rem;
    font-family: 'Poppins', sans-serif;
`;

const StatValue = styled.div`
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary);
    font-family: 'Poppins', sans-serif;
`;

const SelectAllButton = styled.button`
    width: 100%;
    padding: 1rem;
    background: rgba(46, 151, 197, 0.1);
    border: 2px solid rgba(46, 151, 197, 0.2);
    border-radius: 12px;
    font-size: 0.9375rem;
    font-weight: 600;
    font-family: 'Poppins', sans-serif;
    color: rgb(46, 151, 197);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(46, 151, 197, 0.2);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(46, 151, 197, 0.15);
    }
`;

const PermissionsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
`;

const ModuleCard = styled.div`
    border: 2px solid;
    border-radius: 16px;
    overflow: hidden;
`;

const ModuleHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.25rem;
    background: var(--bg-primary);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background: var(--border-color);
    }
`;

const ModuleCheckbox = styled.div<{ checked: boolean }>`
    width: 20px;
    height: 20px;
    border-radius: 5px;
    border: 2px solid ${props => props.checked ? '#0ea5e9' : 'rgba(14, 165, 233, 0.2)'};
    background: ${props => props.checked ? '#0ea5e9' : 'white'};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
`;

const ModuleName = styled.div`
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-primary);
    font-family: 'Poppins', sans-serif;
    flex: 1;
`;

const ModuleCount = styled.div`
    font-size: 0.875rem;
    font-weight: 600;
    color: #0ea5e9;
    background: rgba(14, 165, 233, 0.1);
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
`;

const PermissionGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 0.75rem;
    padding: 1.25rem;
`;

const PermissionCard = styled.div<{ selected: boolean }>`
    padding: 0.875rem;
    background: ${props => props.selected ? 'rgba(46, 151, 197, 0.05)' : 'var(--bg-secondary)'};
    border: 2px solid ${props => props.selected ? 'rgb(46, 151, 197)' : 'var(--border-color)'};
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px var(--shadow);
        border-color: ${props => props.selected ? 'rgb(46, 151, 197)' : 'rgba(46, 151, 197, 0.3)'};
    }
`;

const PermissionCheckbox = styled.div<{ selected: boolean }>`
    width: 16px;
    height: 16px;
    border-radius: 4px;
    border: 2px solid ${props => props.selected ? 'rgb(46, 151, 197)' : 'rgba(46, 151, 197, 0.2)'};
    background: ${props => props.selected ? 'rgb(46, 151, 197)' : 'var(--bg-secondary)'};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;

    svg {
        width: 10px;
        height: 10px;
    }
`;

const PermissionInfo = styled.div`
    flex: 1;
`;

const PermissionName = styled.div`
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.125rem;
    font-family: 'Poppins', sans-serif;
`;

const PermissionDescription = styled.div`
    font-size: 0.75rem;
    color: var(--text-secondary);
    font-family: 'Poppins', sans-serif;
`;

export default RoleFormPage;