import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { changeMyPassword } from '../../api/profileService';
import { Lock, Eye, EyeOff, Key, AlertCircle } from 'lucide-react';
import styled from 'styled-components';
import HoverButton from '../common/HoverButton';

const ForcePasswordChangeModal: React.FC = () => {
    const { fulfillPasswordChange } = useAuth();
    const { showSuccess, showError } = useToast();
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showError('Password Mismatch', 'New passwords do not match.');
            return;
        }
        if (passwordData.newPassword === 'Default@123U') {
            showError('Invalid Password', 'New password cannot be the same as the default password.');
            return;
        }
        setIsSubmitting(true);
        try {
            await changeMyPassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            showSuccess('Success', 'Password updated successfully! You can now use the system.');
            fulfillPasswordChange();
        } catch (error: any) {
            showError('Error', error.response?.data?.message || 'Failed to update password.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ModalOverlay>
            <ModalContainer>
                <ModalHeader>
                    <LockIconWrapper>
                        <Lock size={40} />
                    </LockIconWrapper>
                    <ModalTitle>Update Your Password</ModalTitle>
                    <ModalSubtitle>
                        For your security, you must change your temporary password before you can continue.
                    </ModalSubtitle>
                </ModalHeader>

                <ModalBody>
                    <AlertBox>
                        <AlertCircle size={20} />
                        <AlertText>
                            <strong>Important:</strong> Your account was created with a default password. 
                            Please create a strong, unique password to secure your account.
                        </AlertText>
                    </AlertBox>

                    <FormSection onSubmit={handleSubmit}>
                        <FormGroup>
                            <Label>
                                <IconWrapper>
                                    <Key size={18} />
                                </IconWrapper>
                                Current Password
                            </Label>
                            <PasswordInputWrapper>
                                <PasswordInput
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handleChange}
                                    placeholder="Enter the password given by admin"
                                    required
                                />
                                <EyeToggle onClick={() => setShowCurrentPassword(!showCurrentPassword)} type="button">
                                    {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </EyeToggle>
                            </PasswordInputWrapper>
                            <HelpText>Enter the temporary password provided by your administrator</HelpText>
                        </FormGroup>

                        <FormGroup>
                            <Label>
                                <IconWrapper>
                                    <Lock size={18} />
                                </IconWrapper>
                                New Password
                            </Label>
                            <PasswordInputWrapper>
                                <PasswordInput
                                    type={showNewPassword ? 'text' : 'password'}
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handleChange}
                                    placeholder="Enter your new password"
                                    required
                                    minLength={8}
                                />
                                <EyeToggle onClick={() => setShowNewPassword(!showNewPassword)} type="button">
                                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </EyeToggle>
                            </PasswordInputWrapper>
                            <HelpText>Minimum 8 characters required</HelpText>
                        </FormGroup>

                        <FormGroup>
                            <Label>
                                <IconWrapper>
                                    <Lock size={18} />
                                </IconWrapper>
                                Confirm New Password
                            </Label>
                            <PasswordInputWrapper>
                                <PasswordInput
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Re-enter your new password"
                                    required
                                />
                                <EyeToggle onClick={() => setShowConfirmPassword(!showConfirmPassword)} type="button">
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </EyeToggle>
                            </PasswordInputWrapper>
                        </FormGroup>

                        <ButtonWrapper>
                            <HoverButton
                                textOne={isSubmitting ? 'Updating...' : 'Update Password'}
                                textTwo="Secure Account"
                                type="submit"
                                disabled={isSubmitting}
                                width="100%"
                                height="55px"
                            />
                        </ButtonWrapper>
                    </FormSection>
                </ModalBody>
            </ModalContainer>
        </ModalOverlay>
    );
};

const ModalOverlay = styled.div`
    position: fixed;
    inset: 0;
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    padding: 20px;
    animation: fadeIn 0.3s ease;

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;

const ModalContainer = styled.div`
    width: 100%;
    max-width: 550px;
    max-height: 90vh;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 30px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
    overflow-y: auto;
    animation: slideUp 0.4s ease;

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

const ModalHeader = styled.div`
    padding: 40px 40px 30px;
    text-align: center;
    background: linear-gradient(135deg, rgba(46, 151, 197, 0.1) 0%, rgba(102, 126, 234, 0.1) 100%);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const LockIconWrapper = styled.div`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, #2E97C5 0%, #667eea 100%);
    color: white;
    margin-bottom: 20px;
    box-shadow: 0 10px 30px rgba(46, 151, 197, 0.3);
`;

const ModalTitle = styled.h1`
    font-size: 32px;
    font-weight: 900;
    background: linear-gradient(135deg, var(--light-blue) 0%, var(--purple) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 15px 0;
    font-family: 'Poppins', sans-serif;
`;

const ModalSubtitle = styled.p`
    font-size: 15px;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.6;
    font-family: 'Poppins', sans-serif;
`;

const ModalBody = styled.div`
    padding: 35px 40px;
`;

const AlertBox = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    background: rgba(245, 158, 11, 0.1);
    border: 2px solid rgba(245, 158, 11, 0.3);
    border-radius: 15px;
    margin-bottom: 30px;
    color: var(--text-primary);

    svg {
        flex-shrink: 0;
        color: #f59e0b;
        margin-top: 2px;
    }
`;

const AlertText = styled.div`
    font-size: 14px;
    line-height: 1.5;

    strong {
        color: #f59e0b;
        font-weight: 600;
    }
`;

const FormSection = styled.form`
    display: flex;
    flex-direction: column;
    gap: 25px;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const Label = styled.label`
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
    font-family: 'Poppins', sans-serif;
`;

const IconWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: rgba(46, 151, 197, 0.15);
    color: var(--light-blue);
`;

const PasswordInputWrapper = styled.div`
    position: relative;
    width: 100%;
`;

const PasswordInput = styled.input`
    width: 100%;
    padding: 18px 50px 18px 20px;
    background: var(--bg-primary);
    border: 2px solid var(--border-color);
    border-radius: 15px;
    color: var(--text-primary);
    font-size: 15px;
    font-family: 'Poppins', sans-serif;
    transition: all 0.3s ease;
    box-shadow: 0 5px 15px var(--shadow);

    &:focus {
        outline: none;
        border-color: var(--light-blue);
        box-shadow: 0 0 0 4px rgba(46, 151, 197, 0.1), 0 5px 15px var(--shadow);
    }

    &:disabled {
        background: var(--bg-secondary);
        opacity: 0.7;
        cursor: not-allowed;
    }

    &::placeholder {
        color: var(--text-secondary);
        opacity: 0.6;
    }
`;

const EyeToggle = styled.button`
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(46, 151, 197, 0.1);
        color: var(--light-blue);
    }
`;

const HelpText = styled.span`
    font-size: 13px;
    color: var(--text-secondary);
    font-style: italic;
    font-family: 'Poppins', sans-serif;
`;

const ButtonWrapper = styled.div`
    margin-top: 10px;
`;

export default ForcePasswordChangeModal;