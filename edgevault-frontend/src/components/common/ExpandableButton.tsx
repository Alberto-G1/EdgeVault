import React from 'react';
import styled from 'styled-components';

interface ExpandableButtonProps {
  icon: React.ReactNode;
  text: string;
  onClick?: () => void;
  bgColor?: string;
  hoverWidth?: string;
}

const ExpandableButton: React.FC<ExpandableButtonProps> = ({ 
  icon, 
  text, 
  onClick,
  bgColor = 'rgb(255, 65, 65)',
  hoverWidth = '125px'
}) => {
  return (
    <StyledWrapper $bgColor={bgColor} $hoverWidth={hoverWidth}>
      <button className="Btn" onClick={onClick}>
        <div className="sign">{icon}</div>
        <div className="text">{text}</div>
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div<{ $bgColor: string; $hoverWidth: string }>`
  .Btn {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 45px;
    height: 45px;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition-duration: .3s;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.199);
    background-color: ${props => props.$bgColor};
  }

  /* icon sign */
  .sign {
    width: 100%;
    transition-duration: .3s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sign svg {
    width: 17px;
  }

  .sign svg path {
    fill: white;
  }
  
  /* text */
  .text {
    position: absolute;
    right: 0%;
    width: 0%;
    opacity: 0;
    color: white;
    font-size: 1.2em;
    font-weight: 600;
    transition-duration: .3s;
  }
  
  /* hover effect on button width */
  .Btn:hover {
    width: ${props => props.$hoverWidth};
    border-radius: 40px;
    transition-duration: .3s;
  }

  .Btn:hover .sign {
    width: 30%;
    transition-duration: .3s;
    padding-left: 20px;
  }
  
  /* hover effect button's text */
  .Btn:hover .text {
    opacity: 1;
    width: 70%;
    transition-duration: .3s;
    padding-right: 10px;
  }
  
  /* button click effect*/
  .Btn:active {
    transform: translate(2px, 2px);
  }
`;

export default ExpandableButton;
