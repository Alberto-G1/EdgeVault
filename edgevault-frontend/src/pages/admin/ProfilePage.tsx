import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyProfile } from '../../api/profileService';
import type { UserProfile } from '../../types/user';
import { toast } from 'react-hot-toast';
import { User, Briefcase, Mail, Phone, Calendar, MapPin, Building, Shield, Clock, Award, Activity, Globe, Star } from 'lucide-react';
import styled from 'styled-components';
import Loader from '../../components/common/Loader';
import HoverButton from '../../components/common/HoverButton';

const ProfilePage: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getMyProfile();
                setProfile(data);
            } catch (error) {
                toast.error("Failed to fetch profile data.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return (
        <LoaderContainer>
            <Loader />
        </LoaderContainer>
    );
    
    if (!profile) return (
        <ErrorContainer>
            <ErrorText>Could not load profile data.</ErrorText>
        </ErrorContainer>
    );
    
    const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();

    return (
        <PageContainer>
            <PageHeader>
                <HeaderContent>
                    <PageTitle>
                        <ProfileIcon />
                        My Profile
                    </PageTitle>
                    <PageSubtitle>View and manage your profile information</PageSubtitle>
                </HeaderContent>
                
                <HoverButton 
                    textOne="Edit Profile" 
                    textTwo="Edit Profile" 
                    onClick={() => navigate('/admin/profile/edit')}
                    width="160px"
                    height="50px"
                />
            </PageHeader>

            <ProfileGrid>
                {/* Left Column - Profile Card */}
                <LeftColumn>
                    <ProfileCard>
                        <ProfileImageContainer>
                            <ProfileImage 
                                src={profile.profilePictureUrl || `https://ui-avatars.com/api/?name=${fullName || profile.username}&background=FF8C00&color=fff`}
                                alt="Profile"
                            />
                            <ProfileBadge>
                                <Award size={16} />
                                Member
                            </ProfileBadge>
                        </ProfileImageContainer>
                        
                        <ProfileInfo>
                            <ProfileName>{fullName || profile.username}</ProfileName>
                            <ProfileTitle>{profile.jobTitle || 'No title specified'}</ProfileTitle>
                            <ProfileDepartment>{profile.departmentName || 'No department'}</ProfileDepartment>
                        </ProfileInfo>

                        <ProfileStats>
                            <StatItem>
                                <StatIcon style={{ background: 'rgba(46, 151, 197, 0.1)', color: 'rgb(46, 151, 197)' }}>
                                    <Activity size={16} />
                                </StatIcon>
                                <StatContent>
                                    <StatLabel>Status</StatLabel>
                                    <StatValue active={profile.accountStatus === 'ACTIVE'}>
                                        {profile.accountStatus || 'UNKNOWN'}
                                    </StatValue>
                                </StatContent>
                            </StatItem>
                            <StatItem>
                                <StatIcon style={{ background: 'rgba(150, 129, 158, 0.1)', color: 'rgb(150, 129, 158)' }}>
                                    <Clock size={16} />
                                </StatIcon>
                                <StatContent>
                                    <StatLabel>Last Login</StatLabel>
                                    <StatValue>
                                        {profile.lastLogin ? new Date(profile.lastLogin).toLocaleDateString() : 'Never'}
                                    </StatValue>
                                </StatContent>
                            </StatItem>
                        </ProfileStats>
                    </ProfileCard>

                    {/* Contact Card */}
                    <InfoCard>
                        <CardHeader>
                            <CardIcon style={{ background: 'rgba(46, 151, 197, 0.1)', color: 'rgb(46, 151, 197)' }}>
                                <Mail size={24} />
                            </CardIcon>
                            <CardTitle>Contact Info</CardTitle>
                        </CardHeader>
                        
                        <ContactList>
                            <ContactItem>
                                <ContactIcon style={{ background: 'rgba(46, 151, 197, 0.1)', color: 'rgb(46, 151, 197)' }}>
                                    <Mail size={16} />
                                </ContactIcon>
                                <ContactContent>
                                    <ContactLabel>Email</ContactLabel>
                                    <ContactValue>{profile.email}</ContactValue>
                                </ContactContent>
                            </ContactItem>
                            
                            <ContactItem>
                                <ContactIcon style={{ background: 'rgba(150, 129, 158, 0.1)', color: 'rgb(150, 129, 158)' }}>
                                    <Phone size={16} />
                                </ContactIcon>
                                <ContactContent>
                                    <ContactLabel>Phone</ContactLabel>
                                    <ContactValue>{profile.phoneNumber || 'Not set'}</ContactValue>
                                </ContactContent>
                            </ContactItem>
                            
                            {profile.alternativePhoneNumber && (
                                <ContactItem>
                                    <ContactIcon style={{ background: 'rgba(46, 151, 197, 0.1)', color: 'rgb(46, 151, 197)' }}>
                                        <Phone size={16} />
                                    </ContactIcon>
                                    <ContactContent>
                                        <ContactLabel>Alt Phone</ContactLabel>
                                        <ContactValue>{profile.alternativePhoneNumber}</ContactValue>
                                    </ContactContent>
                                </ContactItem>
                            )}
                            
                            <ContactItem>
                                <ContactIcon style={{ background: 'rgba(150, 129, 158, 0.1)', color: 'rgb(150, 129, 158)' }}>
                                    <MapPin size={16} />
                                </ContactIcon>
                                <ContactContent>
                                    <ContactLabel>Location</ContactLabel>
                                    <ContactValue>
                                        {`${profile.city || ''}${profile.city && profile.country ? ', ' : ''}${profile.country || ''}` || 'Not set'}
                                    </ContactValue>
                                </ContactContent>
                            </ContactItem>
                        </ContactList>
                    </InfoCard>
                </LeftColumn>

                {/* Right Column - Detailed Info */}
                <RightColumn>
                    {/* Work Information Card */}
                    <InfoCard>
                        <CardHeader>
                            <CardIcon style={{ background: 'rgba(150, 129, 158, 0.1)', color: 'rgb(150, 129, 158)' }}>
                                <Briefcase size={24} />
                            </CardIcon>
                            <CardTitle>Work Information</CardTitle>
                        </CardHeader>
                        
                        <DetailGrid>
                            <DetailItem>
                                <DetailIcon style={{ background: 'rgba(150, 129, 158, 0.1)', color: 'rgb(150, 129, 158)' }}>
                                    <Building size={18} />
                                </DetailIcon>
                                <DetailContent>
                                    <DetailLabel>Employee ID</DetailLabel>
                                    <DetailValue>{profile.employeeId || 'Not set'}</DetailValue>
                                </DetailContent>
                            </DetailItem>
                            
                            <DetailItem>
                                <DetailIcon style={{ background: 'rgba(46, 151, 197, 0.1)', color: 'rgb(46, 151, 197)' }}>
                                    <Building size={18} />
                                </DetailIcon>
                                <DetailContent>
                                    <DetailLabel>Department</DetailLabel>
                                    <DetailValue>{profile.departmentName || 'Not set'}</DetailValue>
                                </DetailContent>
                            </DetailItem>
                            
                            <DetailItem>
                                <DetailIcon style={{ background: 'rgba(150, 129, 158, 0.1)', color: 'rgb(150, 129, 158)' }}>
                                    <Shield size={18} />
                                </DetailIcon>
                                <DetailContent>
                                    <DetailLabel>Roles</DetailLabel>
                                    <RoleList>
                                        {profile.roles.map((role, index) => (
                                            <RoleTag key={index} style={{ 
                                                background: index % 2 === 0 ? 'rgba(46, 151, 197, 0.1)' : 'rgba(150, 129, 158, 0.1)',
                                                color: index % 2 === 0 ? 'rgb(46, 151, 197)' : 'rgb(150, 129, 158)'
                                            }}>
                                                {role}
                                            </RoleTag>
                                        ))}
                                    </RoleList>
                                </DetailContent>
                            </DetailItem>
                            
                            <DetailItem>
                                <DetailIcon style={{ background: 'rgba(46, 151, 197, 0.1)', color: 'rgb(46, 151, 197)' }}>
                                    <User size={18} />
                                </DetailIcon>
                                <DetailContent>
                                    <DetailLabel>Supervisor</DetailLabel>
                                    <DetailValue>{profile.supervisorName || 'Not set'}</DetailValue>
                                </DetailContent>
                            </DetailItem>
                            
                            <DetailItem>
                                <DetailIcon style={{ background: 'rgba(150, 129, 158, 0.1)', color: 'rgb(150, 129, 158)' }}>
                                    <Calendar size={18} />
                                </DetailIcon>
                                <DetailContent>
                                    <DetailLabel>Date Joined</DetailLabel>
                                    <DetailValue>{profile.dateJoined || 'Not set'}</DetailValue>
                                </DetailContent>
                            </DetailItem>
                            
                            <DetailItem>
                                <DetailIcon style={{ background: 'rgba(46, 151, 197, 0.1)', color: 'rgb(46, 151, 197)' }}>
                                    <Star size={18} />
                                </DetailIcon>
                                <DetailContent>
                                    <DetailLabel>Job Title</DetailLabel>
                                    <DetailValue>{profile.jobTitle || 'Not set'}</DetailValue>
                                </DetailContent>
                            </DetailItem>
                        </DetailGrid>
                    </InfoCard>

                    {/* Personal Information Card */}
                    <InfoCard>
                        <CardHeader>
                            <CardIcon style={{ background: 'rgba(46, 151, 197, 0.1)', color: 'rgb(46, 151, 197)' }}>
                                <User size={24} />
                            </CardIcon>
                            <CardTitle>Personal Information</CardTitle>
                        </CardHeader>
                        
                        <DetailGrid>
                            <DetailItem>
                                <DetailIcon style={{ background: 'rgba(46, 151, 197, 0.1)', color: 'rgb(46, 151, 197)' }}>
                                    <User size={18} />
                                </DetailIcon>
                                <DetailContent>
                                    <DetailLabel>Username</DetailLabel>
                                    <DetailValue>{profile.username}</DetailValue>
                                </DetailContent>
                            </DetailItem>
                            
                            <DetailItem>
                                <DetailIcon style={{ background: 'rgba(150, 129, 158, 0.1)', color: 'rgb(150, 129, 158)' }}>
                                    <User size={18} />
                                </DetailIcon>
                                <DetailContent>
                                    <DetailLabel>Gender</DetailLabel>
                                    <DetailValue>{profile.gender || 'Not specified'}</DetailValue>
                                </DetailContent>
                            </DetailItem>
                            
                            <DetailItem>
                                <DetailIcon style={{ background: 'rgba(46, 151, 197, 0.1)', color: 'rgb(46, 151, 197)' }}>
                                    <Calendar size={18} />
                                </DetailIcon>
                                <DetailContent>
                                    <DetailLabel>Date of Birth</DetailLabel>
                                    <DetailValue>{profile.dateOfBirth || 'Not set'}</DetailValue>
                                </DetailContent>
                            </DetailItem>
                            
                            <DetailItem>
                                <DetailIcon style={{ background: 'rgba(150, 129, 158, 0.1)', color: 'rgb(150, 129, 158)' }}>
                                    <Globe size={18} />
                                </DetailIcon>
                                <DetailContent>
                                    <DetailLabel>Country</DetailLabel>
                                    <DetailValue>{profile.country || 'Not set'}</DetailValue>
                                </DetailContent>
                            </DetailItem>
                            
                            {profile.backupRecoveryEmail && (
                                <DetailItem>
                                    <DetailIcon style={{ background: 'rgba(46, 151, 197, 0.1)', color: 'rgb(46, 151, 197)' }}>
                                        <Mail size={18} />
                                    </DetailIcon>
                                    <DetailContent>
                                        <DetailLabel>Backup Email</DetailLabel>
                                        <DetailValue>{profile.backupRecoveryEmail}</DetailValue>
                                    </DetailContent>
                                </DetailItem>
                            )}
                        </DetailGrid>
                    </InfoCard>
                </RightColumn>
            </ProfileGrid>
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

const ErrorContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
`;

const ErrorText = styled.div`
    font-size: 1.125rem;
    color: #718096;
    font-family: 'Poppins', sans-serif;
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

const PageHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
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
    flex-direction: column;
    gap: 0.5rem;
`;

const ProfileIcon = styled.div`
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #9333EA, #7C3AED);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    margin-right: 12px;

    &::before {
        content: '👤';
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
`;

const PageSubtitle = styled.p`
    font-size: 0.9375rem;
    color: var(--text-secondary);
    font-family: 'Poppins', sans-serif;
    margin-left: 52px;
`;

const ProfileGrid = styled.div`
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
    padding: 2rem;
    text-align: center;
    box-shadow: 0 8px 24px var(--shadow);
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 32px var(--shadow);
    }
`;

const ProfileImageContainer = styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    margin-bottom: 1.5rem;
`;

const ProfileImage = styled.img`
    width: 140px;
    height: 140px;
    border-radius: 50%;
    border: 4px solid transparent;
    background: linear-gradient(var(--bg-secondary), var(--bg-secondary)) padding-box,
                linear-gradient(135deg, rgb(46, 151, 197), rgb(150, 129, 158)) border-box;
    object-fit: cover;
    box-shadow: 0 8px 20px rgba(46, 151, 197, 0.2);
`;

const ProfileBadge = styled.div`
    position: absolute;
    bottom: 0;
    right: calc(50% - 60px);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, rgb(46, 151, 197), rgb(150, 129, 158));
    color: white;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    font-family: 'Poppins', sans-serif;
`;

const ProfileInfo = styled.div`
    margin-bottom: 1.5rem;
`;

const ProfileName = styled.h2`
    font-size: 1.75rem;
    font-weight: 800;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
    font-family: 'Poppins', sans-serif;
`;

const ProfileTitle = styled.p`
    font-size: 1rem;
    color: rgb(150, 129, 158);
    font-weight: 600;
    margin-bottom: 0.25rem;
    font-family: 'Poppins', sans-serif;
`;

const ProfileDepartment = styled.p`
    font-size: 0.875rem;
    color: var(--text-secondary);
    font-family: 'Poppins', sans-serif;
`;

const ProfileStats = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
`;

const StatItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const StatIcon = styled.div`
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const StatContent = styled.div`
    flex: 1;
    text-align: left;
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

const StatValue = styled.div<{ active?: boolean }>`
    font-size: 0.9375rem;
    font-weight: 600;
    color: ${props => props.active ? '#10B981' : 'var(--text-primary)'};
    font-family: 'Poppins', sans-serif;
`;

const InfoCard = styled.div`
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

const CardTitle = styled.h3`
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary);
    font-family: 'Poppins', sans-serif;
`;

const ContactList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const ContactItem = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    transition: all 0.3s ease;

    &:hover {
        transform: translateX(4px);
        box-shadow: 0 4px 12px var(--shadow);
    }
`;

const ContactIcon = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const ContactContent = styled.div`
    flex: 1;
`;

const ContactLabel = styled.div`
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.25rem;
    font-family: 'Poppins', sans-serif;
`;

const ContactValue = styled.div`
    font-size: 0.9375rem;
    font-weight: 500;
    color: var(--text-primary);
    font-family: 'Poppins', sans-serif;
`;

const DetailGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const DetailItem = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px var(--shadow);
    }
`;

const DetailIcon = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
`;

const DetailContent = styled.div`
    flex: 1;
`;

const DetailLabel = styled.div`
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.5rem;
    font-family: 'Poppins', sans-serif;
`;

const DetailValue = styled.div`
    font-size: 0.9375rem;
    font-weight: 500;
    color: var(--text-primary);
    font-family: 'Poppins', sans-serif;
`;

const RoleList = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
`;

const RoleTag = styled.span`
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    font-family: 'Poppins', sans-serif;
`;

export default ProfilePage;