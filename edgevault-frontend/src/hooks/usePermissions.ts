import { useAuth } from './useAuth';

export const usePermissions = () => {
    const { permissions } = useAuth();

    /**
     * Checks if the current user has a specific permission.
     * @param requiredPermission The permission string to check for (e.g., "USER_CREATE").
     * @returns True if the user has the permission, false otherwise.
     */
    const hasPermission = (requiredPermission: string): boolean => {
        return permissions.has(requiredPermission);
    };

    /**
     * Checks if the user has at least one of the provided permissions.
     * @param requiredPermissions An array of permission strings.
     * @returns True if the user has any of the permissions, false otherwise.
     */
    const hasAnyPermission = (requiredPermissions: string[]): boolean => {
        for (const perm of requiredPermissions) {
            if (permissions.has(perm)) {
                return true;
            }
        }
        return false;
    };

    return { hasPermission, hasAnyPermission, allPermissions: permissions };
};