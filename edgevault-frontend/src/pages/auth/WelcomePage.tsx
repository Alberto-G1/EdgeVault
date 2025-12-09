import React from 'react';
import { useNavigate } from 'react-router-dom';
import WelcomeButton from '../../components/common/WelcomeButton';
import styled from 'styled-components';

const WelcomePage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <WelcomeContainer>
            <ContentWrapper>
                {/* Logo */}
                <LogoWrapper>
                    <img 
                        src="/logo.png" 
                        alt="EdgeVault Logo" 
                        className="logo-image"
                    />
                </LogoWrapper>

                {/* Title */}
                <TitleWrapper>
                    <h1 className="main-title">
                        EDGEVAULT
                    </h1>
                    <p className="subtitle">
                        Secure Document Management System
                    </p>
                </TitleWrapper>

                {/* Welcome Button */}
                <ButtonWrapper>
                    <WelcomeButton 
                        onClick={() => navigate('/auth/login')}
                        primaryText="WELCOME"
                        secondaryText="EDGEVAULT"
                    />
                </ButtonWrapper>

                {/* Features */}
                <FeaturesGrid>
                    <FeatureCard>
                        <div className="feature-icon">🔒</div>
                        <h3 className="feature-title">Secure</h3>
                        <p className="feature-description">Enterprise-grade security</p>
                    </FeatureCard>
                    <FeatureCard>
                        <div className="feature-icon">⚡</div>
                        <h3 className="feature-title">Fast</h3>
                        <p className="feature-description">Lightning-fast performance</p>
                    </FeatureCard>
                    <FeatureCard>
                        <div className="feature-icon">📁</div>
                        <h3 className="feature-title">Organized</h3>
                        <p className="feature-description">Intelligent organization</p>
                    </FeatureCard>
                </FeaturesGrid>
            </ContentWrapper>

            {/* Background effects */}
            <BackgroundEffect className="effect-1" />
            <BackgroundEffect className="effect-2" />
        </WelcomeContainer>
    );
};

const WelcomeContainer = styled.div`
    display: flex;
    flex-column: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-primary) 100%);
    position: relative;
    overflow: hidden;
    padding: 20px;

    @keyframes float {
        0%, 100% {
            transform: translateY(0px);
        }
        50% {
            transform: translateY(-20px);
        }
    }
    
    @keyframes gradient {
        0%, 100% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 100% 50%;
        }
    }

    @keyframes pulse-slow {
        0%, 100% {
            opacity: 0.3;
            transform: scale(1);
        }
        50% {
            opacity: 0.5;
            transform: scale(1.1);
        }
    }
`;

const ContentWrapper = styled.div`
    text-align: center;
    z-index: 10;
    max-width: 1200px;
    width: 100%;
`;

const LogoWrapper = styled.div`
    animation: float 3s ease-in-out infinite;
    margin-bottom: 40px;

    .logo-image {
        width: 200px;
        height: auto;
        filter: drop-shadow(0 10px 30px var(--shadow));

        @media (max-width: 768px) {
            width: 160px;
        }

        @media (max-width: 480px) {
            width: 120px;
        }
    }
`;

const TitleWrapper = styled.div`
    margin-bottom: 60px;

    .main-title {
        font-size: 72px;
        font-weight: 900;
        font-family: 'Poppins', sans-serif;
        background: linear-gradient(135deg, var(--light-blue), var(--purple), var(--orange));
        background-size: 200% auto;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: gradient 3s ease infinite;
        margin-bottom: 20px;
        letter-spacing: 2px;

        @media (max-width: 768px) {
            font-size: 54px;
        }

        @media (max-width: 480px) {
            font-size: 36px;
            letter-spacing: 1px;
        }
    }

    .subtitle {
        font-size: 24px;
        color: var(--text-secondary);
        font-family: 'Poppins', sans-serif;
        font-weight: 300;
        letter-spacing: 1.5px;

        @media (max-width: 768px) {
            font-size: 20px;
        }

        @media (max-width: 480px) {
            font-size: 16px;
            letter-spacing: 1px;
        }
    }
`;

const ButtonWrapper = styled.div`
    padding: 30px 0;

    @media (max-width: 768px) {
        padding: 20px 0;
    }
`;

const FeaturesGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 40px;
    margin-top: 80px;
    max-width: 900px;
    margin-left: auto;
    margin-right: auto;
    padding: 0 20px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 25px;
        margin-top: 60px;
    }
`;

const FeatureCard = styled.div`
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 20px;
    padding: 40px 30px;
    transition: all 0.3s ease;
    box-shadow: 0 5px 20px var(--shadow);

    &:hover {
        transform: translateY(-10px);
        box-shadow: 0 15px 40px var(--shadow);
    }

    .feature-icon {
        font-size: 56px;
        margin-bottom: 20px;

        @media (max-width: 768px) {
            font-size: 48px;
        }
    }

    .feature-title {
        font-size: 24px;
        font-weight: 700;
        font-family: 'Poppins', sans-serif;
        color: var(--text-primary);
        margin-bottom: 12px;

        @media (max-width: 768px) {
            font-size: 20px;
        }
    }

    .feature-description {
        font-size: 16px;
        color: var(--text-secondary);
        font-family: 'Poppins', sans-serif;
        font-weight: 400;

        @media (max-width: 768px) {
            font-size: 14px;
        }
    }
`;

const BackgroundEffect = styled.div`
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    animation: pulse-slow 4s ease-in-out infinite;
    pointer-events: none;

    &.effect-1 {
        top: 20%;
        left: 20%;
        width: 400px;
        height: 400px;
        background: var(--purple);
        opacity: 0.2;

        @media (max-width: 768px) {
            width: 300px;
            height: 300px;
        }
    }

    &.effect-2 {
        bottom: 20%;
        right: 20%;
        width: 400px;
        height: 400px;
        background: var(--orange);
        opacity: 0.2;
        animation-delay: 2s;

        @media (max-width: 768px) {
            width: 300px;
            height: 300px;
        }
    }
`;

export default WelcomePage;
