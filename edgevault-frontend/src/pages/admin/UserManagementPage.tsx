import React, { useEffect, useState } from 'react';
import { getAllUsers, createUser, updateUser, deleteUser } from '../../api/userService';
import type { User } from '../../types/user';
import { toast } from 'react-hot-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Modal from '../../components/common/Modal';
import UserForm from '../../components/admin/UserForm';
import { usePermissions } from '../../hooks/usePermissions';

const UserManagementPage: React.FC = () => {
    const { hasPermission, hasAnyPermission } = usePermissions();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await getAllUsers();
            setUsers(data);
        } catch (error) {
            toast.error('Failed to fetch users.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleOpenModal = (user: User | null = null) => {
        setUserToEdit(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setUserToEdit(null);
    };

    const handleSaveUser = async (formData: any) => {
        setIsSubmitting(true);
        const payload = { 
            email: formData.email, 
            enabled: formData.enabled, 
            roles: formData.roles, 
            departmentId: formData.departmentId 
        };

        const promise = userToEdit
            ? updateUser(userToEdit.id, payload)
            : createUser({ ...payload, username: formData.username, password: formData.password });

        try {
            await toast.promise(promise, {
                loading: 'Saving user...',
                success: `User ${userToEdit ? 'updated' : 'created'} successfully!`,
                error: (err) => err.response?.data?.message || 'Failed to save user.',
            });
            handleCloseModal();
            fetchUsers();
        } catch (error: any) {
            console.error(error.response?.data?.message || error.message);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDeleteUser = async (userId: number) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await toast.promise(deleteUser(userId), {
                    loading: 'Deleting user...',
                    success: 'User deleted successfully!',
                    error: (err) => err.response?.data?.message || 'Failed to delete user.',
                });
                fetchUsers();
            } catch (error) {
                 console.error(error);
            }
        }
    };

    if (loading) return <div>Loading users...</div>;

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">User Management</h1>
                {hasPermission('USER_CREATE') && (
                    <button
                        onClick={() => handleOpenModal()}
                        className="btn-primary flex items-center"
                    >
                        <Plus size={20} className="mr-2" />
                        Add User
                    </button>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="th-style">Username</th>
                            <th className="th-style">Email</th>
                            <th className="th-style">Department</th>
                            <th className="th-style">Status</th>
                            <th className="th-style">Roles</th>
                            {hasAnyPermission(['USER_UPDATE', 'USER_DELETE']) && (
                                <th className="th-style text-right">Actions</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="td-style font-medium">{user.username}</td>
                                <td className="td-style">{user.email}</td>
                                <td className="td-style">{user.departmentName}</td>
                                <td className="td-style">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        user.enabled
                                            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                            : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                                    }`}>
                                        {user.enabled ? 'Enabled' : 'Disabled'}
                                    </span>
                                </td>
                                <td className="td-style">{user.roles.map(r => r.name).join(', ')}</td>
                                {hasAnyPermission(['USER_UPDATE', 'USER_DELETE']) && (
                                    <td className="td-style text-right space-x-2">
                                        {hasPermission('USER_UPDATE') && (
                                             <button onClick={() => handleOpenModal(user)} className="text-blue-500 hover:text-blue-700"><Edit size={18}/></button>
                                        )}
                                        {hasPermission('USER_DELETE') && (
                                             <button onClick={() => handleDeleteUser(user.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18}/></button>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={userToEdit ? 'Edit User' : 'Create New User'}>
                <UserForm 
                    userToEdit={userToEdit} 
                    onSave={handleSaveUser} 
                    onCancel={handleCloseModal} 
                    isLoading={isSubmitting} 
                />
            </Modal>
        </div>
    );
};

const thStyle = "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider";
const tdStyle = "px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200";

export default UserManagementPage;