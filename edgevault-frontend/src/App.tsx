import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import AuthEnforcer from './components/auth/AuthEnforcer';
import { NotificationProvider } from './context/NotificationContext';

function App() {
  return (
    <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <NotificationProvider>
              <AuthEnforcer />
            </NotificationProvider>
          </ToastProvider>
        </AuthProvider>
    </ThemeProvider>
  );
}

export default App;