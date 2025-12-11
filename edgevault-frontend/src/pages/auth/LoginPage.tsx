import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/axiosConfig';
import { toast } from 'react-hot-toast';
import styled from 'styled-components';
import Loader from '../../components/common/Loader';
import HoverButton from '../../components/common/HoverButton';

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('Administrator');
    const [password, setPassword] = useState('Admin@123');
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await apiClient.post('/auth/login', { username, password, rememberMe });
            const { token, permissions, passwordChangeRequired } = response.data;
            login(token, permissions, passwordChangeRequired);
            toast.success('Login successful!');
            navigate('/admin/dashboard');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.');
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

    return (
        <LoginContainer>
            <StyledWrapper>
                <div className="container">
                    <div className="logo-container">
                        <img src="/logo.png" alt="EdgeVault Logo" className="logo" />
                    </div>
                    <div className="heading">Sign In</div>
                    <form onSubmit={handleSubmit} className="form">
                        <input 
                            required 
                            className="input" 
                            type="text" 
                            name="username" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username" 
                        />
                        <input 
                            required 
                            className="input" 
                            type="password" 
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password" 
                        />
                        <div className="remember-forgot-container">
                            <label className="remember-me">
                                <input 
                                    type="checkbox" 
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <span>Remember me for 30 days</span>
                            </label>
                            <span className="forgot-password">
                                <a href="/forgot-password">Forgot Password?</a>
                            </span>
                        </div>
                        <div className="button-wrapper">
                            <HoverButton 
                                textOne="Sign In"
                                textTwo="Welcome!"
                                type="submit"
                                disabled={loading}
                                width="100%"
                                height="55px"
                            />
                        </div>
                    </form>
                    <div className="social-account-container">
                        <span className="title">Or Sign in with</span>
                        <div className="social-accounts">
                            <button type="button" className="social-button google">
                                <svg className="svg" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 488 512">
                                    <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
                                </svg>
                            </button>
                            <button type="button" className="social-button apple">
                                <svg className="svg" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512">
                                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                                </svg>
                            </button>
                            <button type="button" className="social-button twitter">
                                <svg className="svg" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
                                    <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <span className="agreement">
                        <a href="#">Learn user licence agreement</a>
                    </span>
                </div>
            </StyledWrapper>
        </LoginContainer>
    );
};

const LoaderContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
`;

const LoginContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
    padding: 20px;

    @media (max-width: 768px) {
        padding: 10px;
    }
`;

const StyledWrapper = styled.div`
    width: 100%;
    max-width: 700px;

    .container {
        width: 100%;
        max-width: 650px;
        height: auto;
        min-height: 850px;
        background: var(--bg-secondary);
        border-radius: 40px;
        padding: 50px 60px;
        border: 5px solid var(--border-color);
        box-shadow: 0 30px 60px var(--shadow);
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
        margin-bottom: 30px;
        font-family: 'Poppins', sans-serif;

        @media (max-width: 768px) {
            font-size: 36px;
            margin-bottom: 20px;
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

    .form .remember-forgot-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 15px;
        margin-bottom: 10px;

        @media (max-width: 480px) {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
        }
    }

    .form .remember-me {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        user-select: none;

        input[type="checkbox"] {
            width: 18px;
            height: 18px;
            cursor: pointer;
            accent-color: var(--light-blue);
        }

        span {
            font-size: 14px;
            color: var(--text-secondary);
            font-family: 'Poppins', sans-serif;
        }

        &:hover span {
            color: var(--text-primary);
        }
    }

    .form .forgot-password {
        display: block;
        text-align: right;

        @media (max-width: 480px) {
            text-align: left;
        }
    }

    .form .forgot-password a {
        font-size: 14px;
        color: var(--light-blue);
        text-decoration: none;
        font-family: 'Poppins', sans-serif;
        transition: all 0.3s ease;

        @media (max-width: 768px) {
            font-size: 13px;
        }

        @media (max-width: 480px) {
            font-size: 12px;
        }
    }

    .form .forgot-password a:hover {
        text-decoration: underline;
        color: var(--info);
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

export default LoginPage;