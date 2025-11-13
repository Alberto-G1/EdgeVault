import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/admin/DashboardPage';
import ProtectedRoute from './ProtectedRoute';
import UserManagementPage from '../pages/admin/UserManagementPage';
import RoleManagementPage from '../pages/admin/RoleManagementPage';
import RoleFormPage from '../pages/admin/RoleFormPage';

const AppRouter: React.FC = () => {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route path="/admin" element={<ProtectedRoute />}>
                <Route path="dashboard" element={<DashboardPage />} />
                
                <Route path="users" element={<UserManagementPage />} />
                
                <Route path="roles" element={<RoleManagementPage />} />
                <Route path="roles/new" element={<RoleFormPage />} /> 
                <Route path="roles/edit/:id" element={<RoleFormPage />} /> 
            </Route>

            <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
    );
};

export default AppRouter;