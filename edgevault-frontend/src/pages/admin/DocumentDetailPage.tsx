import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDocumentDetails, downloadDocumentVersion, uploadNewVersion } from '../../api/documentService'; // <-- Import uploadNewVersion
import type { Document } from '../../types/document';
import { toast } from 'react-hot-toast';
import { FileClock, Download, ArrowLeft, Upload } from 'lucide-react'; // <-- Import Upload icon
import { usePermissions } from '../../hooks/usePermissions'; // <-- Import usePermissions
import Modal from '../../components/common/Modal'; // <-- Import Modal

const DocumentDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [document, setDocument] = useState<Document | null>(null);
    const [loading, setLoading] = useState(true);
    const { hasPermission } = usePermissions();

    // --- NEW STATE FOR UPLOAD MODAL ---
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    // ----------------------------------

    useEffect(() => {
        if (!id) return;
        const fetchDetails = async () => {
            try {
                const data = await getDocumentDetails(Number(id));
                setDocument(data);
            } catch (error) {
                toast.error("Could not load document details.");
                navigate('/admin/documents');
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id, navigate]);

    const handleDownload = async (versionId: number) => {
        const promise = downloadDocumentVersion(versionId);
        toast.promise(promise, {
            loading: 'Preparing download...',
            success: 'Download starting!',
            error: 'Download failed.',
        });

        try {
            const { data, filename } = await promise;
            const url = window.URL.createObjectURL(data);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url);
            link.parentNode?.removeChild(link);
        } catch (error) {
            console.error("Download error:", error);
        }
    };

    // --- NEW HANDLERS FOR NEW VERSION UPLOAD ---
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFileToUpload(e.target.files[0]);
        }
    };

    const handleUploadNewVersion = async () => {
        if (!fileToUpload || !document) {
            toast.error("Please select a file to upload.");
            return;
        }
        setIsUploading(true);
        try {
            const promise = uploadNewVersion(document.id, fileToUpload);
            const updatedDocument = await toast.promise(promise, {
                loading: 'Uploading new version...',
                success: 'New version uploaded successfully!',
                error: (err) => err.response?.data?.message || 'Upload failed.',
            });
            // INSTANT UI UPDATE: Update state with the new document data from the API response
            setDocument(updatedDocument); 
            setIsUploadModalOpen(false);
            setFileToUpload(null);
        } catch (error) {
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };
    // ---------------------------------------------

    if (loading) return <div>Loading details...</div>;
    if (!document) return null;

    return (
        <div className="container mx-auto">
             <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{document.fileName}</h1>
                    <p className="text-gray-500">Latest Version: {document.latestVersion.versionNumber}</p>
                </div>
                <div className="flex items-center space-x-2">
                    {hasPermission('DOCUMENT_UPDATE') && (
                        <button onClick={() => setIsUploadModalOpen(true)} className="btn-primary flex items-center">
                            <Upload size={18} className="mr-2"/>
                            Upload New Version
                        </button>
                    )}
                    <button onClick={() => navigate('/admin/documents')} className="btn-secondary flex items-center">
                        <ArrowLeft size={18} className="mr-2"/>
                        Back to List
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center"><FileClock className="mr-2"/> Version History</h2>
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {document.versionHistory.map(version => (
                        <li key={version.id} className="py-4 flex justify-between items-center">
                            <div>
                                <p className="font-bold text-lg">Version {version.versionNumber}</p>
                                <p className="text-sm text-gray-500">
                                    Uploaded by <span className="font-medium">{version.uploaderUsername}</span> on {new Date(version.uploadTimestamp).toLocaleString()}
                                </p>
                            </div>
                            <button onClick={() => handleDownload(version.id)} className="btn-primary flex items-center">
                                <Download size={16} className="mr-2"/>
                                Download
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            
            {/* --- UPLOAD NEW VERSION MODAL --- */}
            <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload New Version">
                 <div className="space-y-4">
                    <div>
                        <label htmlFor="version-upload" className="cursor-pointer flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">
                            <Upload size={32} className="text-gray-400"/>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <input id="version-upload" type="file" onChange={handleFileSelect} className="hidden" />
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
                        <button onClick={handleUploadNewVersion} disabled={isUploading || !fileToUpload} className="btn-primary">
                            {isUploading ? 'Uploading...' : 'Upload'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default DocumentDetailPage;