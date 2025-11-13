import React, { useEffect, useState } from 'react';
import { getAllDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../api/departmentService';
import type { Department } from '../../types/user';
import { toast } from 'react-hot-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Modal from '../../components/common/Modal';

const DepartmentManagementPage: React.FC = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentDept, setCurrentDept] = useState<Department | null>(null);
    
    // State for form fields
    const [deptName, setDeptName] = useState('');
    const [deptDescription, setDeptDescription] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const data = await getAllDepartments();
            setDepartments(data);
        } catch (error) {
            toast.error('Failed to fetch departments.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const handleOpenModal = (dept: Department | null = null) => {
        setCurrentDept(dept);
        setDeptName(dept ? dept.name : '');
        setDeptDescription(dept ? dept.description : '');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentDept(null);
        setDeptName('');
        setDeptDescription('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const promise = currentDept
            ? updateDepartment(currentDept.id, deptName, deptDescription)
            : createDepartment(deptName, deptDescription);
            
        try {
            await toast.promise(promise, {
                loading: 'Saving department...',
                success: `Department ${currentDept ? 'updated' : 'created'}!`,
                error: (err) => err.response?.data?.message || 'Failed to save.',
            });
            handleCloseModal();
            fetchDepartments();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure? This may affect users in this department.')) {
            try {
                await toast.promise(deleteDepartment(id), {
                    loading: 'Deleting...',
                    success: 'Department deleted!',
                    error: (err) => err.response?.data?.message || 'Failed to delete.',
                });
                fetchDepartments();
            } catch (error) {
                console.error(error);
            }
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Department Management</h1>
                <button onClick={() => handleOpenModal()} className="btn-primary flex items-center">
                    <Plus size={20} className="mr-2" />
                    Add Department
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="th-style w-1/4">Department Name</th>
                            <th className="th-style w-1/2">Description</th>
                            <th className="th-style text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {departments.map((dept) => (
                            <tr key={dept.id}>
                                <td className="td-style font-medium">{dept.name}</td>
                                <td className="td-style text-gray-500 dark:text-gray-400">{dept.description}</td>
                                <td className="td-style text-right space-x-2">
                                     <button onClick={() => handleOpenModal(dept)} className="text-blue-500 hover:text-blue-700"><Edit size={18}/></button>
                                     <button onClick={() => handleDelete(dept.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentDept ? 'Edit Department' : 'New Department'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                        <input
                            type="text"
                            value={deptName}
                            onChange={(e) => setDeptName(e.target.value)}
                            className="mt-1 block w-full input-style"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                        <textarea
                            value={deptDescription}
                            onChange={(e) => setDeptDescription(e.target.value)}
                            rows={3}
                            className="mt-1 block w-full input-style"
                            placeholder="Optional: A brief description of the department's function."
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={handleCloseModal} className="btn-secondary">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="btn-primary">
                            {isSubmitting ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

const thStyle = "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider";
const tdStyle = "px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200";

export default DepartmentManagementPage;