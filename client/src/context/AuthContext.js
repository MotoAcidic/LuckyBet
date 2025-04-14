import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check if user is logged in on first load
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        // Check if token exists in localStorage
        const token = localStorage.getItem('token');
        
        if (token) {
          // Configure axios to send the token in headers
          axios.defaults.headers.common['x-auth-token'] = token;
          
          // In a real app, you would validate the token with the server
          // const response = await axios.get('/api/auth/user');
          // setCurrentUser(response.data);
          
          // For demo purposes, we'll use mock data
          const mockUser = {
            id: '123456',
            username: 'demo_user',
            email: 'demo@example.com',
            walletAddress: '1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890',
            joinDate: new Date('2023-01-15'),
            role: 'user'
          };
          setCurrentUser(mockUser);
        }
      } catch (err) {
        // If token is invalid, clear it
        localStorage.removeItem('token');
        setError('Authentication failed. Please log in again.');
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError('');
      
      // In a real app, you would send a request to your server
      // const response = await axios.post('/api/users', userData);
      // const { token, user } = response.data;
      
      // For demo purposes, we'll use mock data
      const token = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
      const user = {
        id: Math.random().toString(36).substring(2, 10),
        username: userData.username,
        email: userData.email,
        walletAddress: userData.walletAddress || '',
        joinDate: new Date(),
        role: 'user'
      };
      
      // Save token to localStorage
      localStorage.setItem('token', token);
      
      // Set token in headers
      axios.defaults.headers.common['x-auth-token'] = token;
      
      // Set user
      setCurrentUser(user);
      
      return user;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError('');
      
      // In a real app, you would send a request to your server
      // const response = await axios.post('/api/auth', { email, password });
      // const { token, user } = response.data;
      
      // For demo purposes, we'll use mock data
      // In a real app, you'd verify credentials on the server
      if (email === 'demo@example.com' && password === 'password123') {
        const token = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
        const user = {
          id: '123456',
          username: 'demo_user',
          email: 'demo@example.com',
          walletAddress: '1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890',
          joinDate: new Date('2023-01-15'),
          role: 'user'
        };
        
        // Save token to localStorage
        localStorage.setItem('token', token);
        
        // Set token in headers
        axios.defaults.headers.common['x-auth-token'] = token;
        
        // Set user
        setCurrentUser(user);
        
        return user;
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Remove token from axios headers
    delete axios.defaults.headers.common['x-auth-token'];
    
    // Clear user from state
    setCurrentUser(null);
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError('');
      
      // In a real app, you would send a request to your server
      // const response = await axios.put('/api/users/profile', userData);
      // const updatedUser = response.data;
      
      // For demo purposes, we'll update the mock data
      const updatedUser = {
        ...currentUser,
        ...userData
      };
      
      // Set updated user
      setCurrentUser(updatedUser);
      
      return updatedUser;
    } catch (err) {
      setError(err.response?.data?.message || 'Profile update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Values to provide through context
  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!currentUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;