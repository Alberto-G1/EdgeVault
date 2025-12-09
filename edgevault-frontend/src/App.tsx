import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AuthEnforcer from './components/auth/AuthEnforcer';

function App() {
  return (
    <ThemeProvider>
        <AuthProvider>
          <AuthEnforcer />
          <Toaster position="top-right" />
        </AuthProvider>
    </ThemeProvider>
  );
}

export default App;