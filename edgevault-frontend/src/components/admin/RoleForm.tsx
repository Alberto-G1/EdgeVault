import React, { useState, useEffect } from 'react';
import type { Role } from '../../types/user';
import { getAllPermissions } from '../../api/permissionService';
import { toast } from 'react-hot-toast';

interface RoleFormProps {
    roleToEdit?: Role | null;
    onSave: (formData: any) => void;
    onCancel: () => void;
    isLoading: boolean;
}

const RoleForm: React.FC<RoleFormProps> = ({ roleToEdit, onSave, onCancel, isLoading }) => {
    const [name, setName] = useState('');
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [availablePermissions, setAvailablePermissions] = useState<string[]>([]);

    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const perms = await getAllPermissions();
                setAvailablePermissions(perms);
            } catch (error) {
                toast.error("Failed to load permissions.");
            }
        };
        fetchPermissions();
    }, []);

    useEffect(() => {
        if (roleToEdit) {
            setName(roleToEdit.name);
            setSelectedPermissions(roleToEdit.permissions);
        } else {
            setName('');
            setSelectedPermissions([]);
        }
    }, [roleToEdit]);

    const handlePermissionToggle = (permission: string) => {
        setSelectedPermissions(prev =>
            prev.includes(permission)
                ? prev.filter(p => p !== permission)
                : [...prev, permission]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, permissions: selectedPermissions });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full input-style"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Permissions</label>
                <div className="mt-2 p-3 border dark:border-gray-600 rounded-md h-60 overflow-y-auto grid grid-cols-2 gap-2">
                    {availablePermissions.map(permission => (
                        <div key={permission} className="flex items-center">
                            <input
                                id={permission}
                                type="checkbox"
                                checked={selectedPermissions.includes(permission)}
                                onChange={() => handlePermissionToggle(permission)}
                                className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                            />
                            <label htmlFor={permission} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                {permission}
                            </label>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={isLoading} className="btn-primary">
                    {isLoading ? 'Saving...' : 'Save Role'}
                </button>
            </div>
        </form>
    );
};

export default RoleForm;