import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import ForcePasswordChangeModal from './ForcePasswordChangeModal';
import AppRouter from '../../routes/AppRouter';

const AuthEnforcer: React.FC = () => {
    const { isAuthenticated, passwordChangeRequired } = useAuth();

    // The router is always rendered, but the modal will overlay it if needed.
    return (
        <>
            <AppRouter />
            {isAuthenticated && passwordChangeRequired && <ForcePasswordChangeModal />}
        </>
    );
};

export default AuthEnforcer;