import React from 'react';
import styled from 'styled-components';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Delete',
    cancelText = 'Cancel',
    type = 'danger'
}) => {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Overlay onClick={onClose}>
            <ModalContainer onClick={(e) => e.stopPropagation()}>
                <CloseButton onClick={onClose}>
                    <X size={24} />
                </CloseButton>

                <IconContainer type={type}>
                    <AlertTriangle size={48} />
                </IconContainer>

                <ModalHeader>{title}</ModalHeader>
                <ModalMessage>{message}</ModalMessage>

                <ButtonGroup>
                    <CancelButton onClick={onClose}>
                        {cancelText}
                    </CancelButton>
                    <ConfirmButton type={type} onClick={handleConfirm}>
                        {confirmText}
                    </ConfirmButton>
                </ButtonGroup>
            </ModalContainer>
        </Overlay>
    );
};

const Overlay = styled.div`
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease-out;

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
`;

const ModalContainer = styled.div`
    background: var(--bg-secondary);
    border-radius: 16px;
    padding: 40px;
    max-width: 480px;
    width: 90%;
    position: relative;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    border: 1px solid var(--border-color);
    animation: slideUp 0.3s ease-out;
    font-family: 'Poppins', sans-serif;

    @keyframes slideUp {
        from {
            transform: translateY(20px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    @media (max-width: 576px) {
        padding: 30px 20px;
    }
`;

const CloseButton = styled.button`
    position: absolute;
    top: 20px;
    right: 20px;
    background: transparent;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
        background: var(--bg-primary);
        color: var(--text-primary);
    }
`;

const IconContainer = styled.div<{ type: 'danger' | 'warning' | 'info' }>`
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
    background: ${props => {
        switch (props.type) {
            case 'danger':
                return 'rgba(231, 76, 60, 0.1)';
            case 'warning':
                return 'rgba(229, 151, 54, 0.1)';
            case 'info':
                return 'rgba(46, 151, 197, 0.1)';
        }
    }};
    color: ${props => {
        switch (props.type) {
            case 'danger':
                return 'var(--danger)';
            case 'warning':
                return 'var(--orange)';
            case 'info':
                return 'var(--light-blue)';
        }
    }};
`;

const ModalHeader = styled.h2`
    font-size: 24px;
    font-weight: 700;
    color: var(--text-primary);
    text-align: center;
    margin-bottom: 16px;

    @media (max-width: 576px) {
        font-size: 20px;
    }
`;

const ModalMessage = styled.p`
    font-size: 15px;
    color: var(--text-secondary);
    text-align: center;
    line-height: 1.6;
    margin-bottom: 32px;

    @media (max-width: 576px) {
        font-size: 14px;
        margin-bottom: 24px;
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 16px;
    justify-content: center;

    @media (max-width: 576px) {
        flex-direction: column-reverse;
        gap: 12px;
    }
`;

const CancelButton = styled.button`
    padding: 14px 32px;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    font-family: 'Poppins', sans-serif;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid var(--border-color);
    background: var(--bg-primary);
    color: var(--text-primary);

    &:hover {
        border-color: var(--text-secondary);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px var(--shadow);
    }

    @media (max-width: 576px) {
        width: 100%;
    }
`;

const ConfirmButton = styled.button<{ type: 'danger' | 'warning' | 'info' }>`
    padding: 14px 32px;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    font-family: 'Poppins', sans-serif;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    color: white;
    background: ${props => {
        switch (props.type) {
            case 'danger':
                return 'var(--danger)';
            case 'warning':
                return 'var(--orange)';
            case 'info':
                return 'var(--light-blue)';
        }
    }};

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px ${props => {
            switch (props.type) {
                case 'danger':
                    return 'rgba(231, 76, 60, 0.4)';
                case 'warning':
                    return 'rgba(229, 151, 54, 0.4)';
                case 'info':
                    return 'rgba(46, 151, 197, 0.4)';
            }
        }};
    }

    @media (max-width: 576px) {
        width: 100%;
    }
`;

export default DeleteConfirmModal;
