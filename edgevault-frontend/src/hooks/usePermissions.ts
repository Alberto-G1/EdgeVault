import { useAuth } from './useAuth';
import { useCallback } from 'react'; // <-- IMPORT useCallback

export const usePermissions = () => {
    const { permissions } = useAuth();

    /**
     * Checks if the current user has a specific permission.
     * Memoized with useCallback to ensure the function reference is stable.
     */
    const hasPermission = useCallback((requiredPermission: string): boolean => {
        return permissions.has(requiredPermission);
    }, [permissions]); // Only recreate this function if the 'permissions' Set changes

    /**
     * Checks if the user has at least one of the provided permissions.
     * Memoized with useCallback for stability.
     */
    const hasAnyPermission = useCallback((requiredPermissions: string[]): boolean => {
        for (const perm of requiredPermissions) {
            if (permissions.has(perm)) {
                return true;
            }
        }
        return false;
    }, [permissions]); // Only recreate this function if the 'permissions' Set changes

    return { hasPermission, hasAnyPermission, allPermissions: permissions };
};