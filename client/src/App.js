import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container } from '@mui/material';

// Layout components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Sidebar from './components/layout/Sidebar';

// Page components
import Dashboard from './pages/Dashboard';
import Miners from './pages/Miners';
import PoolStats from './pages/PoolStats';
import Blocks from './pages/Blocks';
import Payments from './pages/Payments';
import Settings from './pages/Settings';
import Help from './pages/Help';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import SoloMining from './pages/SoloMining';

// Context for authentication and dark mode
import { AuthProvider } from './context/AuthContext';
import { useState } from 'react';

function App() {
  const [darkMode, setDarkMode] = useState(true);

  // Create dark or light theme based on user preference
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#4ade80', // Green shade
      },
      secondary: {
        main: '#fb923c', // Orange shade
      },
      background: {
        default: darkMode ? '#1f2937' : '#f8fafc',
        paper: darkMode ? '#374151' : '#ffffff',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
      },
      h2: {
        fontWeight: 600,
      },
    },
  });

  // Toggle dark/light mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="app" style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <Header toggleDarkMode={toggleDarkMode} darkMode={darkMode} />
              <Container 
                component="main" 
                maxWidth="xl" 
                sx={{ 
                  flexGrow: 1, 
                  pt: 4, 
                  pb: 4 
                }}
              >
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/miners" element={<Miners />} />
                  <Route path="/pool-stats" element={<PoolStats />} />
                  <Route path="/blocks" element={<Blocks />} />
                  <Route path="/payments" element={<Payments />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/solo-mining" element={<SoloMining />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/profile" element={<Profile />} />
                </Routes>
              </Container>
              <Footer />
            </div>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;