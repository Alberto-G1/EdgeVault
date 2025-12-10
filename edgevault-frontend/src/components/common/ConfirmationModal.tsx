import React from 'react';
import styled from 'styled-components';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    isConfirming?: boolean;
    isApprove?: boolean;
    icon?: React.ReactNode;
    confirmColor?: string;
    cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    isConfirming = false,
    isApprove = false,
    icon,
    confirmColor,
    cancelText = "Cancel",
}) => {
    if (!isOpen) return null;

    return (
        <Overlay onClick={onClose}>
            <ModalContainer $isApprove={isApprove} onClick={(e) => e.stopPropagation()}>
                <CloseButton onClick={onClose}>
                    <X size={24} />
                </CloseButton>
                
                <IconContainer>
                    <WarningIcon $isApprove={isApprove}>
                        {icon || <AlertTriangle size={40} />}
                    </WarningIcon>
                </IconContainer>

                <ModalTitle>{title}</ModalTitle>
                <ModalMessage>{message}</ModalMessage>

                <ButtonGroup>
                    <CancelButton onClick={onClose} disabled={isConfirming}>
                        {cancelText}
                    </CancelButton>
                    <ActionButton $isApprove={isApprove} onClick={onConfirm} disabled={isConfirming}>
                        {isConfirming ? `${confirmText}ing...` : confirmText}
                    </ActionButton>
                </ButtonGroup>
            </ModalContainer>
        </Overlay>
    );
};

// Styled Components
const Overlay = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.2s ease;

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
`;

const ModalContainer = styled.div<{ $isApprove?: boolean }>`
    background: var(--bg-secondary);
    border-radius: 24px;
    padding: 2.5rem;
    max-width: 480px;
    width: 90%;
    position: relative;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s ease;
    border: 2px solid ${props => props.$isApprove ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'};

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

const CloseButton = styled.button`
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    width: 40px;
    height: 40px;
    background: transparent;
    border: 2px solid var(--border-color);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(239, 68, 68, 0.1);
        border-color: rgba(239, 68, 68, 0.3);
        color: #EF4444;
        transform: rotate(90deg);
    }
`;

const IconContainer = styled.div`
    display: flex;
    justify-content: center;
    margin-bottom: 1.5rem;
`;

const WarningIcon = styled.div<{ $isApprove?: boolean }>`
    width: 80px;
    height: 80px;
    background: ${props => props.$isApprove 
        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))'
        : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1))'};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$isApprove ? '#10b981' : '#EF4444'};
    animation: pulse 2s ease-in-out infinite;

    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
    }
`;

const ModalTitle = styled.h2`
    font-size: 1.75rem;
    font-weight: 800;
    color: var(--text-primary);
    font-family: 'Poppins', sans-serif;
    text-align: center;
    margin-bottom: 1rem;
`;

const ModalMessage = styled.p`
    font-size: 1rem;
    color: var(--text-secondary);
    font-family: 'Poppins', sans-serif;
    text-align: center;
    line-height: 1.6;
    margin-bottom: 2rem;
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 1rem;
`;

const CancelButton = styled.button`
    flex: 1;
    padding: 1rem 1.5rem;
    background: var(--bg-secondary);
    border: 2px solid var(--border-color);
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    font-family: 'Poppins', sans-serif;
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover:not(:disabled) {
        background: rgba(46, 151, 197, 0.1);
        border-color: rgba(46, 151, 197, 0.3);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px var(--shadow);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const ActionButton = styled.button<{ $isApprove?: boolean }>`
    flex: 1;
    padding: 1rem 1.5rem;
    background: ${props => props.$isApprove 
        ? 'linear-gradient(135deg, #10b981, #059669)'
        : 'linear-gradient(135deg, #EF4444, #DC2626)'};
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    font-family: 'Poppins', sans-serif;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: ${props => props.$isApprove 
        ? '0 4px 15px rgba(16, 185, 129, 0.3)'
        : '0 4px 15px rgba(239, 68, 68, 0.3)'};

    &:hover:not(:disabled) {
        background: ${props => props.$isApprove 
            ? 'linear-gradient(135deg, #059669, #047857)'
            : 'linear-gradient(135deg, #DC2626, #B91C1C)'};
        transform: translateY(-2px);
        box-shadow: ${props => props.$isApprove 
            ? '0 6px 20px rgba(16, 185, 129, 0.4)'
            : '0 6px 20px rgba(239, 68, 68, 0.4)'};
    }

    &:active:not(:disabled) {
        transform: scale(0.98);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }
`;

export default ConfirmationModal;