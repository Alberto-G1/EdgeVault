import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { performSearch } from '../../api/searchService';
import type { SearchResult } from '../../types/search';
import { useToast } from '../../context/ToastContext';
import { FileText, SearchX, Search, Calendar, User, FileType, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import styled from 'styled-components';
import SearchLoader from '../../components/common/SearchLoader';

const SearchPage: React.FC = () => {
    const { showError } = useToast();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const query = searchParams.get('q');
    
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!query || query.trim() === '') {
            navigate('/admin/dashboard');
            return;
        }

        const executeSearch = async () => {
            try {
                setLoading(true);
                const data = await performSearch(query);
                setResults(data);
            } catch (error) {
                showError('Error', 'An error occurred while searching.');
            } finally {
                setLoading(false);
            }
        };

        executeSearch();
    }, [query, navigate, showError]);

    if (loading) {
        return <SearchLoader />;
    }

    return (
        <PageContainer>
            <SearchHeader>
                <SearchIcon>
                    <Search size={32} />
                </SearchIcon>
                <SearchTitle>
                    Search Results for <QueryText>"{query}"</QueryText>
                </SearchTitle>
                <ResultsCount>
                    {results.length} {results.length === 1 ? 'result' : 'results'} found
                </ResultsCount>
            </SearchHeader>

            {results.length > 0 ? (
                <ResultsGrid>
                    {results.map((result, index) => (
                        <ResultCard 
                            key={result.id}
                            onClick={() => navigate(`/admin/documents/${result.documentId}`)}
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            <CardHeader>
                                <FileIcon>
                                    <FileText size={24} />
                                </FileIcon>
                                <CardTitle>{result.title}</CardTitle>
                                <ViewButton>
                                    <ArrowRight size={18} />
                                </ViewButton>
                            </CardHeader>
                            
                            <CardBody>
                                <InfoRow>
                                    <InfoIcon><FileType size={16} /></InfoIcon>
                                    <InfoText>{result.originalFileName}</InfoText>
                                </InfoRow>
                                <InfoRow>
                                    <InfoIcon><User size={16} /></InfoIcon>
                                    <InfoText>Uploaded by {result.uploaderUsername}</InfoText>
                                </InfoRow>
                                <InfoRow>
                                    <InfoIcon><Calendar size={16} /></InfoIcon>
                                    <InfoText>{format(new Date(result.uploadTimestamp), 'MMM d, yyyy')}</InfoText>
                                </InfoRow>
                            </CardBody>
                            
                            <VersionBadge>Version {result.versionNumber}</VersionBadge>
                        </ResultCard>
                    ))}
                </ResultsGrid>
            ) : (
                <EmptyState>
                    <EmptyIcon>
                        <SearchX size={64} />
                    </EmptyIcon>
                    <EmptyTitle>No Results Found</EmptyTitle>
                    <EmptyText>
                        No documents match your search for <strong>"{query}"</strong>
                    </EmptyText>
                    <EmptyHint>Try adjusting your search terms or check for typos</EmptyHint>
                </EmptyState>
            )}
        </PageContainer>
    );
};

const PageContainer = styled.div`
    animation: fadeIn 0.4s ease-in;
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;

const SearchHeader = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-bottom: 3rem;
    padding: 2rem;
    background: linear-gradient(135deg, rgba(46, 151, 197, 0.1), rgba(150, 129, 158, 0.1));
    border-radius: 20px;
    border: 2px solid rgba(46, 151, 197, 0.2);
`;

const SearchIcon = styled.div`
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgb(46, 151, 197), rgb(36, 121, 167));
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    margin-bottom: 1rem;
    animation: pulse 2s ease-in-out infinite;
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
`;

const SearchTitle = styled.h1`
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
`;

const QueryText = styled.span`
    color: rgb(46, 151, 197);
    font-weight: 800;
`;

const ResultsCount = styled.p`
    font-size: 1rem;
    color: var(--text-secondary);
    font-weight: 500;
`;

const ResultsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
    padding: 1rem 0;
`;

const ResultCard = styled.div`
    background: var(--card-bg);
    border: 2px solid rgba(46, 151, 197, 0.1);
    border-radius: 16px;
    padding: 1.5rem;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    animation: slideUp 0.5s ease-out backwards;
    position: relative;
    overflow: hidden;
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, rgb(46, 151, 197), rgb(150, 129, 158));
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 0.3s ease;
    }
    
    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px rgba(46, 151, 197, 0.15);
        border-color: rgb(46, 151, 197);
        
        &::before {
            transform: scaleX(1);
        }
    }
    
    @keyframes slideUp {
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

const CardHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
`;

const FileIcon = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: linear-gradient(135deg, rgba(46, 151, 197, 0.2), rgba(46, 151, 197, 0.1));
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgb(46, 151, 197);
`;

const CardTitle = styled.h3`
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    flex: 1;
    margin: 0;
`;

const ViewButton = styled.div`
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: rgba(46, 151, 197, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgb(46, 151, 197);
    opacity: 0;
    transform: translateX(-10px);
    transition: all 0.3s ease;
    
    ${ResultCard}:hover & {
        opacity: 1;
        transform: translateX(0);
    }
`;

const CardBody = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
`;

const InfoRow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const InfoIcon = styled.div`
    color: rgb(46, 151, 197);
    display: flex;
    align-items: center;
`;

const InfoText = styled.span`
    font-size: 0.9rem;
    color: var(--text-secondary);
`;

const VersionBadge = styled.div`
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: linear-gradient(135deg, rgb(46, 151, 197), rgb(36, 121, 167));
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
`;

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    padding: 3rem;
    text-align: center;
    animation: fadeIn 0.5s ease-in;
`;

const EmptyIcon = styled.div`
    color: rgba(46, 151, 197, 0.3);
    margin-bottom: 1.5rem;
    animation: float 3s ease-in-out infinite;
    
    @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }
`;

const EmptyTitle = styled.h2`
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
`;

const EmptyText = styled.p`
    font-size: 1rem;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
`;

const EmptyHint = styled.p`
    font-size: 0.9rem;
    color: var(--text-tertiary);
    font-style: italic;
`;

export default SearchPage;