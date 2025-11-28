import React from 'react';
import { useSearchParams } from 'react-router-dom';

const SearchPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                Search Results for: <span className="text-cyan-600">"{query}"</span>
            </h1>

            {/* We will add search results here in the next step */}
            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <p>Search functionality is under construction.</p>
            </div>
        </div>
    );
};

export default SearchPage;