import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { getRoleById, createRole, updateRole } from '../../api/roleService';
import { getAllPermissions } from '../../api/permissionService';
import { toast } from 'react-hot-toast';
import { Save, ArrowLeft } from 'lucide-react';
import type { Role } from '../../types/user';

const RoleFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { theme } = useTheme(); // For conditional styling if needed
    
    const isEditMode = !!id;
    const [role, setRole] = useState<Role | null>(null);
    const [name, setName] = useState('');
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [availablePermissions, setAvailablePermissions] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const perms = await getAllPermissions();
                setAvailablePermissions(perms);

                if (isEditMode) {
                    const roleData = await getRoleById(Number(id));
                    setRole(roleData);
                    setName(roleData.name);
                    setSelectedPermissions(roleData.permissions);
                }
            } catch (error) {
                toast.error("Failed to load data. Redirecting...");
                navigate('/admin/roles');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, isEditMode, navigate]);

    const groupedPermissions = useMemo(() => {
        const groups: { [key: string]: string[] } = {};
        availablePermissions.forEach(p => {
            const module = p.split('_')[0]; // e.g., USER from USER_CREATE
            if (!groups[module]) {
                groups[module] = [];
            }
            groups[module].push(p);
        });
        return groups;
    }, [availablePermissions]);
    
    const handlePermissionToggle = (permission: string) => {
        setSelectedPermissions(prev =>
            prev.includes(permission)
                ? prev.filter(p => p !== permission)
                : [...prev, permission]
        );
    };

    const handleSelectAllModule = (module: string, permissions: string[]) => {
        const modulePermissionsInSelection = selectedPermissions.filter(p => p.startsWith(module));
        
        if (modulePermissionsInSelection.length === permissions.length) {
            // All are selected, so deselect all
            setSelectedPermissions(prev => prev.filter(p => !p.startsWith(module)));
        } else {
            // Some or none are selected, so select all
            setSelectedPermissions(prev => [...prev.filter(p => !p.startsWith(module)), ...permissions]);
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const roleData = { name, permissions: selectedPermissions };

        const promise = isEditMode
            ? updateRole(Number(id), roleData)
            : createRole(roleData);

        try {
            await toast.promise(promise, {
                loading: 'Saving role...',
                success: `Role ${isEditMode ? 'updated' : 'created'} successfully!`,
                error: (err) => err.response?.data?.message || 'Failed to save role.',
            });
            navigate('/admin/roles');
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (loading) return <div>Loading role details...</div>;

    return (
        <div className="container mx-auto">
             <form onSubmit={handleSubmit}>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                            {isEditMode ? `Edit Role: ${role?.name}` : 'Create New Role'}
                        </h1>
                    </div>
                    <div className="flex space-x-2">
                        <button type="button" onClick={() => navigate('/admin/roles')} className="btn-secondary flex items-center">
                            <ArrowLeft size={18} className="mr-2"/>
                            Back
                        </button>
                        <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center">
                            <Save size={18} className="mr-2"/>
                            {isSubmitting ? 'Saving...' : 'Save Role'}
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full max-w-md input-style"
                            required
                        />
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Permissions</h2>
                        <div className="space-y-6">
                            {Object.entries(groupedPermissions).map(([module, permissions]) => (
                                <div key={module} className="p-4 border dark:border-gray-600 rounded-lg">
                                    <div className="flex items-center mb-3">
                                        <input
                                            type="checkbox"
                                            id={`select-all-${module}`}
                                            className="h-5 w-5 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                                            onChange={() => handleSelectAllModule(module, permissions)}
                                            checked={permissions.every(p => selectedPermissions.includes(p))}
                                        />
                                        <label htmlFor={`select-all-${module}`} className="ml-3 text-lg font-bold text-gray-700 dark:text-gray-300 uppercase">{module}</label>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {permissions.map(permission => (
                                            <div key={permission} className="flex items-center">
                                                <input
                                                    id={permission}
                                                    type="checkbox"
                                                    checked={selectedPermissions.includes(permission)}
                                                    onChange={() => handlePermissionToggle(permission)}
                                                    className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                                                />
                                                <label htmlFor={permission} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                                    {permission.split('_')[1]}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default RoleFormPage;