import React, { useState, useEffect } from 'react';
import type { User, Department, Role } from '../../types/user';
import { getAllDepartments } from '../../api/departmentService';
import { getAllRoles } from '../../api/roleService';
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
    const [availableRoles, setAvailableRoles] = useState<Role[]>([]);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        roles: ['Department User'], // Sensible default
        enabled: true,
        departmentId: '', 
    });

    useEffect(() => {
        const fetchFormData = async () => {
            try {
                const [depts, roles] = await Promise.all([
                    getAllDepartments(),
                    getAllRoles()
                ]);
                setDepartments(depts);
                setAvailableRoles(roles);

                if (!isEditMode && depts.length > 0) {
                    setFormData(prev => ({ ...prev, departmentId: String(depts[0].id) }));
                }
            } catch (error) {
                toast.error("Could not load form data (roles/departments).");
            }
        };
        fetchFormData();
    }, [isEditMode]);

    useEffect(() => {
        if (isEditMode && userToEdit && departments.length > 0) {
            const userDept = departments.find(d => d.name === userToEdit.departmentName);
            setFormData({
                username: userToEdit.username,
                email: userToEdit.email,
                password: '',
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
            {/* Password field is now hidden for create, as it uses a default */}
            
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
                    {availableRoles.map(role => (
                        <option key={role.id} value={role.name}>{role.name}</option>
                    ))}
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