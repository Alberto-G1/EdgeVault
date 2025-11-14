import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyProfile } from '../../api/profileService';
import type { UserProfile } from '../../types/user';
import { toast } from 'react-hot-toast';
import { User, Briefcase, Edit } from 'lucide-react';

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

    if (loading) return <div className="text-center p-8">Loading profile...</div>;
    if (!profile) return <div className="text-center p-8">Could not load profile data.</div>;
    
    const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">My Profile</h1>
                <button 
                    onClick={() => navigate('/admin/profile/edit')}
                    className="btn-primary flex items-center"
                >
                    <Edit size={18} className="mr-2"/>
                    Edit Profile
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Profile Picture & Main Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 text-center">
                        <img 
                            src={profile.profilePictureUrl || `https://ui-avatars.com/api/?name=${fullName || profile.username}&background=random`}
                            alt="Profile"
                            className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-cyan-500 object-cover"
                        />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{fullName || profile.username}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{profile.jobTitle || 'No title specified'}</p>
                    </div>
                     <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                        <h3 className="font-semibold text-lg mb-4 flex items-center"><User className="mr-2 text-cyan-500"/> Contact Info</h3>
                        <div className="space-y-2 text-sm">
                            <ReadOnlyField label="Username" value={profile.username} />
                            <ReadOnlyField label="Email Address" value={profile.email} />
                            <ReadOnlyField label="Phone Number" value={profile.phoneNumber} />
                        </div>
                     </div>
                </div>

                {/* Right Column - Detailed Info */}
                <div className="lg:col-span-2 space-y-6">
                     <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                        <h3 className="font-semibold text-lg mb-4 flex items-center"><Briefcase className="mr-2 text-cyan-500"/> Work Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <ReadOnlyField label="Employee ID" value={profile.employeeId} />
                            <ReadOnlyField label="Department" value={profile.departmentName} />
                            <ReadOnlyField label="Roles" value={profile.roles.join(', ')} />
                            <ReadOnlyField label="Supervisor" value={profile.supervisorName} />
                            <ReadOnlyField label="Date Joined" value={profile.dateJoined} />
                            <ReadOnlyField label="Account Status" value={profile.accountStatus} />
                        </div>
                     </div>
                      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                        <h3 className="font-semibold text-lg mb-4">Additional Information</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <ReadOnlyField label="Gender" value={profile.gender} />
                            <ReadOnlyField label="Date of Birth" value={profile.dateOfBirth} />
                            <ReadOnlyField label="Location" value={`${profile.city || ''}, ${profile.country || ''}`.replace(/^,|,$/g,'').trim() || 'N/A'} />
                            <ReadOnlyField label="Last Login" value={profile.lastLogin ? new Date(profile.lastLogin).toLocaleString() : 'Never'} />
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
};

// Reusable component for displaying fields
interface ReadOnlyFieldProps {
    label: string;
    value?: string;
}

const ReadOnlyField = ({ label, value }: ReadOnlyFieldProps) => (
    <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{label}</label>
        <p className="mt-1 text-gray-900 dark:text-gray-100">{value || <span className="italic text-gray-400">Not Set</span>}</p>
    </div>
);


export default ProfilePage;