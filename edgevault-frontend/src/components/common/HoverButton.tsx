import React from 'react';
import styled from 'styled-components';

interface HoverButtonProps {
  textOne: string;
  textTwo: string;
  onClick?: () => void;
  width?: string;
  height?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

const HoverButton: React.FC<HoverButtonProps> = ({ 
  textOne, 
  textTwo, 
  onClick,
  width = '140px',
  height = '50px',
  type = 'button',
  disabled = false
}) => {
  return (
    <StyledWrapper $width={width} $height={height}>
      <button className="btn" onClick={onClick} type={type} disabled={disabled}>
        <span className="btn-text-one">{textOne}</span>
        <span className="btn-text-two">{textTwo}</span>
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div<{ $width: string; $height: string }>`
  .btn {
    width: ${props => props.$width};
    height: ${props => props.$height};
    background: linear-gradient(to top, #00154c, #12376e, #23487f);
    color: #fff;
    border-radius: 50px;
    border: none;
    outline: none;
    cursor: pointer;
    position: relative;
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.5);
    overflow: hidden;
    font-family: 'Poppins', sans-serif;
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn:disabled:hover .btn-text-one,
  .btn:disabled:hover .btn-text-two {
    top: 50%;
    top: 150%;
  }

  .btn span {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
    transition: top 0.5s;
    font-weight: 600;
  }

  .btn-text-one {
    position: absolute;
    width: 100%;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
  }

  .btn-text-two {
    position: absolute;
    width: 100%;
    top: 150%;
    left: 0;
    transform: translateY(-50%);
  }

  .btn:hover:not(:disabled) .btn-text-one {
    top: -100%;
  }

  .btn:hover:not(:disabled) .btn-text-two {
    top: 50%;
  }

  /* Dark mode support */
  .dark-mode & .btn {
    background: linear-gradient(to top, #001a5c, #1a4080, #2d5a9f);
  }
`;

export default HoverButton;
