import React, { type ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import styled, { keyframes } from 'styled-components';

interface AdminLayoutProps {
    children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    return (
        <LayoutContainer>
            <Sidebar />
            <MainWrapper>
                <Header />
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
    min-height: 100vh;
    background-color: var(--bg-primary);
`;

const MainWrapper = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
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
`;

const PageTransition = styled.div`
    animation: ${fadeInUp} 0.4s ease-out;
    
    @media (prefers-reduced-motion: reduce) {
        animation: ${fadeIn} 0.3s ease-out;
    }
`;

export default AdminLayout;