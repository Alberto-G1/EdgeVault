import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import ChatSidebar from '../../components/chat/ChatSidebar';
import MessagePanel from '../../components/chat/MessagePanel';
import { MessageSquare, Users, Hash, Shield, Menu, X } from 'lucide-react';
import styled from 'styled-components';

const ChatPage: React.FC = () => {
    const { conversationId } = useParams<{ conversationId?: string }>();
    const activeConversationId = conversationId ? Number(conversationId) : null;
    const [showSidebar, setShowSidebar] = useState(false);

    return (
        <PageContainer>
            <ChatContainer>
                {/* Mobile Header */}
                <MobileHeader>
                    <MobileHeaderButton onClick={() => setShowSidebar(!showSidebar)}>
                        {showSidebar ? <X size={24} /> : <Menu size={24} />}
                    </MobileHeaderButton>
                    <MobileHeaderTitle>
                        <MessageSquare size={20} />
                        <span>EdgeVault Chat</span>
                    </MobileHeaderTitle>
                </MobileHeader>

                <SidebarContainer $showOnMobile={showSidebar}>
                    <ChatSidebar />
                </SidebarContainer>

                <MainPanel $showOnMobile={!showSidebar}>
                    {activeConversationId ? (
                        <MessagePanel key={activeConversationId} conversationId={activeConversationId} />
                    ) : (
                        <EmptyState>
                            <EmptyIcon>
                                <MessageSquare size={64} />
                            </EmptyIcon>
                            <EmptyTitle>Welcome to Secure Chat</EmptyTitle>
                            <EmptyText>
                                Select a conversation from the sidebar to start messaging with your team members.
                                All messages are secure and encrypted.
                            </EmptyText>
                            <FeatureList>
                                <FeatureItem>
                                    <FeatureIcon style={{ background: 'rgba(46, 151, 197, 0.1)', color: 'rgb(46, 151, 197)' }}>
                                        <Shield size={18} />
                                    </FeatureIcon>
                                    <FeatureContent>
                                        <FeatureTitle>Secure & Encrypted</FeatureTitle>
                                        <FeatureDescription>Professional enterprise security</FeatureDescription>
                                    </FeatureContent>
                                </FeatureItem>
                                <FeatureItem>
                                    <FeatureIcon style={{ background: 'rgba(150, 129, 158, 0.1)', color: 'rgb(150, 129, 158)' }}>
                                        <Users size={18} />
                                    </FeatureIcon>
                                    <FeatureContent>
                                        <FeatureTitle>Team Collaboration</FeatureTitle>
                                        <FeatureDescription>Group and direct messaging</FeatureDescription>
                                    </FeatureContent>
                                </FeatureItem>
                                <FeatureItem>
                                    <FeatureIcon style={{ background: 'rgba(229, 151, 54, 0.1)', color: 'rgb(229, 151, 54)' }}>
                                        <Hash size={18} />
                                    </FeatureIcon>
                                    <FeatureContent>
                                        <FeatureTitle>Real-time Updates</FeatureTitle>
                                        <FeatureDescription>Instant message delivery</FeatureDescription>
                                    </FeatureContent>
                                </FeatureItem>
                            </FeatureList>
                        </EmptyState>
                    )}
                </MainPanel>
            </ChatContainer>
        </PageContainer>
    );
};

// Styled Components
const PageContainer = styled.div`
    height: calc(100vh - 100px);
    padding: 1.5rem;
    animation: fadeInUp 0.4s ease;

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
        height: calc(100vh - 70px);
    }
    
    @media (max-width: 576px) {
        padding: 0.5rem;
    }
`;

const ChatContainer = styled.div`
    display: flex;
    height: 100%;
    background: var(--bg-secondary);
    border-radius: 20px;
    border: 2px solid rgba(46, 151, 197, 0.2);
    box-shadow: 0 8px 32px var(--shadow);
    overflow: hidden;
`;

const MobileHeader = styled.div`
    display: none;
    
    @media (max-width: 768px) {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        border-bottom: 2px solid rgba(46, 151, 197, 0.2);
        background: linear-gradient(135deg, rgba(46, 151, 197, 0.05), rgba(150, 129, 158, 0.05));
    }
`;

const MobileHeaderButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    border: none;
    background: var(--bg-primary);
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background: var(--hover-color);
    }
`;

const MobileHeaderTitle = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
`;

const SidebarContainer = styled.div<{ $showOnMobile?: boolean }>`
    width: 320px;
    display: flex;
    flex-direction: column;
    border-right: 2px solid rgba(46, 151, 197, 0.2);
    background: linear-gradient(135deg, rgba(46, 151, 197, 0.02), rgba(150, 129, 158, 0.02));

    @media (max-width: 1024px) {
        width: 280px;
    }

    @media (max-width: 768px) {
        position: absolute;
        top: 65px;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        z-index: 10;
        display: ${props => props.showOnMobile ? 'flex' : 'none'};
    }
`;

const MainPanel = styled.div<{ $showOnMobile?: boolean }>`
    flex: 1;
    display: flex;
    flex-direction: column;
    background: var(--bg-secondary);
    
    @media (max-width: 768px) {
        display: ${props => props.showOnMobile ? 'flex' : 'none'};
    }
`;

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 3rem;
    text-align: center;
`;

const EmptyIcon = styled.div`
    width: 120px;
    height: 120px;
    background: linear-gradient(135deg, rgba(46, 151, 197, 0.1), rgba(150, 129, 158, 0.1));
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgb(46, 151, 197);
    margin-bottom: 1.5rem;
`;

const EmptyTitle = styled.h3`
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 1rem;
    font-family: 'Poppins', sans-serif;
`;

const EmptyText = styled.p`
    font-size: 1rem;
    color: var(--text-secondary);
    line-height: 1.6;
    max-width: 500px;
    margin-bottom: 2.5rem;
    font-family: 'Poppins', sans-serif;
`;

const FeatureList = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    max-width: 600px;
`;

const FeatureItem = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem;
    background: var(--bg-primary);
    border-radius: 12px;
    border: 2px solid rgba(46, 151, 197, 0.2);
`;

const FeatureIcon = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
`;

const FeatureContent = styled.div`
    flex: 1;
`;

const FeatureTitle = styled.div`
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
    font-family: 'Poppins', sans-serif;
`;

const FeatureDescription = styled.div`
    font-size: 0.8125rem;
    color: var(--text-secondary);
    line-height: 1.4;
    font-family: 'Poppins', sans-serif;
`;

export default ChatPage;