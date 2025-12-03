import React from 'react';

const ChatPage: React.FC = () => {
    // This will be a layout component. The actual chat logic will be in child components.
    return (
        <div className="flex h-[calc(100vh-100px)]"> {/* Adjust height based on your header */}
            {/* User/Channel List Sidebar */}
            <div className="w-1/4 border-r dark:border-gray-700">
                {/* We will build this next */}
            </div>

            {/* Message Panel */}
            <div className="w-3/4 flex flex-col">
                 {/* We will build this next */}
                 <div className="flex-grow flex items-center justify-center">
                    <p className="text-gray-500">Select a conversation to start chatting.</p>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;