import React, { useEffect, useState, useCallback } from 'react'; // <-- Import useCallback
import { getPendingDeletions, approveDeletion, rejectDeletion } from '../../api/documentService';
import type { DocumentApproval } from '../../types/document';
import { toast } from 'react-hot-toast';
import { Check, X, ShieldQuestion } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import { useNavigate } from 'react-router-dom';

const ApprovalQueuePage: React.FC = () => {
    const [pendingDocs, setPendingDocs] = useState<DocumentApproval[]>([]);
    const [loading, setLoading] = useState(true);
    const { hasPermission } = usePermissions();
    const navigate = useNavigate();

    // --- THIS IS THE FIX ---

    // Effect 1: Check permission ONCE on component mount.
    useEffect(() => {
        if (!hasPermission('DOCUMENT_APPROVAL')) {
            toast.error("You don't have permission to access this page.");
            navigate('/admin/dashboard');
        }
    }, [hasPermission, navigate]); // This effect is safe because it only runs if the functions truly change (which they shouldn't).

    // Define fetch function with useCallback to stabilize it.
    const fetchPendingDocuments = useCallback(async () => {
        // Only fetch if the user has permission.
        if (!hasPermission('DOCUMENT_APPROVAL')) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const data = await getPendingDeletions();
            setPendingDocs(data);
        } catch (error) {
            toast.error("Failed to fetch approval queue.");
        } finally {
            setLoading(false);
        }
    }, [hasPermission]); // This function will only be recreated if hasPermission changes.

    // Effect 2: Fetch data ONCE on component mount and when the fetch function is stable.
    useEffect(() => {
        fetchPendingDocuments();
    }, [fetchPendingDocuments]);
    
    // -------------------------

    const handleApprove = async (docId: number) => {
        await toast.promise(approveDeletion(docId), {
            loading: 'Approving...',
            success: 'Deletion approved.',
            error: 'Failed to approve.',
        });
        fetchPendingDocuments(); // Re-fetch data after action
    };

    const handleReject = async (docId: number) => {
        await toast.promise(rejectDeletion(docId), {
            loading: 'Rejecting...',
            success: 'Deletion rejected.',
            error: 'Failed to reject.',
        });
        fetchPendingDocuments(); // Re-fetch data after action
    };

    // Show loading state only if we are actually loading and have permission
    if (loading && hasPermission('DOCUMENT_APPROVAL')) {
        return <div className="text-center p-8">Loading approval queue...</div>;
    }

    // If the user lands here but doesn't have permission, show nothing while redirecting.
    if (!hasPermission('DOCUMENT_APPROVAL')) {
        return null; 
    }

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Deletion Approval Queue</h1>
            
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="th-style">Document Title</th>
                            <th className="th-style">Department</th>
                            <th className="th-style">Requested By</th>
                            <th className="th-style">Date Requested</th>
                            <th className="th-style text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {pendingDocs.length > 0 ? (
                            pendingDocs.map((doc) => (
                                <tr key={doc.documentId}>
                                    <td className="td-style font-medium">{doc.title}</td>
                                    <td className="td-style">{doc.departmentName}</td>
                                    <td className="td-style">{doc.requesterUsername}</td>
                                    <td className="td-style">{new Date(doc.requestedAt).toLocaleString()}</td>
                                    <td className="td-style text-right space-x-2">
                                        <button onClick={() => handleApprove(doc.documentId)} className="p-2 rounded-full text-green-600 hover:bg-green-100 dark:hover:bg-green-900/50" title="Approve">
                                            <Check size={18}/>
                                        </button>
                                        <button onClick={() => handleReject(doc.documentId)} className="p-2 rounded-full text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50" title="Reject">
                                            <X size={18}/>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-gray-500">
                                    The approval queue is empty.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const thStyle = "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider";
const tdStyle = "px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200";

export default ApprovalQueuePage;