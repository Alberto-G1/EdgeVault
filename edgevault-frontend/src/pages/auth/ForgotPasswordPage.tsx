import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/axiosConfig';
import { toast } from 'react-hot-toast';
import styled from 'styled-components';
import Loader from '../../components/common/Loader';
import HoverButton from '../../components/common/HoverButton';

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        setLoading(true);

        try {
            const response = await apiClient.post('/auth/forgot-password', { email });
            toast.success(response.data.message);
            setSubmitted(true);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to send reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <LoaderContainer>
                <Loader />
            </LoaderContainer>
        );
    }

    if (submitted) {
        return (
            <Container>
                <Wrapper>
                    <SuccessCard>
                        <SuccessIcon>✉️</SuccessIcon>
                        <Heading>Check Your Email</Heading>
                        <Message>
                            If an account exists with that email address, we've sent password reset instructions.
                        </Message>
                        <InfoBox>
                            <strong>⏱️ Didn't receive an email?</strong>
                            <ul>
                                <li>Check your spam or junk folder</li>
                                <li>Make sure you entered the correct email</li>
                                <li>Wait a few minutes and try again</li>
                            </ul>
                        </InfoBox>
                        <ButtonWrapper>
                            <HoverButton
                                textOne="Back to Login"
                                textTwo="Sign In"
                                type="button"
                                onClick={() => navigate('/login')}
                                width="100%"
                                height="55px"
                            />
                        </ButtonWrapper>
                    </SuccessCard>
                </Wrapper>
            </Container>
        );
    }

    return (
        <Container>
            <Wrapper>
                <Card>
                    <LogoContainer>
                        <Logo>🔐 EdgeVault</Logo>
                    </LogoContainer>
                    <Heading>Forgot Password?</Heading>
                    <Subtitle>
                        Enter your email address and we'll send you instructions to reset your password.
                    </Subtitle>
                    <Form onSubmit={handleSubmit}>
                        <InputGroup>
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                autoFocus
                            />
                        </InputGroup>
                        <ButtonWrapper>
                            <HoverButton
                                textOne="Send Reset Link"
                                textTwo="Submit"
                                type="submit"
                                disabled={loading}
                                width="100%"
                                height="55px"
                            />
                        </ButtonWrapper>
                    </Form>
                    <BackLink onClick={() => navigate('/login')}>
                        ← Back to Login
                    </BackLink>
                </Card>
            </Wrapper>
        </Container>
    );
};

const LoaderContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const Container = styled.div`
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, rgb(46, 151, 197) 0%, rgb(150, 129, 158) 100%);
    padding: 20px;
`;

const Wrapper = styled.div`
    width: 100%;
    max-width: 480px;
`;

const Card = styled.div`
    background: var(--bg-primary);
    border-radius: 20px;
    padding: 48px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    transition: transform 0.3s ease;

    &:hover {
        transform: translateY(-5px);
    }
`;

const SuccessCard = styled(Card)`
    text-align: center;
`;

const LogoContainer = styled.div`
    text-align: center;
    margin-bottom: 24px;
`;

const Logo = styled.div`
    font-size: 32px;
    font-weight: bold;
    background: linear-gradient(135deg, rgb(46, 151, 197), rgb(150, 129, 158));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
`;

const SuccessIcon = styled.div`
    font-size: 64px;
    margin-bottom: 24px;
`;

const Heading = styled.h1`
    color: var(--text-primary);
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 12px;
    text-align: center;
`;

const Subtitle = styled.p`
    color: var(--text-secondary);
    font-size: 16px;
    text-align: center;
    margin-bottom: 32px;
    line-height: 1.5;
`;

const Message = styled.p`
    color: var(--text-secondary);
    font-size: 16px;
    margin-bottom: 24px;
    line-height: 1.6;
`;

const InfoBox = styled.div`
    background: rgba(46, 151, 197, 0.1);
    border-left: 4px solid rgb(46, 151, 197);
    padding: 16px;
    margin-bottom: 24px;
    border-radius: 8px;
    text-align: left;

    strong {
        color: var(--text-primary);
        display: block;
        margin-bottom: 12px;
    }

    ul {
        margin: 0;
        padding-left: 20px;
        color: var(--text-secondary);

        li {
            margin-bottom: 8px;
            line-height: 1.5;
        }
    }
`;

const Form = styled.form`
    margin-bottom: 24px;
`;

const InputGroup = styled.div`
    margin-bottom: 24px;
`;

const Label = styled.label`
    display: block;
    color: var(--text-primary);
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 8px;
`;

const Input = styled.input`
    width: 100%;
    padding: 14px 18px;
    border: 2px solid var(--border-color);
    border-radius: 10px;
    font-size: 16px;
    background: var(--bg-secondary);
    color: var(--text-primary);
    transition: all 0.3s ease;

    &:focus {
        outline: none;
        border-color: rgb(46, 151, 197);
        box-shadow: 0 0 0 3px rgba(46, 151, 197, 0.1);
    }

    &::placeholder {
        color: var(--text-tertiary);
    }
`;

const ButtonWrapper = styled.div`
    margin-bottom: 20px;
`;

const BackLink = styled.div`
    text-align: center;
    color: rgb(46, 151, 197);
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: color 0.3s ease;

    &:hover {
        color: rgb(150, 129, 158);
        text-decoration: underline;
    }
`;

export default ForgotPasswordPage;
