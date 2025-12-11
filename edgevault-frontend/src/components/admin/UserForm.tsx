import React, { useState, useEffect } from 'react';
import type { User, Department, Role } from '../../types/user';
import { getAllDepartments } from '../../api/departmentService';
import { getAllRoles } from '../../api/roleService';
import { toast } from 'react-hot-toast';
import styled from 'styled-components';
import { 
  User as UserIcon, 
  Mail, 
  Building, 
  Shield, 
  CheckCircle, 
  Save, 
  X,
  Key,
  Lock,
  Sparkles
} from 'lucide-react';

interface UserFormProps {
    userToEdit?: User | null;
    onSave: (formData: any) => void;
    onCancel: () => void;
    isLoading: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ userToEdit, onSave, onCancel, isLoading }) => {
    const isEditMode = !!userToEdit;
    const [departments, setDepartments] = useState<Department[]>([]);
    const [availableRoles, setAvailableRoles] = useState<Role[]>([]);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        role: 'Department User', // Single role selection
        enabled: true,
        departmentId: '', 
    });

    useEffect(() => {
        const fetchFormData = async () => {
            try {
                const [depts, roles] = await Promise.all([
                    getAllDepartments(),
                    getAllRoles()
                ]);
                setDepartments(depts);
                setAvailableRoles(roles);

                if (!isEditMode && depts.length > 0) {
                    setFormData(prev => ({ ...prev, departmentId: String(depts[0].id) }));
                }
            } catch (error) {
                toast.error("Could not load form data (roles/departments).");
            }
        };
        fetchFormData();
    }, [isEditMode]);

    useEffect(() => {
        if (isEditMode && userToEdit && departments.length > 0) {
            const userDept = departments.find(d => d.name === userToEdit.departmentName);
            const userRole = userToEdit.roles && userToEdit.roles.length > 0 ? userToEdit.roles[0] : 'Department User';
            setFormData({
                username: userToEdit.username,
                email: userToEdit.email,
                role: userRole,
                enabled: userToEdit.enabled,
                departmentId: userDept ? String(userDept.id) : '',
            });
        }
    }, [userToEdit, isEditMode, departments]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        setFormData(prev => ({
            ...prev,
            [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ 
            ...formData, 
            roles: [formData.role], // Convert single role to array
            departmentId: Number(formData.departmentId) 
        });
    };

    const handleRoleSelect = (roleName: string) => {
        setFormData(prev => ({
            ...prev,
            role: roleName
        }));
    };

    const handleDepartmentSelect = (deptId: string) => {
        setFormData(prev => ({ ...prev, departmentId: deptId }));
    };

    return (
        <ModalOverlay>
            <FormContainer onSubmit={handleSubmit}>
                <FormHeader>
                    <TitleContainer>
                        {isEditMode ? (
                            <EditIcon />
                        ) : (
                            <AddIcon />
                        )}
                        <FormTitle>{isEditMode ? 'Edit User' : 'Create New User'}</FormTitle>
                    </TitleContainer>
                    <CloseButton onClick={onCancel}>
                        <X size={24} />
                    </CloseButton>
                </FormHeader>

                <FormGrid>
                    <FormGroup className="username-group">
                        <Label>
                            <IconWrapper style={{ background: 'rgba(255, 165, 0, 0.1)', color: '#FF8C00' }}>
                                <UserIcon size={18} />
                            </IconWrapper>
                            Username
                        </Label>
                        <Input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Enter username"
                            required
                            disabled={isEditMode}
                            style={{ borderLeft: '4px solid #FF8C00' }}
                        />
                        {isEditMode && <HelpText>Username cannot be changed after creation</HelpText>}
                    </FormGroup>

                    <FormGroup className="email-group">
                        <Label>
                            <IconWrapper style={{ background: 'rgba(147, 51, 234, 0.1)', color: '#9333EA' }}>
                                <Mail size={18} />
                            </IconWrapper>
                            Email Address
                        </Label>
                        <Input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="user@example.com"
                            required
                            style={{ borderLeft: '4px solid #9333EA' }}
                        />
                    </FormGroup>

                    {!isEditMode && (
                        <FormGroup className="password-group">
                            <Label>
                                <IconWrapper style={{ background: 'rgba(255, 140, 0, 0.1)', color: '#FF8C00' }}>
                                    <Key size={18} />
                                </IconWrapper>
                                Default Password
                            </Label>
                            <PasswordInfoBox>
                                <Lock size={18} />
                                <div>
                                    <PasswordValue>Default@123U</PasswordValue>
                                    <HelpText>User will be required to change password on first login</HelpText>
                                </div>
                            </PasswordInfoBox>
                        </FormGroup>
                    )}

                    <FormGroup className="department-group">
                        <Label>
                            <IconWrapper style={{ background: 'rgba(147, 51, 234, 0.1)', color: '#9333EA' }}>
                                <Building size={18} />
                            </IconWrapper>
                            Department
                        </Label>
                        <DepartmentGrid>
                            {departments.map(dept => (
                                <DepartmentCard 
                                    key={dept.id}
                                    selected={formData.departmentId === String(dept.id)}
                                    onClick={() => handleDepartmentSelect(String(dept.id))}
                                >
                                    <Building size={16} />
                                    {dept.name}
                                </DepartmentCard>
                            ))}
                        </DepartmentGrid>
                    </FormGroup>

                    <FormGroup className="roles-group">
                        <Label>
                            <IconWrapper style={{ background: 'rgba(255, 140, 0, 0.1)', color: '#FF8C00' }}>
                                <Shield size={18} />
                            </IconWrapper>
                            Role
                        </Label>
                        <RoleGrid>
                            {availableRoles.map(role => (
                                <RoleChip 
                                    key={role.id}
                                    selected={formData.role === role.name}
                                    onClick={() => handleRoleSelect(role.name)}
                                >
                                    <Shield size={14} />
                                    {role.name}
                                    {formData.role === role.name && <CheckCircle size={14} />}
                                </RoleChip>
                            ))}
                        </RoleGrid>
                        <HelpText>Select one role for this user</HelpText>
                    </FormGroup>
                </FormGrid>

                {isEditMode && (
                    <StatusCard>
                        <StatusHeader>
                            <StatusIcon active={formData.enabled}>
                                {formData.enabled ? <Unlock size={20} /> : <Lock size={20} />}
                            </StatusIcon>
                            <StatusTitle>Account Status</StatusTitle>
                        </StatusHeader>
                        <StatusToggle>
                            <StatusOption 
                                active={formData.enabled}
                                onClick={() => setFormData(prev => ({ ...prev, enabled: true }))}
                            >
                                Active
                            </StatusOption>
                            <StatusOption 
                                active={!formData.enabled}
                                onClick={() => setFormData(prev => ({ ...prev, enabled: false }))}
                            >
                                Inactive
                            </StatusOption>
                        </StatusToggle>
                    </StatusCard>
                )}

                <ButtonGroup>
                    <CancelButton type="button" onClick={onCancel}>
                        <X size={18} />
                        Cancel
                    </CancelButton>
                    <SaveButton type="submit" disabled={isLoading}>
                        <div className="svg-wrapper-1">
                            <div className="svg-wrapper">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={30} height={30} className="icon">
                                    <path d="M22,15.04C22,17.23 20.24,19 18.07,19H5.93C3.76,19 2,17.23 2,15.04C2,13.07 3.43,11.44 5.31,11.14C5.28,11 5.27,10.86 5.27,10.71C5.27,9.33 6.38,8.2 7.76,8.2C8.37,8.2 8.94,8.43 9.37,8.8C10.14,7.05 11.13,5.44 13.91,5.44C17.28,5.44 18.87,8.06 18.87,10.83C18.87,10.94 18.87,11.06 18.86,11.17C20.65,11.54 22,13.13 22,15.04Z" />
                                </svg>
                            </div>
                        </div>
                        <span>{isLoading ? 'Saving...' : 'Save'}</span>
                    </SaveButton>
                </ButtonGroup>
            </FormContainer>
        </ModalOverlay>
    );
};

// Styled Components
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 20px;
    animation: fadeIn 0.3s ease;

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;

const FormContainer = styled.form`
    width: 100%;
    max-width: 800px;
    background: var(--bg-secondary);
    border-radius: 24px;
    padding: 2.5rem;
    box-shadow: 
        0 20px 60px var(--shadow),
        0 0 0 1px rgba(46, 151, 197, 0.1),
        0 0 100px rgba(150, 129, 158, 0.1);
    border: 2px solid rgba(46, 151, 197, 0.2);
    animation: slideUp 0.4s ease-out;

    @keyframes slideUp {
        from { 
            opacity: 0;
            transform: translateY(30px) scale(0.95);
        }
        to { 
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    @media (max-width: 768px) {
        padding: 1.5rem;
        border-radius: 20px;
        max-width: 95%;
    }
`;

const FormHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 2px solid rgba(150, 129, 158, 0.15);
`;

const TitleContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const EditIcon = styled.div`
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, rgb(150, 129, 158), rgb(120, 99, 128));
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;

    &::before {
        content: '✏️';
        font-size: 20px;
    }
`;

const AddIcon = styled.div`
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, rgb(229, 151, 54), rgb(209, 131, 34));
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;

    &::before {
        content: '👤';
        font-size: 20px;
    }
`;

const FormTitle = styled.h2`
    font-size: 1.75rem;
    font-weight: 800;
    background: linear-gradient(135deg, rgb(229, 151, 54), rgb(150, 129, 158));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
    font-family: 'Poppins', sans-serif;
`;

const CloseButton = styled.button`
    background: rgba(229, 151, 54, 0.1);
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgb(229, 151, 54);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(229, 151, 54, 0.2);
        transform: rotate(90deg);
    }
`;

const FormGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    margin-bottom: 2rem;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 1.25rem;
    }
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;

    &.department-group,
    &.roles-group {
        grid-column: span 2;
    }

    @media (max-width: 768px) {
        grid-column: span 1 !important;
    }
`;

const Label = styled.label`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--text-primary);
    font-family: 'Poppins', sans-serif;
`;

const IconWrapper = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    transition: transform 0.2s ease;
`;

const Input = styled.input`
    width: 100%;
    background: var(--bg-primary);
    border: 2px solid var(--border-color);
    color: var(--text-primary);
    padding: 16px 20px;
    border-radius: 12px;
    font-size: 0.9375rem;
    font-family: 'Poppins', sans-serif;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px var(--shadow);

    &::placeholder {
        color: var(--text-tertiary);
    }

    &:focus {
        outline: none;
        border-color: rgb(46, 151, 197);
        box-shadow: 0 0 0 3px rgba(46, 151, 197, 0.1);
    }

    &:disabled {
        background-color: var(--border-color);
        cursor: not-allowed;
        opacity: 0.7;
    }
`;

const PasswordInputContainer = styled.div`
    display: flex;
    gap: 0.5rem;
    align-items: center;
`;

const TogglePasswordButton = styled.button`
    background: rgba(229, 151, 54, 0.1);
    border: 2px solid rgba(229, 151, 54, 0.2);
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgb(229, 151, 54);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(229, 151, 54, 0.2);
        transform: translateY(-2px);
    }
`;

const PasswordInfoBox = styled.div`
    padding: 1rem 1.25rem;
    background: rgba(255, 140, 0, 0.05);
    border: 2px solid rgba(255, 140, 0, 0.2);
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 1rem;
    color: #FF8C00;

    > div {
        flex: 1;
    }
`;

const PasswordValue = styled.div`
    font-size: 1rem;
    font-weight: 700;
    font-family: 'Courier New', monospace;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
    letter-spacing: 1px;
`;

const DepartmentGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 0.75rem;
`;

const DepartmentCard = styled.div<{ selected: boolean }>`
    padding: 1rem;
    background: ${props => props.selected ? 'linear-gradient(135deg, rgb(150, 129, 158), rgb(120, 99, 128))' : 'var(--bg-primary)'};
    border: 2px solid ${props => props.selected ? 'rgb(150, 129, 158)' : 'var(--border-color)'};
    border-radius: 12px;
    color: ${props => props.selected ? 'white' : 'var(--text-primary)'};
    font-size: 0.875rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px var(--shadow);

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(150, 129, 158, 0.15);
    }
`;

const RoleCount = styled.span`
    margin-left: auto;
    font-size: 0.75rem;
    font-weight: 500;
    color: rgb(150, 129, 158);
    background: rgba(150, 129, 158, 0.1);
    padding: 0.25rem 0.5rem;
    border-radius: 20px;
`;

const RoleGrid = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
`;

const RoleChip = styled.div<{ selected: boolean }>`
    padding: 0.75rem 1rem;
    background: ${props => props.selected ? 'linear-gradient(135deg, rgb(229, 151, 54), rgb(209, 131, 34))' : 'var(--bg-primary)'};
    border: 2px solid ${props => props.selected ? 'rgb(229, 151, 54)' : 'var(--border-color)'};
    border-radius: 20px;
    color: ${props => props.selected ? 'white' : 'var(--text-primary)'};
    font-size: 0.8125rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(229, 151, 54, 0.15);
    }
`;

const HelpText = styled.p`
    font-size: 0.75rem;
    color: var(--text-tertiary);
    margin-top: 0.25rem;
    font-family: 'Poppins', sans-serif;
`;

const StatusCard = styled.div`
    padding: 1.5rem;
    background: rgba(46, 211, 135, 0.05);
    border-radius: 16px;
    border: 2px solid rgba(46, 211, 135, 0.2);
    margin-bottom: 2rem;
`;

const StatusHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
`;

const StatusIcon = styled.div<{ active: boolean }>`
    width: 40px;
    height: 40px;
    background: ${props => props.active 
        ? 'linear-gradient(135deg, rgb(46, 211, 135), rgb(26, 191, 115))' 
        : 'linear-gradient(135deg, rgb(231, 76, 60), rgb(211, 56, 40))'};
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
`;

const StatusTitle = styled.h3`
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
    font-family: 'Poppins', sans-serif;
`;

const StatusToggle = styled.div`
    display: flex;
    gap: 0.5rem;
    background: var(--bg-primary);
    padding: 0.25rem;
    border-radius: 12px;
    border: 2px solid var(--border-color);
`;

const StatusOption = styled.div<{ active: boolean }>`
    flex: 1;
    padding: 0.75rem 1rem;
    background: ${props => props.active 
        ? 'linear-gradient(135deg, rgb(150, 129, 158), rgb(120, 99, 128))' 
        : 'transparent'};
    color: ${props => props.active ? 'white' : 'var(--text-secondary)'};
    border-radius: 10px;
    font-weight: 600;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background: ${props => !props.active && 'rgba(150, 129, 158, 0.1)'};
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding-top: 2rem;
    border-top: 2px solid var(--border-color);

    @media (max-width: 576px) {
        flex-direction: column;
        
        button {
            width: 100%;
        }
    }
`;

const CancelButton = styled.button`
    padding: 1rem 2rem;
    background: var(--bg-primary);
    border: 2px solid rgba(229, 151, 54, 0.3);
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    font-family: 'Poppins', sans-serif;
    color: rgb(229, 151, 54);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(229, 151, 54, 0.1);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(229, 151, 54, 0.15);
    }
`;

const SaveButton = styled.button`
    font-family: 'Poppins', sans-serif;
    font-size: 20px;
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
`;

const SaveIcon = styled.div`
    display: flex;
    align-items: center;
`;

const SaveText = styled.span`
    font-weight: 700;
`;

const SaveSparkle = styled.div`
    display: flex;
    align-items: center;
    opacity: 0.8;
`;

export default UserForm;