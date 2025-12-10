import React, { useEffect, useState, useCallback } from 'react';
import { getPendingDeletions, approveDeletion, rejectDeletion } from '../../api/documentService';
import type { DocumentApproval } from '../../types/document';
import { toast } from 'react-hot-toast';
import { Check, X, ShieldQuestion, Search, Filter, User, Building, Calendar, FileText, AlertCircle, Clock, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Loader from '../../components/common/Loader';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const ApprovalQueuePage: React.FC = () => {
    const [pendingDocs, setPendingDocs] = useState<DocumentApproval[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterBy, setFilterBy] = useState<'all' | 'department' | 'user'>('all');
    const [selectedDepartment, setSelectedDepartment] = useState<string>('');
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<DocumentApproval | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [sortConfig, setSortConfig] = useState<{key: keyof DocumentApproval, direction: 'asc' | 'desc'} | null>(null);
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    
    const { hasPermission } = usePermissions();
    const navigate = useNavigate();

    // Permission check on component mount
    useEffect(() => {
        if (!hasPermission('DOCUMENT_APPROVAL')) {
            toast.error("You don't have permission to access this page.");
            navigate('/admin/dashboard');
        }
    }, [hasPermission, navigate]);

    const fetchPendingDocuments = useCallback(async () => {
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
    }, [hasPermission]);

    useEffect(() => {
        fetchPendingDocuments();
    }, [fetchPendingDocuments]);

    const departments = Array.from(new Set(pendingDocs.map(doc => doc.departmentName)));

    const calculateDaysOld = (dateString: string) => {
        const requestedDate = new Date(dateString);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - requestedDate.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const getUrgencyColor = (daysOld: number) => {
        if (daysOld > 7) return '#ef4444'; // red
        if (daysOld > 3) return '#f59e0b'; // amber
        return '#10b981'; // green
    };

    const handleSort = (key: keyof DocumentApproval) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedDocuments = React.useMemo(() => {
        let sortableItems = [...pendingDocs];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [pendingDocs, sortConfig]);

    const filteredDocuments = sortedDocuments.filter(doc => {
        const matchesSearch = 
            doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.departmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.requesterUsername.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesFilter = 
            filterBy === 'all' || 
            (filterBy === 'department' && selectedDepartment ? 
                doc.departmentName === selectedDepartment : true) ||
            (filterBy === 'user' && doc.requesterUsername);
        
        return matchesSearch && matchesFilter;
    });

    const handleApproveClick = (doc: DocumentApproval) => {
        setSelectedDoc(doc);
        setIsApproveModalOpen(true);
    };

    const handleRejectClick = (doc: DocumentApproval) => {
        setSelectedDoc(doc);
        setIsRejectModalOpen(true);
    };

    const handleApproveConfirm = async () => {
        if (!selectedDoc) return;
        
        setIsProcessing(true);
        try {
            await toast.promise(approveDeletion(selectedDoc.documentId), {
                loading: 'Approving deletion...',
                success: 'Deletion approved successfully!',
                error: (err) => err.response?.data?.message || 'Failed to approve deletion.',
            });
            fetchPendingDocuments();
        } catch (error) {
            console.error(error);
        } finally {
            setIsProcessing(false);
            setIsApproveModalOpen(false);
            setSelectedDoc(null);
        }
    };

    const handleRejectConfirm = async () => {
        if (!selectedDoc) return;
        
        setIsProcessing(true);
        try {
            await toast.promise(rejectDeletion(selectedDoc.documentId), {
                loading: 'Rejecting deletion...',
                success: 'Deletion rejected!',
                error: (err) => err.response?.data?.message || 'Failed to reject deletion.',
            });
            fetchPendingDocuments();
        } catch (error) {
            console.error(error);
        } finally {
            setIsProcessing(false);
            setIsRejectModalOpen(false);
            setSelectedDoc(null);
        }
    };

    const toggleRowExpand = (docId: number) => {
        setExpandedRow(expandedRow === docId ? null : docId);
    };

    if (!hasPermission('DOCUMENT_APPROVAL')) {
        return null;
    }

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
                        <ShieldQuestion size={32} />
                        Deletion Approval Queue
                    </PageTitle>
                    <PageSubtitle>Review and manage document deletion requests</PageSubtitle>
                </HeaderContent>
                
                <QueueStats>
                    <StatBadge style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                        <AlertCircle size={16} />
                        {pendingDocs.length} Pending Requests
                    </StatBadge>
                </QueueStats>
            </PageHeader>

            <ControlsContainer>
                <SearchContainer>
                    <SearchIcon>
                        <Search size={20} />
                    </SearchIcon>
                    <SearchInput
                        type="text"
                        placeholder="Search by document title, department, or requester..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </SearchContainer>
                
                <FilterGroup>
                    <FilterSelect value={filterBy} onChange={(e) => setFilterBy(e.target.value as 'all' | 'department' | 'user')}>
                        <option value="all">All Requests</option>
                        <option value="department">Filter by Department</option>
                        <option value="user">My Department Only</option>
                    </FilterSelect>
                    
                    {filterBy === 'department' && (
                        <DepartmentSelect value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
                            <option value="">All Departments</option>
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </DepartmentSelect>
                    )}
                </FilterGroup>
            </ControlsContainer>

            <StatsContainer>
                <StatCard style={{ background: 'rgba(46, 151, 197, 0.05)', borderColor: 'rgba(46, 151, 197, 0.2)' }}>
                    <StatIcon style={{ background: 'rgba(46, 151, 197, 0.1)', color: 'rgb(46, 151, 197)' }}>
                        <FileText size={24} />
                    </StatIcon>
                    <StatContent>
                        <StatLabel>Total Pending</StatLabel>
                        <StatValue>{pendingDocs.length}</StatValue>
                    </StatContent>
                </StatCard>
                
                <StatCard style={{ background: 'rgba(150, 129, 158, 0.05)', borderColor: 'rgba(150, 129, 158, 0.2)' }}>
                    <StatIcon style={{ background: 'rgba(150, 129, 158, 0.1)', color: 'rgb(150, 129, 158)' }}>
                        <Clock size={24} />
                    </StatIcon>
                    <StatContent>
                        <StatLabel>Average Wait Time</StatLabel>
                        <StatValue>
                            {pendingDocs.length > 0 
                                ? `${Math.round(pendingDocs.reduce((acc, doc) => acc + calculateDaysOld(doc.requestedAt), 0) / pendingDocs.length)} days`
                                : '0 days'
                            }
                        </StatValue>
                    </StatContent>
                </StatCard>
                
                <StatCard style={{ background: 'rgba(229, 151, 54, 0.05)', borderColor: 'rgba(229, 151, 54, 0.2)' }}>
                    <StatIcon style={{ background: 'rgba(229, 151, 54, 0.1)', color: 'rgb(229, 151, 54)' }}>
                        <Building size={24} />
                    </StatIcon>
                    <StatContent>
                        <StatLabel>Departments</StatLabel>
                        <StatValue>{departments.length}</StatValue>
                    </StatContent>
                </StatCard>
            </StatsContainer>

            <TableContainer>
                <StyledTable>
                    <thead>
                        <tr>
                            <TableHeader onClick={() => handleSort('title')}>
                                <TableHeaderContent>
                                    Document Title
                                    {sortConfig?.key === 'title' && (
                                        <SortIcon>
                                            {sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </SortIcon>
                                    )}
                                </TableHeaderContent>
                            </TableHeader>
                            <TableHeader onClick={() => handleSort('departmentName')}>
                                <TableHeaderContent>
                                    Department
                                    {sortConfig?.key === 'departmentName' && (
                                        <SortIcon>
                                            {sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </SortIcon>
                                    )}
                                </TableHeaderContent>
                            </TableHeader>
                            <TableHeader onClick={() => handleSort('requesterUsername')}>
                                <TableHeaderContent>
                                    Requested By
                                    {sortConfig?.key === 'requesterUsername' && (
                                        <SortIcon>
                                            {sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </SortIcon>
                                    )}
                                </TableHeaderContent>
                            </TableHeader>
                            <TableHeader onClick={() => handleSort('requestedAt')}>
                                <TableHeaderContent>
                                    Date Requested
                                    {sortConfig?.key === 'requestedAt' && (
                                        <SortIcon>
                                            {sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </SortIcon>
                                    )}
                                </TableHeaderContent>
                            </TableHeader>
                            <TableHeader>
                                <TableHeaderContent>
                                    Urgency
                                </TableHeaderContent>
                            </TableHeader>
                            <TableHeader style={{ textAlign: 'center' }}>
                                Actions
                            </TableHeader>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredDocuments.length > 0 ? (
                            filteredDocuments.map((doc) => {
                                const daysOld = calculateDaysOld(doc.requestedAt);
                                const urgencyColor = getUrgencyColor(daysOld);
                                
                                return (
                                    <React.Fragment key={doc.documentId}>
                                        <TableRow onClick={() => toggleRowExpand(doc.documentId)}>
                                            <TableCell>
                                                <DocumentTitle>
                                                    <FileIcon>
                                                        <FileText size={16} />
                                                    </FileIcon>
                                                    {doc.title}
                                                </DocumentTitle>
                                            </TableCell>
                                            <TableCell>
                                                <DepartmentCell>
                                                    <Building size={14} />
                                                    {doc.departmentName}
                                                </DepartmentCell>
                                            </TableCell>
                                            <TableCell>
                                                <UserCell>
                                                    <User size={14} />
                                                    {doc.requesterUsername}
                                                </UserCell>
                                            </TableCell>
                                            <TableCell>
                                                <DateCell>
                                                    <Calendar size={14} />
                                                    {new Date(doc.requestedAt).toLocaleDateString()}
                                                </DateCell>
                                            </TableCell>
                                            <TableCell>
                                                <UrgencyBadge style={{ background: `${urgencyColor}15`, color: urgencyColor }}>
                                                    <Clock size={12} />
                                                    {daysOld} day{daysOld !== 1 ? 's' : ''}
                                                </UrgencyBadge>
                                            </TableCell>
                                            <TableCell>
                                                <ActionButtons>
                                                    <ApproveButton 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleApproveClick(doc);
                                                        }}
                                                        title="Approve"
                                                    >
                                                        <Check size={18} />
                                                    </ApproveButton>
                                                    <RejectButton 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRejectClick(doc);
                                                        }}
                                                        title="Reject"
                                                    >
                                                        <X size={18} />
                                                    </RejectButton>
                                                    <ExpandButton>
                                                        {expandedRow === doc.documentId ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                    </ExpandButton>
                                                </ActionButtons>
                                            </TableCell>
                                        </TableRow>
                                        {expandedRow === doc.documentId && (
                                            <ExpandedRow>
                                                <td colSpan={6}>
                                                    <ExpandedContent>
                                                        <ExpandedSection>
                                                            <ExpandedTitle>Request Details</ExpandedTitle>
                                                            <DetailGrid>
                                                                <DetailItem>
                                                                    <DetailLabel>
                                                                        <Building size={14} />
                                                                        Department
                                                                    </DetailLabel>
                                                                    <DetailValue>{doc.departmentName}</DetailValue>
                                                                </DetailItem>
                                                                <DetailItem>
                                                                    <DetailLabel>
                                                                        <User size={14} />
                                                                        Requested By
                                                                    </DetailLabel>
                                                                    <DetailValue>{doc.requesterUsername}</DetailValue>
                                                                </DetailItem>
                                                                <DetailItem>
                                                                    <DetailLabel>
                                                                        <Calendar size={14} />
                                                                        Request Date
                                                                    </DetailLabel>
                                                                    <DetailValue>{new Date(doc.requestedAt).toLocaleString()}</DetailValue>
                                                                </DetailItem>
                                                                <DetailItem>
                                                                    <DetailLabel>
                                                                        <Clock size={14} />
                                                                        Days Pending
                                                                    </DetailLabel>
                                                                    <DetailValue>
                                                                        <UrgencyBadge style={{ background: `${urgencyColor}15`, color: urgencyColor }}>
                                                                            {daysOld} day{daysOld !== 1 ? 's' : ''}
                                                                        </UrgencyBadge>
                                                                    </DetailValue>
                                                                </DetailItem>
                                                            </DetailGrid>
                                                        </ExpandedSection>
                                                        
                                                        <ActionSection>
                                                            <ActionTitle>Quick Actions</ActionTitle>
                                                            <ActionButtonsExpanded>
                                                                <ApproveButtonExpanded onClick={() => handleApproveClick(doc)}>
                                                                    <Check size={18} />
                                                                    Approve Deletion
                                                                </ApproveButtonExpanded>
                                                                <RejectButtonExpanded onClick={() => handleRejectClick(doc)}>
                                                                    <X size={18} />
                                                                    Reject Request
                                                                </RejectButtonExpanded>
                                                            </ActionButtonsExpanded>
                                                        </ActionSection>
                                                    </ExpandedContent>
                                                </td>
                                            </ExpandedRow>
                                        )}
                                    </React.Fragment>
                                );
                            })
                        ) : (
                            <TableRow>
                                <td colSpan={6}>
                                    <EmptyState>
                                        <EmptyIcon>
                                            <ShieldQuestion size={48} />
                                        </EmptyIcon>
                                        <EmptyText>
                                            {searchQuery || filterBy !== 'all' || selectedDepartment
                                                ? 'No matching deletion requests found'
                                                : 'No pending deletion requests'
                                            }
                                        </EmptyText>
                                        <EmptySubtext>
                                            {searchQuery || filterBy !== 'all' || selectedDepartment
                                                ? 'Try adjusting your search or filter criteria'
                                                : 'The approval queue is currently empty'
                                            }
                                        </EmptySubtext>
                                    </EmptyState>
                                </td>
                            </TableRow>
                        )}
                    </tbody>
                </StyledTable>
            </TableContainer>

            {/* Confirmation Modals */}
            <ConfirmationModal
                isOpen={isApproveModalOpen}
                onClose={() => {
                    setIsApproveModalOpen(false);
                    setSelectedDoc(null);
                }}
                onConfirm={handleApproveConfirm}
                title="Approve Deletion Request"
                message={
                    selectedDoc ? 
                    `Are you sure you want to approve the deletion of "${selectedDoc.title}"? This action cannot be undone and the document will be permanently deleted.` 
                    : ''
                }
                confirmText="Approve Deletion"
                confirmColor="#10b981"
                cancelText="Cancel"
                isConfirming={isProcessing}
                icon={<Check size={32} />}
                isApprove={true}
            />

            <ConfirmationModal
                isOpen={isRejectModalOpen}
                onClose={() => {
                    setIsRejectModalOpen(false);
                    setSelectedDoc(null);
                }}
                onConfirm={handleRejectConfirm}
                title="Reject Deletion Request"
                message={
                    selectedDoc ? 
                    `Are you sure you want to reject the deletion request for "${selectedDoc.title}"? The document will remain in the system.` 
                    : ''
                }
                confirmText="Reject Request"
                confirmColor="#ef4444"
                cancelText="Cancel"
                isConfirming={isProcessing}
                icon={<X size={32} />}
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

const QueueStats = styled.div`
    display: flex;
    gap: 1rem;
`;

const StatBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    border-radius: 12px;
    font-size: 0.9375rem;
    font-weight: 600;
    font-family: 'Poppins', sans-serif;
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
    min-width: 180px;

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

const DepartmentSelect = styled.select`
    padding: 0.875rem 1rem;
    background: var(--bg-primary);
    border: 2px solid var(--border-color);
    border-radius: 12px;
    font-size: 0.9375rem;
    font-family: 'Poppins', sans-serif;
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 180px;

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

const TableContainer = styled.div`
    background: var(--bg-secondary);
    border-radius: 16px;
    border: 2px solid rgba(46, 151, 197, 0.2);
    box-shadow: 0 8px 24px var(--shadow);
    overflow: hidden;
    margin-bottom: 2rem;
`;

const StyledTable = styled.table`
    width: 100%;
    border-collapse: collapse;
`;

const TableHeader = styled.th`
    background: linear-gradient(135deg, rgba(46, 151, 197, 0.05), rgba(150, 129, 158, 0.05));
    padding: 1.25rem 1.5rem;
    text-align: left;
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--text-primary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-family: 'Poppins', sans-serif;
    border-bottom: 2px solid var(--border-color);
    cursor: pointer;
    transition: all 0.3s ease;
    user-select: none;

    &:hover {
        background: rgba(46, 151, 197, 0.1);
    }

    &:first-child {
        border-top-left-radius: 14px;
    }

    &:last-child {
        border-top-right-radius: 14px;
    }
`;

const TableHeaderContent = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const SortIcon = styled.span`
    display: flex;
    align-items: center;
    color: rgb(46, 151, 197);
`;

const TableRow = styled.tr`
    cursor: pointer;
    transition: all 0.3s ease;
    border-bottom: 1px solid var(--border-color);

    &:hover {
        background: rgba(46, 151, 197, 0.02);
    }

    &:last-child {
        border-bottom: none;
    }
`;

const TableCell = styled.td`
    padding: 1.25rem 1.5rem;
    font-size: 0.9375rem;
    color: var(--text-primary);
    font-family: 'Poppins', sans-serif;
    vertical-align: middle;
`;

const DocumentTitle = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 600;
    max-width: 250px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const FileIcon = styled.div`
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: rgba(46, 151, 197, 0.1);
    color: rgb(46, 151, 197);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
`;

const DepartmentCell = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
`;

const UserCell = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
`;

const DateCell = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
`;

const UrgencyBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    font-family: 'Poppins', sans-serif;
`;

const ActionButtons = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    justify-content: center;
`;

const ApproveButton = styled.button`
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #10b981, #059669);
    border: none;
    border-radius: 10px;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }
`;

const RejectButton = styled.button`
    width: 40px;
    height: 40px;
    background: var(--bg-secondary);
    border: 2px solid rgba(239, 68, 68, 0.3);
    border-radius: 10px;
    color: #EF4444;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(239, 68, 68, 0.1);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
    }
`;

const ExpandButton = styled.div`
    width: 40px;
    height: 40px;
    background: rgba(46, 151, 197, 0.1);
    border-radius: 10px;
    color: rgb(46, 151, 197);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(46, 151, 197, 0.2);
    }
`;

const ExpandedRow = styled.tr`
    background: rgba(46, 151, 197, 0.02);
`;

const ExpandedContent = styled.div`
    padding: 1.5rem;
    background: var(--bg-secondary);
    border-top: 1px solid var(--border-color);
`;

const ExpandedSection = styled.div`
    margin-bottom: 1.5rem;
`;

const ExpandedTitle = styled.h4`
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 1rem;
    font-family: 'Poppins', sans-serif;
`;

const DetailGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
`;

const DetailItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
    background: var(--bg-primary);
    border-radius: 10px;
`;

const DetailLabel = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-family: 'Poppins', sans-serif;
`;

const DetailValue = styled.div`
    font-size: 0.9375rem;
    font-weight: 500;
    color: var(--text-primary);
    font-family: 'Poppins', sans-serif;
`;

const ActionSection = styled.div`
    border-top: 1px solid var(--border-color);
    padding-top: 1.5rem;
`;

const ActionTitle = styled.h4`
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 1rem;
    font-family: 'Poppins', sans-serif;
`;

const ActionButtonsExpanded = styled.div`
    display: flex;
    gap: 1rem;
`;

const ApproveButtonExpanded = styled.button`
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #10b981, #059669);
    border: none;
    border-radius: 10px;
    font-size: 0.875rem;
    font-weight: 600;
    font-family: 'Poppins', sans-serif;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }
`;

const RejectButtonExpanded = styled.button`
    padding: 0.75rem 1.5rem;
    background: var(--bg-secondary);
    border: 2px solid rgba(239, 68, 68, 0.3);
    color: #EF4444;
    border-radius: 10px;
    font-size: 0.875rem;
    font-weight: 600;
    font-family: 'Poppins', sans-serif;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(239, 68, 68, 0.1);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
    }
`;

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    background: var(--bg-secondary);
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

export default ApprovalQueuePage;