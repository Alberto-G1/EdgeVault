import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/admin/DashboardPage';
import ProtectedRoute from './ProtectedRoute';
import UserManagementPage from '../pages/admin/UserManagementPage';
import RoleManagementPage from '../pages/admin/RoleManagementPage';
import RoleFormPage from '../pages/admin/RoleFormPage';
import DepartmentManagementPage from '../pages/admin/DepartmentManagementPage';
import ProfilePage from '../pages/admin/ProfilePage';
import ProfileEditPage from '../pages/admin/ProfileEditPage';
import DocumentManagementPage from '../pages/admin/DocumentManagementPage';
import DocumentDetailPage from '../pages/admin/DocumentDetailPage';
import ApprovalQueuePage from '../pages/admin/ApprovalQueuePage';
import SearchPage from '../pages/admin/SearchPage';
import ChatPage from '../pages/admin/ChatPage';

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
                <Route path="departments" element={<DepartmentManagementPage />} /> 
                <Route path="profile" element={<ProfilePage />} />
                <Route path="profile/edit" element={<ProfileEditPage />} /> 
                <Route path="documents" element={<DocumentManagementPage />} /> 
                <Route path="documents/:id" element={<DocumentDetailPage />} />
                <Route path="approvals" element={<ApprovalQueuePage />} />
                <Route path="search" element={<SearchPage />} />
                <Route path="chat" element={<ChatPage />} /> {/* <-- ADD ROUTE */}
                <Route path="chat/:conversationId" element={<ChatPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
    );
};

export default AppRouter;