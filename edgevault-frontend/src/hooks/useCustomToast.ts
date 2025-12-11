import { useToast } from '../context/ToastContext';

/**
 * Custom hook that provides toast notification methods
 * Compatible with react-hot-toast API for easy migration
 */
export const useCustomToast = () => {
    const { showToast, showError, showSuccess, showInfo } = useToast();

    return {
        // New API (recommended)
        showToast,
        showError,
        showSuccess,
        showInfo,

        // Legacy API compatibility (for gradual migration from react-hot-toast)
        toast: {
            error: (message: string, title: string = 'Error') => {
                showError(title, message);
            },
            success: (message: string, title: string = 'Success') => {
                showSuccess(title, message);
            },
            info: (message: string, title: string = 'Info') => {
                showInfo(title, message);
            },
            promise: async <T,>(
                promise: Promise<T>,
                messages: {
                    loading: string;
                    success: string;
                    error: string;
                }
            ): Promise<T> => {
                showInfo('Processing', messages.loading);
                try {
                    const result = await promise;
                    showSuccess('Success', messages.success);
                    return result;
                } catch (error) {
                    showError('Error', messages.error);
                    throw error;
                }
            }
        }
    };
};
