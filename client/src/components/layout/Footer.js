import React from 'react';
import { Box, Container, Typography, Link, Divider, useTheme } from '@mui/material';

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();
  
  return (
    <Box 
      component="footer" 
      sx={{ 
        py: 3, 
        px: 2,
        mt: 'auto',
        backgroundColor: theme.palette.mode === 'dark' ? '#111827' : '#f8fafc',
        borderTop: `1px solid ${
          theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'
        }`,
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* Logo and Copyright */}
          <Box sx={{ mb: { xs: 2, md: 0 } }}>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
              LuckyBet Mining Pool
            </Typography>
            <Typography variant="body2" color="text.secondary">
              © {currentYear} LuckyBet. All rights reserved.
            </Typography>
          </Box>
          
          {/* Links */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 3,
            }}
          >
            <Box>
              <Typography variant="subtitle2" color="text.primary" gutterBottom>
                Resources
              </Typography>
              <Link href="/help" color="inherit" underline="hover" display="block" sx={{ mb: 0.5 }}>
                Getting Started
              </Link>
              <Link href="/help#faq" color="inherit" underline="hover" display="block" sx={{ mb: 0.5 }}>
                FAQ
              </Link>
              <Link href="/pool-stats" color="inherit" underline="hover" display="block">
                Network Stats
              </Link>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.primary" gutterBottom>
                Mining
              </Typography>
              <Link href="/miners" color="inherit" underline="hover" display="block" sx={{ mb: 0.5 }}>
                Pool Mining
              </Link>
              <Link href="/solo-mining" color="inherit" underline="hover" display="block" sx={{ mb: 0.5 }}>
                Solo Mining
              </Link>
              <Link href="/blocks" color="inherit" underline="hover" display="block">
                Blocks
              </Link>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.primary" gutterBottom>
                Legal
              </Typography>
              <Link href="/terms" color="inherit" underline="hover" display="block" sx={{ mb: 0.5 }}>
                Terms of Service
              </Link>
              <Link href="/privacy" color="inherit" underline="hover" display="block" sx={{ mb: 0.5 }}>
                Privacy Policy
              </Link>
              <Link href="/contact" color="inherit" underline="hover" display="block">
                Contact
              </Link>
            </Box>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Bottom Line */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Mining made simple. Payouts processed securely and on time.
          </Typography>
          
          <Typography variant="caption" color="text.secondary">
            Pool Fee: 1% | Min. Payout: 0.01 BTC | <Link href="/settings" color="inherit" underline="hover">Configure Settings</Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;