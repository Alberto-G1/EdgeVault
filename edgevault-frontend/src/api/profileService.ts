import apiClient from './axiosConfig';
import type { UserProfile } from '../types/user';

// Corresponds to UpdateProfileRequestDto
interface UpdateProfilePayload {
    firstName?: string;
    lastName?: string;
    gender?: 'MALE' | 'FEMALE';
    dateOfBirth?: string;
    phoneNumber?: string;
    alternativePhoneNumber?: string;
    email: string;
    city?: string;
    district?: string;
    country?: string;
    username: string;
    backupRecoveryEmail?: string;
    profilePictureUrl?: string;
}

interface UpdateWorkProfilePayload {
    employeeId?: string;
    jobTitle?: string;
    dateJoined?: string;
    supervisorName?: string;
}

interface ChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
}

export const getMyProfile = async (): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>('/profile/me');
    return response.data;
};

export const updateMyProfile = async (profileData: UpdateProfilePayload): Promise<UserProfile> => {
    const response = await apiClient.put<UserProfile>('/profile/me', profileData);
    return response.data;
};

export const updateMyWorkProfile = async (workProfileData: UpdateWorkProfilePayload): Promise<UserProfile> => {
    const response = await apiClient.put<UserProfile>('/profile/me/work-info', workProfileData);
    return response.data;
};

export const changeMyPassword = async (passwordData: ChangePasswordPayload): Promise<void> => {
    await apiClient.post('/profile/change-password', passwordData);
};