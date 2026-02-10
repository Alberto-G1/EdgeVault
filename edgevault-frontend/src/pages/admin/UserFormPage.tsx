import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAllDepartments } from '../../api/departmentService';
import { getAllRoles } from '../../api/roleService';
import { createUser, updateUser, getAllUserDetails } from '../../api/userService';
import type { User, Department, Role } from '../../types/user';
import { useToast } from '../../context/ToastContext';
import styled from 'styled-components';
import { 
  User as UserIcon, 
  Mail, 
  Building, 
  Shield, 
  Key,
  Lock,
  Unlock,
  ArrowLeft,
  Calendar
} from 'lucide-react';
import FullPageLoader from '../../components/common/FullPageLoader';
import HoverButton from '../../components/common/HoverButton';

const UserFormPage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const { showError, showSuccess } = useToast();
    const isEditMode = !!userId;

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        role: 'Department User',
        enabled: true,
        departmentId: '',
        employeeId: '',
        jobTitle: '',
        supervisorName: '',
        dateJoined: '',
    });

    useEffect(() => {
        const fetchFormData = async () => {
            try {
                setLoading(true);
                const [depts, roles] = await Promise.all([
                    getAllDepartments(),
                    getAllRoles()
                ]);
                setDepartments(depts);
                setAvailableRoles(roles);

                if (isEditMode && userId) {
                    const users = await getAllUserDetails();
                    const user = users.find(u => u.id === parseInt(userId));
                    if (user) {
                        setUserToEdit(user);
                        const userDept = depts.find(d => d.name === user.departmentName);
                        const userRole = user.roles && user.roles.length > 0 ? user.roles[0] : 'Department User';
                        setFormData({
                            username: user.username,
                            email: user.email,
                            role: userRole,
                            enabled: user.enabled,
                            departmentId: userDept ? String(userDept.id) : '',
                            employeeId: user.employeeId || '',
                            jobTitle: user.jobTitle || '',
                            supervisorName: user.supervisorName || '',
                            dateJoined: user.dateJoined || '',
                        });
                    }
                } else if (depts.length > 0) {
                    setFormData(prev => ({ ...prev, departmentId: String(depts[0].id) }));
                }
            } catch (error) {
                showError('Error', 'Could not load form data (roles/departments).');
            } finally {
                setLoading(false);
            }
        };
        fetchFormData();
    }, [userId, isEditMode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        setFormData(prev => ({
            ...prev,
            [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        
        const dataToSave: any = { 
            ...formData, 
            roles: [formData.role],
            departmentId: Number(formData.departmentId)
        };
        
        if (!isEditMode && !dataToSave.dateJoined) {
            const today = new Date().toISOString().split('T')[0];
            dataToSave.dateJoined = today;
        }

        try {
            if (isEditMode && userId) {
                const payload = { 
                    email: dataToSave.email, 
                    enabled: dataToSave.enabled, 
                    roles: dataToSave.roles, 
                    departmentId: dataToSave.departmentId,
                    employeeId: dataToSave.employeeId,
                    jobTitle: dataToSave.jobTitle,
                    supervisorName: dataToSave.supervisorName,
                    dateJoined: dataToSave.dateJoined
                };
                await updateUser(parseInt(userId), payload);
                showSuccess('Success', 'User updated successfully!');
            } else {
                await createUser(dataToSave);
                showSuccess('Success', 'User created successfully!');
            }
            navigate('/admin/users');
        } catch (error: any) {
            showError('Error', error.response?.data?.message || 'Failed to save user.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <FullPageLoader />;

    return (
        <PageContainer>
            <ContentWrapper>
                <PageHeader>
                    <TitleSection>
                        <PageTitle>{isEditMode ? 'Edit User' : 'Create New User'}</PageTitle>
                        <PageSubtitle>
                            {isEditMode 
                                ? 'Update user information and account settings' 
                                : 'Fill in the details below to create a new user account'}
                        </PageSubtitle>
                    </TitleSection>
                </PageHeader>

                <MainContent>
                    <FormSection>
                        <SectionTitle>Basic Information</SectionTitle>
                        <FormGrid>
                            <FormGroup>
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

                            <FormGroup>
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
                    </FormSection>

                    <FormSection>
                        <SectionTitle>Department & Role</SectionTitle>
                        <TwoColumnRow>
                            <FormGroup>
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

                            <FormGroup>
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
                    </FormSection>

                    {isEditMode && (
                        <FormSection>
                            <SectionTitle>Account Status</SectionTitle>
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
                        </FormSection>
                    )}

                    <FormSection>
                        <SectionTitle>Work Information</SectionTitle>
                        <FormGrid>
                            <FormGroup>
                                <Label>
                                    <IconWrapper style={{ background: 'rgba(46, 151, 197, 0.1)', color: '#2E97C5' }}>
                                        <Building size={16} />
                                    </IconWrapper>
                                    Employee ID
                                </Label>
                                <Input
                                    type="text"
                                    name="employeeId"
                                    value={formData.employeeId}
                                    onChange={handleChange}
                                    placeholder="Enter employee ID"
                                    style={{ borderLeft: '4px solid #2E97C5' }}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>
                                    <IconWrapper style={{ background: 'rgba(46, 151, 197, 0.1)', color: '#2E97C5' }}>
                                        <Building size={16} />
                                    </IconWrapper>
                                    Job Title
                                </Label>
                                <Input
                                    type="text"
                                    name="jobTitle"
                                    value={formData.jobTitle}
                                    onChange={handleChange}
                                    placeholder="Enter job title"
                                    style={{ borderLeft: '4px solid #2E97C5' }}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>
                                    <IconWrapper style={{ background: 'rgba(46, 151, 197, 0.1)', color: '#2E97C5' }}>
                                        <UserIcon size={16} />
                                    </IconWrapper>
                                    Supervisor Name
                                </Label>
                                <Input
                                    type="text"
                                    name="supervisorName"
                                    value={formData.supervisorName}
                                    onChange={handleChange}
                                    placeholder="Enter supervisor name"
                                    style={{ borderLeft: '4px solid #2E97C5' }}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>
                                    <IconWrapper style={{ background: 'rgba(46, 151, 197, 0.1)', color: '#2E97C5' }}>
                                        <Calendar size={16} />
                                    </IconWrapper>
                                    Date Joined
                                </Label>
                                <Input
                                    type="date"
                                    name="dateJoined"
                                    value={formData.dateJoined}
                                    onChange={handleChange}
                                    style={{ borderLeft: '4px solid #2E97C5' }}
                                />
                                {!isEditMode && <HelpText>Auto-filled with today's date if left empty</HelpText>}
                            </FormGroup>
                        </FormGrid>
                    </FormSection>

                    <ButtonGroup>
                        <BackButtonWrapper onClick={() => navigate('/admin/users')}>
                            <BackButtonStyled>
                                <ArrowLeft size={20} />
                                <span>Back to Users</span>
                            </BackButtonStyled>
                        </BackButtonWrapper>
                        <ActionButtons>
                            <HoverButton
                                textOne={isSubmitting ? 'Saving...' : (isEditMode ? 'Update' : 'Create')}
                                textTwo={isEditMode ? 'Save Changes' : 'Add User'}
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                width="180px"
                                height="55px"
                            />
                        </ActionButtons>
                    </ButtonGroup>
                </MainContent>
            </ContentWrapper>
        </PageContainer>
    );
};

// Styled Components
const PageContainer = styled.div`
    width: 100%;
    min-height: 100vh;
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
        padding: 20px 15px;
    }
`;

const ContentWrapper = styled.div`
    max-width: 1400px;
    margin: 0 auto;
`;

const PageHeader = styled.div`
    margin-bottom: 35px;
    animation: slideDown 0.5s ease;

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

const TitleSection = styled.div`
    text-align: left;
`;

const PageTitle = styled.h1`
    font-size: 36px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 10px 0;
    background: linear-gradient(135deg, var(--light-blue) 0%, var(--purple) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;

    @media (max-width: 768px) {
        font-size: 28px;
    }
`;

const PageSubtitle = styled.p`
    font-size: 16px;
    color: var(--text-secondary);
    margin: 0;
    font-weight: 400;

    @media (max-width: 768px) {
        font-size: 14px;
    }
`;

const MainContent = styled.div`
    background: var(--bg-secondary);
    border-radius: 20px;
    padding: 40px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    border: 1px solid var(--border-color);
    animation: slideUp 0.6s ease;

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @media (max-width: 768px) {
        padding: 25px 20px;
        border-radius: 15px;
    }
`;

const FormSection = styled.div`
    margin-bottom: 40px;
    
    &:last-of-type {
        margin-bottom: 30px;
    }

    @media (max-width: 768px) {
        margin-bottom: 30px;
    }
`;

const SectionTitle = styled.h2`
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 25px;
    padding-bottom: 12px;
    border-bottom: 2px solid var(--border-color);

    @media (max-width: 768px) {
        font-size: 18px;
        margin-bottom: 20px;
    }
`;

const FormGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 25px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 20px;
    }
`;

const TwoColumnRow = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 25px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 20px;
    }
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;

    &.password-group {
        grid-column: 1 / -1;
    }
`;

const Label = styled.label`
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
`;

const IconWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    flex-shrink: 0;
`;

const Input = styled.input`
    width: 100%;
    padding: 14px 18px;
    background: var(--bg-primary);
    color: var(--text-primary);
    border: 2px solid var(--border-color);
    border-radius: 12px;
    font-size: 15px;
    font-family: 'Poppins', sans-serif;
    transition: all 0.3s ease;

    &:focus {
        outline: none;
        border-color: var(--light-blue);
        box-shadow: 0 0 0 4px rgba(46, 151, 197, 0.1);
    }

    &:disabled {
        background: var(--bg-secondary);
        cursor: not-allowed;
        opacity: 0.6;
    }

    &::placeholder {
        color: var(--text-secondary);
        opacity: 0.6;
    }
`;

const Select = styled.select`
    width: 100%;
    padding: 14px 18px;
    background: var(--bg-primary);
    color: var(--text-primary);
    border: 2px solid var(--border-color);
    border-radius: 12px;
    font-size: 15px;
    font-family: 'Poppins', sans-serif;
    cursor: pointer;
    transition: all 0.3s ease;

    &:focus {
        outline: none;
        border-color: var(--light-blue);
        box-shadow: 0 0 0 4px rgba(46, 151, 197, 0.1);
    }

    option {
        background: var(--bg-secondary);
        color: var(--text-primary);
    }
`;

const HelpText = styled.p`
    font-size: 13px;
    color: var(--text-secondary);
    margin: 0;
    font-style: italic;
    line-height: 1.4;
`;

const PasswordInfoBox = styled.div`
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 18px;
    background: rgba(255, 140, 0, 0.08);
    border: 2px solid rgba(255, 140, 0, 0.25);
    border-radius: 12px;
    color: var(--text-primary);
`;

const PasswordValue = styled.div`
    font-size: 18px;
    font-weight: 700;
    font-family: 'Courier New', monospace;
    color: #FF8C00;
    margin-bottom: 4px;
`;

const StatusCard = styled.div`
    padding: 25px;
    background: var(--bg-primary);
    border: 2px solid var(--border-color);
    border-radius: 15px;
`;

const StatusHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 20px;
`;

const StatusIcon = styled.div<{ $active: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 45px;
    height: 45px;
    border-radius: 12px;
    background: ${props => props.$active ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)'};
    color: ${props => props.$active ? '#22c55e' : '#ef4444'};
`;

const StatusTitle = styled.h3`
    font-size: 17px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
`;

const StatusToggle = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
`;

const StatusOption = styled.div<{ $active: boolean }>`
    padding: 14px 24px;
    text-align: center;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    background: ${props => props.$active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'var(--bg-secondary)'};
    color: ${props => props.$active ? '#fff' : 'var(--text-primary)'};
    border: 2px solid ${props => props.$active ? 'transparent' : 'var(--border-color)'};

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 30px;
    margin-top: 30px;
    border-top: 2px solid var(--border-color);

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 15px;
        align-items: stretch;
    }
`;

const BackButtonWrapper = styled.div`
    @media (max-width: 768px) {
        order: 2;
    }
`;

const BackButtonStyled = styled.button`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 24px;
    background: transparent;
    color: var(--text-secondary);
    border: 2px solid var(--border-color);
    border-radius: 50px;
    cursor: pointer;
    font-size: 15px;
    font-weight: 600;
    transition: all 0.3s ease;
    font-family: 'Poppins', sans-serif;

    &:hover {
        background: var(--bg-primary);
        color: var(--text-primary);
        border-color: var(--light-blue);
        transform: translateX(-4px);
    }

    span {
        @media (max-width: 480px) {
            display: none;
        }
    }
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 15px;

    @media (max-width: 768px) {
        order: 1;
        width: 100%;
        justify-content: stretch;
    }
`;

export default UserFormPage;
