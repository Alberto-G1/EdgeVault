import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { BookOpen, HelpCircle, MessageCircle, CheckCircle, AlertCircle, Upload, Search, MessageSquare, Users, Shield, FileText, Send, Activity } from 'lucide-react';
import styled from 'styled-components';

const HelpSupportPage: React.FC = () => {
    const { showSuccess, showError } = useToast();
    const [activeSection, setActiveSection] = useState<'help' | 'faq' | 'support' | 'status'>('help');
    const [searchQuery, setSearchQuery] = useState('');
    const [supportForm, setSupportForm] = useState({
        subject: '',
        category: 'general',
        priority: 'medium',
        description: '',
        attachment: null as File | null,
    });

    const handleSubmitTicket = () => {
        if (!supportForm.subject || !supportForm.description) {
            showError('Error', 'Please fill in all required fields');
            return;
        }
        
        showSuccess('Ticket Submitted', 'Your support ticket has been created. Our team will respond within 24 hours.');
        setSupportForm({
            subject: '',
            category: 'general',
            priority: 'medium',
            description: '',
            attachment: null,
        });
    };

    const knowledgeBase = [
        {
            icon: <Upload size={24} />,
            title: 'How to Upload Documents',
            content: 'Navigate to the Documents page, click "Upload Document", select your file, add metadata (title, description, tags), and click submit. Supported formats include PDF, DOCX, XLSX, and images.',
        },
        {
            icon: <Users size={24} />,
            title: 'How to Share Documents',
            content: 'Open a document, click the "Share" button, select users or departments, set permissions (view/edit), and send. Recipients will receive an in-app notification.',
        },
        {
            icon: <Shield size={24} />,
            title: 'How to Reset Your Password',
            content: 'Click "Forgot Password" on the login page, enter your email address, check your inbox for a reset link, and create a new secure password following our guidelines.',
        },
        {
            icon: <FileText size={24} />,
            title: 'Understanding Document Versions',
            content: 'EdgeVault automatically tracks document versions. View version history in document details, compare changes between versions, restore previous versions if needed, and see who made modifications.',
        },
        {
            icon: <MessageSquare size={24} />,
            title: 'How the Chat System Works',
            content: 'Access chat from the sidebar, join group conversations or start direct messages, send text and files, receive real-time notifications, and maintain secure encrypted communications.',
        },
        {
            icon: <Search size={24} />,
            title: 'Using Advanced Search',
            content: 'Use the search bar to find documents by title, content, tags, or metadata. Filter by date range, document type, department, or upload user for precise results.',
        },
    ];

    const faqs = [
        {
            question: 'What should I do if I forgot my password?',
            answer: 'Click the "Forgot Password" link on the login page, enter your registered email address, and follow the instructions in the reset email. If you don\'t receive the email within 5 minutes, check your spam folder or contact support.',
        },
        {
            question: 'What are the file upload limits?',
            answer: 'Individual files can be up to 50MB in size. Supported formats include PDF, DOCX, XLSX, PPTX, JPG, PNG, and more. For larger files or bulk uploads, please contact your administrator.',
        },
        {
            question: 'How do I report a system error?',
            answer: 'Take a screenshot of the error, note what you were doing when it occurred, and submit a support ticket through the "Contact Support" section. Include as much detail as possible to help us resolve the issue quickly.',
        },
        {
            question: 'Can I access EdgeVault on mobile devices?',
            answer: 'Yes! EdgeVault is fully responsive and works on smartphones and tablets. Simply visit the same URL from your mobile browser and log in with your credentials.',
        },
        {
            question: 'How long are documents stored in the system?',
            answer: 'Documents are stored indefinitely unless explicitly deleted by authorized users or as per your organization\'s data retention policy. Deleted documents are moved to trash and permanently removed after 30 days.',
        },
        {
            question: 'Who can see my uploaded documents?',
            answer: 'Document visibility depends on your sharing settings and permissions. By default, only you and administrators can see your uploads. You can share documents with specific users or departments as needed.',
        },
    ];

    const filteredKnowledgeBase = knowledgeBase.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <PageContainer>
            <PageHeader>
                <HeaderContent>
                    <Title>Help & Support</Title>
                    <Subtitle>Find answers, get help, and learn how to use EdgeVault</Subtitle>
                </HeaderContent>
            </PageHeader>

            <ContentWrapper>
                <TabsContainer>
                    <Tab 
                        $active={activeSection === 'help'} 
                        onClick={() => setActiveSection('help')}
                    >
                        <BookOpen size={18} />
                        Knowledge Base
                    </Tab>
                    <Tab 
                        $active={activeSection === 'faq'} 
                        onClick={() => setActiveSection('faq')}
                    >
                        <HelpCircle size={18} />
                        FAQs
                    </Tab>
                    <Tab 
                        $active={activeSection === 'support'} 
                        onClick={() => setActiveSection('support')}
                    >
                        <MessageCircle size={18} />
                        Contact Support
                    </Tab>
                    <Tab 
                        $active={activeSection === 'status'} 
                        onClick={() => setActiveSection('status')}
                    >
                        <Activity size={18} />
                        System Status
                    </Tab>
                </TabsContainer>

                <TabContent>
                    {activeSection === 'help' && (
                        <Section>
                            <SectionHeader>
                                <SectionTitle>Knowledge Base</SectionTitle>
                            </SectionHeader>

                            <SearchBar>
                                <Search size={20} />
                                <SearchInput 
                                    type="text"
                                    placeholder="Search articles..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </SearchBar>

                            <ArticlesGrid>
                                {filteredKnowledgeBase.map((article, index) => (
                                    <ArticleCard key={index}>
                                        <ArticleIcon>{article.icon}</ArticleIcon>
                                        <ArticleTitle>{article.title}</ArticleTitle>
                                        <ArticleContent>{article.content}</ArticleContent>
                                    </ArticleCard>
                                ))}
                            </ArticlesGrid>

                            {filteredKnowledgeBase.length === 0 && (
                                <EmptyState>
                                    <BookOpen size={48} />
                                    <EmptyText>No articles found</EmptyText>
                                    <EmptySubtext>Try a different search term</EmptySubtext>
                                </EmptyState>
                            )}
                        </Section>
                    )}

                    {activeSection === 'faq' && (
                        <Section>
                            <SectionHeader>
                                <SectionTitle>Frequently Asked Questions</SectionTitle>
                            </SectionHeader>

                            <FAQContainer>
                                {faqs.map((faq, index) => (
                                    <FAQItem key={index}>
                                        <FAQQuestion>
                                            <HelpCircle size={20} />
                                            {faq.question}
                                        </FAQQuestion>
                                        <FAQAnswer>{faq.answer}</FAQAnswer>
                                    </FAQItem>
                                ))}
                            </FAQContainer>
                        </Section>
                    )}

                    {activeSection === 'support' && (
                        <Section>
                            <SectionHeader>
                                <SectionTitle>Contact Support</SectionTitle>
                            </SectionHeader>

                            <SupportInfo>
                                <InfoCard>
                                    <MessageCircle size={24} />
                                    <div>
                                        <InfoTitle>Email Support</InfoTitle>
                                        <InfoText>support@edgevault.com</InfoText>
                                    </div>
                                </InfoCard>
                                <InfoCard>
                                    <AlertCircle size={24} />
                                    <div>
                                        <InfoTitle>Response Time</InfoTitle>
                                        <InfoText>Within 24 hours</InfoText>
                                    </div>
                                </InfoCard>
                            </SupportInfo>

                            <TicketForm>
                                <FormTitle>Submit a Support Ticket</FormTitle>
                                
                                <FormGroup>
                                    <Label>Subject *</Label>
                                    <Input 
                                        type="text"
                                        placeholder="Brief description of your issue"
                                        value={supportForm.subject}
                                        onChange={(e) => setSupportForm({...supportForm, subject: e.target.value})}
                                    />
                                </FormGroup>

                                <FormRow>
                                    <FormGroup>
                                        <Label>Category</Label>
                                        <Select 
                                            value={supportForm.category}
                                            onChange={(e) => setSupportForm({...supportForm, category: e.target.value})}
                                        >
                                            <option value="general">General Question</option>
                                            <option value="technical">Technical Issue</option>
                                            <option value="account">Account Problem</option>
                                            <option value="document">Document Issue</option>
                                            <option value="permissions">Permissions/Access</option>
                                            <option value="feature">Feature Request</option>
                                        </Select>
                                    </FormGroup>

                                    <FormGroup>
                                        <Label>Priority</Label>
                                        <Select 
                                            value={supportForm.priority}
                                            onChange={(e) => setSupportForm({...supportForm, priority: e.target.value})}
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="urgent">Urgent</option>
                                        </Select>
                                    </FormGroup>
                                </FormRow>

                                <FormGroup>
                                    <Label>Description *</Label>
                                    <TextArea 
                                        placeholder="Provide detailed information about your issue..."
                                        rows={6}
                                        value={supportForm.description}
                                        onChange={(e) => setSupportForm({...supportForm, description: e.target.value})}
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <Label>Attach Screenshot (Optional)</Label>
                                    <FileInput>
                                        <Upload size={20} />
                                        <span>Click to upload or drag and drop</span>
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={(e) => setSupportForm({...supportForm, attachment: e.target.files?.[0] || null})}
                                        />
                                    </FileInput>
                                    {supportForm.attachment && (
                                        <FileName>{supportForm.attachment.name}</FileName>
                                    )}
                                </FormGroup>

                                <SubmitButton onClick={handleSubmitTicket}>
                                    <Send size={18} />
                                    Submit Ticket
                                </SubmitButton>
                            </TicketForm>
                        </Section>
                    )}

                    {activeSection === 'status' && (
                        <Section>
                            <SectionHeader>
                                <SectionTitle>System Status</SectionTitle>
                            </SectionHeader>

                            <StatusCard>
                                <StatusHeader>
                                    <CheckCircle size={32} style={{ color: '#10b981' }} />
                                    <div>
                                        <StatusTitle>All Systems Operational</StatusTitle>
                                        <StatusSubtitle>Last updated: {new Date().toLocaleString()}</StatusSubtitle>
                                    </div>
                                </StatusHeader>
                            </StatusCard>

                            <ServicesGrid>
                                <ServiceItem>
                                    <ServiceStatus $status="operational" />
                                    <ServiceName>Document Storage</ServiceName>
                                    <ServiceBadge $status="operational">Operational</ServiceBadge>
                                </ServiceItem>

                                <ServiceItem>
                                    <ServiceStatus $status="operational" />
                                    <ServiceName>Search Service</ServiceName>
                                    <ServiceBadge $status="operational">Operational</ServiceBadge>
                                </ServiceItem>

                                <ServiceItem>
                                    <ServiceStatus $status="operational" />
                                    <ServiceName>Chat System</ServiceName>
                                    <ServiceBadge $status="operational">Operational</ServiceBadge>
                                </ServiceItem>

                                <ServiceItem>
                                    <ServiceStatus $status="operational" />
                                    <ServiceName>Authentication</ServiceName>
                                    <ServiceBadge $status="operational">Operational</ServiceBadge>
                                </ServiceItem>

                                <ServiceItem>
                                    <ServiceStatus $status="operational" />
                                    <ServiceName>API Services</ServiceName>
                                    <ServiceBadge $status="operational">Operational</ServiceBadge>
                                </ServiceItem>

                                <ServiceItem>
                                    <ServiceStatus $status="operational" />
                                    <ServiceName>Email Notifications</ServiceName>
                                    <ServiceBadge $status="operational">Operational</ServiceBadge>
                                </ServiceItem>
                            </ServicesGrid>

                            <MaintenanceSection>
                                <MaintenanceTitle>Scheduled Maintenance</MaintenanceTitle>
                                <MaintenanceText>
                                    No scheduled maintenance at this time. We'll notify you in advance of any planned downtime.
                                </MaintenanceText>
                            </MaintenanceSection>
                        </Section>
                    )}
                </TabContent>
            </ContentWrapper>
        </PageContainer>
    );
};

// Styled Components
const PageContainer = styled.div`
    padding: 2rem;
    animation: fadeIn 0.4s ease;
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @media (max-width: 768px) {
        padding: 1rem;
    }
`;

const PageHeader = styled.div`
    margin-bottom: 2rem;
`;

const HeaderContent = styled.div``;

const Title = styled.h1`
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
    font-family: 'Poppins', sans-serif;
`;

const Subtitle = styled.p`
    font-size: 1rem;
    color: var(--text-secondary);
    font-family: 'Poppins', sans-serif;
`;

const ContentWrapper = styled.div`
    display: flex;
    gap: 2rem;
    
    @media (max-width: 968px) {
        flex-direction: column;
    }
`;

const TabsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 240px;
    
    @media (max-width: 968px) {
        flex-direction: row;
        overflow-x: auto;
        min-width: 100%;
    }
`;

const Tab = styled.button<{ $active: boolean }>`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    background: ${props => props.$active ? 'linear-gradient(135deg, rgba(46, 151, 197, 0.1), rgba(150, 129, 158, 0.1))' : 'var(--bg-secondary)'};
    border: 2px solid ${props => props.$active ? 'var(--light-blue)' : 'transparent'};
    border-radius: 12px;
    color: ${props => props.$active ? 'var(--light-blue)' : 'var(--text-secondary)'};
    font-weight: ${props => props.$active ? '600' : '500'};
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Poppins', sans-serif;
    white-space: nowrap;
    
    &:hover {
        background: ${props => props.$active ? 'linear-gradient(135deg, rgba(46, 151, 197, 0.15), rgba(150, 129, 158, 0.15))' : 'var(--hover-color)'};
        border-color: ${props => props.$active ? 'var(--light-blue)' : 'rgba(46, 151, 197, 0.3)'};
    }
    
    svg {
        flex-shrink: 0;
    }
`;

const TabContent = styled.div`
    flex: 1;
    background: var(--bg-secondary);
    border-radius: 16px;
    padding: 2rem;
    border: 2px solid rgba(46, 151, 197, 0.1);
    
    @media (max-width: 768px) {
        padding: 1.5rem;
    }
`;

const Section = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const SectionHeader = styled.div`
    margin-bottom: 0.5rem;
`;

const SectionTitle = styled.h2`
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
    font-family: 'Poppins', sans-serif;
`;

const SearchBar = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: var(--bg-primary);
    border: 2px solid rgba(46, 151, 197, 0.2);
    border-radius: 10px;
    
    svg {
        color: var(--text-secondary);
        flex-shrink: 0;
    }
`;

const SearchInput = styled.input`
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: var(--text-primary);
    font-size: 0.95rem;
    font-family: 'Poppins', sans-serif;
    
    &::placeholder {
        color: var(--text-secondary);
    }
`;

const ArticlesGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
`;

const ArticleCard = styled.div`
    padding: 1.5rem;
    background: var(--bg-primary);
    border-radius: 12px;
    border: 2px solid rgba(46, 151, 197, 0.1);
    transition: all 0.2s;
    cursor: pointer;
    
    &:hover {
        border-color: var(--light-blue);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(46, 151, 197, 0.2);
    }
`;

const ArticleIcon = styled.div`
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, rgba(46, 151, 197, 0.1), rgba(150, 129, 158, 0.1));
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--light-blue);
    margin-bottom: 1rem;
`;

const ArticleTitle = styled.h3`
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.75rem;
    font-family: 'Poppins', sans-serif;
`;

const ArticleContent = styled.p`
    font-size: 0.9rem;
    color: var(--text-secondary);
    line-height: 1.6;
    font-family: 'Poppins', sans-serif;
`;

const FAQContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const FAQItem = styled.div`
    padding: 1.5rem;
    background: var(--bg-primary);
    border-radius: 12px;
    border: 2px solid rgba(46, 151, 197, 0.1);
`;

const FAQQuestion = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.05rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.75rem;
    font-family: 'Poppins', sans-serif;
    
    svg {
        color: var(--light-blue);
        flex-shrink: 0;
    }
`;

const FAQAnswer = styled.p`
    font-size: 0.95rem;
    color: var(--text-secondary);
    line-height: 1.6;
    padding-left: 2rem;
    font-family: 'Poppins', sans-serif;
`;

const SupportInfo = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
`;

const InfoCard = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem;
    background: var(--bg-primary);
    border-radius: 12px;
    border: 2px solid rgba(46, 151, 197, 0.1);
    
    svg {
        color: var(--light-blue);
        flex-shrink: 0;
    }
`;

const InfoTitle = styled.div`
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
    font-family: 'Poppins', sans-serif;
`;

const InfoText = styled.div`
    font-size: 0.9rem;
    color: var(--text-secondary);
    font-family: 'Poppins', sans-serif;
`;

const TicketForm = styled.div`
    padding: 2rem;
    background: var(--bg-primary);
    border-radius: 12px;
    border: 2px solid rgba(46, 151, 197, 0.1);
`;

const FormTitle = styled.h3`
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 1.5rem;
    font-family: 'Poppins', sans-serif;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1.25rem;
`;

const FormRow = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
`;

const Label = styled.label`
    font-weight: 600;
    color: var(--text-primary);
    font-size: 0.9rem;
    font-family: 'Poppins', sans-serif;
`;

const Input = styled.input`
    padding: 0.75rem 1rem;
    background: var(--bg-secondary);
    border: 2px solid rgba(46, 151, 197, 0.2);
    border-radius: 8px;
    color: var(--text-primary);
    font-size: 0.95rem;
    font-family: 'Poppins', sans-serif;
    transition: all 0.2s;
    
    &:focus {
        outline: none;
        border-color: var(--light-blue);
        box-shadow: 0 0 0 3px rgba(46, 151, 197, 0.1);
    }
`;

const Select = styled.select`
    padding: 0.75rem 1rem;
    background: var(--bg-secondary);
    border: 2px solid rgba(46, 151, 197, 0.2);
    border-radius: 8px;
    color: var(--text-primary);
    font-size: 0.95rem;
    font-family: 'Poppins', sans-serif;
    cursor: pointer;
    transition: all 0.2s;
    
    &:focus {
        outline: none;
        border-color: var(--light-blue);
        box-shadow: 0 0 0 3px rgba(46, 151, 197, 0.1);
    }
`;

const TextArea = styled.textarea`
    padding: 0.75rem 1rem;
    background: var(--bg-secondary);
    border: 2px solid rgba(46, 151, 197, 0.2);
    border-radius: 8px;
    color: var(--text-primary);
    font-size: 0.95rem;
    font-family: 'Poppins', sans-serif;
    resize: vertical;
    transition: all 0.2s;
    
    &:focus {
        outline: none;
        border-color: var(--light-blue);
        box-shadow: 0 0 0 3px rgba(46, 151, 197, 0.1);
    }
`;

const FileInput = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 2rem;
    background: var(--bg-secondary);
    border: 2px dashed rgba(46, 151, 197, 0.3);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    
    &:hover {
        border-color: var(--light-blue);
        background: var(--hover-color);
    }
    
    svg {
        color: var(--light-blue);
    }
    
    span {
        color: var(--text-secondary);
        font-size: 0.9rem;
        font-family: 'Poppins', sans-serif;
    }
    
    input {
        position: absolute;
        inset: 0;
        opacity: 0;
        cursor: pointer;
    }
`;

const FileName = styled.div`
    padding: 0.5rem 0.75rem;
    background: rgba(46, 151, 197, 0.1);
    color: var(--light-blue);
    border-radius: 6px;
    font-size: 0.875rem;
    font-family: 'Poppins', sans-serif;
`;

const SubmitButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, var(--light-blue), rgb(150, 129, 158));
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Poppins', sans-serif;
    margin-top: 0.5rem;
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(46, 151, 197, 0.3);
    }
`;

const StatusCard = styled.div`
    padding: 2rem;
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(5, 150, 105, 0.05));
    border-radius: 12px;
    border: 2px solid rgba(16, 185, 129, 0.2);
`;

const StatusHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const StatusTitle = styled.h3`
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
    font-family: 'Poppins', sans-serif;
`;

const StatusSubtitle = styled.div`
    font-size: 0.9rem;
    color: var(--text-secondary);
    font-family: 'Poppins', sans-serif;
`;

const ServicesGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
`;

const ServiceItem = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem;
    background: var(--bg-primary);
    border-radius: 12px;
    border: 2px solid rgba(46, 151, 197, 0.1);
`;

const ServiceStatus = styled.div<{ $status: string }>`
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${props => props.$status === 'operational' ? '#10b981' : '#ef4444'};
    flex-shrink: 0;
    box-shadow: 0 0 0 3px ${props => props.$status === 'operational' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
`;

const ServiceName = styled.div`
    flex: 1;
    font-weight: 500;
    color: var(--text-primary);
    font-family: 'Poppins', sans-serif;
`;

const ServiceBadge = styled.div<{ $status: string }>`
    padding: 0.25rem 0.75rem;
    background: ${props => props.$status === 'operational' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
    color: ${props => props.$status === 'operational' ? '#10b981' : '#ef4444'};
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 600;
    font-family: 'Poppins', sans-serif;
`;

const MaintenanceSection = styled.div`
    padding: 1.5rem;
    background: var(--bg-primary);
    border-radius: 12px;
    border: 2px solid rgba(46, 151, 197, 0.1);
`;

const MaintenanceTitle = styled.h3`
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.75rem;
    font-family: 'Poppins', sans-serif;
`;

const MaintenanceText = styled.p`
    font-size: 0.95rem;
    color: var(--text-secondary);
    line-height: 1.6;
    font-family: 'Poppins', sans-serif;
`;

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    text-align: center;
    color: var(--text-secondary);
`;

const EmptyText = styled.div`
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-top: 1rem;
    font-family: 'Poppins', sans-serif;
`;

const EmptySubtext = styled.div`
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin-top: 0.5rem;
    font-family: 'Poppins', sans-serif;
`;

export default HelpSupportPage;
