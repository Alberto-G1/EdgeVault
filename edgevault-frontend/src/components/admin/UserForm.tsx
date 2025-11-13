import React, { useState, useEffect } from 'react';
import type { User } from '../../types/user';

interface UserFormProps {
    userToEdit?: User | null;
    onSave: (formData: any) => void;
    onCancel: () => void;
    isLoading: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ userToEdit, onSave, onCancel, isLoading }) => {
    const isEditMode = !!userToEdit;

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        roles: ['USER'], // Default role
        enabled: true,
    });

    useEffect(() => {
        if (isEditMode && userToEdit) {
            setFormData({
                username: userToEdit.username,
                email: userToEdit.email,
                password: '', // Password is not sent for editing
                roles: userToEdit.roles.map(r => r.name),
                enabled: userToEdit.enabled,
            });
        }
    }, [userToEdit, isEditMode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedRoles = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({ ...prev, roles: selectedRoles }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="mt-1 block w-full input-style"
                    required
                    disabled={isEditMode} // Cannot change username
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full input-style"
                    required
                />
            </div>
            {!isEditMode && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="mt-1 block w-full input-style"
                        required
                        minLength={8}
                    />
                </div>
            )}
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Roles</label>
                 <select
                    name="roles"
                    multiple
                    value={formData.roles}
                    onChange={handleRoleChange}
                    className="mt-1 block w-full input-style h-24"
                    required
                 >
                    {/* In a real app, these would come from an API */}
                    <option value="USER">USER</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                 </select>
                 <p className="text-xs text-gray-500 mt-1">Hold Ctrl (or Cmd) to select multiple roles.</p>
            </div>
            {isEditMode && (
                <div className="flex items-center">
                    <input
                        id="enabled"
                        name="enabled"
                        type="checkbox"
                        checked={formData.enabled}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                    />
                     <label htmlFor="enabled" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                        Account Enabled
                    </label>
                </div>
            )}
            <div className="flex justify-end space-x-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 border border-transparent rounded-md shadow-sm hover:bg-cyan-700 disabled:bg-gray-400"
                >
                    {isLoading ? 'Saving...' : 'Save User'}
                </button>
            </div>
        </form>
    );
};

export default UserForm;