import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AuthEnforcer from './components/auth/AuthEnforcer';
import { NotificationProvider } from './context/NotificationContext';

function App() {
  return (
    <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <AuthEnforcer />
            <Toaster position="top-right" />
          </NotificationProvider>
        </AuthProvider>
    </ThemeProvider>
  );
}

export default App;