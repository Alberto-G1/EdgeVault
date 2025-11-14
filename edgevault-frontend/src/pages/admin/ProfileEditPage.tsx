import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyProfile, updateMyProfile, updateMyWorkProfile } from '../../api/profileService';
import type { UserProfile } from '../../types/user';
import { toast } from 'react-hot-toast';
import { Save, ArrowLeft } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';

const ProfileEditPage: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
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
            } catch (error) { toast.error("Failed to fetch profile data."); } 
            finally { setLoading(false); }
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

    if (loading) return <div>Loading editor...</div>;

    return (
        <div className="container mx-auto">
             <form onSubmit={handleSubmit}>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Edit My Profile</h1>
                    <div className="flex space-x-2">
                         <button type="button" onClick={() => navigate('/admin/profile')} className="btn-secondary flex items-center">
                            <ArrowLeft size={18} className="mr-2"/>Cancel
                        </button>
                        <button type="submit" className="btn-primary flex items-center">
                            <Save size={18} className="mr-2"/>Save All Changes
                        </button>
                    </div>
                </div>

                {/* Personal Info Form */}
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
                     <h2 className="text-xl font-semibold mb-4">Personal & Contact Information</h2>
                    <div className="flex items-center space-x-4 mb-6">
                        <img 
                            src={personalData.profilePictureUrl || `https://ui-avatars.com/api/?name=${personalData.firstName || personalData.username}&background=random`}
                            alt="Profile"
                            className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                        />
                        <div>
                            <label htmlFor="profile-picture-upload" className="cursor-pointer btn-secondary">Change Picture</label>
                            <input id="profile-picture-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" />
                            <p className="text-xs text-gray-500 mt-1">PNG, JPG, WebP up to 5MB.</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Username" name="username" value={personalData.username} onChange={handlePersonalChange} />
                        <InputField label="Email" name="email" value={personalData.email} onChange={handlePersonalChange} type="email" />
                        <InputField label="First Name" name="firstName" value={personalData.firstName} onChange={handlePersonalChange} />
                        <InputField label="Last Name" name="lastName" value={personalData.lastName} onChange={handlePersonalChange} />
                        <InputField label="Phone Number" name="phoneNumber" value={personalData.phoneNumber} onChange={handlePersonalChange} />
                        <InputField label="Alternative Phone (Optional)" name="alternativePhoneNumber" value={personalData.alternativePhoneNumber} onChange={handlePersonalChange} />
                        <InputField label="Date of Birth" name="dateOfBirth" value={personalData.dateOfBirth} onChange={handlePersonalChange} type="date" />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
                            <select name="gender" value={personalData.gender} onChange={handlePersonalChange} className="mt-1 block w-full input-style">
                                <option value="">Do not specify</option>
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                            </select>
                        </div>
                        <InputField label="City" name="city" value={personalData.city} onChange={handlePersonalChange} />
                        <InputField label="District" name="district" value={personalData.district} onChange={handlePersonalChange} />
                        <InputField label="Country" name="country" value={personalData.country} onChange={handlePersonalChange} />
                        <InputField label="Backup Recovery Email" name="backupRecoveryEmail" value={personalData.backupRecoveryEmail} onChange={handlePersonalChange} type="email" />
                    </div>
                </div>

                {/* Work Info Form (Conditional) */}
                {hasPermission('WORK_PROFILE_EDIT') && (
                    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4 text-orange-500">Work Information (Admin Editable)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField label="Employee ID" name="employeeId" value={workData.employeeId} onChange={handleWorkChange} />
                            <InputField label="Job Title" name="jobTitle" value={workData.jobTitle} onChange={handleWorkChange} />
                            <InputField label="Supervisor Name" name="supervisorName" value={workData.supervisorName} onChange={handleWorkChange} />
                            <InputField label="Date Joined" name="dateJoined" value={workData.dateJoined} onChange={handleWorkChange} type="date" />
                        </div>
                    </div>
                )}
             </form>
        </div>
    );
};


interface InputFieldProps {
    label: string;
    name: string;
    value: string;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
    type?: string;
    required?: boolean;
}

const InputField = ({ label, name, value, onChange, type = 'text', required = false }: InputFieldProps) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <input
            type={type}
            name={name}
            value={value || ''}
            onChange={onChange}
            className="mt-1 block w-full input-style"
            required={required}
        />
    </div>
);

export default ProfileEditPage;