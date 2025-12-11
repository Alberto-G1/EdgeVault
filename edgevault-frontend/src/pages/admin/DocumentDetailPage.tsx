import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDocumentDetails, downloadDocumentVersion, uploadNewVersion, updateVersionDescription, deleteVersion, requestDocumentDeletion } from '../../api/documentService';
import type { Document } from '../../types/document';
import { FileClock, Download, ArrowLeft, Upload, FileText, User, Calendar, GitBranch, Eye, ChevronDown, ChevronUp, Edit2, Trash2, Trash } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import styled from 'styled-components';
import Loader from '../../components/common/Loader';
import HoverButton from '../../components/common/HoverButton';
import Modal from '../../components/common/Modal';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import DocumentChat from '../../components/document/DocumentChat';

const DocumentDetailPage: React.FC = () => {
    const { showError } = useToast();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [document, setDocument] = useState<Document | null>(null);
    const [loading, setLoading] = useState(true);
    const { hasPermission } = usePermissions();

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);
    const [versionDescription, setVersionDescription] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [expandedVersion, setExpandedVersion] = useState<number | null>(null);
    
    // Edit version states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingVersionId, setEditingVersionId] = useState<number | null>(null);
    const [editDescription, setEditDescription] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    
    // Delete version states
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [deletingVersionId, setDeletingVersionId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Delete document request states
    const [isDeleteDocConfirmOpen, setIsDeleteDocConfirmOpen] = useState(false);
    const [isRequestingDeletion, setIsRequestingDeletion] = useState(false);

    const fetchDetails = async () => {
        if (!id) return;
        try {
            const data = await getDocumentDetails(Number(id));
            setDocument(data);
            // Expand the latest version by default
            if (data.versionHistory.length > 0) {
                setExpandedVersion(data.versionHistory[0].id);
            }
        } catch (error) {
            showError('Error', 'Could not load document details.');
            navigate('/admin/documents');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [id, navigate]);

    const handleDownload = async (versionId: number) => {
        try {
            const { data, filename } = await downloadDocumentVersion(versionId);
            const url = window.URL.createObjectURL(data);
            const link = window.document.createElement('a') as HTMLAnchorElement;
            link.href = url;
            link.download = filename;
            window.document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url);
            if (link.parentNode) {
                link.parentNode.removeChild(link);
            }
            showSuccess('Success', 'Download started!');
        } catch (error) {
            showError('Error', 'Download failed.');
            console.error("Download error:", error);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFileToUpload(e.target.files[0]);
        }
    };

    const handleUploadNewVersion = async () => {
        if (!fileToUpload || !document) {
            showError('Validation Error', 'Please select a file to upload.');
            return;
        }
        setIsUploading(true);
        try {
            const updatedDocument = await uploadNewVersion(document.id, fileToUpload, versionDescription);
            showSuccess('Success', 'New version uploaded successfully!');
            setDocument(updatedDocument);
            setIsUploadModalOpen(false);
            setFileToUpload(null);
            setVersionDescription('');
            // Expand the new version
            if (updatedDocument.versionHistory.length > 0) {
                setExpandedVersion(updatedDocument.versionHistory[0].id);
            }
        } catch (error: any) {
            showError('Error', error.response?.data?.message || 'Upload failed.');
        } finally {
            setIsUploading(false);
        }
    };

    const toggleVersionExpand = (versionId: number) => {
        setExpandedVersion(expandedVersion === versionId ? null : versionId);
    };

    const handleEditVersion = (version: any) => {
        setEditingVersionId(version.id);
        setEditDescription(version.description || '');
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!editingVersionId) return;
        setIsUpdating(true);
        try {
            await updateVersionDescription(editingVersionId, editDescription);
            showSuccess('Success', 'Version description updated successfully!');
            setIsEditModalOpen(false);
            fetchDetails(); // Refresh document details
        } catch (error) {
            showError('Error', 'Failed to update version description.');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteVersion = (versionId: number) => {
        setDeletingVersionId(versionId);
        setIsDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!deletingVersionId) return;
        setIsDeleting(true);
        try {
            const updatedDocument = await deleteVersion(deletingVersionId);
            showSuccess('Success', 'Version deleted successfully!');
            setDocument(updatedDocument);
            setIsDeleteConfirmOpen(false);
            setDeletingVersionId(null);
        } catch (error: any) {
            showError('Error', error.response?.data?.message || 'Failed to delete version.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleRequestDocumentDeletion = async () => {
        if (!document) return;
        setIsRequestingDeletion(true);
        try {
            await requestDocumentDeletion(document.id);
            showSuccess('Success', 'Document deletion request submitted successfully! It will be reviewed by an administrator.');
            setIsDeleteDocConfirmOpen(false);
            navigate('/admin/documents');
        } catch (error: any) {
            showError('Error', error.response?.data?.message || 'Failed to request document deletion.');
        } finally {
            setIsRequestingDeletion(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (loading) {
        return (
            <LoaderContainer>
                <Loader />
            </LoaderContainer>
        );
    }
    
    if (!document) return null;

    return (
        <PageContainer>
            <PageHeader>
                <HeaderContent>
                    <BackButton onClick={() => navigate('/admin/documents')}>
                        <ArrowLeft size={24} />
                    </BackButton>
                    <PageTitle>
                        <FileText size={32} />
                        {document.title}
                    </PageTitle>
                </HeaderContent>
                
                <ButtonGroup>
                    {hasPermission('DOCUMENT_UPDATE') && (
                        <UploadButton 
                            onClick={() => setIsUploadModalOpen(true)}
                            textOne="Upload New Version"
                            textTwo="New Version"
                            width="220px"
                            height="55px"
                        />
                    )}
                    <DownloadButton 
                        onClick={() => handleDownload(document.latestVersion.id)}
                        textOne="Download Latest"
                        textTwo="Download Now"
                        width="180px"
                        height="55px"
                    />
                    {hasPermission('DOCUMENT_DELETE') && (
                        <DeleteDocButton 
                            onClick={() => setIsDeleteDocConfirmOpen(true)}
                            textOne="Request Deletion"
                            textTwo="Delete Document"
                            width="190px"
                            height="55px"
                        />
                    )}
                </ButtonGroup>
            </PageHeader>

            <ContentGrid>
                {/* Left Column - Document Details */}
                <LeftColumn>
                    <DocumentInfoCard>
                        <CardHeader>
                            <CardIcon style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }}>
                                <FileText size={24} />
                            </CardIcon>
                            <CardTitle>Document Information</CardTitle>
                        </CardHeader>
                        
                        <InfoGrid>
                            <InfoItem>
                                <InfoIcon style={{ background: 'rgba(46, 151, 197, 0.1)', color: 'rgb(46, 151, 197)' }}>
                                    <GitBranch size={16} />
                                </InfoIcon>
                                <InfoContent>
                                    <InfoLabel>Latest Version</InfoLabel>
                                    <InfoValue>v{document.latestVersion.versionNumber}</InfoValue>
                                </InfoContent>
                            </InfoItem>
                            
                            <InfoItem>
                                <InfoIcon style={{ background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9' }}>
                                    <FileText size={16} />
                                </InfoIcon>
                                <InfoContent>
                                    <InfoLabel>File Name</InfoLabel>
                                    <InfoValue>{document.fileName}</InfoValue>
                                </InfoContent>
                            </InfoItem>
                            
                            <InfoItem>
                                <InfoIcon style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' }}>
                                    <User size={16} />
                                </InfoIcon>
                                <InfoContent>
                                    <InfoLabel>Uploaded By</InfoLabel>
                                    <InfoValue>{document.latestVersion.uploaderUsername}</InfoValue>
                                </InfoContent>
                            </InfoItem>
                            
                            <InfoItem>
                                <InfoIcon style={{ background: 'rgba(103, 232, 249, 0.1)', color: '#67e8f9' }}>
                                    <Calendar size={16} />
                                </InfoIcon>
                                <InfoContent>
                                    <InfoLabel>Last Updated</InfoLabel>
                                    <InfoValue>{new Date(document.latestVersion.uploadTimestamp).toLocaleString()}</InfoValue>
                                </InfoContent>
                            </InfoItem>
                        </InfoGrid>
                    </DocumentInfoCard>
                    
                    {document.description && (
                        <DescriptionCard>
                            <CardHeader>
                                <CardIcon style={{ background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9' }}>
                                    <FileText size={24} />
                                </CardIcon>
                                <CardTitle>Description</CardTitle>
                            </CardHeader>
                            <DescriptionText>
                                {document.description}
                            </DescriptionText>
                        </DescriptionCard>
                    )}
                    
                    <VersionHistoryCard>
                        <CardHeader>
                            <CardIcon style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }}>
                                <FileClock size={24} />
                            </CardIcon>
                            <CardTitle>Version History</CardTitle>
                        </CardHeader>
                        
                        <VersionList>
                            {document.versionHistory.map((version) => (
                                <VersionItem key={version.id} expanded={expandedVersion === version.id}>
                                    <VersionHeader onClick={() => toggleVersionExpand(version.id)}>
                                        <VersionInfo>
                                            <VersionNumber>v{version.versionNumber}</VersionNumber>
                                            <VersionMeta>
                                                <User size={12} />
                                                {version.uploaderUsername} • 
                                                <Calendar size={12} />
                                                {new Date(version.uploadTimestamp).toLocaleDateString()}
                                            </VersionMeta>
                                        </VersionInfo>
                                        <VersionActions>
                                            {expandedVersion === version.id ? (
                                                <ChevronUp size={20} />
                                            ) : (
                                                <ChevronDown size={20} />
                                            )}
                                        </VersionActions>
                                    </VersionHeader>
                                    
                                    {expandedVersion === version.id && (
                                        <VersionDetails>
                                            {version.description && (
                                                <DetailItem>
                                                    <DetailLabel>Description:</DetailLabel>
                                                    <DetailValue>{version.description}</DetailValue>
                                                </DetailItem>
                                            )}
                                            <DetailItem>
                                                <DetailLabel>Upload Date:</DetailLabel>
                                                <DetailValue>{new Date(version.uploadTimestamp).toLocaleString()}</DetailValue>
                                            </DetailItem>
                                            <DetailItem>
                                                <DetailLabel>Uploaded By:</DetailLabel>
                                                <DetailValue>{version.uploaderUsername}</DetailValue>
                                            </DetailItem>
                                            <DetailItem>
                                                <DetailLabel>File Type:</DetailLabel>
                                                <DetailValue>{document.fileName.split('.').pop()?.toUpperCase()}</DetailValue>
                                            </DetailItem>
                                            <DetailAction>
                                                <ActionButtons>
                                                    <DownloadVersionButton onClick={() => handleDownload(version.id)}>
                                                        <Download size={16} />
                                                        Download v{version.versionNumber}
                                                    </DownloadVersionButton>
                                                    {hasPermission('DOCUMENT_UPDATE') && (
                                                        <EditButton onClick={() => handleEditVersion(version)}>
                                                            <Edit2 size={16} />
                                                            Edit
                                                        </EditButton>
                                                    )}
                                                    {hasPermission('DOCUMENT_DELETE') && document.versionHistory.length > 1 && (
                                                        <DeleteVersionButton onClick={() => handleDeleteVersion(version.id)}>
                                                            <Trash2 size={16} />
                                                            Delete
                                                        </DeleteVersionButton>
                                                    )}
                                                </ActionButtons>
                                            </DetailAction>
                                        </VersionDetails>
                                    )}
                                </VersionItem>
                            ))}
                        </VersionList>
                    </VersionHistoryCard>
                </LeftColumn>

                {/* Right Column - Document Chat */}
                <RightColumn>
                    <ChatCard>
                        <DocumentChat documentId={document.id} />
                    </ChatCard>
                </RightColumn>
            </ContentGrid>

            <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload New Version">
                <ModalContent>
                    <DescriptionField>
                        <DescriptionLabel>Version Description (Optional)</DescriptionLabel>
                        <DescriptionTextArea
                            value={versionDescription}
                            onChange={(e) => setVersionDescription(e.target.value)}
                            rows={3}
                            placeholder="Describe changes in this version..."
                        />
                    </DescriptionField>
                    
                    <UploadArea>
                        <UploadLabel htmlFor="version-upload">
                            <Upload size={48} />
                            <UploadTitle>Click to upload new version</UploadTitle>
                            <UploadSubtitle>Drag and drop your file here or click to browse</UploadSubtitle>
                            <UploadHint>Supports: PDF, DOC, DOCX, TXT, XLS, XLSX (Max 50MB)</UploadHint>
                        </UploadLabel>
                        <FileInput
                            id="version-upload"
                            type="file"
                            onChange={handleFileSelect}
                        />
                    </UploadArea>
                    
                    {fileToUpload && (
                        <SelectedFile>
                            <FileText size={20} />
                            <FileInfo>
                                <FileName>{fileToUpload.name}</FileName>
                                <FileSize>{formatFileSize(fileToUpload.size)}</FileSize>
                            </FileInfo>
                        </SelectedFile>
                    )}
                    
                    <ModalActions>
                        <CancelButton type="button" onClick={() => setIsUploadModalOpen(false)}>
                            Cancel
                        </CancelButton>
                        <HoverButton 
                            onClick={handleUploadNewVersion} 
                            disabled={isUploading || !fileToUpload}
                            textOne={isUploading ? 'Uploading...' : 'Upload New Version'}
                            textTwo={isUploading ? 'Uploading...' : 'Save'}
                            width="200px"
                            height="50px"
                        />
                    </ModalActions>
                </ModalContent>
            </Modal>

            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Version Description">
                <ModalContent>
                    <DescriptionField>
                        <DescriptionLabel>Version Description</DescriptionLabel>
                        <DescriptionTextArea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            rows={4}
                            placeholder="Enter version description..."
                        />
                    </DescriptionField>
                    
                    <ModalActions>
                        <CancelButton type="button" onClick={() => setIsEditModalOpen(false)}>
                            Cancel
                        </CancelButton>
                        <HoverButton 
                            onClick={handleSaveEdit} 
                            disabled={isUpdating}
                            textOne={isUpdating ? 'Saving...' : 'Save Changes'}
                            textTwo={isUpdating ? 'Saving...' : 'Save'}
                            width="180px"
                            height="50px"
                        />
                    </ModalActions>
                </ModalContent>
            </Modal>

            <ConfirmationModal
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Version"
                message="Are you sure you want to delete this version? This action cannot be undone and the file will be permanently removed."
                confirmText="Delete Version"
                isConfirming={isDeleting}
            />
            
            <ConfirmationModal
                isOpen={isDeleteDocConfirmOpen}
                onClose={() => setIsDeleteDocConfirmOpen(false)}
                onConfirm={handleRequestDocumentDeletion}
                title="Request Document Deletion"
                message="Are you sure you want to request deletion of this document? The request will be sent to an administrator for approval. All versions will be deleted if approved."
                confirmText="Request Deletion"
                isConfirming={isRequestingDeletion}
            />
        </PageContainer>
    );
};

// Styled Components
const PageContainer = styled.div`
    animation: fadeInUp 0.4s ease;
    padding: 2rem;

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

const LoaderContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
`;

const PageHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding: 1.5rem 2rem;
    background: linear-gradient(135deg, rgba(46, 151, 197, 0.05), rgba(150, 129, 158, 0.05));
    border-radius: 20px;
    border: 2px solid rgba(46, 151, 197, 0.2);

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 1.5rem;
        align-items: stretch;
        padding: 1rem;
    }
`;

const HeaderContent = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const BackButton = styled.button`
    width: 48px;
    height: 48px;
    background: var(--bg-secondary);
    border: 2px solid rgba(46, 151, 197, 0.2);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgb(46, 151, 197);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(46, 151, 197, 0.1);
        transform: translateX(-4px);
    }
`;

const PageTitle = styled.h1`
    font-size: 1.75rem;
    font-weight: 800;
    background: linear-gradient(135deg, rgb(46, 151, 197), rgb(150, 129, 158));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-family: 'Poppins', sans-serif;
    display: flex;
    align-items: center;
    gap: 1rem;

    @media (max-width: 768px) {
        font-size: 1.5rem;
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 1rem;

    @media (max-width: 768px) {
        width: 100%;
        
        button {
            flex: 1;
        }
    }
`;

const UploadButton = styled(HoverButton)`
    @media (max-width: 768px) {
        width: 100% !important;
    }
`;

const DownloadButton = styled(HoverButton)`
    @media (max-width: 768px) {
        width: 100% !important;
    }
`;

const DeleteDocButton = styled(HoverButton)`
    @media (max-width: 768px) {
        width: 100% !important;
    }
`;

const ContentGrid = styled.div`
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 2rem;

    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
    }
`;

const LeftColumn = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const RightColumn = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const DocumentInfoCard = styled.div`
    background: var(--bg-secondary);
    border: 2px solid rgba(46, 151, 197, 0.2);
    border-radius: 20px;
    padding: 1.75rem;
    box-shadow: 0 8px 24px var(--shadow);
`;

const DescriptionCard = styled.div`
    background: var(--bg-secondary);
    border: 2px solid rgba(46, 151, 197, 0.2);
    border-radius: 20px;
    padding: 1.75rem;
    box-shadow: 0 8px 24px var(--shadow);
`;

const VersionHistoryCard = styled.div`
    background: var(--bg-secondary);
    border: 2px solid rgba(46, 151, 197, 0.2);
    border-radius: 20px;
    padding: 1.75rem;
    box-shadow: 0 8px 24px var(--shadow);
`;

const ChatCard = styled.div`
    background: var(--bg-secondary);
    border: 2px solid rgba(46, 151, 197, 0.2);
    border-radius: 20px;
    box-shadow: 0 8px 24px var(--shadow);
    height: 100%;
`;

const CardHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
`;

const CardIcon = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const CardTitle = styled.h2`
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary);
    font-family: 'Poppins', sans-serif;
`;

const InfoGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const InfoItem = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: var(--bg-primary);
    border-radius: 12px;
`;

const InfoIcon = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const InfoContent = styled.div`
    flex: 1;
`;

const InfoLabel = styled.div`
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.25rem;
    font-family: 'Poppins', sans-serif;
`;

const InfoValue = styled.div`
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--text-primary);
    font-family: 'Poppins', sans-serif;
`;

const DescriptionText = styled.p`
    font-size: 0.9375rem;
    color: var(--text-secondary);
    font-family: 'Poppins', sans-serif;
    line-height: 1.6;
    white-space: pre-wrap;
`;

const VersionList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
`;

const VersionItem = styled.div<{ expanded: boolean }>`
    background: var(--bg-primary);
    border: 2px solid ${props => props.expanded ? 'rgb(46, 151, 197)' : 'var(--border-color)'};
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s ease;
`;

const VersionHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(46, 151, 197, 0.05);
    }
`;

const VersionInfo = styled.div`
    flex: 1;
`;

const VersionNumber = styled.div`
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--text-primary);
    font-family: 'Poppins', sans-serif;
    margin-bottom: 0.25rem;
`;

const VersionMeta = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8125rem;
    color: var(--text-secondary);
    font-family: 'Poppins', sans-serif;

    svg {
        width: 12px;
        height: 12px;
    }
`;

const VersionActions = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const VersionDetails = styled.div`
    padding: 1rem;
    border-top: 1px solid var(--border-color);
    background: var(--bg-secondary);
`;

const DetailItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    font-size: 0.875rem;
    font-family: 'Poppins', sans-serif;
`;

const DetailLabel = styled.div`
    font-weight: 600;
    color: var(--text-secondary);
`;

const DetailValue = styled.div`
    font-weight: 500;
    color: var(--text-primary);
`;

const DetailAction = styled.div`
    display: flex;
    justify-content: flex-end;
    padding-top: 1rem;
    margin-top: 1rem;
    border-top: 1px solid var(--border-color);
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
`;

const DownloadVersionButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: linear-gradient(135deg, rgb(46, 151, 197), rgb(150, 129, 158));
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 0.875rem;
    font-weight: 600;
    font-family: 'Poppins', sans-serif;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(46, 151, 197, 0.3);
    }
`;

const EditButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: linear-gradient(135deg, rgb(59, 130, 246), rgb(99, 102, 241));
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 0.875rem;
    font-weight: 600;
    font-family: 'Poppins', sans-serif;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
`;

const DeleteVersionButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: linear-gradient(135deg, rgb(239, 68, 68), rgb(220, 38, 38));
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 0.875rem;
    font-weight: 600;
    font-family: 'Poppins', sans-serif;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }
`;

const ModalContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const DescriptionField = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const DescriptionLabel = styled.label`
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--text-primary);
    font-family: 'Poppins', sans-serif;
`;

const DescriptionTextArea = styled.textarea`
    padding: 0.875rem;
    border: 2px solid rgba(46, 151, 197, 0.3);
    border-radius: 12px;
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 0.9375rem;
    font-family: 'Poppins', sans-serif;
    resize: vertical;
    transition: all 0.3s ease;

    &:focus {
        outline: none;
        border-color: rgb(46, 151, 197);
        box-shadow: 0 0 0 3px rgba(46, 151, 197, 0.1);
    }

    &::placeholder {
        color: var(--text-tertiary);
    }
`;

const UploadArea = styled.div`
    position: relative;
    width: 100%;
`;

const UploadLabel = styled.label`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 200px;
    border: 2px dashed rgba(46, 151, 197, 0.3);
    border-radius: 16px;
    background: rgba(46, 151, 197, 0.05);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(46, 151, 197, 0.1);
        border-color: rgb(46, 151, 197);
    }
`;

const UploadTitle = styled.p`
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-top: 1rem;
    font-family: 'Poppins', sans-serif;
`;

const UploadSubtitle = styled.p`
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-top: 0.5rem;
    font-family: 'Poppins', sans-serif;
`;

const UploadHint = styled.p`
    font-size: 0.75rem;
    color: var(--text-tertiary);
    margin-top: 0.5rem;
    font-family: 'Poppins', sans-serif;
`;

const FileInput = styled.input`
    display: none;
`;

const SelectedFile = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(46, 151, 197, 0.1);
    border-radius: 12px;
`;

const FileInfo = styled.div`
    flex: 1;
`;

const FileName = styled.div`
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--text-primary);
    font-family: 'Poppins', sans-serif;
`;

const FileSize = styled.div`
    font-size: 0.75rem;
    color: var(--text-secondary);
    font-family: 'Poppins', sans-serif;
    margin-top: 0.25rem;
`;

const ModalActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 2px solid var(--border-color);
`;

const CancelButton = styled.button`
    padding: 0.875rem 1.75rem;
    background: var(--bg-secondary);
    border: 2px solid rgba(46, 151, 197, 0.3);
    border-radius: 12px;
    font-size: 0.9375rem;
    font-weight: 600;
    font-family: 'Poppins', sans-serif;
    color: rgb(46, 151, 197);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(46, 151, 197, 0.1);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(46, 151, 197, 0.15);
    }
`;

export default DocumentDetailPage;