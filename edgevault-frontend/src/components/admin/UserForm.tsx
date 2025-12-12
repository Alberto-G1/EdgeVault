import React, { useState, useEffect } from 'react';
import type { User, Department, Role } from '../../types/user';
import { getAllDepartments } from '../../api/departmentService';
import { getAllRoles } from '../../api/roleService';
import { useToast } from '../../context/ToastContext';
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
  Unlock,
  Sparkles
} from 'lucide-react';

interface UserFormProps {
    userToEdit?: User | null;
    onSave: (formData: any) => void;
    onCancel: () => void;
    isLoading: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ userToEdit, onSave, onCancel, isLoading }) => {
    const { showError } = useToast();
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
                showError('Error', 'Could not load form data (roles/departments).');
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
                </FormGrid>

                <TwoColumnRow>
                    <FormGroup className="department-group">
                        <Label>
                            <IconWrapper style={{ background: 'rgba(147, 51, 234, 0.1)', color: '#9333EA' }}>
                                <Building size={18} />
                            </IconWrapper>
                            Department
                        </Label>
                        <Select
                            name="departmentId"
                            value={formData.departmentId}
                            onChange={handleChange}
                            required
                            style={{ borderLeft: '4px solid #9333EA' }}
                        >
                            <option value="">Select Department</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={String(dept.id)}>
                                    {dept.name}
                                </option>
                            ))}
                        </Select>
                    </FormGroup>

                    <FormGroup className="roles-group">
                        <Label>
                            <IconWrapper style={{ background: 'rgba(255, 140, 0, 0.1)', color: '#FF8C00' }}>
                                <Shield size={18} />
                            </IconWrapper>
                            Role
                        </Label>
                        <Select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            required
                            style={{ borderLeft: '4px solid #FF8C00' }}
                        >
                            <option value="">Select Role</option>
                            {availableRoles.map(role => (
                                <option key={role.id} value={role.name}>
                                    {role.name}
                                </option>
                            ))}
                        </Select>
                    </FormGroup>
                </TwoColumnRow>

                {isEditMode && (
                    <StatusCard>
                        <StatusHeader>
                            <StatusIcon $active={formData.enabled}>
                                {formData.enabled ? <Unlock size={20} /> : <Lock size={20} />}
                            </StatusIcon>
                            <StatusTitle>Account Status</StatusTitle>
                        </StatusHeader>
                        <StatusToggle>
                            <StatusOption 
                                $active={formData.enabled}
                                onClick={() => setFormData(prev => ({ ...prev, enabled: true }))}
                            >
                                Active
                            </StatusOption>
                            <StatusOption 
                                $active={!formData.enabled}
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
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 99999;
    padding: 20px;
    animation: fadeIn 0.3s ease;
    overflow-y: auto;

    @keyframes fadeIn {
        from { 
            opacity: 0;
            backdrop-filter: blur(0);
        }
        to { 
            opacity: 1;
            backdrop-filter: blur(12px);
        }
    }
`;

const FormContainer = styled.form`
    width: 100%;
    max-width: 900px;
    background: var(--bg-secondary);
    border-radius: 32px;
    padding: 3rem;
    box-shadow: 
        0 30px 90px rgba(0, 0, 0, 0.5),
        0 0 0 1px rgba(46, 151, 197, 0.3),
        0 0 150px rgba(150, 129, 158, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    border: 3px solid transparent;
    background-image: 
        linear-gradient(var(--bg-secondary), var(--bg-secondary)),
        linear-gradient(135deg, rgba(46, 151, 197, 0.4), rgba(229, 151, 54, 0.4), rgba(150, 129, 158, 0.4));
    background-origin: border-box;
    background-clip: padding-box, border-box;
    animation: slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative;
    z-index: 100000;

    @keyframes slideUp {
        from { 
            opacity: 0;
            transform: translateY(50px) scale(0.9);
        }
        to { 
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    &::before {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        background: linear-gradient(135deg, 
            rgba(46, 151, 197, 0.3), 
            rgba(229, 151, 54, 0.3), 
            rgba(150, 129, 158, 0.3));
        border-radius: 32px;
        z-index: -1;
        filter: blur(20px);
        opacity: 0.5;
        animation: glow 3s ease-in-out infinite;
    }

    @keyframes glow {
        0%, 100% { opacity: 0.5; }
        50% { opacity: 0.8; }
    }

    @media (max-width: 768px) {
        padding: 2rem;
        border-radius: 24px;
        max-width: 95%;
        
        &::before {
            border-radius: 24px;
        }
    }

    @media (max-width: 576px) {
        padding: 1.5rem;
    }
`;

const FormHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2.5rem;
    padding-bottom: 2rem;
    border-bottom: 3px solid;
    border-image: linear-gradient(90deg, 
        rgba(46, 151, 197, 0.3),
        rgba(229, 151, 54, 0.3),
        rgba(150, 129, 158, 0.3)
    ) 1;
    position: relative;

    &::after {
        content: '';
        position: absolute;
        bottom: -3px;
        left: 0;
        width: 30%;
        height: 3px;
        background: linear-gradient(90deg, rgb(46, 151, 197), transparent);
        animation: shimmer 3s ease-in-out infinite;
    }

    @keyframes shimmer {
        0%, 100% { transform: translateX(0); opacity: 1; }
        50% { transform: translateX(200px); opacity: 0.5; }
    }
`;

const TitleContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const EditIcon = styled.div`
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, rgb(150, 129, 158), rgb(120, 99, 128));
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 
        0 8px 24px rgba(150, 129, 158, 0.4),
        inset 0 -2px 8px rgba(0, 0, 0, 0.2),
        inset 0 2px 8px rgba(255, 255, 255, 0.1);
    position: relative;
    animation: iconPulse 2s ease-in-out infinite;

    &::before {
        content: '✏️';
        font-size: 28px;
    }

    &::after {
        content: '';
        position: absolute;
        inset: -3px;
        border-radius: 18px;
        background: linear-gradient(135deg, rgb(150, 129, 158), rgb(120, 99, 128));
        opacity: 0.3;
        filter: blur(10px);
        z-index: -1;
    }

    @keyframes iconPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
`;

const AddIcon = styled.div`
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, rgb(229, 151, 54), rgb(209, 131, 34));
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 
        0 8px 24px rgba(229, 151, 54, 0.4),
        inset 0 -2px 8px rgba(0, 0, 0, 0.2),
        inset 0 2px 8px rgba(255, 255, 255, 0.1);
    position: relative;
    animation: iconPulse 2s ease-in-out infinite;

    &::before {
        content: '👤';
        font-size: 28px;
    }

    &::after {
        content: '';
        position: absolute;
        inset: -3px;
        border-radius: 18px;
        background: linear-gradient(135deg, rgb(229, 151, 54), rgb(209, 131, 34));
        opacity: 0.3;
        filter: blur(10px);
        z-index: -1;
    }
`;

const FormTitle = styled.h2`
    font-size: 2rem;
    font-weight: 900;
    background: linear-gradient(135deg, rgb(46, 151, 197), rgb(229, 151, 54), rgb(150, 129, 158));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    background-size: 200% auto;
    margin: 0;
    font-family: 'Poppins', sans-serif;
    letter-spacing: -0.5px;
    animation: gradientShift 4s ease infinite;

    @keyframes gradientShift {
        0%, 100% { background-position: 0% center; }
        50% { background-position: 100% center; }
    }

    @media (max-width: 768px) {
        font-size: 1.5rem;
    }
`;

const CloseButton = styled.button`
    background: rgba(231, 76, 60, 0.1);
    border: 2px solid rgba(231, 76, 60, 0.2);
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgb(231, 76, 60);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 4px 12px rgba(231, 76, 60, 0.2);
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(231, 76, 60, 0.2), rgba(211, 56, 40, 0.2));
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    &:hover {
        background: rgba(231, 76, 60, 0.2);
        border-color: rgb(231, 76, 60);
        transform: rotate(90deg) scale(1.1);
        box-shadow: 0 8px 24px rgba(231, 76, 60, 0.4);

        &::before {
            opacity: 1;
        }
    }

    &:active {
        transform: rotate(90deg) scale(0.95);
    }
`;

const FormGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
    margin-bottom: 2.5rem;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }
`;

const TwoColumnRow = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
    margin-bottom: 2.5rem;
    animation: fadeInUp 0.5s ease-out 0.25s backwards;

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

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    animation: fadeInUp 0.5s ease-out backwards;

    &.username-group { animation-delay: 0.1s; }
    &.email-group { animation-delay: 0.15s; }
    &.password-group { animation-delay: 0.2s; }
    &.department-group { animation-delay: 0s; }
    &.roles-group { animation-delay: 0s; }

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

    @media (max-width: 768px) {
        grid-column: span 1 !important;
    }
`;

const Label = styled.label`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-primary);
    font-family: 'Poppins', sans-serif;
    letter-spacing: 0.3px;
`;

const IconWrapper = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    border-radius: 12px;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    &:hover {
        transform: translateY(-2px) rotate(5deg);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    }
`;

const Input = styled.input`
    width: 100%;
    background: var(--bg-primary);
    border: 3px solid var(--border-color);
    color: var(--text-primary);
    padding: 18px 24px;
    border-radius: 14px;
    font-size: 1rem;
    font-family: 'Poppins', sans-serif;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 
        0 4px 12px var(--shadow),
        inset 0 1px 0 rgba(255, 255, 255, 0.05);
    position: relative;

    &::placeholder {
        color: var(--text-tertiary);
        font-weight: 500;
    }

    &:focus {
        outline: none;
        border-color: rgb(46, 151, 197);
        background: var(--bg-secondary);
        box-shadow: 
            0 0 0 4px rgba(46, 151, 197, 0.15),
            0 8px 24px rgba(46, 151, 197, 0.2);
        transform: translateY(-2px);
    }

    &:disabled {
        background: linear-gradient(135deg, rgba(150, 129, 158, 0.05), rgba(150, 129, 158, 0.1));
        cursor: not-allowed;
        opacity: 0.7;
        border-style: dashed;
    }
`;

const Select = styled.select`
    width: 100%;
    background: var(--bg-primary);
    border: 3px solid var(--border-color);
    color: var(--text-primary);
    padding: 18px 24px;
    border-radius: 14px;
    font-size: 1rem;
    font-family: 'Poppins', sans-serif;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 
        0 4px 12px var(--shadow),
        inset 0 1px 0 rgba(255, 255, 255, 0.05);
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%232e97c5' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 16px center;
    background-size: 20px;
    padding-right: 50px;

    option {
        background: var(--bg-primary);
        color: var(--text-primary);
        padding: 12px;
        font-family: 'Poppins', sans-serif;
    }

    &:focus {
        outline: none;
        border-color: rgb(46, 151, 197);
        background-color: var(--bg-secondary);
        box-shadow: 
            0 0 0 4px rgba(46, 151, 197, 0.15),
            0 8px 24px rgba(46, 151, 197, 0.2);
        transform: translateY(-2px);
    }

    &:hover {
        border-color: rgb(46, 151, 197);
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
    padding: 1.5rem 1.75rem;
    background: linear-gradient(135deg, rgba(255, 140, 0, 0.08), rgba(255, 140, 0, 0.12));
    border: 3px solid rgba(255, 140, 0, 0.3);
    border-radius: 16px;
    display: flex;
    align-items: center;
    gap: 1.25rem;
    color: #FF8C00;
    box-shadow: 
        0 8px 24px rgba(255, 140, 0, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        animation: shimmerPass 3s ease-in-out infinite;
    }

    @keyframes shimmerPass {
        0%, 100% { left: -100%; }
        50% { left: 100%; }
    }

    > div {
        flex: 1;
        position: relative;
        z-index: 1;
    }

    svg {
        filter: drop-shadow(0 2px 4px rgba(255, 140, 0, 0.3));
    }
`;

const PasswordValue = styled.div`
    font-size: 1.125rem;
    font-weight: 800;
    font-family: 'Courier New', monospace;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
    letter-spacing: 2px;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const DepartmentGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
`;

const DepartmentCard = styled.div<{ selected: boolean }>`
    padding: 1.25rem 1.5rem;
    background: ${props => props.selected 
        ? 'linear-gradient(135deg, rgb(150, 129, 158), rgb(120, 99, 128))' 
        : 'var(--bg-primary)'};
    border: 3px solid ${props => props.selected ? 'rgb(150, 129, 158)' : 'var(--border-color)'};
    border-radius: 16px;
    color: ${props => props.selected ? 'white' : 'var(--text-primary)'};
    font-size: 0.9375rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: ${props => props.selected 
        ? '0 8px 24px rgba(150, 129, 158, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
        : '0 4px 12px var(--shadow)'};
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, rgba(150, 129, 158, 0.1), rgba(150, 129, 158, 0.2));
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    &:hover {
        transform: translateY(-4px) scale(1.02);
        box-shadow: ${props => props.selected 
            ? '0 12px 32px rgba(150, 129, 158, 0.5)' 
            : '0 8px 24px rgba(150, 129, 158, 0.2)'};
        border-color: ${props => props.selected ? 'rgb(170, 149, 178)' : 'rgb(150, 129, 158)'};

        &::before {
            opacity: 1;
        }
    }

    &:active {
        transform: translateY(-2px) scale(0.98);
    }

    svg {
        filter: ${props => props.selected && 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'};
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
    gap: 0.75rem;
`;

const RoleChip = styled.div<{ selected: boolean }>`
    padding: 1rem 1.5rem;
    background: ${props => props.selected 
        ? 'linear-gradient(135deg, rgb(229, 151, 54), rgb(209, 131, 34))' 
        : 'var(--bg-primary)'};
    border: 3px solid ${props => props.selected ? 'rgb(229, 151, 54)' : 'var(--border-color)'};
    border-radius: 24px;
    color: ${props => props.selected ? 'white' : 'var(--text-primary)'};
    font-size: 0.9375rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: ${props => props.selected 
        ? '0 8px 24px rgba(229, 151, 54, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
        : '0 4px 12px var(--shadow)'};
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, rgba(229, 151, 54, 0.1), rgba(229, 151, 54, 0.2));
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    &:hover {
        transform: translateY(-3px) scale(1.05);
        box-shadow: ${props => props.selected 
            ? '0 12px 32px rgba(229, 151, 54, 0.5)' 
            : '0 8px 24px rgba(229, 151, 54, 0.2)'};
        border-color: ${props => props.selected ? 'rgb(249, 171, 74)' : 'rgb(229, 151, 54)'};

        &::before {
            opacity: 1;
        }
    }

    &:active {
        transform: translateY(-1px) scale(1.02);
    }

    svg {
        filter: ${props => props.selected && 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'};
        transition: transform 0.3s ease;
    }

    &:hover svg:first-child {
        transform: rotate(15deg) scale(1.1);
    }
`;

const HelpText = styled.p`
    font-size: 0.8125rem;
    color: var(--text-tertiary);
    margin-top: 0.5rem;
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
    letter-spacing: 0.2px;
    opacity: 0.85;
    transition: all 0.3s ease;
    line-height: 1.6;

    &:hover {
        opacity: 1;
        color: rgb(229, 151, 54);
    }
`;

const StatusCard = styled.div`
    padding: 2rem;
    background: linear-gradient(135deg, rgba(46, 211, 135, 0.08), rgba(26, 191, 115, 0.05));
    border-radius: 20px;
    border: 3px solid rgba(46, 211, 135, 0.3);
    margin-bottom: 2.5rem;
    box-shadow: 0 8px 24px rgba(46, 211, 135, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1);
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    animation: fadeInUp 0.5s ease-out 0.35s both;

    &::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: linear-gradient(45deg, transparent, rgba(46, 211, 135, 0.1), transparent);
        animation: shimmer 3s infinite;
    }

    &:hover {
        border-color: rgba(46, 211, 135, 0.5);
        box-shadow: 0 12px 32px rgba(46, 211, 135, 0.25);
        transform: translateY(-2px);
    }
`;

const StatusHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
    position: relative;
    z-index: 1;
`;

const StatusIcon = styled.div<{ $active: boolean }>`
    width: 56px;
    height: 56px;
    background: ${props => props.$active 
        ? 'linear-gradient(135deg, rgb(46, 211, 135), rgb(26, 191, 115))' 
        : 'linear-gradient(135deg, rgb(231, 76, 60), rgb(211, 56, 40))'};
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: ${props => props.$active 
        ? '0 8px 24px rgba(46, 211, 135, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
        : '0 8px 24px rgba(231, 76, 60, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'};
    position: relative;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

    &::after {
        content: '';
        position: absolute;
        inset: -4px;
        background: ${props => props.$active 
            ? 'linear-gradient(135deg, rgb(46, 211, 135), rgb(26, 191, 115))' 
            : 'linear-gradient(135deg, rgb(231, 76, 60), rgb(211, 56, 40))'};
        border-radius: 16px;
        opacity: 0.4;
        filter: blur(12px);
        z-index: -1;
        animation: iconPulse 2s infinite;
    }

    svg {
        width: 28px;
        height: 28px;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    }
`;

const StatusTitle = styled.h3`
    font-size: 1.375rem;
    font-weight: 800;
    color: var(--text-primary);
    margin: 0;
    font-family: 'Poppins', sans-serif;
    letter-spacing: 0.5px;
    background: linear-gradient(135deg, var(--text-primary), rgb(150, 129, 158));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
`;

const StatusToggle = styled.div`
    display: flex;
    gap: 0.75rem;
    background: var(--bg-primary);
    padding: 0.5rem;
    border-radius: 16px;
    border: 3px solid var(--border-color);
    box-shadow: 0 4px 12px var(--shadow), inset 0 1px 0 rgba(255, 255, 255, 0.05);
    position: relative;
    z-index: 1;
    transition: all 0.3s ease;

    &:hover {
        border-color: rgb(150, 129, 158);
        box-shadow: 0 6px 18px rgba(150, 129, 158, 0.2);
    }
`;

const StatusOption = styled.div<{ $active: boolean }>`
    flex: 1;
    padding: 1rem 1.5rem;
    background: ${props => props.$active 
        ? 'linear-gradient(135deg, rgb(150, 129, 158), rgb(120, 99, 128))' 
        : 'transparent'};
    color: ${props => props.$active ? 'white' : 'var(--text-secondary)'};
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 700;
    text-align: center;
    cursor: pointer;
    font-family: 'Poppins', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: ${props => props.$active 
        ? '0 6px 18px rgba(150, 129, 158, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
        : '0 2px 8px var(--shadow)'};
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: ${props => props.$active 
            ? 'linear-gradient(135deg, rgba(170, 149, 178, 0.2), rgba(130, 109, 138, 0.2))' 
            : 'linear-gradient(135deg, rgba(150, 129, 158, 0.1), rgba(120, 99, 128, 0.1))'};
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    &:hover {
        background: ${props => !props.$active && 'rgba(150, 129, 158, 0.15)'};
        border-color: rgb(150, 129, 158);
        transform: translateY(-2px) scale(1.02);
        box-shadow: ${props => props.$active 
            ? '0 8px 24px rgba(150, 129, 158, 0.5)' 
            : '0 6px 18px rgba(150, 129, 158, 0.3)'};

        &::before {
            opacity: 1;
        }
    }

    &:active {
        transform: translateY(-1px) scale(1.01);
    }

    svg {
        transition: transform 0.3s ease;
    }

    &:hover svg {
        transform: rotate(360deg) scale(1.1);
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 1.5rem;
    padding-top: 2.5rem;
    border-top: 3px solid var(--border-color);
    margin-top: 1rem;
    animation: fadeInUp 0.5s ease-out 0.4s both;

    @media (max-width: 576px) {
        flex-direction: column;
        
        button {
            width: 100%;
        }
    }
`;

const CancelButton = styled.button`
    padding: 1.125rem 2.5rem;
    background: var(--bg-primary);
    border: 3px solid rgba(229, 151, 54, 0.3);
    border-radius: 14px;
    font-size: 1.0625rem;
    font-weight: 700;
    font-family: 'Poppins', sans-serif;
    color: rgb(229, 151, 54);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 4px 12px var(--shadow), inset 0 1px 0 rgba(255, 255, 255, 0.05);
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(229, 151, 54, 0.1), rgba(209, 131, 34, 0.1));
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    &:hover {
        background: rgba(229, 151, 54, 0.15);
        border-color: rgb(229, 151, 54);
        transform: translateY(-3px) scale(1.02);
        box-shadow: 0 8px 24px rgba(229, 151, 54, 0.3);

        &::before {
            opacity: 1;
        }
    }

    &:active {
        transform: translateY(-1px) scale(1.01);
    }

    svg {
        transition: transform 0.3s ease;
    }

    &:hover svg {
        transform: rotate(-90deg) scale(1.1);
    }
`;

const SaveButton = styled.button`
    font-family: 'Poppins', sans-serif;
    font-size: 21px;
    background: linear-gradient(135deg, rgb(46, 151, 197), rgb(150, 129, 158));
    color: white;
    fill: rgb(200, 200, 200);
    padding: 0.8em 2em;
    padding-left: 1em;
    display: flex;
    align-items: center;
    cursor: pointer;
    border: none;
    border-radius: 16px;
    font-weight: 800;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 8px 24px rgba(46, 151, 197, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2);
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        inset: -4px;
        background: linear-gradient(135deg, rgb(46, 151, 197), rgb(150, 129, 158));
        border-radius: 18px;
        opacity: 0.5;
        filter: blur(15px);
        z-index: -1;
        transition: opacity 0.3s ease;
    }

    span {
        display: block;
        margin-left: 0.4em;
        transition: all 0.3s ease-in-out;
        letter-spacing: 0.5px;
    }

    .svg-wrapper-1 {
        display: flex;
        align-items: center;
    }

    .svg-wrapper {
        display: flex;
        align-items: center;
        transform-origin: center center;
        transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    svg {
        display: block;
        transform-origin: center center;
        transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    }

    &:hover:not(:disabled) {
        background: linear-gradient(135deg, rgb(36, 121, 167), rgb(120, 99, 128));
        box-shadow: 0 12px 32px rgba(46, 151, 197, 0.5);
        transform: translateY(-3px) scale(1.02);

        &::before {
            opacity: 0.8;
        }
    }

    &:hover:not(:disabled) .svg-wrapper {
        transform: scale(1.3);
        transition: 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    &:hover:not(:disabled) svg {
        transform: translateX(1.3em) scale(1.15);
        fill: #fff;
        filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
    }

    &:hover:not(:disabled) span {
        opacity: 0;
        transition: 0.5s linear;
    }

    &:active:not(:disabled) {
        transform: translateY(-1px) scale(1.01);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        box-shadow: 0 4px 12px rgba(46, 151, 197, 0.2);
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