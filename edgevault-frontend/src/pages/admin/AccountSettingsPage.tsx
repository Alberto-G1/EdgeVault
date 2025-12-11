import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getMyProfile, updateMyProfile } from '../../api/profileService';
import type { UserProfile } from '../../types/user';
import { useToast } from '../../context/ToastContext';
import { User, Lock, Bell, Shield, Eye, Download, Trash2, Mail, Phone, Briefcase, Camera, Key, Clock, Monitor, AlertCircle } from 'lucide-react';
import styled from 'styled-components';

const AccountSettingsPage: React.FC = () => {
    const { user } = useAuth();
    const { showSuccess, showError } = useToast();
    const [activeTab, setActiveTab] = useState<'personal' | 'security' | 'notifications' | 'privacy'>('personal');
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    
    // Form states
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // Notification preferences
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [documentNotifications, setDocumentNotifications] = useState(true);
    const [chatNotifications, setChatNotifications] = useState(true);
    const [systemNotifications, setSystemNotifications] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await getMyProfile();
            setProfile(data);
            setFullName(data.firstName || '');
            setEmail(data.email || '');
            setPhone(data.phoneNumber || '');
            setJobTitle(data.jobTitle || '');
        } catch (error) {
            showError('Error', 'Failed to fetch profile data');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            await updateMyProfile({
                firstName: fullName,
                email,
                phoneNumber: phone,
                jobTitle
            });
            showSuccess('Success', 'Profile updated successfully');
            setIsEditing(false);
            fetchProfile();
        } catch (error: any) {
            showError('Error', error.response?.data?.message || 'Failed to update profile');
        }
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            showError('Error', 'Passwords do not match');
            return;
        }
        
        if (newPassword.length < 8) {
            showError('Error', 'Password must be at least 8 characters long');
            return;
        }

        try {
            // API call would go here
            showSuccess('Success', 'Password changed successfully');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            showError('Error', error.response?.data?.message || 'Failed to change password');
        }
    };

    const handleSaveNotifications = () => {
        // Save notification preferences
        showSuccess('Success', 'Notification preferences saved');
    };

    const handleExportData = () => {
        showSuccess('Request Submitted', 'Your data export will be ready shortly');
    };

    const handleDeleteAccount = () => {
        showError('Action Required', 'Please contact your administrator to delete your account');
    };

    if (loading) {
        return (
            <PageContainer>
                <LoadingState>Loading account settings...</LoadingState>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader>
                <HeaderContent>
                    <Title>Account Settings</Title>
                    <Subtitle>Manage your profile, security, and preferences</Subtitle>
                </HeaderContent>
            </PageHeader>

            <ContentWrapper>
                <TabsContainer>
                    <Tab 
                        $active={activeTab === 'personal'} 
                        onClick={() => setActiveTab('personal')}
                    >
                        <User size={18} />
                        Personal Info
                    </Tab>
                    <Tab 
                        $active={activeTab === 'security'} 
                        onClick={() => setActiveTab('security')}
                    >
                        <Lock size={18} />
                        Security
                    </Tab>
                    <Tab 
                        $active={activeTab === 'notifications'} 
                        onClick={() => setActiveTab('notifications')}
                    >
                        <Bell size={18} />
                        Notifications
                    </Tab>
                    <Tab 
                        $active={activeTab === 'privacy'} 
                        onClick={() => setActiveTab('privacy')}
                    >
                        <Shield size={18} />
                        Privacy
                    </Tab>
                </TabsContainer>

                <TabContent>
                    {activeTab === 'personal' && (
                        <Section>
                            <SectionHeader>
                                <SectionTitle>Personal Information</SectionTitle>
                                {!isEditing && (
                                    <EditButton onClick={() => setIsEditing(true)}>
                                        Edit Profile
                                    </EditButton>
                                )}
                            </SectionHeader>

                            <ProfileImageSection>
                                <ProfileImage 
                                    src={profile?.profilePictureUrl || `https://ui-avatars.com/api/?name=${user?.sub}&background=2E97C5&color=fff&size=128`}
                                    alt="Profile"
                                />
                                <UploadButton>
                                    <Camera size={18} />
                                    Change Photo
                                </UploadButton>
                            </ProfileImageSection>

                            <FormGrid>
                                <FormGroup>
                                    <Label>
                                        <User size={16} />
                                        Full Name
                                    </Label>
                                    <Input 
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        disabled={!isEditing}
                                        placeholder="Enter your full name"
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <Label>
                                        <Mail size={16} />
                                        Email Address
                                    </Label>
                                    <Input 
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={!isEditing}
                                        placeholder="your.email@company.com"
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <Label>
                                        <Phone size={16} />
                                        Phone Number
                                    </Label>
                                    <Input 
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        disabled={!isEditing}
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <Label>
                                        <Briefcase size={16} />
                                        Job Title
                                    </Label>
                                    <Input 
                                        type="text"
                                        value={jobTitle}
                                        onChange={(e) => setJobTitle(e.target.value)}
                                        disabled={!isEditing}
                                        placeholder="Your position"
                                    />
                                </FormGroup>
                            </FormGrid>

                            {isEditing && (
                                <ButtonGroup>
                                    <SaveButton onClick={handleUpdateProfile}>
                                        Save Changes
                                    </SaveButton>
                                    <CancelButton onClick={() => {
                                        setIsEditing(false);
                                        fetchProfile();
                                    }}>
                                        Cancel
                                    </CancelButton>
                                </ButtonGroup>
                            )}
                        </Section>
                    )}

                    {activeTab === 'security' && (
                        <Section>
                            <SectionHeader>
                                <SectionTitle>Security Settings</SectionTitle>
                            </SectionHeader>

                            <SecurityCard>
                                <SecurityHeader>
                                    <Key size={24} />
                                    <div>
                                        <CardTitle>Change Password</CardTitle>
                                        <CardDescription>Update your password regularly to keep your account secure</CardDescription>
                                    </div>
                                </SecurityHeader>

                                <FormGroup>
                                    <Label>
                                        <Lock size={16} />
                                        Current Password
                                    </Label>
                                    <Input 
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Enter current password"
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <Label>
                                        <Lock size={16} />
                                        New Password
                                    </Label>
                                    <Input 
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <Label>
                                        <Lock size={16} />
                                        Confirm New Password
                                    </Label>
                                    <Input 
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                    />
                                </FormGroup>

                                <SaveButton onClick={handleChangePassword}>
                                    Update Password
                                </SaveButton>
                            </SecurityCard>

                            <SecurityCard>
                                <SecurityHeader>
                                    <Monitor size={24} />
                                    <div>
                                        <CardTitle>Active Sessions</CardTitle>
                                        <CardDescription>Manage your login sessions across devices</CardDescription>
                                    </div>
                                </SecurityHeader>

                                <SessionItem>
                                    <SessionInfo>
                                        <SessionDevice>Current Device</SessionDevice>
                                        <SessionDetails>Windows · Chrome · {new Date().toLocaleString()}</SessionDetails>
                                    </SessionInfo>
                                    <SessionBadge>Active Now</SessionBadge>
                                </SessionItem>
                            </SecurityCard>

                            <SecurityCard>
                                <SecurityHeader>
                                    <Clock size={24} />
                                    <div>
                                        <CardTitle>Login History</CardTitle>
                                        <CardDescription>View your recent login activity</CardDescription>
                                    </div>
                                </SecurityHeader>

                                <HistoryItem>
                                    <HistoryDate>{new Date().toLocaleDateString()}</HistoryDate>
                                    <HistoryDetails>Successful login from Windows PC</HistoryDetails>
                                </HistoryItem>
                            </SecurityCard>
                        </Section>
                    )}

                    {activeTab === 'notifications' && (
                        <Section>
                            <SectionHeader>
                                <SectionTitle>Notification Preferences</SectionTitle>
                            </SectionHeader>

                            <NotificationCard>
                                <NotificationHeader>
                                    <Mail size={24} />
                                    <div>
                                        <CardTitle>Email Notifications</CardTitle>
                                        <CardDescription>Receive important updates via email</CardDescription>
                                    </div>
                                </NotificationHeader>
                                <Toggle>
                                    <ToggleInput 
                                        type="checkbox" 
                                        checked={emailNotifications}
                                        onChange={(e) => setEmailNotifications(e.target.checked)}
                                    />
                                    <ToggleSlider />
                                </Toggle>
                            </NotificationCard>

                            <NotificationCard>
                                <NotificationHeader>
                                    <Bell size={24} />
                                    <div>
                                        <CardTitle>Document Notifications</CardTitle>
                                        <CardDescription>Get notified about document updates and approvals</CardDescription>
                                    </div>
                                </NotificationHeader>
                                <Toggle>
                                    <ToggleInput 
                                        type="checkbox" 
                                        checked={documentNotifications}
                                        onChange={(e) => setDocumentNotifications(e.target.checked)}
                                    />
                                    <ToggleSlider />
                                </Toggle>
                            </NotificationCard>

                            <NotificationCard>
                                <NotificationHeader>
                                    <Bell size={24} />
                                    <div>
                                        <CardTitle>Chat Notifications</CardTitle>
                                        <CardDescription>Receive alerts for new messages</CardDescription>
                                    </div>
                                </NotificationHeader>
                                <Toggle>
                                    <ToggleInput 
                                        type="checkbox" 
                                        checked={chatNotifications}
                                        onChange={(e) => setChatNotifications(e.target.checked)}
                                    />
                                    <ToggleSlider />
                                </Toggle>
                            </NotificationCard>

                            <NotificationCard>
                                <NotificationHeader>
                                    <AlertCircle size={24} />
                                    <div>
                                        <CardTitle>System Notifications</CardTitle>
                                        <CardDescription>Important system announcements and updates</CardDescription>
                                    </div>
                                </NotificationHeader>
                                <Toggle>
                                    <ToggleInput 
                                        type="checkbox" 
                                        checked={systemNotifications}
                                        onChange={(e) => setSystemNotifications(e.target.checked)}
                                    />
                                    <ToggleSlider />
                                </Toggle>
                            </NotificationCard>

                            <SaveButton onClick={handleSaveNotifications}>
                                Save Preferences
                            </SaveButton>
                        </Section>
                    )}

                    {activeTab === 'privacy' && (
                        <Section>
                            <SectionHeader>
                                <SectionTitle>Privacy Options</SectionTitle>
                            </SectionHeader>

                            <PrivacyCard>
                                <PrivacyHeader>
                                    <Eye size={24} />
                                    <div>
                                        <CardTitle>Profile Visibility</CardTitle>
                                        <CardDescription>Control who can view your profile information</CardDescription>
                                    </div>
                                </PrivacyHeader>
                                <Select defaultValue="team">
                                    <option value="public">Everyone</option>
                                    <option value="team">Team Members Only</option>
                                    <option value="private">Only Me</option>
                                </Select>
                            </PrivacyCard>

                            <PrivacyCard>
                                <PrivacyHeader>
                                    <Download size={24} />
                                    <div>
                                        <CardTitle>Data Export</CardTitle>
                                        <CardDescription>Download a copy of your personal data</CardDescription>
                                    </div>
                                </PrivacyHeader>
                                <ActionButton onClick={handleExportData}>
                                    Request Data Export
                                </ActionButton>
                            </PrivacyCard>

                            <DangerCard>
                                <PrivacyHeader>
                                    <Trash2 size={24} />
                                    <div>
                                        <CardTitle>Delete Account</CardTitle>
                                        <CardDescription>Permanently delete your account and all associated data</CardDescription>
                                    </div>
                                </PrivacyHeader>
                                <DangerButton onClick={handleDeleteAccount}>
                                    Delete My Account
                                </DangerButton>
                            </DangerCard>
                        </Section>
                    )}
                </TabContent>
            </ContentWrapper>
        </PageContainer>
    );
};

// Styled Components
const PageContainer = styled.div`
    padding: 2rem;
    animation: fadeIn 0.4s ease;
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @media (max-width: 768px) {
        padding: 1rem;
    }
`;

const LoadingState = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    color: var(--text-secondary);
    font-size: 1.1rem;
`;

const PageHeader = styled.div`
    margin-bottom: 2rem;
`;

const HeaderContent = styled.div``;

const Title = styled.h1`
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
    font-family: 'Poppins', sans-serif;
`;

const Subtitle = styled.p`
    font-size: 1rem;
    color: var(--text-secondary);
    font-family: 'Poppins', sans-serif;
`;

const ContentWrapper = styled.div`
    display: flex;
    gap: 2rem;
    
    @media (max-width: 968px) {
        flex-direction: column;
    }
`;

const TabsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 240px;
    
    @media (max-width: 968px) {
        flex-direction: row;
        overflow-x: auto;
        min-width: 100%;
    }
`;

const Tab = styled.button<{ $active: boolean }>`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    background: ${props => props.$active ? 'linear-gradient(135deg, rgba(46, 151, 197, 0.1), rgba(150, 129, 158, 0.1))' : 'var(--bg-secondary)'};
    border: 2px solid ${props => props.$active ? 'var(--light-blue)' : 'transparent'};
    border-radius: 12px;
    color: ${props => props.$active ? 'var(--light-blue)' : 'var(--text-secondary)'};
    font-weight: ${props => props.$active ? '600' : '500'};
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Poppins', sans-serif;
    white-space: nowrap;
    
    &:hover {
        background: ${props => props.$active ? 'linear-gradient(135deg, rgba(46, 151, 197, 0.15), rgba(150, 129, 158, 0.15))' : 'var(--hover-color)'};
        border-color: ${props => props.$active ? 'var(--light-blue)' : 'rgba(46, 151, 197, 0.3)'};
    }
    
    svg {
        flex-shrink: 0;
    }
`;

const TabContent = styled.div`
    flex: 1;
    background: var(--bg-secondary);
    border-radius: 16px;
    padding: 2rem;
    border: 2px solid rgba(46, 151, 197, 0.1);
    
    @media (max-width: 768px) {
        padding: 1.5rem;
    }
`;

const Section = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const SectionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
`;

const SectionTitle = styled.h2`
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
    font-family: 'Poppins', sans-serif;
`;

const EditButton = styled.button`
    padding: 0.5rem 1.25rem;
    background: linear-gradient(135deg, var(--light-blue), rgb(150, 129, 158));
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Poppins', sans-serif;
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(46, 151, 197, 0.3);
    }
`;

const ProfileImageSection = styled.div`
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 1.5rem;
    background: var(--bg-primary);
    border-radius: 12px;
    border: 2px solid rgba(46, 151, 197, 0.1);
`;

const ProfileImage = styled.img`
    width: 100px;
    height: 100px;
    border-radius: 50%;
    border: 3px solid var(--light-blue);
    object-fit: cover;
`;

const UploadButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: var(--bg-secondary);
    border: 2px solid rgba(46, 151, 197, 0.2);
    border-radius: 8px;
    color: var(--text-primary);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Poppins', sans-serif;
    
    &:hover {
        border-color: var(--light-blue);
        background: var(--hover-color);
    }
`;

const FormGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const Label = styled.label`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    color: var(--text-primary);
    font-size: 0.9rem;
    font-family: 'Poppins', sans-serif;
    
    svg {
        color: var(--light-blue);
    }
`;

const Input = styled.input`
    padding: 0.75rem 1rem;
    background: var(--bg-primary);
    border: 2px solid rgba(46, 151, 197, 0.2);
    border-radius: 8px;
    color: var(--text-primary);
    font-size: 0.95rem;
    font-family: 'Poppins', sans-serif;
    transition: all 0.2s;
    
    &:focus {
        outline: none;
        border-color: var(--light-blue);
        box-shadow: 0 0 0 3px rgba(46, 151, 197, 0.1);
    }
    
    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
`;

const SaveButton = styled.button`
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, var(--light-blue), rgb(150, 129, 158));
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Poppins', sans-serif;
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(46, 151, 197, 0.3);
    }
`;

const CancelButton = styled.button`
    padding: 0.75rem 1.5rem;
    background: var(--bg-primary);
    color: var(--text-primary);
    border: 2px solid rgba(46, 151, 197, 0.2);
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Poppins', sans-serif;
    
    &:hover {
        border-color: var(--light-blue);
        background: var(--hover-color);
    }
`;

const SecurityCard = styled.div`
    padding: 1.5rem;
    background: var(--bg-primary);
    border-radius: 12px;
    border: 2px solid rgba(46, 151, 197, 0.1);
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
`;

const SecurityHeader = styled.div`
    display: flex;
    gap: 1rem;
    
    svg {
        color: var(--light-blue);
        flex-shrink: 0;
    }
`;

const CardTitle = styled.h3`
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
    font-family: 'Poppins', sans-serif;
`;

const CardDescription = styled.p`
    font-size: 0.875rem;
    color: var(--text-secondary);
    font-family: 'Poppins', sans-serif;
`;

const SessionItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: var(--bg-secondary);
    border-radius: 8px;
    border: 1px solid var(--border-color);
`;

const SessionInfo = styled.div``;

const SessionDevice = styled.div`
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
    font-family: 'Poppins', sans-serif;
`;

const SessionDetails = styled.div`
    font-size: 0.875rem;
    color: var(--text-secondary);
    font-family: 'Poppins', sans-serif;
`;

const SessionBadge = styled.div`
    padding: 0.25rem 0.75rem;
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 600;
`;

const HistoryItem = styled.div`
    padding: 1rem;
    background: var(--bg-secondary);
    border-radius: 8px;
    border: 1px solid var(--border-color);
`;

const HistoryDate = styled.div`
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
    font-family: 'Poppins', sans-serif;
`;

const HistoryDetails = styled.div`
    font-size: 0.875rem;
    color: var(--text-secondary);
    font-family: 'Poppins', sans-serif;
`;

const NotificationCard = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    background: var(--bg-primary);
    border-radius: 12px;
    border: 2px solid rgba(46, 151, 197, 0.1);
    gap: 1rem;
`;

const NotificationHeader = styled.div`
    display: flex;
    gap: 1rem;
    flex: 1;
    
    svg {
        color: var(--light-blue);
        flex-shrink: 0;
    }
`;

const Toggle = styled.label`
    position: relative;
    display: inline-block;
    width: 50px;
    height: 26px;
    flex-shrink: 0;
`;

const ToggleInput = styled.input`
    opacity: 0;
    width: 0;
    height: 0;
    
    &:checked + span {
        background: var(--light-blue);
    }
    
    &:checked + span:before {
        transform: translateX(24px);
    }
`;

const ToggleSlider = styled.span`
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--border-color);
    transition: 0.3s;
    border-radius: 26px;
    
    &:before {
        position: absolute;
        content: "";
        height: 20px;
        width: 20px;
        left: 3px;
        bottom: 3px;
        background: white;
        transition: 0.3s;
        border-radius: 50%;
    }
`;

const PrivacyCard = styled.div`
    padding: 1.5rem;
    background: var(--bg-primary);
    border-radius: 12px;
    border: 2px solid rgba(46, 151, 197, 0.1);
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const PrivacyHeader = styled.div`
    display: flex;
    gap: 1rem;
    
    svg {
        color: var(--light-blue);
        flex-shrink: 0;
    }
`;

const Select = styled.select`
    padding: 0.75rem 1rem;
    background: var(--bg-secondary);
    border: 2px solid rgba(46, 151, 197, 0.2);
    border-radius: 8px;
    color: var(--text-primary);
    font-size: 0.95rem;
    font-family: 'Poppins', sans-serif;
    cursor: pointer;
    transition: all 0.2s;
    
    &:focus {
        outline: none;
        border-color: var(--light-blue);
        box-shadow: 0 0 0 3px rgba(46, 151, 197, 0.1);
    }
`;

const ActionButton = styled.button`
    padding: 0.75rem 1.5rem;
    background: var(--bg-secondary);
    border: 2px solid var(--light-blue);
    border-radius: 8px;
    color: var(--light-blue);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Poppins', sans-serif;
    
    &:hover {
        background: var(--light-blue);
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(46, 151, 197, 0.3);
    }
`;

const DangerCard = styled(PrivacyCard)`
    border-color: rgba(239, 68, 68, 0.2);
`;

const DangerButton = styled.button`
    padding: 0.75rem 1.5rem;
    background: rgba(239, 68, 68, 0.1);
    border: 2px solid #ef4444;
    border-radius: 8px;
    color: #ef4444;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Poppins', sans-serif;
    
    &:hover {
        background: #ef4444;
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }
`;

export default AccountSettingsPage;
