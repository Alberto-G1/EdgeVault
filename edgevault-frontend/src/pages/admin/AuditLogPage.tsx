import React, { useEffect, useState } from 'react';
import { getAuditLogs } from '../../api/auditService';
import type { AuditLog } from '../../types/audit';
import { useToast } from '../../context/ToastContext';
import { usePermissions } from '../../hooks/usePermissions';
import { ShieldCheck, ShieldAlert, Search, Filter, Calendar, User, Activity, Lock, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { format } from 'date-fns';
import styled from 'styled-components';
import Loader from '../../components/common/Loader';

const AuditLogPage: React.FC = () => {
    const { showError, showSuccess } = useToast();
    const { hasPermission } = usePermissions();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [verificationStatus, setVerificationStatus] = useState<'VERIFYING' | 'VALID' | 'INVALID'>('VERIFYING');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterBy, setFilterBy] = useState<'all' | 'user' | 'action'>('all');
    const [selectedAction, setSelectedAction] = useState<string>('');
    const [selectedUser, setSelectedUser] = useState<string>('');
    const [expandedLog, setExpandedLog] = useState<number | null>(null);
    const [sortConfig, setSortConfig] = useState<{key: keyof AuditLog, direction: 'asc' | 'desc'} | null>({ key: 'timestamp', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        const fetchAndVerifyLogs = async () => {
            try {
                setLoading(true);
                const fetchedLogs = await getAuditLogs();
                const sortedLogs = [...fetchedLogs].sort((a, b) => b.id - a.id); // Newest first by default
                setLogs(sortedLogs);
                verifyChain(sortedLogs);
            } catch (error) {
                showError('Error', 'Failed to fetch audit logs.');
                setVerificationStatus('INVALID');
            } finally {
                setLoading(false);
            }
        };
        fetchAndVerifyLogs();
    }, []);

    const verifyChain = async (logsToVerify: AuditLog[]) => {
        if (logsToVerify.length === 0) {
            setVerificationStatus('VALID');
            return;
        }

        // Sort ascending by ID for verification
        const sortedForVerification = [...logsToVerify].sort((a, b) => a.id - b.id);
        
        for (let i = 0; i < sortedForVerification.length; i++) {
            const currentLog = sortedForVerification[i];
            const previousHash = i === 0 ? "0" : sortedForVerification[i-1].currentHash;

            if (currentLog.previousHash !== previousHash) {
                setVerificationStatus('INVALID');
                showError('Security Alert', `Tampering detected! Chain broken at log ID: ${currentLog.id}`);
                return;
            }
        }
        setVerificationStatus('VALID');
        showSuccess('Verified', 'Audit chain verified successfully!');
    };

    const users = Array.from(new Set(logs.map(log => log.username)));
    const actions = Array.from(new Set(logs.map(log => log.action)));

    const handleSort = (key: keyof AuditLog) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedLogs = React.useMemo(() => {
        let sortableItems = [...logs];
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
    }, [logs, sortConfig]);

    const filteredLogs = sortedLogs.filter(log => {
        const matchesSearch = 
            log.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.currentHash.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesFilter = 
            filterBy === 'all' || 
            (filterBy === 'user' && selectedUser ? log.username === selectedUser : true) ||
            (filterBy === 'action' && selectedAction ? log.action === selectedAction : true);
        
        return matchesSearch && matchesFilter;
    });
    
    // Pagination calculations
    const totalItems = filteredLogs.length;
    const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(totalItems / itemsPerPage);
    const startIndex = itemsPerPage === -1 ? 0 : (currentPage - 1) * itemsPerPage;
    const endIndex = itemsPerPage === -1 ? totalItems : startIndex + itemsPerPage;
    const currentLogs = filteredLogs.slice(startIndex, endIndex);
    
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };
    
    const handleItemsPerPageChange = (value: number) => {
        setItemsPerPage(value);
        setCurrentPage(1); // Reset to first page
    };

    const getActionColor = (action: string) => {
        const actionLower = action.toLowerCase();
        if (actionLower.includes('create') || actionLower.includes('add')) return '#10b981'; // green
        if (actionLower.includes('update') || actionLower.includes('edit')) return '#0ea5e9'; // blue
        if (actionLower.includes('delete') || actionLower.includes('remove')) return '#ef4444'; // red
        if (actionLower.includes('login') || actionLower.includes('logout')) return '#8b5cf6'; // purple
        return '#64748b'; // gray
    };

    const toggleLogExpand = (logId: number) => {
        setExpandedLog(expandedLog === logId ? null : logId);
    };

    const exportToCSV = () => {
        const headers = ['ID', 'Timestamp', 'User', 'Action', 'Details', 'Previous Hash', 'Current Hash'];
        const csvContent = [
            headers.join(','),
            ...filteredLogs.map(log => [
                log.id,
                `"${format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}"`,
                `"${log.username}"`,
                `"${log.action}"`,
                `"${log.details}"`,
                `"${log.previousHash}"`,
                `"${log.currentHash}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `audit_logs_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        showSuccess('Success', 'Audit logs exported successfully!');
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
                <PageHeaderContent>
                    <PageTitle>
                        <ShieldCheck size={32} />
                        Audit Logs
                    </PageTitle>
                    <PageSubtitle>Immutable record of all system activities</PageSubtitle>
                </PageHeaderContent>
                
                <HeaderActions>
                    <VerificationBadge $status={verificationStatus}>
                        {verificationStatus === 'VALID' ? (
                            <>
                                <ShieldCheck size={16} />
                                Chain Valid
                            </>
                        ) : verificationStatus === 'INVALID' ? (
                            <>
                                <ShieldAlert size={16} />
                                Chain Invalid!
                            </>
                        ) : (
                            <>
                                <Activity size={16} />
                                Verifying...
                            </>
                        )}
                    </VerificationBadge>
                    
                    {hasPermission('AUDIT_EXPORT') && (
                        <ExportButton onClick={exportToCSV}>
                            <Download size={18} />
                            Export CSV
                        </ExportButton>
                    )}
                </HeaderActions>
            </PageHeader>

            <ControlsContainer>
                <SearchContainer>
                    <SearchIcon>
                        <Search size={20} />
                    </SearchIcon>
                    <SearchInput
                        type="text"
                        placeholder="Search by user, action, details, or hash..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </SearchContainer>
                
                <FilterGroup>
                    <FilterSelect value={filterBy} onChange={(e) => setFilterBy(e.target.value as 'all' | 'user' | 'action')}>
                        <option value="all">All Activities</option>
                        <option value="user">Filter by User</option>
                        <option value="action">Filter by Action</option>
                    </FilterSelect>
                    
                    {filterBy === 'user' && (
                        <UserSelect value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                            <option value="">All Users</option>
                            {users.map(user => (
                                <option key={user} value={user}>{user}</option>
                            ))}
                        </UserSelect>
                    )}
                    
                    {filterBy === 'action' && (
                        <ActionSelect value={selectedAction} onChange={(e) => setSelectedAction(e.target.value)}>
                            <option value="">All Actions</option>
                            {actions.map(action => (
                                <option key={action} value={action}>{action}</option>
                            ))}
                        </ActionSelect>
                    )}
                </FilterGroup>
            </ControlsContainer>

            <StatsContainer>
                <StatCard style={{ background: 'rgba(46, 151, 197, 0.05)', borderColor: 'rgba(46, 151, 197, 0.2)' }}>
                    <StatIcon style={{ background: 'rgba(46, 151, 197, 0.1)', color: 'rgb(46, 151, 197)' }}>
                        <Activity size={24} />
                    </StatIcon>
                    <StatContent>
                        <StatLabel>Total Logs</StatLabel>
                        <StatValue>{logs.length}</StatValue>
                    </StatContent>
                </StatCard>
                
                <StatCard style={{ background: 'rgba(150, 129, 158, 0.05)', borderColor: 'rgba(150, 129, 158, 0.2)' }}>
                    <StatIcon style={{ background: 'rgba(150, 129, 158, 0.1)', color: 'rgb(150, 129, 158)' }}>
                        <User size={24} />
                    </StatIcon>
                    <StatContent>
                        <StatLabel>Unique Users</StatLabel>
                        <StatValue>{users.length}</StatValue>
                    </StatContent>
                </StatCard>
                
                <StatCard style={{ background: 'rgba(229, 151, 54, 0.05)', borderColor: 'rgba(229, 151, 54, 0.2)' }}>
                    <StatIcon style={{ background: 'rgba(229, 151, 54, 0.1)', color: 'rgb(229, 151, 54)' }}>
                        <Calendar size={24} />
                    </StatIcon>
                    <StatContent>
                        <StatLabel>Today's Activities</StatLabel>
                        <StatValue>
                            {logs.filter(log => {
                                const logDate = new Date(log.timestamp);
                                const today = new Date();
                                return logDate.toDateString() === today.toDateString();
                            }).length}
                        </StatValue>
                    </StatContent>
                </StatCard>
            </StatsContainer>

            <TableContainer>
                <StyledTable>
                    <thead>
                        <tr>
                            <TableHeader onClick={() => handleSort('timestamp')}>
                                <TableHeaderContent>
                                    <Calendar size={14} />
                                    Timestamp
                                    {sortConfig?.key === 'timestamp' && (
                                        <SortIcon>
                                            {sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </SortIcon>
                                    )}
                                </TableHeaderContent>
                            </TableHeader>
                            <TableHeader onClick={() => handleSort('username')}>
                                <TableHeaderContent>
                                    <User size={14} />
                                    User
                                    {sortConfig?.key === 'username' && (
                                        <SortIcon>
                                            {sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </SortIcon>
                                    )}
                                </TableHeaderContent>
                            </TableHeader>
                            <TableHeader onClick={() => handleSort('action')}>
                                <TableHeaderContent>
                                    <Activity size={14} />
                                    Action
                                    {sortConfig?.key === 'action' && (
                                        <SortIcon>
                                            {sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </SortIcon>
                                    )}
                                </TableHeaderContent>
                            </TableHeader>
                            <TableHeader>Details</TableHeader>
                            <TableHeader>
                                <TableHeaderContent>
                                    <Lock size={14} />
                                    Hash Verification
                                </TableHeaderContent>
                            </TableHeader>
                        </tr>
                    </thead>
                    <tbody>
                        {currentLogs.length > 0 ? (
                            currentLogs.map((log) => {
                                const actionColor = getActionColor(log.action);
                                const isHashValid = log.id === 1 ? 
                                    log.previousHash === "0" : 
                                    log.previousHash === logs.find(l => l.id === log.id - 1)?.currentHash;
                                
                                return (
                                    <React.Fragment key={log.id}>
                                        <TableRow onClick={() => toggleLogExpand(log.id)}>
                                            <TableCell>
                                                <TimestampCell>
                                                    {format(new Date(log.timestamp), 'MMM dd, yyyy')}
                                                    <TimeText>
                                                        {format(new Date(log.timestamp), 'HH:mm:ss')}
                                                    </TimeText>
                                                </TimestampCell>
                                            </TableCell>
                                            <TableCell>
                                                <UserCell>
                                                    <User size={14} />
                                                    {log.username}
                                                </UserCell>
                                            </TableCell>
                                            <TableCell>
                                                <ActionBadge style={{ background: `${actionColor}15`, color: actionColor }}>
                                                    {log.action}
                                                </ActionBadge>
                                            </TableCell>
                                            <TableCell>
                                                <DetailsCell>
                                                    {log.details}
                                                </DetailsCell>
                                            </TableCell>
                                            <TableCell>
                                                <HashCell $valid={isHashValid}>
                                                    <Lock size={12} />
                                                    {isHashValid ? '✓ Valid' : '✗ Invalid'}
                                                </HashCell>
                                            </TableCell>
                                        </TableRow>
                                        {expandedLog === log.id && (
                                            <ExpandedRow>
                                                <td colSpan={5}>
                                                    <ExpandedContent>
                                                        <DetailGrid>
                                                            <DetailItem>
                                                                <DetailLabel>
                                                                    <Calendar size={14} />
                                                                    Full Timestamp
                                                                </DetailLabel>
                                                                <DetailValue>
                                                                    {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss.SSS')}
                                                                </DetailValue>
                                                            </DetailItem>
                                                            <DetailItem>
                                                                <DetailLabel>
                                                                    <User size={14} />
                                                                    User
                                                                </DetailLabel>
                                                                <DetailValue>{log.username}</DetailValue>
                                                            </DetailItem>
                                                            <DetailItem>
                                                                <DetailLabel>
                                                                    <Activity size={14} />
                                                                    Action
                                                                </DetailLabel>
                                                                <DetailValue>
                                                                    <ActionBadge style={{ background: `${actionColor}15`, color: actionColor }}>
                                                                        {log.action}
                                                                    </ActionBadge>
                                                                </DetailValue>
                                                            </DetailItem>
                                                            <DetailItem>
                                                                <DetailLabel>
                                                                    <Lock size={14} />
                                                                    Previous Hash
                                                                </DetailLabel>
                                                                <HashValue title={log.previousHash}>
                                                                    {log.previousHash.substring(0, 24)}...
                                                                </HashValue>
                                                            </DetailItem>
                                                            <DetailItem>
                                                                <DetailLabel>
                                                                    <Lock size={14} />
                                                                    Current Hash
                                                                </DetailLabel>
                                                                <HashValue title={log.currentHash}>
                                                                    {log.currentHash.substring(0, 24)}...
                                                                </HashValue>
                                                            </DetailItem>
                                                        </DetailGrid>
                                                    </ExpandedContent>
                                                </td>
                                            </ExpandedRow>
                                        )}
                                    </React.Fragment>
                                );
                            })
                        ) : (
                            <TableRow>
                                <td colSpan={5}>
                                    <EmptyState>
                                        <EmptyIcon>
                                            <ShieldCheck size={48} />
                                        </EmptyIcon>
                                        <EmptyText>
                                            {searchQuery || filterBy !== 'all' || selectedUser || selectedAction
                                                ? 'No matching audit logs found'
                                                : 'No audit logs available'
                                            }
                                        </EmptyText>
                                        <EmptySubtext>
                                            {searchQuery || filterBy !== 'all' || selectedUser || selectedAction
                                                ? 'Try adjusting your search or filter criteria'
                                                : 'System activities will appear here'
                                            }
                                        </EmptySubtext>
                                    </EmptyState>
                                </td>
                            </TableRow>
                        )}
                    </tbody>
                </StyledTable>
            </TableContainer>
            
            <PaginationContainer>
                <PaginationInfo>
                    Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} audit logs
                </PaginationInfo>
                
                <PaginationControls>
                    <ItemsPerPageSelect 
                        value={itemsPerPage} 
                        onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    >
                        <option value={5}>5 per page</option>
                        <option value={10}>10 per page</option>
                        <option value={15}>15 per page</option>
                        <option value={20}>20 per page</option>
                        <option value={25}>25 per page</option>
                        <option value={35}>35 per page</option>
                        <option value={45}>45 per page</option>
                        <option value={50}>50 per page</option>
                        <option value={70}>70 per page</option>
                        <option value={80}>80 per page</option>
                        <option value={90}>90 per page</option>
                        <option value={100}>100 per page</option>
                        <option value={-1}>All</option>
                    </ItemsPerPageSelect>
                    
                    <PageButtons>
                        <PageButton 
                            onClick={() => handlePageChange(currentPage - 1)} 
                            disabled={currentPage === 1}
                        >
                            Previous
                        </PageButton>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(page => {
                                return page === 1 || 
                                       page === totalPages || 
                                       (page >= currentPage - 1 && page <= currentPage + 1);
                            })
                            .map((page, index, array) => (
                                <React.Fragment key={page}>
                                    {index > 0 && array[index - 1] !== page - 1 && <PageEllipsis>...</PageEllipsis>}
                                    <PageButton
                                        onClick={() => handlePageChange(page)}
                                        $active={currentPage === page}
                                    >
                                        {page}
                                    </PageButton>
                                </React.Fragment>
                            ))}
                        
                        <PageButton 
                            onClick={() => handlePageChange(currentPage + 1)} 
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </PageButton>
                    </PageButtons>
                </PaginationControls>
            </PaginationContainer>
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
    
    @media (max-width: 768px) {
        padding: 1rem;
    }
    
    @media (max-width: 576px) {
        padding: 0.75rem;
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

const PageHeaderContent = styled.div`
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

const HeaderActions = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;

    @media (max-width: 768px) {
        width: 100%;
        
        > * {
            flex: 1;
        }
    }
`;

const VerificationBadge = styled.div<{ $status: string }>`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: ${props => {
        if (props.status === 'VALID') return 'rgba(16, 185, 129, 0.1)';
        if (props.status === 'INVALID') return 'rgba(239, 68, 68, 0.1)';
        return 'rgba(245, 158, 11, 0.1)';
    }};
    color: ${props => {
        if (props.status === 'VALID') return '#10b981';
        if (props.status === 'INVALID') return '#ef4444';
        return '#f59e0b';
    }};
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: 600;
    font-family: 'Poppins', sans-serif;
`;

const ExportButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: linear-gradient(135deg, rgb(46, 151, 197), rgb(150, 129, 158));
    border: none;
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: 600;
    font-family: 'Poppins', sans-serif;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(46, 151, 197, 0.3);
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

const UserSelect = styled.select`
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

const ActionSelect = styled.select`
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

const TableContainer = styled.div`
    background: var(--bg-secondary);
    border-radius: 16px;
    border: 2px solid rgba(46, 151, 197, 0.2);
    box-shadow: 0 8px 24px var(--shadow);
    overflow: hidden;
    
    @media (max-width: 768px) {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        
        &::-webkit-scrollbar {
            height: 8px;
        }
        
        &::-webkit-scrollbar-track {
            background: var(--bg-primary);
            border-radius: 4px;
        }
        
        &::-webkit-scrollbar-thumb {
            background: rgba(46, 151, 197, 0.5);
            border-radius: 4px;
            
            &:hover {
                background: rgba(46, 151, 197, 0.7);
            }
        }
    }
`;

const StyledTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    
    @media (max-width: 768px) {
        min-width: 1000px;
    }
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

const TimestampCell = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
`;

const TimeText = styled.span`
    font-size: 0.75rem;
    color: var(--text-tertiary);
`;

const UserCell = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
`;

const ActionBadge = styled.span`
    display: inline-block;
    padding: 0.375rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    font-family: 'Poppins', sans-serif;
`;

const DetailsCell = styled.div`
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const HashCell = styled.div<{ $valid: boolean }>`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    font-weight: 600;
    font-family: 'Poppins', sans-serif;
    color: ${props => props.valid ? '#10b981' : '#ef4444'};
`;

const ExpandedRow = styled.tr`
    background: rgba(46, 151, 197, 0.02);
`;

const ExpandedContent = styled.div`
    padding: 1.5rem;
    background: var(--bg-secondary);
    border-top: 1px solid var(--border-color);
`;

const DetailGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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

const HashValue = styled.div`
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.8125rem;
    color: var(--text-secondary);
    word-break: break-all;
    cursor: help;
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

const PaginationContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
    padding: 20px;
    background: var(--bg-secondary);
    border-radius: 12px;
    border: 2px solid rgba(46, 151, 197, 0.1);
    flex-wrap: wrap;
    gap: 15px;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
    }
`;

const PaginationInfo = styled.div`
    color: var(--text-secondary);
    font-size: 14px;
    font-weight: 500;

    @media (max-width: 768px) {
        text-align: center;
    }
`;

const PaginationControls = styled.div`
    display: flex;
    align-items: center;
    gap: 15px;
    flex-wrap: wrap;

    @media (max-width: 768px) {
        flex-direction: column;
        width: 100%;
    }
`;

const ItemsPerPageSelect = styled.select`
    padding: 8px 12px;
    border: 2px solid rgba(46, 151, 197, 0.2);
    border-radius: 8px;
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Poppins', sans-serif;

    &:hover {
        border-color: rgba(46, 151, 197, 0.5);
    }

    &:focus {
        outline: none;
        border-color: var(--light-blue);
        box-shadow: 0 0 0 3px rgba(46, 151, 197, 0.1);
    }

    @media (max-width: 768px) {
        width: 100%;
    }
`;

const PageButtons = styled.div`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;

    @media (max-width: 768px) {
        justify-content: center;
        width: 100%;
    }
`;

const PageButton = styled.button<{ $active?: boolean }>`
    padding: 8px 14px;
    border: 2px solid ${props => props.$active ? 'var(--light-blue)' : 'rgba(46, 151, 197, 0.2)'};
    border-radius: 8px;
    background: ${props => props.$active ? 'var(--light-blue)' : 'var(--bg-primary)'};
    color: ${props => props.$active ? 'white' : 'var(--text-primary)'};
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Poppins', sans-serif;
    min-width: 40px;

    &:hover:not(:disabled) {
        background: ${props => props.$active ? 'var(--light-blue)' : 'var(--hover-color)'};
        border-color: var(--light-blue);
        transform: translateY(-1px);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    @media (max-width: 576px) {
        padding: 6px 10px;
        font-size: 13px;
        min-width: 36px;
    }
`;

const PageEllipsis = styled.span`
    padding: 8px 4px;
    color: var(--text-secondary);
    font-weight: 600;
`;

export default AuditLogPage;