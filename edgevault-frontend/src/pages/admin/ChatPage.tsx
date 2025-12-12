import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ChatSidebar from '../../components/chat/ChatSidebar';
import MessagePanel from '../../components/chat/MessagePanel';
import { MessageSquare, Users, Hash, Shield, Menu, X, Maximize2, Minimize2 } from 'lucide-react';
import styled, { keyframes } from 'styled-components';

const ChatPage: React.FC = () => {
    const { conversationId } = useParams<{ conversationId?: string }>();
    const activeConversationId = conversationId ? Number(conversationId) : null;
    const [showSidebar, setShowSidebar] = useState(true);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // Handle window resize for responsive behavior
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (!mobile) {
                setShowSidebar(true);
            } else if (activeConversationId) {
                setShowSidebar(false);
            }
        };
        
        window.addEventListener('resize', handleResize);
        handleResize();
        
        return () => window.removeEventListener('resize', handleResize);
    }, [activeConversationId]);

    // On mobile, hide sidebar when conversation is selected
    useEffect(() => {
        if (isMobile && activeConversationId) {
            setShowSidebar(false);
        }
    }, [isMobile, activeConversationId]);

    const handleBackToChats = () => {
        setShowSidebar(true);
    };

    return (
        <PageContainer $fullscreen={isFullScreen}>
            <ChatContainer $fullscreen={isFullScreen}>
                {/* Enhanced Mobile Header */}
                

                <SidebarContainer $showOnMobile={showSidebar}>
                    <ChatSidebar />
                </SidebarContainer>

                <MainPanel $showOnMobile={!showSidebar && activeConversationId !== null}>
                    {activeConversationId ? (
                        <MessagePanel 
                            key={activeConversationId} 
                            conversationId={activeConversationId}
                            onBack={isMobile ? handleBackToChats : undefined}
                        />
                    ) : (
                        <EmptyState>
                            <EmptyIcon>
                                <MessageSquare size={72} />
                            </EmptyIcon>
                            <EmptyTitle>Welcome to Secure Chat</EmptyTitle>
                            <EmptyText>
                                Select a conversation from the sidebar to start secure messaging with your team members.
                                All communications are end-to-end encrypted and enterprise-grade secure.
                            </EmptyText>
                            
                            <FeatureGrid>
                                <FeatureCard>
                                    <FeatureIcon>
                                        <Shield size={24} />
                                    </FeatureIcon>
                                    <FeatureContent>
                                        <FeatureTitle>Enterprise Security</FeatureTitle>
                                        <FeatureDescription>
                                            End-to-end encryption, GDPR compliant, military-grade security protocols
                                        </FeatureDescription>
                                    </FeatureContent>
                                </FeatureCard>
                                
                                <FeatureCard>
                                    <FeatureIcon>
                                        <Users size={24} />
                                    </FeatureIcon>
                                    <FeatureContent>
                                        <FeatureTitle>Team Collaboration</FeatureTitle>
                                        <FeatureDescription>
                                            Group chats, direct messaging, file sharing, and @mentions
                                        </FeatureDescription>
                                    </FeatureContent>
                                </FeatureCard>
                                
                                <FeatureCard>
                                    <FeatureIcon>
                                        <Hash size={24} />
                                    </FeatureIcon>
                                    <FeatureContent>
                                        <FeatureTitle>Real-time Communication</FeatureTitle>
                                        <FeatureDescription>
                                            Instant messaging, typing indicators, and read receipts
                                        </FeatureDescription>
                                    </FeatureContent>
                                </FeatureCard>
                            </FeatureGrid>
                            
                            <StatsContainer>
                                <Stat>
                                    <StatNumber>99.9%</StatNumber>
                                    <StatLabel>Uptime</StatLabel>
                                </Stat>
                                <Stat>
                                    <StatNumber>256-bit</StatNumber>
                                    <StatLabel>Encryption</StatLabel>
                                </Stat>
                                <Stat>
                                    <StatNumber>24/7</StatNumber>
                                    <StatLabel>Support</StatLabel>
                                </Stat>
                            </StatsContainer>
                        </EmptyState>
                    )}
                </MainPanel>

                {/* Mobile floating new chat button */}
                {!activeConversationId && (
                    <FloatingActionButton onClick={() => {/* Open new chat */}}>
                        <MessageSquare size={20} />
                        <span>New Chat</span>
                    </FloatingActionButton>
                )}
            </ChatContainer>
        </PageContainer>
    );
};

// Styled Components
const fadeInUp = keyframes`
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`;

const floatAnimation = keyframes`
    0%, 100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-10px);
    }
`;

const PageContainer = styled.div<{ $fullscreen: boolean }>`
    height: ${props => props.$fullscreen ? '100vh' : 'calc(100vh - 100px)'};
    padding: 0;
    animation: ${fadeInUp} 0.5s ease-out;
    background: ${props => props.$fullscreen 
        ? 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)'
        : 'transparent'
    };

    @media (max-width: 768px) {
        height: ${props => props.$fullscreen ? '100vh' : 'calc(100vh - 70px)'};
    }
`;

const ChatContainer = styled.div<{ $fullscreen: boolean }>`
    display: flex;
    height: 100%;
    background: var(--bg-secondary);
    border-radius: 0;
    border: none;
    border-top: 2px solid rgba(46, 151, 197, 0.1);
    box-shadow: none;
    overflow: hidden;
    position: relative;
    backdrop-filter: blur(10px);
    background: rgba(var(--bg-secondary-rgb, 255, 255, 255), 0.95);
`;

const MobileHeader = styled.div`
    display: none;
    
    @media (max-width: 768px) {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 1.25rem;
        background: linear-gradient(135deg, 
            rgba(46, 151, 197, 0.08) 0%, 
            rgba(150, 129, 158, 0.08) 100%
        );
        border-bottom: 2px solid rgba(46, 151, 197, 0.1);
        backdrop-filter: blur(10px);
        position: sticky;
        top: 0;
        z-index: 100;
    }
`;

const MobileControls = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
`;

const MobileHeaderButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    border: 2px solid rgba(46, 151, 197, 0.2);
    background: var(--bg-primary);
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;

    &:hover {
        background: var(--hover-color);
        border-color: rgba(46, 151, 197, 0.4);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(46, 151, 197, 0.15);
    }
`;

const Tooltip = styled.div`
    position: absolute;
    bottom: -35px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s;
    
    ${MobileHeaderButton}:hover & {
        opacity: 1;
        visibility: visible;
    }
`;

const MobileHeaderTitle = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const LogoIcon = styled.div`
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: linear-gradient(135deg, rgb(46, 151, 197), rgb(150, 129, 158));
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 4px 12px rgba(46, 151, 197, 0.3);
`;

const Title = styled.div`
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text-primary);
    font-family: 'Poppins', sans-serif;
`;

const Subtitle = styled.div`
    font-size: 0.75rem;
    color: var(--text-secondary);
    font-weight: 500;
    margin-top: 2px;
    font-family: 'Poppins', sans-serif;
`;

const ScreenControl = styled(MobileHeaderButton)`
    width: 44px;
    height: 44px;
`;

const SidebarContainer = styled.div<{ $showOnMobile?: boolean }>`
    width: 360px;
    display: flex;
    flex-direction: column;
    border-right: 2px solid rgba(46, 151, 197, 0.1);
    background: linear-gradient(180deg, 
        rgba(46, 151, 197, 0.03) 0%, 
        rgba(150, 129, 158, 0.03) 100%
    );
    position: relative;
    z-index: 10;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, 
            rgba(46, 151, 197, 0.02) 0%, 
            transparent 50%, 
            rgba(150, 129, 158, 0.02) 100%
        );
        pointer-events: none;
    }

    @media (max-width: 1024px) {
        width: 320px;
    }

    @media (max-width: 768px) {
        position: fixed;
        top: 72px;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        z-index: 50;
        display: ${props => props.$showOnMobile ? 'flex' : 'none'};
        border-radius: 0;
        animation: slideInLeft 0.3s ease;
    }

    @keyframes slideInLeft {
        from {
            transform: translateX(-100%);
        }
        to {
            transform: translateX(0);
        }
    }
`;

const MainPanel = styled.div<{ $showOnMobile?: boolean }>`
    flex: 1;
    display: flex;
    flex-direction: column;
    background: var(--bg-secondary);
    position: relative;
    overflow: hidden;
    
    @media (max-width: 768px) {
        display: ${props => props.$showOnMobile ? 'flex' : 'none'};
    }
`;

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 3rem 2rem;
    text-align: center;
    animation: ${fadeInUp} 0.6s ease-out 0.2s both;
`;

const EmptyIcon = styled.div`
    width: 140px;
    height: 140px;
    background: linear-gradient(135deg, 
        rgba(46, 151, 197, 0.1) 0%, 
        rgba(150, 129, 158, 0.1) 100%
    );
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgb(46, 151, 197);
    margin-bottom: 2rem;
    box-shadow: 0 8px 32px rgba(46, 151, 197, 0.15);
    animation: ${floatAnimation} 4s ease-in-out infinite;
`;

const EmptyTitle = styled.h3`
    font-size: 2rem;
    font-weight: 800;
    background: linear-gradient(135deg, rgb(46, 151, 197), rgb(150, 129, 158));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 1rem;
    font-family: 'Poppins', sans-serif;
    
    @media (max-width: 768px) {
        font-size: 1.75rem;
    }
`;

const EmptyText = styled.p`
    font-size: 1.125rem;
    color: var(--text-secondary);
    line-height: 1.7;
    max-width: 600px;
    margin-bottom: 3rem;
    font-family: 'Poppins', sans-serif;
    opacity: 0.9;
    
    @media (max-width: 768px) {
        font-size: 1rem;
        padding: 0 1rem;
    }
`;

const FeatureGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    max-width: 900px;
    margin-bottom: 3rem;
    
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
`;

const FeatureCard = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
    background: var(--bg-primary);
    border-radius: 20px;
    border: 2px solid rgba(46, 151, 197, 0.15);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    text-align: center;
    
    &:hover {
        transform: translateY(-5px);
        border-color: rgba(46, 151, 197, 0.3);
        box-shadow: 0 12px 32px rgba(46, 151, 197, 0.15);
    }
`;

const FeatureIcon = styled.div`
    width: 64px;
    height: 64px;
    border-radius: 16px;
    background: linear-gradient(135deg, 
        rgba(46, 151, 197, 0.1) 0%, 
        rgba(150, 129, 158, 0.1) 100%
    );
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgb(46, 151, 197);
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
`;

const FeatureContent = styled.div`
    flex: 1;
`;

const FeatureTitle = styled.div`
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.75rem;
    font-family: 'Poppins', sans-serif;
`;

const FeatureDescription = styled.div`
    font-size: 0.9375rem;
    color: var(--text-secondary);
    line-height: 1.6;
    font-family: 'Poppins', sans-serif;
`;

const StatsContainer = styled.div`
    display: flex;
    gap: 3rem;
    margin-top: 2rem;
    
    @media (max-width: 768px) {
        gap: 2rem;
        flex-wrap: wrap;
        justify-content: center;
    }
`;

const Stat = styled.div`
    text-align: center;
`;

const StatNumber = styled.div`
    font-size: 2rem;
    font-weight: 800;
    background: linear-gradient(135deg, rgb(46, 151, 197), rgb(150, 129, 158));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 0.5rem;
    font-family: 'Poppins', sans-serif;
`;

const StatLabel = styled.div`
    font-size: 0.875rem;
    color: var(--text-secondary);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-family: 'Poppins', sans-serif;
`;

const FloatingActionButton = styled.button`
    display: none;
    
    @media (max-width: 768px) {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        padding: 1rem 1.5rem;
        background: linear-gradient(135deg, rgb(46, 151, 197), rgb(150, 129, 158));
        color: white;
        border: none;
        border-radius: 16px;
        font-weight: 600;
        font-size: 0.9375rem;
        cursor: pointer;
        z-index: 100;
        box-shadow: 0 8px 24px rgba(46, 151, 197, 0.4);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        
        &:hover {
            transform: translateY(-3px) scale(1.05);
            box-shadow: 0 12px 32px rgba(46, 151, 197, 0.5);
        }
        
        &:active {
            transform: translateY(-1px);
        }
    }
`;

export default ChatPage;