import React, { useState, useEffect } from 'react';
import type { User, Department } from '../../types/user';
import { getAllDepartments } from '../../api/departmentService';
import { toast } from 'react-hot-toast';

interface UserFormProps {
    userToEdit?: User | null;
    onSave: (formData: any) => void;
    onCancel: () => void;
    isLoading: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ userToEdit, onSave, onCancel, isLoading }) => {
    const isEditMode = !!userToEdit;
    const [departments, setDepartments] = useState<Department[]>([]);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        roles: ['USER'],
        enabled: true,
        departmentId: '', // Stored as a string for the select input value
    });

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const data = await getAllDepartments();
                setDepartments(data);
                if (!isEditMode && data.length > 0) {
                    // Set a default department for new users if one isn't already set
                    setFormData(prev => ({ ...prev, departmentId: String(data[0].id) }));
                }
            } catch (error) {
                toast.error("Could not load departments for the form.");
            }
        };
        fetchDepartments();
    }, [isEditMode]);

    useEffect(() => {
        if (isEditMode && userToEdit && departments.length > 0) {
            // Find the department ID that matches the user's department name
            const userDept = departments.find(d => d.name === userToEdit.departmentName);
            setFormData({
                username: userToEdit.username,
                email: userToEdit.email,
                password: '', // Password is not sent back for editing
                roles: userToEdit.roles.map(r => r.name),
                enabled: userToEdit.enabled,
                departmentId: userDept ? String(userDept.id) : '',
            });
        }
    }, [userToEdit, isEditMode, departments]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        setFormData(prev => ({
            ...prev,
            [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value,
        }));
    };
    
    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedRoles = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({ ...prev, roles: selectedRoles }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Convert departmentId back to a number before saving
        onSave({ ...formData, departmentId: Number(formData.departmentId) });
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
                    disabled={isEditMode}
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
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
                 <select
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleChange}
                    className="mt-1 block w-full input-style"
                    required
                 >
                    <option value="" disabled>Select a department</option>
                    {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                 </select>
            </div>
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
                <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={isLoading} className="btn-primary">
                    {isLoading ? 'Saving...' : 'Save User'}
                </button>
            </div>
        </form>
    );
};

export default UserForm;