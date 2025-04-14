import React, { useState } from 'react';
import { 
  AppBar, Toolbar, Typography, Button, IconButton,
  Box, Menu, MenuItem, Avatar, Tooltip, Divider,
  Badge, Switch, useTheme
} from '@mui/material';
import {
  Brightness4, Brightness7, Menu as MenuIcon, AccountCircle,
  Notifications, Person, Settings, ExitToApp
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Header = ({ toggleDarkMode, darkMode }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Mock auth state (would come from context in a real app)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationEl, setNotificationEl] = useState(null);
  
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleNotificationOpen = (event) => {
    setNotificationEl(event.currentTarget);
  };
  
  const handleNotificationClose = () => {
    setNotificationEl(null);
  };
  
  // Mock login/logout functions
  const login = () => {
    setIsAuthenticated(true);
  };
  
  const logout = () => {
    setIsAuthenticated(false);
    handleMenuClose();
    navigate('/');
  };

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        zIndex: theme.zIndex.drawer + 1,
        bgcolor: theme.palette.mode === 'dark' ? '#1f2937' : '#ffffff',
        color: theme.palette.text.primary,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}
    >
      <Toolbar>
        {/* Mobile menu button - would be used for showing sidebar on mobile */}
        <IconButton
          color="inherit"
          edge="start"
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        
        {/* Logo */}
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            fontWeight: 'bold',
            color: theme.palette.primary.main,
            display: 'flex',
            alignItems: 'center'
          }}
          onClick={() => navigate('/')}
        >
          <Box 
            component="span" 
            sx={{ 
              mr: 1, 
              borderRadius: '6px', 
              bgcolor: theme.palette.primary.main, 
              color: '#fff',
              px: 1
            }}
          >
            LB
          </Box>
          LuckyBet Mining Pool
        </Typography>
        
        {/* Theme toggle */}
        <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
          <IconButton color="inherit" onClick={toggleDarkMode} sx={{ mr: 1 }}>
            {darkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Tooltip>
        
        {/* Authenticated menu items */}
        {isAuthenticated ? (
          <>
            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton color="inherit" onClick={handleNotificationOpen}>
                <Badge badgeContent={3} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>
            
            {/* User menu */}
            <Tooltip title="Account settings">
              <IconButton 
                edge="end" 
                color="inherit"
                onClick={handleMenuOpen}
                sx={{ ml: 1 }}
              >
                <Avatar 
                  alt="User" 
                  src="" 
                  sx={{ 
                    width: 32, 
                    height: 32,
                    bgcolor: theme.palette.primary.main
                  }}
                >
                  U
                </Avatar>
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <>
            <Button color="inherit" onClick={() => navigate('/login')}>Login</Button>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => navigate('/register')}
              sx={{ ml: 1 }}
            >
              Register
            </Button>
          </>
        )}
      </Toolbar>
      
      {/* User dropdown menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{ mt: 1 }}
      >
        <MenuItem onClick={() => {
          handleMenuClose();
          navigate('/profile');
        }}>
          <Person fontSize="small" sx={{ mr: 1 }} /> Profile
        </MenuItem>
        <MenuItem onClick={() => {
          handleMenuClose();
          navigate('/settings');
        }}>
          <Settings fontSize="small" sx={{ mr: 1 }} /> Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={logout}>
          <ExitToApp fontSize="small" sx={{ mr: 1 }} /> Logout
        </MenuItem>
      </Menu>
      
      {/* Notifications menu */}
      <Menu
        anchorEl={notificationEl}
        open={Boolean(notificationEl)}
        onClose={handleNotificationClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{ mt: 1, width: 320 }}
      >
        <MenuItem>
          <Typography variant="body2">
            <strong>Block Found!</strong> Your miner contributed to finding block #724567
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem>
          <Typography variant="body2">
            <strong>Payment Sent:</strong> 0.00574 BTC has been sent to your wallet
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem>
          <Typography variant="body2">
            <strong>Worker Offline:</strong> Your worker "Office PC" went offline
          </Typography>
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Header;