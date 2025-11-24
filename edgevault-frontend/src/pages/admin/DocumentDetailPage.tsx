import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDocumentDetails, downloadDocumentVersion } from '../../api/documentService';
import type { Document } from '../../types/document';
import { toast } from 'react-hot-toast';
import { FileClock, Download, ArrowLeft } from 'lucide-react';

const DocumentDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [document, setDocument] = useState<Document | null>(null);
    const [loading, setLoading] = useState(true);

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
            
            // --- THIS IS THE FIX ---
            // The 'data' from our service is already a Blob. We don't need to re-wrap it.
            const url = window.URL.createObjectURL(data); 
            // -----------------------

            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            
            // Clean up by revoking the object URL and removing the link
            window.URL.revokeObjectURL(url);
            link.parentNode?.removeChild(link);
        } catch (error) {
            console.error("Download error:", error);
        }
    };

    if (loading) return <div>Loading details...</div>;
    if (!document) return null;

    return (
        <div className="container mx-auto">
             <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{document.fileName}</h1>
                    <p className="text-gray-500">Latest Version: {document.latestVersion.versionNumber}</p>
                </div>
                <button onClick={() => navigate('/admin/documents')} className="btn-secondary flex items-center">
                    <ArrowLeft size={18} className="mr-2"/>
                    Back to List
                </button>
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
        </div>
    );
};

export default DocumentDetailPage;