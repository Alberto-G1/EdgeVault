import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyDepartmentDocuments, uploadDocument, requestDocumentDeletion } from '../../api/documentService';
import type { Document } from '../../types/document';
import { toast } from 'react-hot-toast';
import { Upload, FileText, Trash2 } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import Modal from '../../components/common/Modal';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const DocumentManagementPage: React.FC = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    
    // State for confirmation modal
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const { hasPermission } = usePermissions();
    const navigate = useNavigate();

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const data = await getMyDepartmentDocuments();
            setDocuments(data);
        } catch (error) {
            toast.error("Failed to fetch documents.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFileToUpload(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!fileToUpload) {
            toast.error("Please select a file to upload.");
            return;
        }
        setIsUploading(true);
        try {
            await toast.promise(uploadDocument(fileToUpload), {
                loading: 'Uploading document...',
                success: 'Document uploaded successfully!',
                error: (err) => err.response?.data?.message || 'Upload failed.',
            });
            setIsUploadModalOpen(false);
            setFileToUpload(null);
            fetchDocuments(); // Refresh list
        } catch (error) {
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleOpenConfirmModal = (docId: number) => {
        setDocumentToDelete(docId);
        setIsConfirmModalOpen(true);
    };

    const handleCloseConfirmModal = () => {
        setDocumentToDelete(null);
        setIsConfirmModalOpen(false);
    };

    const handleConfirmDelete = async () => {
        if (!documentToDelete) return;

        setIsDeleting(true);
        try {
            await toast.promise(requestDocumentDeletion(documentToDelete), {
                loading: 'Requesting deletion...',
                success: 'Deletion requested successfully!',
                error: (err) => err.response?.data?.message || 'Failed to request deletion.'
            });
            fetchDocuments();
        } catch (error) {
            console.error(error);
        } finally {
            setIsDeleting(false);
            handleCloseConfirmModal();
        }
    };

    if (loading) return <div className="text-center p-8">Loading documents...</div>;

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Document Management</h1>
                {hasPermission('DOCUMENT_CREATE') && (
                    <button onClick={() => setIsUploadModalOpen(true)} className="btn-primary flex items-center">
                        <Upload size={20} className="mr-2" />
                        Upload Document
                    </button>
                )}
            </div>

            {documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {documents.map(doc => (
                        <div 
                            key={doc.id} 
                            onClick={() => navigate(`/admin/documents/${doc.id}`)}
                            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col justify-between group relative cursor-pointer transition-transform transform hover:-translate-y-1"
                        >
                            <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                {hasPermission('DOCUMENT_DELETE') && (
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation(); 
                                            handleOpenConfirmModal(doc.id);
                                        }} 
                                        className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                                        title="Request Deletion"
                                    >
                                        <Trash2 size={18}/>
                                    </button>
                                )}
                            </div>

                            <div className="flex-grow">
                                <FileText size={40} className="text-cyan-500 mb-2"/>
                                <h3 className="font-bold text-gray-800 dark:text-gray-100 break-words group-hover:text-cyan-500 transition-colors">
                                    {doc.fileName}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Version: {doc.latestVersion.versionNumber}
                                </p>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-4 pt-2 border-t dark:border-gray-700">
                                <p>Last updated by {doc.latestVersion.uploaderUsername}</p>
                                <p>{new Date(doc.latestVersion.uploadTimestamp).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <FileText size={48} className="mx-auto text-gray-400"/>
                    <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No Documents Found</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by uploading a new document.</p>
                </div>
            )}
            
            <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload New Document">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">
                            <Upload size={32} className="text-gray-400"/>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <input id="file-upload" type="file" onChange={handleFileSelect} className="hidden" />
                        </label>
                    </div>
                    {fileToUpload && (
                        <p className="text-sm text-center font-medium text-gray-700 dark:text-gray-300">
                            Selected file: <span className="text-cyan-600">{fileToUpload.name}</span>
                        </p>
                    )}
                    <div className="flex justify-end pt-4">
                        <button onClick={() => setIsUploadModalOpen(false)} type="button" className="btn-secondary mr-3">
                            Cancel
                        </button>
                        <button onClick={handleUpload} disabled={isUploading || !fileToUpload} className="btn-primary">
                            {isUploading ? 'Uploading...' : 'Upload'}
                        </button>
                    </div>
                </div>
            </Modal>

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={handleCloseConfirmModal}
                onConfirm={handleConfirmDelete}
                title="Request Document Deletion"
                message="Are you sure you want to request deletion for this document? This will move it to an approval queue and it will no longer be visible."
                confirmText="Request Deletion"
                isConfirming={isDeleting}
            />
        </div>
    );
};

export default DocumentManagementPage;