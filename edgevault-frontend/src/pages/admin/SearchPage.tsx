import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { performSearch } from '../../api/searchService';
import type { SearchResult } from '../../types/search';
import { toast } from 'react-hot-toast';
import { FileText, SearchX } from 'lucide-react';
import { format } from 'date-fns';

const SearchPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const query = searchParams.get('q');
    
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!query || query.trim() === '') {
            navigate('/admin/dashboard'); // Redirect if no query
            return;
        }

        const executeSearch = async () => {
            try {
                setLoading(true);
                const data = await performSearch(query);
                setResults(data);
            } catch (error) {
                toast.error("An error occurred while searching.");
            } finally {
                setLoading(false);
            }
        };

        executeSearch();
    }, [query, navigate]);

    if (loading) return <div>Searching...</div>;

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                Search Results for: <span className="text-cyan-600">"{query}"</span>
            </h1>

            {results.length > 0 ? (
                <div className="space-y-4">
                    {results.map(result => (
                        <div 
                            key={result.id} 
                            onClick={() => navigate(`/admin/documents/${result.documentId}`)}
                            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-center">
                                <FileText className="h-6 w-6 text-cyan-500 mr-4"/>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 hover:text-cyan-500">{result.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Original Filename: {result.originalFileName} (Version {result.versionNumber})
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                        Uploaded by {result.uploaderUsername} on {format(new Date(result.uploadTimestamp), 'MMM d, yyyy')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <SearchX size={48} className="mx-auto text-gray-400"/>
                    <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No Results Found</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        No documents in your department match the search term "{query}".
                    </p>
                </div>
            )}
        </div>
    );
};

export default SearchPage;