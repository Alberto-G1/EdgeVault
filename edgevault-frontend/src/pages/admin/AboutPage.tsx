import React from 'react';
import { Shield, FileText, Search, Users, Lock, MessageSquare, Activity, CheckCircle, Mail, Github, Linkedin, Twitter, ExternalLink } from 'lucide-react';
import styled from 'styled-components';

const AboutPage: React.FC = () => {
    const currentYear = new Date().getFullYear();
    
    const features = [
        {
            icon: <FileText size={24} />,
            title: 'Document Storage',
            description: 'Secure, cloud-based storage for all your important documents with unlimited capacity and 99.9% uptime guarantee.',
        },
        {
            icon: <Activity size={24} />,
            title: 'Version Control',
            description: 'Automatic version tracking with complete history, comparison tools, and easy rollback capabilities.',
        },
        {
            icon: <Search size={24} />,
            title: 'Smart Search',
            description: 'Powerful full-text search with advanced filters, metadata indexing, and instant results.',
        },
        {
            icon: <Users size={24} />,
            title: 'User Roles & Permissions',
            description: 'Granular access control with customizable roles, department-level permissions, and audit trails.',
        },
        {
            icon: <Shield size={24} />,
            title: 'Audit Logs',
            description: 'Immutable blockchain-based audit trail tracking every action with tamper-proof verification.',
        },
        {
            icon: <MessageSquare size={24} />,
            title: 'Chat & Messaging',
            description: 'Real-time secure communication with document sharing, group chats, and direct messaging.',
        },
    ];

    return (
        <PageContainer>
            <HeroSection>
                <LogoContainer>
                    <img src="/chat-logo.png" alt="EdgeVault" />
                </LogoContainer>
                <HeroTitle>EdgeVault</HeroTitle>
                <HeroSubtitle>Secure Document Management for the Modern Enterprise</HeroSubtitle>
                <Version>Version 1.0.0</Version>
            </HeroSection>

            <Section>
                <SectionTitle>Product Overview</SectionTitle>
                <OverviewCard>
                    <OverviewText>
                        EdgeVault is a comprehensive, secure, and modern document management system designed to streamline 
                        organizational workflows. Built with cutting-edge technology, EdgeVault provides enterprises with 
                        fast storage, easy retrieval, and efficient document lifecycle management.
                    </OverviewText>
                    <OverviewText>
                        Our platform combines powerful features with an intuitive interface, ensuring that teams can 
                        collaborate effectively while maintaining the highest standards of security and compliance. From 
                        small teams to large organizations, EdgeVault scales to meet your needs.
                    </OverviewText>
                </OverviewCard>
            </Section>

            <Section>
                <SectionTitle>Mission & Vision</SectionTitle>
                <MissionCard>
                    <MissionIcon>
                        <Shield size={48} />
                    </MissionIcon>
                    <MissionContent>
                        <MissionTitle>Our Mission</MissionTitle>
                        <MissionText>
                            To provide organizations with seamless, secure, and intelligent document management solutions 
                            that enhance productivity and protect critical information. We believe every business deserves 
                            enterprise-grade tools that are both powerful and easy to use.
                        </MissionText>
                    </MissionContent>
                </MissionCard>

                <VisionCard>
                    <VisionContent>
                        <VisionTitle>Our Vision</VisionTitle>
                        <VisionText>
                            To become the world's most trusted document management platform, empowering organizations to 
                            work smarter, collaborate better, and maintain complete control over their information assets 
                            in an increasingly digital world.
                        </VisionText>
                    </VisionContent>
                </VisionCard>
            </Section>

            <Section>
                <SectionTitle>Core Features</SectionTitle>
                <FeaturesGrid>
                    {features.map((feature, index) => (
                        <FeatureCard key={index}>
                            <FeatureIcon>{feature.icon}</FeatureIcon>
                            <FeatureTitle>{feature.title}</FeatureTitle>
                            <FeatureDescription>{feature.description}</FeatureDescription>
                            <CheckMark>
                                <CheckCircle size={18} />
                            </CheckMark>
                        </FeatureCard>
                    ))}
                </FeaturesGrid>
            </Section>

            <Section>
                <SectionTitle>Technology Stack</SectionTitle>
                <TechCard>
                    <TechCategory>
                        <TechCategoryTitle>Frontend</TechCategoryTitle>
                        <TechList>
                            <TechItem>React 18 with TypeScript</TechItem>
                            <TechItem>Styled Components for theming</TechItem>
                            <TechItem>React Router for navigation</TechItem>
                            <TechItem>Lucide React for icons</TechItem>
                        </TechList>
                    </TechCategory>

                    <TechCategory>
                        <TechCategoryTitle>Backend</TechCategoryTitle>
                        <TechList>
                            <TechItem>Spring Boot (Java)</TechItem>
                            <TechItem>PostgreSQL Database</TechItem>
                            <TechItem>Elasticsearch for search</TechItem>
                            <TechItem>JWT Authentication</TechItem>
                        </TechList>
                    </TechCategory>

                    <TechCategory>
                        <TechCategoryTitle>Security</TechCategoryTitle>
                        <TechList>
                            <TechItem>End-to-end encryption</TechItem>
                            <TechItem>Role-based access control</TechItem>
                            <TechItem>Blockchain audit logs</TechItem>
                            <TechItem>Secure file storage</TechItem>
                        </TechList>
                    </TechCategory>
                </TechCard>
            </Section>

            <Section>
                <SectionTitle>Company Information</SectionTitle>
                <CompanyCard>
                    <CompanyInfo>
                        <InfoLabel>Developer</InfoLabel>
                        <InfoValue>Grande Technology Solutions</InfoValue>
                    </CompanyInfo>
                    <CompanyInfo>
                        <InfoLabel>Contact Email</InfoLabel>
                        <InfoValue>
                            <ContactLink href="mailto:support@edgevault.com">
                                <Mail size={16} />
                                support@edgevault.com
                            </ContactLink>
                        </InfoValue>
                    </CompanyInfo>
                    <CompanyInfo>
                        <InfoLabel>Release Date</InfoLabel>
                        <InfoValue>December 2025</InfoValue>
                    </CompanyInfo>
                    <CompanyInfo>
                        <InfoLabel>License</InfoLabel>
                        <InfoValue>Commercial Enterprise License</InfoValue>
                    </CompanyInfo>
                </CompanyCard>

                <SocialLinks>
                    <SocialTitle>Connect With Us</SocialTitle>
                    <SocialButtons>
                        <SocialButton href="https://github.com" target="_blank" rel="noopener noreferrer">
                            <Github size={20} />
                            GitHub
                        </SocialButton>
                        <SocialButton href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                            <Linkedin size={20} />
                            LinkedIn
                        </SocialButton>
                        <SocialButton href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                            <Twitter size={20} />
                            Twitter
                        </SocialButton>
                    </SocialButtons>
                </SocialLinks>
            </Section>

            <Section>
                <SectionTitle>Legal & Policies</SectionTitle>
                <LegalCard>
                    <LegalLink>
                        <ExternalLink size={18} />
                        <div>
                            <LinkTitle>Privacy Policy</LinkTitle>
                            <LinkDescription>Learn how we protect your data and respect your privacy</LinkDescription>
                        </div>
                    </LegalLink>
                    
                    <LegalLink>
                        <ExternalLink size={18} />
                        <div>
                            <LinkTitle>Terms of Use</LinkTitle>
                            <LinkDescription>Review our terms and conditions for using EdgeVault</LinkDescription>
                        </div>
                    </LegalLink>
                    
                    <LegalLink>
                        <ExternalLink size={18} />
                        <div>
                            <LinkTitle>Data Handling Policy</LinkTitle>
                            <LinkDescription>Understand how we collect, store, and process your information</LinkDescription>
                        </div>
                    </LegalLink>
                    
                    <LegalLink>
                        <ExternalLink size={18} />
                        <div>
                            <LinkTitle>Security Standards</LinkTitle>
                            <LinkDescription>Our commitment to enterprise-grade security and compliance</LinkDescription>
                        </div>
                    </LegalLink>
                </LegalCard>
            </Section>

            <Footer>
                <FooterText>
                    © {currentYear} EdgeVault by Grande Technology Solutions. All rights reserved.
                </FooterText>
                <FooterText>
                    Built with ❤️ for organizations that value security and efficiency.
                </FooterText>
            </Footer>
        </PageContainer>
    );
};

// Styled Components
const PageContainer = styled.div`
    padding: 2rem;
    animation: fadeIn 0.4s ease;
    max-width: 1400px;
    margin: 0 auto;
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @media (max-width: 768px) {
        padding: 1rem;
    }
`;

const HeroSection = styled.div`
    text-align: center;
    padding: 3rem 2rem;
    background: linear-gradient(135deg, rgba(46, 151, 197, 0.1), rgba(150, 129, 158, 0.1));
    border-radius: 20px;
    margin-bottom: 3rem;
    border: 2px solid rgba(46, 151, 197, 0.2);
`;

const LogoContainer = styled.div`
    margin-bottom: 1.5rem;
    
    img {
        height: 80px;
        object-fit: contain;
    }
`;

const HeroTitle = styled.h1`
    font-size: 3rem;
    font-weight: 800;
    color: var(--text-primary);
    margin-bottom: 1rem;
    font-family: 'Poppins', sans-serif;
    
    @media (max-width: 768px) {
        font-size: 2rem;
    }
`;

const HeroSubtitle = styled.p`
    font-size: 1.25rem;
    color: var(--text-secondary);
    margin-bottom: 1rem;
    font-family: 'Poppins', sans-serif;
    
    @media (max-width: 768px) {
        font-size: 1rem;
    }
`;

const Version = styled.div`
    display: inline-block;
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, var(--light-blue), rgb(150, 129, 158));
    color: white;
    border-radius: 20px;
    font-weight: 600;
    font-size: 0.9rem;
    font-family: 'Poppins', sans-serif;
`;

const Section = styled.div`
    margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 1.5rem;
    font-family: 'Poppins', sans-serif;
    padding-bottom: 0.75rem;
    border-bottom: 3px solid var(--light-blue);
`;

const OverviewCard = styled.div`
    padding: 2rem;
    background: var(--bg-secondary);
    border-radius: 16px;
    border: 2px solid rgba(46, 151, 197, 0.1);
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
`;

const OverviewText = styled.p`
    font-size: 1.05rem;
    color: var(--text-secondary);
    line-height: 1.8;
    font-family: 'Poppins', sans-serif;
`;

const MissionCard = styled.div`
    display: flex;
    gap: 2rem;
    padding: 2rem;
    background: linear-gradient(135deg, rgba(46, 151, 197, 0.05), rgba(150, 129, 158, 0.05));
    border-radius: 16px;
    border: 2px solid rgba(46, 151, 197, 0.2);
    margin-bottom: 1.5rem;
    
    @media (max-width: 768px) {
        flex-direction: column;
        text-align: center;
    }
`;

const MissionIcon = styled.div`
    width: 100px;
    height: 100px;
    background: linear-gradient(135deg, var(--light-blue), rgb(150, 129, 158));
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
    box-shadow: 0 8px 24px rgba(46, 151, 197, 0.3);
    
    @media (max-width: 768px) {
        margin: 0 auto;
    }
`;

const MissionContent = styled.div`
    flex: 1;
`;

const MissionTitle = styled.h3`
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 1rem;
    font-family: 'Poppins', sans-serif;
`;

const MissionText = styled.p`
    font-size: 1.05rem;
    color: var(--text-secondary);
    line-height: 1.8;
    font-family: 'Poppins', sans-serif;
`;

const VisionCard = styled.div`
    padding: 2rem;
    background: var(--bg-secondary);
    border-radius: 16px;
    border: 2px solid rgba(46, 151, 197, 0.1);
`;

const VisionContent = styled.div``;

const VisionTitle = styled.h3`
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 1rem;
    font-family: 'Poppins', sans-serif;
`;

const VisionText = styled.p`
    font-size: 1.05rem;
    color: var(--text-secondary);
    line-height: 1.8;
    font-family: 'Poppins', sans-serif;
`;

const FeaturesGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
`;

const FeatureCard = styled.div`
    padding: 1.75rem;
    background: var(--bg-secondary);
    border-radius: 16px;
    border: 2px solid rgba(46, 151, 197, 0.1);
    position: relative;
    transition: all 0.3s;
    
    &:hover {
        border-color: var(--light-blue);
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(46, 151, 197, 0.2);
    }
`;

const FeatureIcon = styled.div`
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, rgba(46, 151, 197, 0.1), rgba(150, 129, 158, 0.1));
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--light-blue);
    margin-bottom: 1.25rem;
`;

const FeatureTitle = styled.h3`
    font-size: 1.15rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.75rem;
    font-family: 'Poppins', sans-serif;
`;

const FeatureDescription = styled.p`
    font-size: 0.95rem;
    color: var(--text-secondary);
    line-height: 1.6;
    font-family: 'Poppins', sans-serif;
`;

const CheckMark = styled.div`
    position: absolute;
    top: 1rem;
    right: 1rem;
    color: #10b981;
`;

const TechCard = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
`;

const TechCategory = styled.div`
    padding: 1.75rem;
    background: var(--bg-secondary);
    border-radius: 16px;
    border: 2px solid rgba(46, 151, 197, 0.1);
`;

const TechCategoryTitle = styled.h3`
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--light-blue);
    margin-bottom: 1.25rem;
    font-family: 'Poppins', sans-serif;
`;

const TechList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
`;

const TechItem = styled.li`
    padding: 0.75rem 0;
    color: var(--text-secondary);
    font-size: 0.95rem;
    font-family: 'Poppins', sans-serif;
    border-bottom: 1px solid var(--border-color);
    
    &:last-child {
        border-bottom: none;
    }
    
    &:before {
        content: "✓";
        color: #10b981;
        font-weight: bold;
        margin-right: 0.75rem;
    }
`;

const CompanyCard = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
    padding: 2rem;
    background: var(--bg-secondary);
    border-radius: 16px;
    border: 2px solid rgba(46, 151, 197, 0.1);
    margin-bottom: 1.5rem;
`;

const CompanyInfo = styled.div``;

const InfoLabel = styled.div`
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
    font-family: 'Poppins', sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
`;

const InfoValue = styled.div`
    font-size: 1.05rem;
    color: var(--text-primary);
    font-weight: 500;
    font-family: 'Poppins', sans-serif;
`;

const ContactLink = styled.a`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--light-blue);
    text-decoration: none;
    transition: all 0.2s;
    
    &:hover {
        text-decoration: underline;
    }
`;

const SocialLinks = styled.div`
    padding: 2rem;
    background: linear-gradient(135deg, rgba(46, 151, 197, 0.05), rgba(150, 129, 158, 0.05));
    border-radius: 16px;
    border: 2px solid rgba(46, 151, 197, 0.1);
    text-align: center;
`;

const SocialTitle = styled.h3`
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 1.25rem;
    font-family: 'Poppins', sans-serif;
`;

const SocialButtons = styled.div`
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
`;

const SocialButton = styled.a`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: var(--bg-secondary);
    border: 2px solid rgba(46, 151, 197, 0.2);
    border-radius: 10px;
    color: var(--text-primary);
    font-weight: 500;
    font-family: 'Poppins', sans-serif;
    text-decoration: none;
    transition: all 0.2s;
    
    &:hover {
        border-color: var(--light-blue);
        background: var(--hover-color);
        transform: translateY(-2px);
    }
`;

const LegalCard = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
`;

const LegalLink = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.5rem;
    background: var(--bg-secondary);
    border-radius: 12px;
    border: 2px solid rgba(46, 151, 197, 0.1);
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
        border-color: var(--light-blue);
        transform: translateX(4px);
        box-shadow: 0 4px 12px rgba(46, 151, 197, 0.15);
    }
    
    svg {
        color: var(--light-blue);
        flex-shrink: 0;
        margin-top: 0.25rem;
    }
`;

const LinkTitle = styled.div`
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
    font-family: 'Poppins', sans-serif;
`;

const LinkDescription = styled.div`
    font-size: 0.875rem;
    color: var(--text-secondary);
    line-height: 1.5;
    font-family: 'Poppins', sans-serif;
`;

const Footer = styled.footer`
    text-align: center;
    padding: 2rem;
    border-top: 2px solid rgba(46, 151, 197, 0.2);
    margin-top: 3rem;
`;

const FooterText = styled.p`
    color: var(--text-secondary);
    font-size: 0.95rem;
    margin: 0.5rem 0;
    font-family: 'Poppins', sans-serif;
`;

export default AboutPage;
