import React, { useEffect, useState } from 'react';
import { getMyDepartmentDocuments, uploadDocument } from '../../api/documentService';
import type { Document } from '../../types/document';
import { toast } from 'react-hot-toast';
import { Upload, FileText } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import Modal from '../../components/common/Modal';

const DocumentManagementPage: React.FC = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const { hasPermission } = usePermissions();

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

    if (loading) return <div>Loading documents...</div>;

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

            {/* Document List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {documents.map(doc => (
                    <div key={doc.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col justify-between">
                        <div>
                            <FileText size={40} className="text-cyan-500 mb-2"/>
                            <h3 className="font-bold text-gray-800 dark:text-gray-100 truncate">{doc.fileName}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Version: {doc.latestVersion.versionNumber}
                            </p>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                            <p>Last updated by {doc.latestVersion.uploaderUsername}</p>
                            <p>{new Date(doc.latestVersion.uploadTimestamp).toLocaleDateString()}</p>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Upload Modal */}
            <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload New Document">
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select File</label>
                    <input type="file" onChange={handleFileSelect} className="input-style" />
                    {fileToUpload && <p className="text-sm">Selected: {fileToUpload.name}</p>}
                    <div className="flex justify-end pt-4">
                        <button onClick={handleUpload} disabled={isUploading || !fileToUpload} className="btn-primary">
                            {isUploading ? 'Uploading...' : 'Upload'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default DocumentManagementPage;