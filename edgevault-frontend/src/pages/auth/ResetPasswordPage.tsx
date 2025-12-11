import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../../api/axiosConfig';
import styled from 'styled-components';
import Loader from '../../components/common/Loader';
import HoverButton from '../../components/common/HoverButton';

const ResetPasswordPage: React.FC = () => {
    const { showError, showSuccess } = useToast();
    const [searchParams] = useSearchParams();
    const [token, setToken] = useState<string>('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const tokenParam = searchParams.get('token');
        if (!tokenParam) {
            showError('Invalid Token', 'Invalid or missing reset token');
            navigate('/login');
        } else {
            setToken(tokenParam);
        }
    }, [searchParams, navigate]);

    const validatePassword = (): boolean => {
        if (newPassword.length < 8) {
            showError('Invalid Password', 'Password must be at least 8 characters long');
            return false;
        }

        if (newPassword !== confirmPassword) {
            showError('Password Mismatch', 'Passwords do not match');
            return false;
        }

        // Password strength validation
        const hasUpperCase = /[A-Z]/.test(newPassword);
        const hasLowerCase = /[a-z]/.test(newPassword);
        const hasNumbers = /\d/.test(newPassword);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

        if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
            showError('Weak Password', 'Password must contain uppercase, lowercase, and numbers');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validatePassword()) {
            return;
        }

        setLoading(true);

        try {
            const response = await apiClient.post('/auth/reset-password', {
                token,
                newPassword
            });
            showSuccess('Success', response.data.message);
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err: any) {
            showError('Error', err.response?.data?.message || 'Failed to reset password. The link may have expired.');
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrength = (): { strength: string; color: string; percentage: number } => {
        if (!newPassword) return { strength: '', color: '', percentage: 0 };

        let score = 0;
        if (newPassword.length >= 8) score++;
        if (newPassword.length >= 12) score++;
        if (/[A-Z]/.test(newPassword)) score++;
        if (/[a-z]/.test(newPassword)) score++;
        if (/\d/.test(newPassword)) score++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) score++;

        if (score <= 2) return { strength: 'Weak', color: '#EF4444', percentage: 33 };
        if (score <= 4) return { strength: 'Medium', color: 'rgb(229, 151, 54)', percentage: 66 };
        return { strength: 'Strong', color: '#10b981', percentage: 100 };
    };

    const passwordStrength = getPasswordStrength();

    if (loading) {
        return (
            <LoaderContainer>
                <Loader />
            </LoaderContainer>
        );
    }

    if (success) {
        return (
            <Container>
                <Wrapper>
                    <SuccessCard>
                        <SuccessIcon>✅</SuccessIcon>
                        <Heading>Password Reset Successful!</Heading>
                        <Message>
                            Your password has been successfully reset. You can now log in with your new password.
                        </Message>
                        <Message style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>
                            Redirecting to login page...
                        </Message>
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
                    <Heading>Reset Your Password</Heading>
                    <Subtitle>
                        Please enter your new password below.
                    </Subtitle>
                    <Form onSubmit={handleSubmit}>
                        <InputGroup>
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                required
                                autoFocus
                            />
                            {newPassword && (
                                <PasswordStrengthBar>
                                    <StrengthFill percentage={passwordStrength.percentage} color={passwordStrength.color} />
                                </PasswordStrengthBar>
                            )}
                            {newPassword && (
                                <PasswordStrengthText color={passwordStrength.color}>
                                    Password Strength: {passwordStrength.strength}
                                </PasswordStrengthText>
                            )}
                        </InputGroup>

                        <InputGroup>
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                required
                            />
                        </InputGroup>

                        <InfoBox>
                            <strong>Password Requirements:</strong>
                            <ul>
                                <li>At least 8 characters long</li>
                                <li>Contains uppercase and lowercase letters</li>
                                <li>Contains at least one number</li>
                                <li>Special characters recommended</li>
                            </ul>
                        </InfoBox>

                        <ButtonWrapper>
                            <HoverButton
                                textOne="Reset Password"
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
    max-width: 520px;
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
    margin-bottom: 16px;
    line-height: 1.6;
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

const PasswordStrengthBar = styled.div`
    width: 100%;
    height: 4px;
    background: var(--border-color);
    border-radius: 2px;
    margin-top: 8px;
    overflow: hidden;
`;

const StrengthFill = styled.div<{ percentage: number; color: string }>`
    height: 100%;
    width: ${props => props.percentage}%;
    background: ${props => props.color};
    transition: all 0.3s ease;
`;

const PasswordStrengthText = styled.div<{ color: string }>`
    font-size: 12px;
    color: ${props => props.color};
    font-weight: 600;
    margin-top: 4px;
`;

const InfoBox = styled.div`
    background: rgba(46, 151, 197, 0.1);
    border-left: 4px solid rgb(46, 151, 197);
    padding: 16px;
    margin-bottom: 24px;
    border-radius: 8px;

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

export default ResetPasswordPage;
