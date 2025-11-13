import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllRoles, deleteRole } from '../../api/roleService';
import type { Role } from '../../types/user';
import { toast } from 'react-hot-toast';
import { Plus, Edit, Trash2, ShieldCheck } from 'lucide-react';

const RoleManagementPage: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const data = await getAllRoles();
            setRoles(data);
        } catch (error) {
            toast.error('Failed to fetch roles.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);
    
    const handleDeleteRole = async (roleId: number) => {
        if (window.confirm('Are you sure you want to delete this role?')) {
            try {
                await toast.promise(deleteRole(roleId), {
                    loading: 'Deleting role...',
                    success: 'Role deleted successfully!',
                    error: (err) => err.response?.data?.message || 'Failed to delete role.',
                });
                fetchRoles();
            } catch (error) {
                console.error(error);
            }
        }
    };

    if (loading) return <div>Loading roles...</div>;

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Role Management</h1>
                <button 
                    onClick={() => navigate('/admin/roles/new')} 
                    className="btn-primary flex items-center"
                >
                    <Plus size={20} className="mr-2" />
                    Add Role
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                     <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Permissions Count</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {roles.map((role) => (
                            <tr key={role.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{role.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                    <span className="inline-flex items-center">
                                        <ShieldCheck size={16} className="mr-2 text-green-500"/>
                                        {role.permissions.length} permissions
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                     <button 
                                        onClick={() => navigate(`/admin/roles/edit/${role.id}`)} 
                                        className="text-blue-500 hover:text-blue-700"
                                     >
                                         <Edit size={18}/>
                                     </button>
                                     <button 
                                        onClick={() => handleDeleteRole(role.id)} 
                                        className="text-red-500 hover:text-red-700"
                                     >
                                         <Trash2 size={18}/>
                                     </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RoleManagementPage;