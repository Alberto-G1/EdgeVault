import React, { type ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import styled, { keyframes } from 'styled-components';

interface AdminLayoutProps {
    children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    
    return (
        <LayoutContainer>
            <Sidebar 
                isMobileOpen={isMobileSidebarOpen} 
                onClose={() => setIsMobileSidebarOpen(false)} 
            />
            <MainWrapper>
                <Header onMenuClick={() => setIsMobileSidebarOpen(true)} />
                <MainContent>
                    <PageTransition>
                        {children}
                    </PageTransition>
                </MainContent>
            </MainWrapper>
        </LayoutContainer>
    );
};

const fadeInUp = keyframes`
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`;

const fadeIn = keyframes`
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
`;

const LayoutContainer = styled.div`
    display: flex;
    height: 100vh;
    overflow: hidden;
    background-color: var(--bg-primary);
`;

const MainWrapper = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;

    @media (max-width: 576px) {
        margin-left: 0;
    }
`;

const MainContent = styled.main`
    flex: 1;
    overflow-x: hidden;
    overflow-y: auto;
    background-color: var(--bg-primary);
    padding: 2rem;
    
    /* Custom scrollbar */
    &::-webkit-scrollbar {
        width: 8px;
    }
    
    &::-webkit-scrollbar-track {
        background: var(--bg-secondary);
        border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb {
        background: rgba(46, 151, 197, 0.5);
        border-radius: 4px;
        
        &:hover {
            background: rgba(46, 151, 197, 0.7);
        }
    }
`;

const PageTransition = styled.div`
    animation: ${fadeInUp} 0.4s ease-out;
    min-height: 100%;
    
    @media (prefers-reduced-motion: reduce) {
        animation: ${fadeIn} 0.3s ease-out;
    }
`;

export default AdminLayout;