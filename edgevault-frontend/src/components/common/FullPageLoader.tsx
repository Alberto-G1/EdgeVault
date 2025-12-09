import React from 'react';
import Loader from './Loader';

interface FullPageLoaderProps {
  message?: string;
}

const FullPageLoader: React.FC<FullPageLoaderProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 z-50">
      <Loader />
      {message && (
        <p className="mt-8 text-green-500 text-lg font-semibold tracking-wide animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

export default FullPageLoader;
