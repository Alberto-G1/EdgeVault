import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../../hooks/useAuth';

const WelcomeCard: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <StyledWrapper>
      <div className="card">
        <div className="border" />
        <div className="content">
          <div className="logo">
            <div className="logo1">
              <svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" id="logo-main">
                <defs>
                  <linearGradient id="avatarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--light-blue)" />
                    <stop offset="50%" stopColor="var(--purple)" />
                    <stop offset="100%" stopColor="var(--orange)" />
                  </linearGradient>
                </defs>
                <circle cx="25" cy="25" r="20" fill="url(#avatarGradient)" />
                <text x="25" y="32" fontSize="20" fill="white" textAnchor="middle" fontWeight="bold">
                  {user?.sub?.substring(0, 2).toUpperCase() || 'EV'}
                </text>
              </svg>
            </div>
            <div className="logo2">
              <svg viewBox="0 0 150 30" xmlns="http://www.w3.org/2000/svg" id="logo-second">
                <defs>
                  <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--light-blue)" />
                    <stop offset="50%" stopColor="var(--purple)" />
                    <stop offset="100%" stopColor="var(--orange)" />
                  </linearGradient>
                </defs>
                <text x="5" y="22" fontSize="18" fill="url(#textGradient)" fontFamily="Poppins, sans-serif" fontWeight="700">
                  EDGEVAULT
                </text>
              </svg>
            </div>
            <span className="trail" />
          </div>
          <span className="logo-bottom-text">Document Management</span>
        </div>
        <span className="bottom-text">Welcome Back!</span>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .card {
    width: 100%;
    max-width: 650px;
    height: 220px;
    background: linear-gradient(135deg, var(--bg-secondary) 0%, rgba(150, 129, 158, 0.05) 50%, rgba(229, 151, 54, 0.05) 100%);
    position: relative;
    display: grid;
    place-content: center;
    border-radius: 16px;
    overflow: hidden;
    transition: all 0.5s ease-in-out;
    box-shadow: 0 4px 16px var(--shadow);
    border: 2px solid transparent;
    background-image: 
      linear-gradient(var(--bg-secondary), var(--bg-secondary)),
      linear-gradient(135deg, var(--light-blue), var(--purple), var(--orange));
    background-origin: border-box;
    background-clip: padding-box, border-box;

    @media (max-width: 1024px) {
      max-width: 550px;
      height: 200px;
    }

    @media (max-width: 768px) {
      max-width: 100%;
      height: 180px;
    }

    @media (max-width: 480px) {
      width: 100%;
      height: 160px;
    }
  }

  #logo-main, #logo-second {
    height: 100%;
  }

  #logo-second {
    padding-bottom: 10px;
  }

  .border {
    position: absolute;
    inset: 0px;
    border: 3px solid transparent;
    border-image: linear-gradient(135deg, var(--light-blue), var(--purple), var(--orange)) 1;
    opacity: 0;
    transform: rotate(10deg);
    transition: all 0.5s ease-in-out;
  }

  .bottom-text {
    position: absolute;
    left: 50%;
    bottom: 18px;
    transform: translateX(-50%);
    font-size: 10px;
    text-transform: uppercase;
    padding: 0px 5px 0px 8px;
    background: linear-gradient(90deg, var(--light-blue), var(--purple), var(--orange));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    opacity: 0;
    letter-spacing: 8px;
    transition: all 0.5s ease-in-out;
    font-family: 'Poppins', sans-serif;
    font-weight: 700;

    @media (max-width: 480px) {
      font-size: 8px;
      letter-spacing: 6px;
      bottom: 15px;
    }
  }

  .content {
    transition: all 0.5s ease-in-out;
  }

  .content .logo {
    height: 50px;
    position: relative;
    width: 50px;
    overflow: hidden;
    transition: all 1s ease-in-out;

    @media (max-width: 768px) {
      height: 45px;
      width: 45px;
    }

    @media (max-width: 480px) {
      height: 40px;
      width: 40px;
    }
  }

  .content .logo .logo1 {
    height: 50px;
    position: absolute;
    left: 0;

    @media (max-width: 768px) {
      height: 45px;
    }

    @media (max-width: 480px) {
      height: 40px;
    }
  }

  .content .logo .logo2 {
    height: 50px;
    position: absolute;
    left: 50px;

    @media (max-width: 768px) {
      height: 45px;
      left: 45px;
    }

    @media (max-width: 480px) {
      height: 40px;
      left: 40px;
    }
  }

  .content .logo .trail {
    position: absolute;
    right: 0;
    height: 100%;
    width: 100%;
    opacity: 0;
  }

  .content .logo-bottom-text {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    margin-top: 40px;
    background: linear-gradient(90deg, var(--purple), var(--orange));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    padding-left: 8px;
    font-size: 13px;
    opacity: 0;
    letter-spacing: none;
    transition: all 0.5s ease-in-out 0.5s;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    white-space: nowrap;

    @media (max-width: 768px) {
      font-size: 12px;
      margin-top: 38px;
    }

    @media (max-width: 480px) {
      font-size: 10px;
      margin-top: 35px;
    }
  }

  .card:hover {
    border-radius: 8px;
    transform: scale(1.02);
    box-shadow: 0 8px 32px var(--shadow);
  }

  .card:hover .logo {
    width: 240px;
    animation: opacity 1s ease-in-out;

    @media (max-width: 768px) {
      width: 200px;
    }

    @media (max-width: 480px) {
      width: 170px;
    }
  }

  .card:hover .border {
    inset: 15px;
    opacity: 1;
    transform: rotate(0);
  }

  .card:hover .bottom-text {
    letter-spacing: 5px;
    opacity: 1;
    transform: translateX(-50%);

    @media (max-width: 480px) {
      letter-spacing: 4px;
    }
  }

  .card:hover .content .logo-bottom-text {
    opacity: 1;
    letter-spacing: 8px;

    @media (max-width: 768px) {
      letter-spacing: 7px;
    }

    @media (max-width: 480px) {
      letter-spacing: 5px;
    }
  }

  .card:hover .trail {
    animation: trail 1s ease-in-out;
  }

  @keyframes opacity {
    0% {
      border-right: 2px solid transparent;
    }

    10% {
      border-right: 2px solid var(--purple);
    }

    80% {
      border-right: 2px solid var(--orange);
    }

    100% {
      border-right: 2px solid transparent;
    }
  }

  @keyframes trail {
    0% {
      background: linear-gradient(90deg, rgba(46, 151, 197, 0) 90%, rgb(46, 151, 197) 100%);
      opacity: 0;
    }

    30% {
      background: linear-gradient(90deg, rgba(150, 129, 158, 0) 70%, rgb(150, 129, 158) 100%);
      opacity: 1;
    }

    70% {
      background: linear-gradient(90deg, rgba(229, 151, 54, 0) 70%, rgb(229, 151, 54) 100%);
      opacity: 1;
    }

    95% {
      background: linear-gradient(90deg, rgba(46, 151, 197, 0) 90%, rgb(46, 151, 197) 100%);
      opacity: 0;
    }
  }
`;

export default WelcomeCard;
