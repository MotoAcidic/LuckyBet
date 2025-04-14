import React, { useState } from 'react';
import {
  Drawer, List, ListItem, ListItemIcon, ListItemText,
  Divider, Collapse, Box, useTheme
} from '@mui/material';
import {
  Speed, Memory, Timeline, Assessment, Payments,
  Settings, Help, ExpandLess, ExpandMore, Storage,
  Home, NetworkCheck, Person
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const theme = useTheme();
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState('');
  
  const drawerWidth = 240;
  
  // Define menu items with their icons and paths
  const menuItems = [
    { 
      text: 'Dashboard', 
      icon: <Home />, 
      path: '/' 
    },
    { 
      text: 'My Miners', 
      icon: <Memory />, 
      path: '/miners' 
    },
    {
      text: 'Mining Options',
      icon: <NetworkCheck />,
      submenu: [
        { text: 'Pool Mining', icon: <Memory />, path: '/miners' },
        { text: 'Solo Mining', icon: <Storage />, path: '/solo-mining' }
      ]
    },
    { 
      text: 'Pool Stats', 
      icon: <Timeline />, 
      path: '/pool-stats' 
    },
    { 
      text: 'Blocks', 
      icon: <Assessment />, 
      path: '/blocks' 
    },
    { 
      text: 'Payments', 
      icon: <Payments />, 
      path: '/payments' 
    },
    { 
      text: 'Settings', 
      icon: <Settings />, 
      path: '/settings' 
    },
    { 
      text: 'Help', 
      icon: <Help />, 
      path: '/help' 
    }
  ];

  // Handle submenu toggle
  const handleSubmenuToggle = (text) => {
    if (openSubmenu === text) {
      setOpenSubmenu('');
    } else {
      setOpenSubmenu(text);
    }
  };

  // Check if the current route is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Render a menu item
  const renderMenuItem = (item) => {
    // If item has submenu, render a collapsible item
    if (item.submenu) {
      return (
        <React.Fragment key={item.text}>
          <ListItem 
            button 
            onClick={() => handleSubmenuToggle(item.text)}
            sx={{
              mb: 0.5,
              borderRadius: 1,
              mx: 1,
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.08)' 
                  : 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
            {openSubmenu === item.text ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={openSubmenu === item.text} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.submenu.map((subItem) => (
                <ListItem
                  button
                  component={Link}
                  to={subItem.path}
                  key={subItem.text}
                  sx={{
                    pl: 4,
                    mb: 0.5,
                    borderRadius: 1,
                    mx: 1,
                    bgcolor: isActive(subItem.path) 
                      ? theme.palette.mode === 'dark' 
                        ? 'rgba(74, 222, 128, 0.2)' 
                        : 'rgba(74, 222, 128, 0.1)' 
                      : 'transparent',
                    color: isActive(subItem.path) ? theme.palette.primary.main : 'inherit',
                    '&:hover': {
                      bgcolor: isActive(subItem.path)
                        ? theme.palette.mode === 'dark' 
                          ? 'rgba(74, 222, 128, 0.25)' 
                          : 'rgba(74, 222, 128, 0.15)'
                        : theme.palette.mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.08)' 
                          : 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: isActive(subItem.path) ? theme.palette.primary.main : 'inherit' }}>
                    {subItem.icon}
                  </ListItemIcon>
                  <ListItemText primary={subItem.text} />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </React.Fragment>
      );
    }
    
    // Regular menu item
    return (
      <ListItem
        button
        component={Link}
        to={item.path}
        key={item.text}
        sx={{
          mb: 0.5,
          borderRadius: 1,
          mx: 1,
          bgcolor: isActive(item.path) 
            ? theme.palette.mode === 'dark' 
              ? 'rgba(74, 222, 128, 0.2)' 
              : 'rgba(74, 222, 128, 0.1)' 
            : 'transparent',
          color: isActive(item.path) ? theme.palette.primary.main : 'inherit',
          '&:hover': {
            bgcolor: isActive(item.path)
              ? theme.palette.mode === 'dark' 
                ? 'rgba(74, 222, 128, 0.25)' 
                : 'rgba(74, 222, 128, 0.15)'
              : theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.08)' 
                : 'rgba(0, 0, 0, 0.04)'
          }
        }}
      >
        <ListItemIcon sx={{ minWidth: 40, color: isActive(item.path) ? theme.palette.primary.main : 'inherit' }}>
          {item.icon}
        </ListItemIcon>
        <ListItemText primary={item.text} />
      </ListItem>
    );
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { 
          width: drawerWidth, 
          boxSizing: 'border-box',
          bgcolor: theme.palette.mode === 'dark' ? '#111827' : '#f8fafc',
          borderRight: `1px solid ${
            theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'
          }`,
        },
      }}
    >
      <Box sx={{ mt: 8 }} /> {/* Space for the header */}
      
      {/* Main menu */}
      <List sx={{ pt: 2 }}>
        {menuItems.map((item) => renderMenuItem(item))}
      </List>
      
      {/* Status indicator */}
      <Box sx={{ 
        p: 2, 
        borderRadius: 1,
        m: 2,
        mt: 'auto', // Push to bottom
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(74, 222, 128, 0.1)',
        border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(74, 222, 128, 0.3)'}`,
        color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark,
        fontSize: '0.875rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Speed sx={{ mr: 1, fontSize: '1.1rem' }} />
          <Box component="span" sx={{ fontWeight: 'bold' }}>Pool Status:</Box>
        </Box>
        <Box>
          <Box component="span" sx={{ 
            display: 'inline-block',
            width: 10,
            height: 10,
            borderRadius: '50%',
            bgcolor: '#4ade80',
            mr: 1
          }}></Box>
          Online | 15.7 TH/s
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;