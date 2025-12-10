import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyDepartmentDocuments, uploadDocument, requestDocumentDeletion } from '../../api/documentService';
import type { Document } from '../../types/document';
import { toast } from 'react-hot-toast';
import { Upload, FileText, Trash2, Search, Filter, Clock, User, FileUp, Eye } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import styled from 'styled-components';
import Loader from '../../components/common/Loader';
import HoverButton from '../../components/common/HoverButton';
import Modal from '../../components/common/Modal';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const DocumentManagementPage: React.FC = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'recent' | 'title'>('recent');
    const [filterBy, setFilterBy] = useState<'all' | 'mine'>('all');
    
    const [uploadTitle, setUploadTitle] = useState('');
    const [uploadDescription, setUploadDescription] = useState('');
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);

    const [isUploading, setIsUploading] = useState(false);
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

    const resetUploadForm = () => {
        setUploadTitle('');
        setUploadDescription('');
        setFileToUpload(null);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFileToUpload(file);
            if (uploadTitle === '') {
                const fileName = file.name;
                const lastDot = fileName.lastIndexOf('.');
                const baseName = lastDot > 0 ? fileName.substring(0, lastDot) : fileName;
                setUploadTitle(baseName);
            }
        }
    };

    const handleUpload = async () => {
        if (!fileToUpload || !uploadTitle.trim()) {
            toast.error("A title and a file are required to upload.");
            return;
        }
        setIsUploading(true);
        try {
            await toast.promise(uploadDocument(uploadTitle, uploadDescription, fileToUpload), {
                loading: 'Uploading document...',
                success: 'Document uploaded successfully!',
                error: (err) => err.response?.data?.message || 'Upload failed.',
            });
            setIsUploadModalOpen(false);
            resetUploadForm();
            fetchDocuments();
        } catch (error) {
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleOpenConfirmModal = (docId: number, e: React.MouseEvent) => {
        e.stopPropagation();
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

    const filteredDocuments = documents
        .filter(doc => 
            doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .filter(doc => {
            if (filterBy === 'mine') {
                return doc.latestVersion.uploaderUsername === 'currentUser'; // You'd need current user context
            }
            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'recent') {
                return new Date(b.latestVersion.uploadTimestamp).getTime() - 
                       new Date(a.latestVersion.uploadTimestamp).getTime();
            }
            return a.title.localeCompare(b.title);
        });

    const getDocColor = (index: number) => {
        const colors = [
            { bg: 'rgba(46, 151, 197, 0.1)', border: 'rgba(46, 151, 197, 0.3)', icon: 'linear-gradient(135deg, rgb(46, 151, 197), rgb(36, 121, 167))', text: 'rgb(46, 151, 197)' },
            { bg: 'rgba(150, 129, 158, 0.1)', border: 'rgba(150, 129, 158, 0.3)', icon: 'linear-gradient(135deg, rgb(150, 129, 158), rgb(120, 99, 128))', text: 'rgb(150, 129, 158)' },
            { bg: 'rgba(229, 151, 54, 0.1)', border: 'rgba(229, 151, 54, 0.3)', icon: 'linear-gradient(135deg, rgb(229, 151, 54), rgb(199, 121, 24))', text: 'rgb(229, 151, 54)' },
            { bg: 'rgba(46, 151, 197, 0.08)', border: 'rgba(46, 151, 197, 0.25)', icon: 'linear-gradient(135deg, rgb(70, 180, 230), rgb(46, 151, 197))', text: 'rgb(70, 180, 230)' }
        ];
        return colors[index % colors.length];
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

    return (
        <PageContainer>
            <PageHeader>
                <HeaderContent>
                    <PageTitle>
                        <FileText size={32} />
                        Document Management
                    </PageTitle>
                    <PageSubtitle>Manage department documents and files</PageSubtitle>
                </HeaderContent>
                
                {hasPermission('DOCUMENT_CREATE') && (
                    <UploadButton 
                        onClick={() => setIsUploadModalOpen(true)}
                        textOne="Upload Document"
                        textTwo="Upload File"
                        width="200px"
                        height="55px"
                    />
                )}
            </PageHeader>

            <ControlsContainer>
                <SearchContainer>
                    <SearchIcon>
                        <Search size={20} />
                    </SearchIcon>
                    <SearchInput
                        type="text"
                        placeholder="Search documents by title or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </SearchContainer>
                
                <FilterGroup>
                    <FilterSelect value={sortBy} onChange={(e) => setSortBy(e.target.value as 'recent' | 'title')}>
                        <option value="recent">Sort by Recent</option>
                        <option value="title">Sort by Title</option>
                    </FilterSelect>
                    
                    <FilterSelect value={filterBy} onChange={(e) => setFilterBy(e.target.value as 'all' | 'mine')}>
                        <option value="all">All Documents</option>
                        <option value="mine">My Documents</option>
                    </FilterSelect>
                </FilterGroup>
            </ControlsContainer>

            <StatsContainer>
                <StatCard style={{ background: 'rgba(46, 151, 197, 0.05)', borderColor: 'rgba(46, 151, 197, 0.2)' }}>
                    <StatIcon style={{ background: 'rgba(46, 151, 197, 0.1)', color: 'rgb(46, 151, 197)' }}>
                        <FileText size={24} />
                    </StatIcon>
                    <StatContent>
                        <StatLabel>Total Documents</StatLabel>
                        <StatValue>{documents.length}</StatValue>
                    </StatContent>
                </StatCard>
                
                <StatCard style={{ background: 'rgba(150, 129, 158, 0.05)', borderColor: 'rgba(150, 129, 158, 0.2)' }}>
                    <StatIcon style={{ background: 'rgba(150, 129, 158, 0.1)', color: 'rgb(150, 129, 158)' }}>
                        <Clock size={24} />
                    </StatIcon>
                    <StatContent>
                        <StatLabel>Last Updated</StatLabel>
                        <StatValue>
                            {documents.length > 0 
                                ? new Date(documents[0].latestVersion.uploadTimestamp).toLocaleDateString()
                                : 'Never'
                            }
                        </StatValue>
                    </StatContent>
                </StatCard>
            </StatsContainer>

            <DocumentGrid>
                {filteredDocuments.map((doc, index) => {
                    const colors = getDocColor(index);
                    
                    return (
                        <DocumentCard 
                            key={doc.id} 
                            onClick={() => navigate(`/admin/documents/${doc.id}`)}
                            style={{ borderColor: colors.border, background: colors.bg }}
                        >
                            <DocHeader>
                                <DocIcon style={{ background: colors.icon }}>
                                    <FileText size={24} />
                                </DocIcon>
                                <DocInfo>
                                    <DocTitle style={{ color: colors.icon.includes('06b6d4') ? '#06b6d4' : '#0ea5e9' }}>
                                        {doc.title}
                                    </DocTitle>
                                    <DocVersion>
                                        Version {doc.latestVersion.versionNumber}
                                    </DocVersion>
                                </DocInfo>
                                
                                {hasPermission('DOCUMENT_DELETE') && (
                                    <DeleteButton 
                                        onClick={(e) => handleOpenConfirmModal(doc.id, e)}
                                        title="Request Deletion"
                                    >
                                        <Trash2 size={18} />
                                    </DeleteButton>
                                )}
                            </DocHeader>
                            
                            <DocDescription>
                                {doc.description || 'No description provided'}
                            </DocDescription>
                            
                            <DocMeta>
                                <MetaItem>
                                    <User size={14} />
                                    <span>By {doc.latestVersion.uploaderUsername}</span>
                                </MetaItem>
                                <MetaItem>
                                    <Clock size={14} />
                                    <span>{new Date(doc.latestVersion.uploadTimestamp).toLocaleDateString()}</span>
                                </MetaItem>
                                {doc.fileSize && (
                                    <MetaItem>
                                        <FileUp size={14} />
                                        <span>{formatFileSize(doc.fileSize)}</span>
                                    </MetaItem>
                                )}
                            </DocMeta>
                            
                            <DocActions>
                                <ViewButton onClick={() => navigate(`/admin/documents/${doc.id}`)}>
                                    <Eye size={16} />
                                    View Details
                                </ViewButton>
                            </DocActions>
                        </DocumentCard>
                    );
                })}
            </DocumentGrid>

            {filteredDocuments.length === 0 && (
                <EmptyState>
                    <EmptyIcon>
                        <FileText size={48} />
                    </EmptyIcon>
                    <EmptyText>
                        {searchQuery ? 'No documents found matching your search' : 'No documents found'}
                    </EmptyText>
                    <EmptySubtext>
                        {searchQuery 
                            ? 'Try a different search term or clear the search'
                            : hasPermission('DOCUMENT_CREATE') 
                                ? 'Click "Upload Document" to add your first document'
                                : 'No documents available in your department'
                        }
                    </EmptySubtext>
                </EmptyState>
            )}

            <Modal isOpen={isUploadModalOpen} onClose={() => { setIsUploadModalOpen(false); resetUploadForm(); }} title="Upload New Document">
                <ModalContent>
                    <FormGroup>
                        <Label>
                            <LabelIcon style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }}>
                                <FileText size={16} />
                            </LabelIcon>
                            Document Title
                        </Label>
                        <Input
                            type="text"
                            value={uploadTitle}
                            onChange={(e) => setUploadTitle(e.target.value)}
                            placeholder="Enter document title"
                            required
                            style={{ borderLeft: '4px solid #06b6d4' }}
                        />
                    </FormGroup>
                    
                    <FormGroup>
                        <Label>
                            <LabelIcon style={{ background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9' }}>
                                <FileText size={16} />
                            </LabelIcon>
                            Description (Optional)
                        </Label>
                        <TextArea
                            value={uploadDescription}
                            onChange={(e) => setUploadDescription(e.target.value)}
                            rows={3}
                            placeholder="Add a description for this document..."
                        />
                    </FormGroup>
                    
                    <FormGroup>
                        <Label>
                            <LabelIcon style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' }}>
                                <Upload size={16} />
                            </LabelIcon>
                            Select File
                        </Label>
                        <FileUploadContainer>
                            <FileUploadLabel htmlFor="file-upload">
                                <Upload size={32} />
                                <UploadText>Click to upload or drag and drop</UploadText>
                                <UploadHint>PDF, DOC, DOCX, TXT up to 50MB</UploadHint>
                            </FileUploadLabel>
                            <FileInput
                                id="file-upload"
                                type="file"
                                onChange={handleFileSelect}
                                required
                            />
                        </FileUploadContainer>
                        
                        {fileToUpload && (
                            <SelectedFile>
                                <FileText size={16} />
                                {fileToUpload.name} ({formatFileSize(fileToUpload.size)})
                            </SelectedFile>
                        )}
                    </FormGroup>
                    
                    <ModalActions>
                        <CancelButton type="button" onClick={() => { setIsUploadModalOpen(false); resetUploadForm(); }}>
                            Cancel
                        </CancelButton>
                        <UploadButton type="button" onClick={handleUpload} disabled={isUploading || !fileToUpload || !uploadTitle.trim()}>
                            {isUploading ? 'Uploading...' : 'Upload Document'}
                        </UploadButton>
                    </ModalActions>
                </ModalContent>
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
    flex-direction: column;
    gap: 0.5rem;
`;

const PageTitle = styled.h1`
    font-size: 2rem;
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

const PageSubtitle = styled.p`
    font-size: 1rem;
    color: var(--text-secondary);
    font-family: 'Poppins', sans-serif;
    margin-left: 3.5rem;

    @media (max-width: 768px) {
        margin-left: 0;
    }
`;

const UploadButton = styled(HoverButton)`
    @media (max-width: 768px) {
        width: 100% !important;
    }
`;

const ControlsContainer = styled.div`
    display: flex;
    gap: 1.5rem;
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: var(--bg-secondary);
    border-radius: 16px;
    border: 2px solid rgba(46, 151, 197, 0.2);
    box-shadow: 0 4px 12px var(--shadow);

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const SearchContainer = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    position: relative;
`;

const SearchIcon = styled.div`
    position: absolute;
    left: 1rem;
    color: var(--text-tertiary);
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 0.875rem 1rem 0.875rem 3rem;
    background: var(--bg-primary);
    border: 2px solid var(--border-color);
    border-radius: 12px;
    font-size: 0.9375rem;
    font-family: 'Poppins', sans-serif;
    color: var(--text-primary);
    transition: all 0.3s ease;

    &::placeholder {
        color: var(--text-tertiary);
    }

    &:focus {
        outline: none;
        border-color: rgb(46, 151, 197);
        box-shadow: 0 0 0 3px rgba(46, 151, 197, 0.1);
    }
`;

const FilterGroup = styled.div`
    display: flex;
    gap: 1rem;

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const FilterSelect = styled.select`
    padding: 0.875rem 1rem;
    background: var(--bg-primary);
    border: 2px solid var(--border-color);
    border-radius: 12px;
    font-size: 0.9375rem;
    font-family: 'Poppins', sans-serif;
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 160px;

    &:focus {
        outline: none;
        border-color: rgb(46, 151, 197);
        box-shadow: 0 0 0 3px rgba(46, 151, 197, 0.1);
    }

    option {
        background: var(--bg-secondary);
        color: var(--text-primary);
    }
`;

const StatsContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
`;

const StatCard = styled.div`
    padding: 1.25rem;
    border: 2px solid;
    border-radius: 16px;
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const StatIcon = styled.div`
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const StatContent = styled.div`
    flex: 1;
`;

const StatLabel = styled.div`
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.25rem;
    font-family: 'Poppins', sans-serif;
`;

const StatValue = styled.div`
    font-size: 1.75rem;
    font-weight: 800;
    color: var(--text-primary);
    font-family: 'Poppins', sans-serif;
`;

const DocumentGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const DocumentCard = styled.div`
    background: var(--bg-secondary);
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 8px 24px var(--shadow);
    transition: all 0.3s ease;
    border: 2px solid;
    display: flex;
    flex-direction: column;
    cursor: pointer;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 32px var(--shadow);
    }
`;

const DocHeader = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1rem;
`;

const DocIcon = styled.div`
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
`;

const DocInfo = styled.div`
    flex: 1;
    overflow: hidden;
`;

const DocTitle = styled.h3`
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
    font-family: 'Poppins', sans-serif;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const DocVersion = styled.div`
    font-size: 0.875rem;
    color: var(--text-secondary);
    font-family: 'Poppins', sans-serif;
`;

const DeleteButton = styled.button`
    width: 40px;
    height: 40px;
    background: var(--bg-secondary);
    border: 2px solid rgba(239, 68, 68, 0.2);
    border-radius: 10px;
    color: #EF4444;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    flex-shrink: 0;

    &:hover {
        background: rgba(239, 68, 68, 0.1);
        transform: scale(1.1);
    }
`;

const DocDescription = styled.p`
    font-size: 0.9375rem;
    color: var(--text-secondary);
    font-family: 'Poppins', sans-serif;
    line-height: 1.5;
    margin-bottom: 1rem;
    flex: 1;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
`;

const DocMeta = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    padding: 0.75rem;
    background: rgba(46, 151, 197, 0.05);
    border-radius: 10px;
`;

const MetaItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8125rem;
    color: var(--text-secondary);
    font-family: 'Poppins', sans-serif;

    svg {
        width: 14px;
        height: 14px;
    }
`;

const DocActions = styled.div`
    display: flex;
    gap: 0.75rem;
    margin-top: auto;
`;

const ViewButton = styled.button`
    flex: 1;
    padding: 0.75rem 1rem;
    background: var(--bg-secondary);
    border: 2px solid rgba(46, 151, 197, 0.3);
    color: rgb(46, 151, 197);
    border-radius: 10px;
    font-size: 0.875rem;
    font-weight: 600;
    font-family: 'Poppins', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(46, 151, 197, 0.1);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px var(--shadow);
    }
`;

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    background: var(--bg-secondary);
    border-radius: 20px;
    border: 2px dashed rgba(46, 151, 197, 0.2);
    text-align: center;
`;

const EmptyIcon = styled.div`
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, rgba(46, 151, 197, 0.1), rgba(150, 129, 158, 0.1));
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgb(46, 151, 197);
    margin-bottom: 1.5rem;
`;

const EmptyText = styled.h3`
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
    font-family: 'Poppins', sans-serif;
`;

const EmptySubtext = styled.p`
    font-size: 1rem;
    color: var(--text-secondary);
    font-family: 'Poppins', sans-serif;
`;

const ModalContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
`;

const Label = styled.label`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
    font-family: 'Poppins', sans-serif;
`;

const LabelIcon = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 6px;
`;

const Input = styled.input`
    width: 100%;
    background: var(--bg-primary);
    border: 2px solid var(--border-color);
    color: var(--text-primary);
    padding: 0.875rem 1rem;
    border-radius: 10px;
    font-size: 0.9375rem;
    font-family: 'Poppins', sans-serif;
    transition: all 0.3s ease;

    &::placeholder {
        color: var(--text-tertiary);
    }

    &:focus {
        outline: none;
        border-color: rgb(46, 151, 197);
        box-shadow: 0 0 0 3px rgba(46, 151, 197, 0.1);
    }
`;

const TextArea = styled.textarea`
    width: 100%;
    background: var(--bg-primary);
    border: 2px solid var(--border-color);
    color: var(--text-primary);
    padding: 0.875rem 1rem;
    border-radius: 10px;
    font-size: 0.9375rem;
    font-family: 'Poppins', sans-serif;
    transition: all 0.3s ease;
    resize: vertical;

    &::placeholder {
        color: var(--text-tertiary);
    }

    &:focus {
        outline: none;
        border-color: rgb(46, 151, 197);
        box-shadow: 0 0 0 3px rgba(46, 151, 197, 0.1);
    }
`;

const FileUploadContainer = styled.div`
    position: relative;
    width: 100%;
`;

const FileUploadLabel = styled.label`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 160px;
    border: 2px dashed rgba(46, 151, 197, 0.3);
    border-radius: 12px;
    background: rgba(46, 151, 197, 0.05);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(46, 151, 197, 0.1);
        border-color: rgb(46, 151, 197);
    }
`;

const UploadText = styled.p`
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-top: 1rem;
    font-family: 'Poppins', sans-serif;
`;

const UploadHint = styled.p`
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-top: 0.25rem;
    font-family: 'Poppins', sans-serif;
`;

const FileInput = styled.input`
    display: none;
`;

const SelectedFile = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: rgba(46, 151, 197, 0.1);
    border-radius: 10px;
    font-size: 0.875rem;
    color: rgb(46, 151, 197);
    font-weight: 500;
    font-family: 'Poppins', sans-serif;
    margin-top: 0.75rem;
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

export default DocumentManagementPage;