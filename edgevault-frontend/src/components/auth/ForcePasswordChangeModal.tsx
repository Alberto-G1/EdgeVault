import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { changeMyPassword } from '../../api/profileService';
import { Lock } from 'lucide-react';

const ForcePasswordChangeModal: React.FC = () => {
    const { fulfillPasswordChange } = useAuth();
    const { showSuccess, showError } = useToast();
    const [passwordData, setPasswordData] = useState({
        currentPassword: 'Default@123U', // Pre-fill with the default
        newPassword: '',
        confirmPassword: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showError('Password Mismatch', 'New passwords do not match.');
            return;
        }
        if (passwordData.newPassword === 'Default@123U') {
            showError('Invalid Password', 'New password cannot be the same as the default password.');
            return;
        }
        setIsSubmitting(true);
        try {
            await changeMyPassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            showSuccess('Success', 'Password updated successfully! You can now use the system.');
            fulfillPasswordChange(); // This will close the modal
        } catch (error: any) {
            showError('Error', error.response?.data?.message || 'Failed to update password.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-80">
            <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-2xl">
                <div className="text-center">
                    <Lock size={48} className="mx-auto text-cyan-500"/>
                    <h1 className="text-2xl font-bold mt-4 text-gray-800 dark:text-gray-100">
                        Update Your Password
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        For your security, you must change your temporary password before you can continue.
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Current Password</label>
                        <input
                            type="password"
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handleChange}
                            className="mt-1 input-style"
                            required
                            disabled // User should not change the default password input
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">New Password</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handleChange}
                            className="mt-1 input-style"
                            required
                            minLength={8}
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Confirm New Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handleChange}
                            className="mt-1 input-style"
                            required
                        />
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full btn-primary">
                        {isSubmitting ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForcePasswordChangeModal;