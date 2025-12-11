import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getMyProfile } from '../../api/profileService';
import type { UserProfile } from '../../types/user';
import ThemeToggleButton from '../common/ThemeToggleButton';
import SearchBar from '../common/SearchBar';
import NotificationDropdown from '../common/NotificationDropdown';
import ExpandableButton from '../common/ExpandableButton';
import { Link } from 'react-router-dom';
import { User, ChevronDown, Settings, HelpCircle, Info } from 'lucide-react';
import styled from 'styled-components';

const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const getUserInitials = (username?: string) => {
        if (!username) return 'AD';
        return username.substring(0, 2).toUpperCase();
    };

    // Fetch user profile
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const profile = await getMyProfile();
                setUserProfile(profile);
            } catch (error) {
                console.error('Failed to fetch user profile:', error);
            }
        };
        fetchUserProfile();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setProfileDropdownOpen(false);
            }
        };

        if (profileDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [profileDropdownOpen]);

    const logoutIcon = (
        <svg viewBox="0 0 512 512">
            <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z" />
        </svg>
    );

    const toggleDropdown = (e: React.MouseEvent) => {
        e.stopPropagation();
        setProfileDropdownOpen(!profileDropdownOpen);
    };

    return (
        <HeaderContainer>
            <SearchSection>
                <SearchBar />
            </SearchSection>

            <HeaderControls>
                <ThemeToggleButton />
                
                <NotificationDropdown />
                
                <ProfileDropdown 
                    ref={dropdownRef}
                    className={profileDropdownOpen ? 'active' : ''}
                >
                    <ProfileTrigger onClick={toggleDropdown}>
                        <UserAvatar
                            src={userProfile?.profilePictureUrl || `https://ui-avatars.com/api/?name=${user?.sub}&background=2E97C5&color=fff`}
                            alt="Profile"
                        />
                        <UserInfo>
                            <UserName>{user?.sub || 'Admin User'}</UserName>
                            <UserRole>System Administrator</UserRole>
                        </UserInfo>
                        <DropdownArrow>
                            <ChevronDown size={14} />
                        </DropdownArrow>
                    </ProfileTrigger>
                    
                    <DropdownMenu>
                        <DropdownHeader>
                            <UserName>{user?.sub || 'Admin User'}</UserName>
                            <UserRole>{user?.email || 'admin@edgevault.com'}</UserRole>
                        </DropdownHeader>
                        
                        <DropdownList>
                            <li>
                                <Link to="/admin/profile" onClick={() => setProfileDropdownOpen(false)}>
                                    <User size={18} /> My Profile
                                </Link>
                            </li>
                            <li>
                                <Link to="/admin/profile" onClick={() => setProfileDropdownOpen(false)}>
                                    <Settings size={18} /> Account Settings
                                </Link>
                            </li>
                        </DropdownList>
                        
                        <DropdownDivider />
                        
                        <DropdownList>
                            <li>
                                <a href="#" onClick={(e) => { e.preventDefault(); setProfileDropdownOpen(false); }}>
                                    <HelpCircle size={18} /> Help & Support
                                </a>
                            </li>
                            <li>
                                <a href="#" onClick={(e) => { e.preventDefault(); setProfileDropdownOpen(false); }}>
                                    <Info size={18} /> About EdgeVault
                                </a>
                            </li>
                        </DropdownList>
                        
                        <DropdownDivider />
                    </DropdownMenu>
                </ProfileDropdown>

                <ExpandableButton 
                    icon={logoutIcon}
                    text="Logout"
                    onClick={logout}
                    bgColor="rgb(231, 76, 60)"
                    hoverWidth="125px"
                />
            </HeaderControls>
        </HeaderContainer>
    );
};

const HeaderContainer = styled.header`
    background-color: var(--sidebar-bg);
    height: 90px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 40px;
    box-shadow: 0 2px 10px var(--shadow);
    border-bottom: 1px solid var(--border-color);
    font-family: 'Poppins', sans-serif;
    position: sticky;
    top: 0;
    z-index: 100;

    @media (max-width: 768px) {
        padding: 0 20px;
        height: 70px;
    }
`;

const SearchSection = styled.div`
    flex: 1;
    max-width: 500px;

    @media (max-width: 768px) {
        max-width: 300px;
    }

    @media (max-width: 576px) {
        display: none;
    }
`;

const HeaderControls = styled.div`
    display: flex;
    align-items: center;
    gap: 25px;

    @media (max-width: 768px) {
        gap: 15px;
    }
`;

const ProfileTrigger = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    padding: 5px;
    border-radius: 8px;
    transition: background-color 0.2s;

    &:hover {
        background-color: var(--bg-primary);
    }
`;

const UserAvatar = styled.img`
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: 3px solid rgba(46, 151, 197, 0.2);
    box-shadow: 0 4px 12px rgba(46, 151, 197, 0.15);
    object-fit: cover;
    background: linear-gradient(135deg, var(--light-blue), var(--purple));

    @media (max-width: 768px) {
        width: 40px;
        height: 40px;
    }
`;

const UserInfo = styled.div`
    display: flex;
    flex-direction: column;

    @media (max-width: 768px) {
        display: none;
    }
`;

const UserName = styled.div`
    font-weight: 600;
    font-size: 15px;
    color: var(--text-primary);
`;

const UserRole = styled.div`
    font-size: 13px;
    color: var(--text-secondary);
`;

const DropdownArrow = styled.div`
    color: var(--text-secondary);
    font-size: 12px;
    transition: transform 0.3s;
    display: flex;
    align-items: center;

    @media (max-width: 768px) {
        display: none;
    }
`;

const DropdownMenu = styled.div`
    position: absolute;
    top: 100%;
    right: 0;
    width: 260px;
    background-color: var(--bg-secondary);
    border-radius: 10px;
    box-shadow: 0 5px 20px var(--shadow);
    border: 1px solid var(--border-color);
    padding: 10px 0;
    margin-top: 10px;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: all 0.3s;
    z-index: 1001;
`;

const DropdownHeader = styled.div`
    padding: 15px 20px;
    border-bottom: 1px solid var(--border-color);
`;

const DropdownList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;

    li {
        padding: 0;
    }

    a, button {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 20px;
        color: var(--text-primary);
        text-decoration: none;
        transition: background-color 0.2s;
        width: 100%;
        border: none;
        background: none;
        cursor: pointer;
        font-family: 'Poppins', sans-serif;
        font-size: 14px;

        &:hover {
            background-color: var(--bg-primary);
        }

        svg {
            color: var(--text-secondary);
        }
    }
`;

const DropdownDivider = styled.div`
    height: 1px;
    background-color: var(--border-color);
    margin: 10px 0;
`;

const ProfileDropdown = styled.div`
    position: relative;

    &.active ${DropdownArrow} {
        transform: rotate(180deg);
    }

    &.active ${DropdownMenu} {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
    }
`;

export default Header;