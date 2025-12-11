import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

export interface Toast {
    id: string;
    title: string;
    message: string;
    type: 'error' | 'success' | 'info';
    duration?: number;
}

interface ToastContainerProps {
    toasts: Toast[];
    onClose: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
    console.log('[ToastContainer] Rendering with toasts:', toasts);
    return (
        <Container>
            {toasts.map((toast) => (
                <ToastMessage
                    key={toast.id}
                    toast={toast}
                    onClose={() => onClose(toast.id)}
                />
            ))}
        </Container>
    );
};

interface ToastMessageProps {
    toast: Toast;
    onClose: () => void;
}

const ToastMessage: React.FC<ToastMessageProps> = ({ toast, onClose }) => {
    const [isHiding, setIsHiding] = useState(false);
    const [progress, setProgress] = useState(100);
    const duration = toast.duration || getDefaultDuration(toast.type);

    useEffect(() => {
        // Progress bar animation
        const startTime = Date.now();
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
            setProgress(remaining);

            if (remaining === 0) {
                clearInterval(interval);
            }
        }, 50);

        // Auto dismiss timer
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => {
            clearInterval(interval);
            clearTimeout(timer);
        };
    }, [duration]);

    const handleClose = () => {
        setIsHiding(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const getIcon = () => {
        switch (toast.type) {
            case 'error':
                return <AlertCircle size={24} />;
            case 'success':
                return <CheckCircle size={24} />;
            case 'info':
            default:
                return <Info size={24} />;
        }
    };

    return (
        <Message $type={toast.type} $isHiding={isHiding}>
            <MessageIcon $type={toast.type}>{getIcon()}</MessageIcon>
            <MessageContent>
                <MessageTitle>{toast.title}</MessageTitle>
                <MessageText>{toast.message}</MessageText>
            </MessageContent>
            <CloseButton onClick={handleClose}>
                <X size={18} />
            </CloseButton>
            <TimerLine>
                <TimerProgress $type={toast.type} $progress={progress} />
            </TimerLine>
        </Message>
    );
};

const getDefaultDuration = (type: string): number => {
    switch (type) {
        case 'error':
            return 8000;
        case 'info':
            return 5000;
        case 'success':
            return 3000;
        default:
            return 5000;
    }
};

// Animations
const slideIn = keyframes`
    from {
        transform: translateX(100px);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
`;

const slideOut = keyframes`
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(100px);
        opacity: 0;
    }
`;

// Styled Components
const Container = styled.div`
    position: fixed;
    top: 30px;
    right: 30px;
    width: 380px;
    z-index: 10000;
    display: flex;
    flex-direction: column;
    gap: 15px;
    pointer-events: none;

    @media (max-width: 768px) {
        width: calc(100% - 40px);
        right: 20px;
        top: 20px;
    }
`;

const Message = styled.div<{ $type: string; $isHiding: boolean }>`
    display: flex;
    align-items: flex-start;
    padding: 18px 20px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    position: relative;
    overflow: hidden;
    pointer-events: auto;
    animation: ${props => props.$isHiding ? slideOut : slideIn} 0.3s ease forwards;
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }

    ${props => {
        switch (props.$type) {
            case 'error':
                return `
                    background: linear-gradient(135deg, #ffeaea 0%, #ffd6d6 100%);
                    border-left: 5px solid #ff4757;
                `;
            case 'success':
                return `
                    background: linear-gradient(135deg, #e8fff1 0%, #d6ffea 100%);
                    border-left: 5px solid #2ed573;
                `;
            case 'info':
            default:
                return `
                    background: linear-gradient(135deg, #e8f4ff 0%, #d9ebff 100%);
                    border-left: 5px solid #1e90ff;
                `;
        }
    }}
`;

const MessageIcon = styled.div<{ $type: string }>`
    margin-right: 15px;
    margin-top: 2px;
    flex-shrink: 0;
    
    ${props => {
        switch (props.$type) {
            case 'error':
                return 'color: #ff4757;';
            case 'success':
                return 'color: #2ed573;';
            case 'info':
            default:
                return 'color: #1e90ff;';
        }
    }}
`;

const MessageContent = styled.div`
    flex-grow: 1;
    min-width: 0;
`;

const MessageTitle = styled.div`
    font-weight: 600;
    margin-bottom: 5px;
    font-size: 1.05rem;
    color: #2d3748;
`;

const MessageText = styled.div`
    color: #4a5568;
    line-height: 1.5;
    font-size: 0.95rem;
`;

const CloseButton = styled.button`
    background: transparent;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    padding: 0;
    margin-left: 10px;
    transition: color 0.2s;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        color: #64748b;
    }
`;

const TimerLine = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    width: 100%;
    background: rgba(255, 255, 255, 0.3);
    overflow: hidden;
    border-radius: 0 0 12px 12px;
`;

const TimerProgress = styled.div<{ $type: string; $progress: number }>`
    height: 100%;
    width: ${props => props.$progress}%;
    transition: width 0.05s linear;
    
    ${props => {
        switch (props.$type) {
            case 'error':
                return 'background: linear-gradient(90deg, #ff4757, #ff6b81);';
            case 'success':
                return 'background: linear-gradient(90deg, #2ed573, #42e782);';
            case 'info':
            default:
                return 'background: linear-gradient(90deg, #1e90ff, #4da6ff);';
        }
    }}
`;

export default ToastContainer;
