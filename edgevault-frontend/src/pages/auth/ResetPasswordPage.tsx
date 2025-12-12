import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../../api/axiosConfig';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../hooks/useTheme';
import styled from 'styled-components';
import Loader from '../../components/common/Loader';
import HoverButton from '../../components/common/HoverButton';
import { Link } from 'react-router-dom';

const ResetPasswordPage: React.FC = () => {
    const { showError, showSuccess } = useToast();
    const [searchParams] = useSearchParams();
    const [token, setToken] = useState<string>('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const { mode } = useTheme();
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
            <LoaderContainer $mode={mode}>
                <Loader />
            </LoaderContainer>
        );
    }

    if (success) {
        return (
            <ResetContainer $mode={mode}>
                <StyledWrapper>
                    <div className="container">
                        <div className="logo-container">
                            <img src="/logo.png" alt="EdgeVault Logo" className="logo" />
                        </div>
                        <div className="heading">Password Reset Successful!</div>
                        <SuccessMessage>
                            <div className="success-icon">✅</div>
                            <p className="message">
                                Your password has been successfully reset. You can now log in with your new password.
                            </p>
                            <p className="redirect-message">
                                Redirecting to login page...
                            </p>
                        </SuccessMessage>
                        <div className="icon-buttons-container">
                            <IconButton 
                                to="/login" 
                                icon="←"
                                text="Back to Login"
                                aria-label="Back to Login"
                            />
                            <IconButton 
                                to="/" 
                                icon="🏠"
                                text="To Welcome Page"
                                aria-label="Go to Welcome Page"
                            />
                        </div>
                    </div>
                </StyledWrapper>
            </ResetContainer>
        );
    }

    return (
        <ResetContainer $mode={mode}>
            <StyledWrapper>
                <div className="container">
                    <div className="logo-container">
                        <img src="/logo.png" alt="EdgeVault Logo" className="logo" />
                    </div>
                    <div className="heading">Reset Your Password</div>
                    <Subtitle>
                        Please enter your new password below.
                    </Subtitle>
                    <form onSubmit={handleSubmit} className="form">
                        <InputGroup>
                            <input 
                                required 
                                className="input" 
                                type="password" 
                                name="newPassword"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="New Password" 
                                autoFocus
                            />
                            {newPassword && (
                                <>
                                    <PasswordStrengthBar>
                                        <StrengthFill percentage={passwordStrength.percentage} color={passwordStrength.color} />
                                    </PasswordStrengthBar>
                                    <PasswordStrengthText color={passwordStrength.color}>
                                        Password Strength: {passwordStrength.strength}
                                    </PasswordStrengthText>
                                </>
                            )}
                        </InputGroup>

                        <InputGroup>
                            <input 
                                required 
                                className="input" 
                                type="password" 
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm New Password" 
                            />
                        </InputGroup>

                        <div className="info-box">
                            <strong>Password Requirements:</strong>
                            <ul>
                                <li>At least 8 characters long</li>
                                <li>Contains uppercase and lowercase letters</li>
                                <li>Contains at least one number</li>
                                <li>Special characters recommended</li>
                            </ul>
                        </div>

                        <div className="button-wrapper">
                            <HoverButton
                                textOne="Reset Password"
                                textTwo="Submit"
                                type="submit"
                                disabled={loading}
                                width="100%"
                                height="55px"
                            />
                        </div>
                    </form>
                    <div className="icon-buttons-container">
                        <IconButton 
                            to="/login" 
                            icon="←"
                            text="Back to Login"
                            aria-label="Back to Login"
                        />
                        <IconButton 
                            to="/" 
                            icon="🏠"
                            text="To Welcome Page"
                            aria-label="Go to Welcome Page"
                        />
                    </div>
                </div>
            </StyledWrapper>
        </ResetContainer>
    );
};

// IconButton Component (same as in Forgot Password page)
const IconButton: React.FC<{ to: string; icon: string; text: string; ariaLabel?: string }> = ({ 
    to, 
    icon, 
    text, 
    ariaLabel 
}) => {
    return (
        <StyledIconButton to={to} aria-label={ariaLabel || text}>
            <span className="icon">{icon}</span>
            <span className="text">{text}</span>
        </StyledIconButton>
    );
};

// Styled Icon Button (same as in Forgot Password page)
const StyledIconButton = styled(Link)`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(45deg, var(--dark-teal), var(--purple));
    border: 3px solid var(--border-color);
    text-decoration: none;
    color: white;
    font-weight: 600;
    overflow: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px var(--shadow);
    position: relative;
    
    .icon {
        font-size: 24px;
        transition: all 0.3s ease;
    }
    
    .text {
        position: absolute;
        opacity: 0;
        transform: translateX(-20px);
        transition: all 0.3s ease;
        white-space: nowrap;
        font-size: 14px;
        font-family: 'Poppins', sans-serif;
    }
    
    &:hover {
        width: 200px;
        border-radius: 30px;
        gap: 10px;
        
        .icon {
            transform: scale(0.9);
        }
        
        .text {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    &:active {
        transform: scale(0.95);
        box-shadow: 0 2px 8px var(--shadow);
    }

    @media (max-width: 768px) {
        width: 55px;
        height: 55px;
        
        .icon {
            font-size: 22px;
        }
        
        &:hover {
            width: 180px;
        }
    }

    @media (max-width: 480px) {
        width: 50px;
        height: 50px;
        
        .icon {
            font-size: 20px;
        }
        
        &:hover {
            width: 160px;
            
            .text {
                font-size: 12px;
            }
        }
    }
`;

// Reusing the same LoaderContainer from other pages
const LoaderContainer = styled.div<{ $mode: 'light' | 'dark' }>`
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: ${props => 
        props.$mode === 'dark' 
            ? `url('/login-darkmode-background (3).jpeg')` 
            : `url('/login-lightmode-background (1).jpeg')`
    };
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-attachment: fixed;
    position: relative;
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: ${props => 
            props.$mode === 'dark'
                ? 'rgba(0, 0, 0, 0.4)'
                : 'rgba(255, 255, 255, 0.3)'
        };
        z-index: 1;
    }
    
    > * {
        position: relative;
        z-index: 2;
    }
`;

// Same container styling as other pages
const ResetContainer = styled.div<{ $mode: 'light' | 'dark' }>`
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: ${props => 
        props.$mode === 'dark' 
            ? `url('/login-darkmode-background (3).jpeg')` 
            : `url('/login-lightmode-background (1).jpeg')`
    };
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-attachment: fixed;
    padding: 20px;
    position: relative;
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: ${props => 
            props.$mode === 'dark'
                ? 'rgba(0, 0, 0, 0.4)'
                : 'rgba(255, 255, 255, 0.3)'
        };
        z-index: 1;
    }
    
    > * {
        position: relative;
        z-index: 2;
    }

    @media (max-width: 768px) {
        padding: 10px;
        background-attachment: scroll;
    }
`;

// Reusing the same StyledWrapper from other pages
const StyledWrapper = styled.div`
    width: 100%;
    max-width: 700px;

    .container {
        width: 100%;
        max-width: 650px;
        height: auto;
        min-height: 850px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-radius: 40px;
        padding: 50px 60px;
        border: 2px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;

        @media (max-width: 768px) {
            max-width: 100%;
            min-height: auto;
            padding: 40px 30px;
            border-radius: 30px;
            border-width: 3px;
        }

        @media (max-width: 480px) {
            padding: 30px 20px;
            border-radius: 20px;
        }
    }

    .logo-container {
        text-align: center;
        margin-bottom: 30px;

        @media (max-width: 768px) {
            margin-bottom: 20px;
        }
    }

    .logo {
        width: 180px;
        height: auto;
        filter: drop-shadow(0 4px 6px var(--shadow));

        @media (max-width: 768px) {
            width: 140px;
        }

        @media (max-width: 480px) {
            width: 120px;
        }
    }

    .heading {
        text-align: center;
        font-weight: 900;
        font-size: 48px;
        color: var(--light-blue);
        margin-bottom: 20px;
        font-family: 'Poppins', sans-serif;

        @media (max-width: 768px) {
            font-size: 36px;
            margin-bottom: 15px;
        }

        @media (max-width: 480px) {
            font-size: 28px;
        }
    }

    .form {
        margin-top: 30px;

        @media (max-width: 768px) {
            margin-top: 20px;
        }
    }

    .form .input {
        width: 100%;
        background: var(--bg-primary);
        border: 2px solid var(--border-color);
        color: var(--text-primary);
        padding: 20px 25px;
        border-radius: 20px;
        margin-top: 20px;
        box-shadow: 0 10px 20px var(--shadow);
        font-size: 16px;
        font-family: 'Poppins', sans-serif;
        transition: all 0.3s ease;

        @media (max-width: 768px) {
            padding: 16px 20px;
            font-size: 15px;
            margin-top: 15px;
        }

        @media (max-width: 480px) {
            padding: 14px 18px;
            font-size: 14px;
            border-radius: 15px;
        }
    }

    .form .input::placeholder {
        color: var(--text-secondary);
    }

    .form .input:focus {
        outline: none;
        border-color: var(--light-blue);
        box-shadow: 0 0 0 3px rgba(46, 151, 197, 0.1);
    }

    .icon-buttons-container {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 20px;
        margin-top: 30px;
        margin-bottom: 20px;

        @media (max-width: 768px) {
            gap: 15px;
            margin-top: 25px;
        }

        @media (max-width: 480px) {
            gap: 12px;
            margin-top: 20px;
            flex-direction: column;
        }
    }

    .button-wrapper {
        margin: 30px 0;

        @media (max-width: 768px) {
            margin: 25px 0;
        }

        @media (max-width: 480px) {
            margin: 20px 0;
        }
    }

    .info-box {
        background: rgba(46, 151, 197, 0.1);
        border-left: 4px solid var(--light-blue);
        padding: 16px;
        margin: 20px 0 25px 0;
        border-radius: 8px;
        text-align: left;
        font-family: 'Poppins', sans-serif;

        strong {
            color: var(--text-primary);
            display: block;
            margin-bottom: 12px;
            font-size: 14px;
        }

        ul {
            margin: 0;
            padding-left: 20px;
            color: var(--text-secondary);

            li {
                margin-bottom: 8px;
                line-height: 1.5;
                font-size: 14px;
            }
        }

        @media (max-width: 480px) {
            padding: 12px;
            margin: 15px 0 20px 0;
            
            strong {
                font-size: 13px;
            }
            
            li {
                font-size: 13px;
            }
        }
    }

    .social-account-container {
        margin-top: 35px;

        @media (max-width: 768px) {
            margin-top: 30px;
        }

        @media (max-width: 480px) {
            margin-top: 25px;
        }
    }

    .social-account-container .title {
        display: block;
        text-align: center;
        font-size: 14px;
        color: var(--text-secondary);
        margin-bottom: 15px;
        font-family: 'Poppins', sans-serif;

        @media (max-width: 768px) {
            font-size: 13px;
            margin-bottom: 12px;
        }

        @media (max-width: 480px) {
            font-size: 12px;
        }
    }

    .social-account-container .social-accounts {
        width: 100%;
        display: flex;
        justify-content: center;
        gap: 20px;
        margin-top: 10px;

        @media (max-width: 480px) {
            gap: 15px;
        }
    }

    .social-account-container .social-accounts .social-button {
        background: linear-gradient(45deg, var(--dark-teal), var(--purple));
        border: 5px solid var(--border-color);
        padding: 8px;
        border-radius: 50%;
        width: 60px;
        height: 60px;
        aspect-ratio: 1;
        display: grid;
        place-content: center;
        box-shadow: 0 12px 24px var(--shadow);
        transition: all 0.3s ease;
        cursor: pointer;

        @media (max-width: 768px) {
            width: 55px;
            height: 55px;
            border-width: 4px;
        }

        @media (max-width: 480px) {
            width: 50px;
            height: 50px;
            border-width: 3px;
            padding: 6px;
        }
    }

    .social-account-container .social-accounts .social-button .svg {
        fill: white;
        margin: auto;
        width: 24px;
        height: 24px;

        @media (max-width: 480px) {
            width: 20px;
            height: 20px;
        }
    }

    .social-account-container .social-accounts .social-button:hover {
        transform: scale(1.1);
        box-shadow: 0 15px 30px var(--shadow);
    }

    .social-account-container .social-accounts .social-button:active {
        transform: scale(0.95);
    }

    .agreement {
        display: block;
        text-align: center;
        margin-top: 25px;

        @media (max-width: 768px) {
            margin-top: 20px;
        }

        @media (max-width: 480px) {
            margin-top: 15px;
        }
    }

    .agreement a {
        text-decoration: none;
        color: var(--light-blue);
        font-size: 12px;
        font-family: 'Poppins', sans-serif;
        transition: all 0.3s ease;

        @media (max-width: 768px) {
            font-size: 11px;
        }

        @media (max-width: 480px) {
            font-size: 10px;
        }
    }

    .agreement a:hover {
        text-decoration: underline;
        color: var(--info);
    }
`;

const Subtitle = styled.p`
    text-align: center;
    color: var(--text-secondary);
    font-size: 16px;
    margin-bottom: 30px;
    line-height: 1.5;
    font-family: 'Poppins', sans-serif;

    @media (max-width: 768px) {
        font-size: 14px;
        margin-bottom: 25px;
    }

    @media (max-width: 480px) {
        font-size: 13px;
        margin-bottom: 20px;
    }
`;

const SuccessMessage = styled.div`
    text-align: center;
    margin: 20px 0;

    .success-icon {
        font-size: 64px;
        margin-bottom: 20px;
        animation: float 3s ease-in-out infinite;

        @media (max-width: 768px) {
            font-size: 48px;
        }

        @media (max-width: 480px) {
            font-size: 40px;
        }
    }

    .message {
        color: var(--text-secondary);
        font-size: 16px;
        margin-bottom: 15px;
        line-height: 1.6;
        font-family: 'Poppins', sans-serif;

        @media (max-width: 768px) {
            font-size: 15px;
            margin-bottom: 12px;
        }

        @media (max-width: 480px) {
            font-size: 14px;
        }
    }

    .redirect-message {
        color: var(--text-tertiary);
        font-size: 14px;
        font-family: 'Poppins', sans-serif;
        margin-bottom: 25px;

        @media (max-width: 480px) {
            font-size: 13px;
            margin-bottom: 20px;
        }
    }

    @keyframes float {
        0%, 100% {
            transform: translateY(0px);
        }
        50% {
            transform: translateY(-10px);
        }
    }
`;

const InputGroup = styled.div`
    position: relative;
    width: 100%;
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
    font-family: 'Poppins', sans-serif;
    text-align: right;
`;

export default ResetPasswordPage;