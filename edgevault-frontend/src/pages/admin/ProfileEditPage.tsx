import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyProfile, updateMyProfile, updateMyWorkProfile } from '../../api/profileService';
import type { UserProfile } from '../../types/user';
import { toast } from 'react-hot-toast';
import { ArrowLeft, User, Mail, Phone, Calendar, MapPin, Building, Upload, Key, Eye, EyeOff } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import styled from 'styled-components';
import Loader from '../../components/common/Loader';
import HoverButton from '../../components/common/HoverButton';

const ProfileEditPage: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { hasPermission } = usePermissions();

    const [personalData, setPersonalData] = useState({
        firstName: '', lastName: '', gender: '', dateOfBirth: '',
        phoneNumber: '', alternativePhoneNumber: '', email: '',
        city: '', district: '', country: '', username: '', backupRecoveryEmail: '',
        profilePictureUrl: ''
    });

    const [workData, setWorkData] = useState({
        employeeId: '', jobTitle: '', dateJoined: '', supervisorName: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getMyProfile();
                setProfile(data);
                setPersonalData({
                    firstName: data.firstName || '', lastName: data.lastName || '',
                    gender: data.gender || '', dateOfBirth: data.dateOfBirth || '',
                    phoneNumber: data.phoneNumber || '', alternativePhoneNumber: data.alternativePhoneNumber || '',
                    email: data.email || '', city: data.city || '', district: data.district || '',
                    country: data.country || '', username: data.username || '',
                    backupRecoveryEmail: data.backupRecoveryEmail || '',
                    profilePictureUrl: data.profilePictureUrl || ''
                });
                setWorkData({
                    employeeId: data.employeeId || '', jobTitle: data.jobTitle || '',
                    dateJoined: data.dateJoined || '', supervisorName: data.supervisorName || ''
                });
            } catch (error) { 
                toast.error("Failed to fetch profile data."); 
            } finally { 
                setLoading(false); 
            }
        };
        fetchProfile();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error("File is too large! Maximum size is 5MB.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setPersonalData(prev => ({ ...prev, profilePictureUrl: reader.result as string }));
            toast.success('Profile picture updated!');
        };
        reader.readAsDataURL(file);
    };

    const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setPersonalData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleWorkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setWorkData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Ensure empty string for gender is sent as null
        const personalPayload = {
            ...personalData,
            gender: personalData.gender === '' ? null : personalData.gender,
        };

        const personalPromise = updateMyProfile(personalPayload as any);
        const promises = [personalPromise];

        if (hasPermission('WORK_PROFILE_EDIT')) {
            promises.push(updateMyWorkProfile(workData as any));
        }
        
        try {
            await toast.promise(Promise.all(promises), {
                loading: 'Saving profile...',
                success: 'Profile saved successfully!',
                error: (err) => err.response?.data?.message || 'Failed to save.'
            });
            navigate('/admin/profile');
        } catch (error) {
            console.error("Save failed:", error);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    if (loading) return (
        <LoaderContainer>
            <Loader />
        </LoaderContainer>
    );

    return (
        <PageContainer>
            <FormContainer onSubmit={handleSubmit}>
                <PageHeader>
                    <HeaderContent>
                        <BackButton onClick={() => navigate('/admin/profile')}>
                            <ArrowLeft size={20} />
                        </BackButton>
                        <PageTitle>
                            <EditIcon />
                            Edit My Profile
                        </PageTitle>
                    </HeaderContent>
                    
                    <ButtonGroup>
                        <HoverButton 
                            textOne="Discard" 
                            textTwo="Cancel" 
                            onClick={() => navigate('/admin/profile')}
                            width="160px"
                            height="50px"
                        />
                        <SaveButton type="submit">
                            <div className="svg-wrapper-1">
                                <div className="svg-wrapper">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={30} height={30} className="icon">
                                        <path d="M22,15.04C22,17.23 20.24,19 18.07,19H5.93C3.76,19 2,17.23 2,15.04C2,13.07 3.43,11.44 5.31,11.14C5.28,11 5.27,10.86 5.27,10.71C5.27,9.33 6.38,8.2 7.76,8.2C8.37,8.2 8.94,8.43 9.37,8.8C10.14,7.05 11.13,5.44 13.91,5.44C17.28,5.44 18.87,8.06 18.87,10.83C18.87,10.94 18.87,11.06 18.86,11.17C20.65,11.54 22,13.13 22,15.04Z" />
                                    </svg>
                                </div>
                            </div>
                            <span>Save Changes</span>
                        </SaveButton>
                    </ButtonGroup>
                </PageHeader>

                <ContentGrid>
                    {/* Left Column - Profile Picture & Basic Info */}
                    <LeftColumn>
                        <ProfileCard>
                            <CardHeader>
                                <CardIcon style={{ background: 'rgba(255, 140, 0, 0.1)', color: '#FF8C00' }}>
                                    <User size={24} />
                                </CardIcon>
                                <CardTitle>Profile Picture</CardTitle>
                            </CardHeader>
                            
                            <ProfileImageSection>
                                <ProfileImageContainer>
                                    <ProfileImage 
                                        src={personalData.profilePictureUrl || `https://ui-avatars.com/api/?name=${personalData.firstName || personalData.username}&background=FF8C00&color=fff`}
                                        alt="Profile"
                                    />
                                </ProfileImageContainer>
                                <UploadSection>
                                    <UploadLabel htmlFor="profile-picture-upload">
                                        <Upload size={18} />
                                        Change Picture
                                    </UploadLabel>
                                    <HiddenFileInput 
                                        id="profile-picture-upload" 
                                        type="file" 
                                        onChange={handleFileChange} 
                                        accept="image/png, image/jpeg, image/webp" 
                                    />
                                    <UploadHint>PNG, JPG, WebP up to 5MB</UploadHint>
                                </UploadSection>
                            </ProfileImageSection>

                            <Separator />

                            <QuickInfoSection>
                                <InfoItem>
                                    <InfoLabel>
                                        <User size={16} />
                                        Username
                                    </InfoLabel>
                                    <InfoValue>{personalData.username}</InfoValue>
                                </InfoItem>
                                <InfoItem>
                                    <InfoLabel>
                                        <Mail size={16} />
                                        Email
                                    </InfoLabel>
                                    <InfoValue>{personalData.email}</InfoValue>
                                </InfoItem>
                            </QuickInfoSection>
                        </ProfileCard>

                        {/* Password Change Section */}
                        <PasswordCard>
                            <CardHeader>
                                <CardIcon style={{ background: 'rgba(147, 51, 234, 0.1)', color: '#9333EA' }}>
                                    <Key size={24} />
                                </CardIcon>
                                <CardTitle>Change Password</CardTitle>
                            </CardHeader>
                            
                            <PasswordForm>
                                <FormField>
                                    <Label>New Password</Label>
                                    <PasswordInput>
                                        <Input 
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter new password"
                                        />
                                        <TogglePassword onClick={togglePasswordVisibility}>
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </TogglePassword>
                                    </PasswordInput>
                                    <PasswordHint>Minimum 8 characters with letters and numbers</PasswordHint>
                                </FormField>
                                
                                <UpdatePasswordButton type="button">
                                    Update Password
                                </UpdatePasswordButton>
                            </PasswordForm>
                        </PasswordCard>
                    </LeftColumn>

                    {/* Right Column - Detailed Forms */}
                    <RightColumn>
                        {/* Personal Info Form */}
                        <FormCard>
                            <CardHeader>
                                <CardIcon style={{ background: 'rgba(255, 140, 0, 0.1)', color: '#FF8C00' }}>
                                    <User size={24} />
                                </CardIcon>
                                <CardTitle>Personal Information</CardTitle>
                            </CardHeader>

                            <FieldGrid>
                                {[
                                    { label: 'First Name', name: 'firstName', icon: <User size={16} />, type: 'text' },
                                    { label: 'Last Name', name: 'lastName', icon: <User size={16} />, type: 'text' },
                                    { label: 'Phone Number', name: 'phoneNumber', icon: <Phone size={16} />, type: 'tel' },
                                    { label: 'Alternative Phone', name: 'alternativePhoneNumber', icon: <Phone size={16} />, type: 'tel' },
                                    { label: 'City', name: 'city', icon: <MapPin size={16} />, type: 'text' },
                                    { label: 'District', name: 'district', icon: <MapPin size={16} />, type: 'text' },
                                    { label: 'Country', name: 'country', icon: <MapPin size={16} />, type: 'text' },
                                    { label: 'Backup Recovery Email', name: 'backupRecoveryEmail', icon: <Mail size={16} />, type: 'email' },
                                ].map((field) => (
                                    <FormField key={field.name}>
                                        <Label>
                                            <FieldIcon>{field.icon}</FieldIcon>
                                            {field.label}
                                        </Label>
                                        <Input 
                                            type={field.type}
                                            name={field.name}
                                            value={personalData[field.name as keyof typeof personalData] as string}
                                            onChange={handlePersonalChange}
                                            placeholder={`Enter ${field.label.toLowerCase()}`}
                                        />
                                    </FormField>
                                ))}

                                {/* Date of Birth */}
                                <FormField>
                                    <Label>
                                        <FieldIcon><Calendar size={16} /></FieldIcon>
                                        Date of Birth
                                    </Label>
                                    <Input 
                                        type="date"
                                        name="dateOfBirth"
                                        value={personalData.dateOfBirth}
                                        onChange={handlePersonalChange}
                                    />
                                </FormField>

                                {/* Gender */}
                                <FormField>
                                    <Label>
                                        <FieldIcon><User size={16} /></FieldIcon>
                                        Gender
                                    </Label>
                                    <Select 
                                        name="gender" 
                                        value={personalData.gender} 
                                        onChange={handlePersonalChange}
                                    >
                                        <option value="">Do not specify</option>
                                        <option value="MALE">Male</option>
                                        <option value="FEMALE">Female</option>
                                    </Select>
                                </FormField>
                            </FieldGrid>
                        </FormCard>

                        {/* Work Info Form (Conditional) */}
                        {hasPermission('WORK_PROFILE_EDIT') && (
                            <FormCard>
                                <CardHeader>
                                    <CardIcon style={{ background: 'rgba(147, 51, 234, 0.1)', color: '#9333EA' }}>
                                        <Building size={24} />
                                    </CardIcon>
                                    <CardTitle>Work Information</CardTitle>
                                    <CardSubtitle>Admin Editable</CardSubtitle>
                                </CardHeader>
                                
                                <FieldGrid>
                                    {[
                                        { label: 'Employee ID', name: 'employeeId', icon: <Building size={16} /> },
                                        { label: 'Job Title', name: 'jobTitle', icon: <Building size={16} /> },
                                        { label: 'Supervisor Name', name: 'supervisorName', icon: <User size={16} /> },
                                    ].map((field) => (
                                        <FormField key={field.name}>
                                            <Label>
                                                <FieldIcon>{field.icon}</FieldIcon>
                                                {field.label}
                                            </Label>
                                            <Input 
                                                name={field.name}
                                                value={workData[field.name as keyof typeof workData]}
                                                onChange={handleWorkChange}
                                                placeholder={`Enter ${field.label.toLowerCase()}`}
                                            />
                                        </FormField>
                                    ))}

                                    <FormField>
                                        <Label>
                                            <FieldIcon><Calendar size={16} /></FieldIcon>
                                            Date Joined
                                        </Label>
                                        <Input 
                                            type="date"
                                            name="dateJoined"
                                            value={workData.dateJoined}
                                            onChange={handleWorkChange}
                                        />
                                    </FormField>
                                </FieldGrid>
                            </FormCard>
                        )}
                    </RightColumn>
                </ContentGrid>
            </FormContainer>
        </PageContainer>
    );
};

// Styled Components
const LoaderContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
`;

const PageContainer = styled.div`
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

const FormContainer = styled.form`
    display: flex;
    flex-direction: column;
    gap: 2rem;
`;

const PageHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    background: linear-gradient(135deg, rgba(255, 140, 0, 0.05), rgba(147, 51, 234, 0.05));
    border-radius: 20px;
    border: 2px solid rgba(147, 51, 234, 0.1);

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 1rem;
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
    background: white;
    border: 2px solid rgba(255, 140, 0, 0.2);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FF8C00;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(255, 140, 0, 0.1);
        transform: translateX(-4px);
    }
`;

const EditIcon = styled.div`
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #FF8C00, #FF6B00);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    margin-right: 12px;

    &::before {
        content: '✏️';
        font-size: 20px;
    }
`;

const PageTitle = styled.h1`
    font-size: 1.75rem;
    font-weight: 800;
    background: linear-gradient(135deg, #FF8C00, #9333EA);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-family: 'Poppins', sans-serif;
    display: flex;
    align-items: center;
    gap: 12px;
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

const ContentGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 2rem;

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

const ProfileCard = styled.div`
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

const PasswordCard = styled.div`
    background: var(--bg-secondary);
    border: 2px solid rgba(150, 129, 158, 0.2);
    border-radius: 20px;
    padding: 1.75rem;
    box-shadow: 0 8px 24px var(--shadow);
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 32px var(--shadow);
    }
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

const CardSubtitle = styled.span`
    font-size: 0.875rem;
    font-weight: 600;
    color: #9333EA;
    background: rgba(147, 51, 234, 0.1);
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
`;

const ProfileImageSection = styled.div`
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 1.5rem;

    @media (max-width: 576px) {
        flex-direction: column;
        text-align: center;
    }
`;

const ProfileImageContainer = styled.div``;

const ProfileImage = styled.img`
    width: 120px;
    height: 120px;
    border-radius: 50%;
    border: 4px solid transparent;
    background: linear-gradient(var(--bg-secondary), var(--bg-secondary)) padding-box,
                linear-gradient(135deg, rgb(46, 151, 197), rgb(150, 129, 158)) border-box;
    object-fit: cover;
    box-shadow: 0 8px 20px rgba(46, 151, 197, 0.2);
`;

const UploadSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const UploadLabel = styled.label`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: linear-gradient(135deg, rgb(46, 151, 197), rgb(150, 129, 158));
    color: white;
    border-radius: 10px;
    font-size: 0.9375rem;
    font-weight: 600;
    font-family: 'Poppins', sans-serif;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(46, 151, 197, 0.2);

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(46, 151, 197, 0.3);
    }
`;

const HiddenFileInput = styled.input`
    display: none;
`;

const UploadHint = styled.p`
    font-size: 0.75rem;
    color: var(--text-tertiary);
    font-family: 'Poppins', sans-serif;
`;

const Separator = styled.div`
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(46, 151, 197, 0.2), rgba(150, 129, 158, 0.2), transparent);
    margin: 1.5rem 0;
`;

const QuickInfoSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const InfoItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
`;

const InfoLabel = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-tertiary);
    font-family: 'Poppins', sans-serif;
`;

const InfoValue = styled.div`
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--text-primary);
    font-family: 'Poppins', sans-serif;
    padding-left: 1.75rem;
`;

const PasswordForm = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const PasswordInput = styled.div`
    display: flex;
    gap: 0.5rem;
    align-items: center;
`;

const TogglePassword = styled.button`
    background: rgba(46, 151, 197, 0.1);
    border: 2px solid rgba(46, 151, 197, 0.2);
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgb(46, 151, 197);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(46, 151, 197, 0.2);
    }
`;

const PasswordHint = styled.p`
    font-size: 0.75rem;
    color: var(--text-tertiary);
    font-family: 'Poppins', sans-serif;
    margin-top: 0.25rem;
`;

const UpdatePasswordButton = styled.button`
    padding: 0.875rem 1.5rem;
    background: rgba(46, 151, 197, 0.1);
    border: 2px solid rgba(46, 151, 197, 0.2);
    border-radius: 10px;
    font-size: 0.9375rem;
    font-weight: 600;
    font-family: 'Poppins', sans-serif;
    color: rgb(46, 151, 197);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(46, 151, 197, 0.2);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(46, 151, 197, 0.15);
    }
`;

const FieldGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const FormField = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
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

const FieldIcon = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    background: rgba(46, 151, 197, 0.15);
    color: rgb(46, 151, 197);
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

const Select = styled.select`
    width: 100%;
    background: var(--bg-primary);
    border: 2px solid var(--border-color);
    color: var(--text-primary);
    padding: 0.875rem 1rem;
    border-radius: 10px;
    font-size: 0.9375rem;
    font-family: 'Poppins', sans-serif;
    cursor: pointer;
    transition: all 0.3s ease;

    &:focus {
        outline: none;
        border-color: rgb(46, 151, 197);
        box-shadow: 0 0 0 3px rgba(46, 151, 197, 0.1);
    }

    option {
        background: var(--bg-primary);
        color: var(--text-primary);
    }
`;

export default ProfileEditPage;