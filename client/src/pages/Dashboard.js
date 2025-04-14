import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Paper, Card, CardContent, 
  CardHeader, Button, Divider, CircularProgress,
  useTheme
} from '@mui/material';
import { 
  Timeline, Speed, Memory, Dns, AttachMoney, 
  CloudUpload, Power, Schedule
} from '@mui/icons-material';
import axios from 'axios';

// Mock data (would normally come from API)
const initialStats = {
  poolHashrate: '15.7 TH/s',
  activeMiners: 246,
  workers: 892,
  lastBlock: '724567 (30 mins ago)',
  networkDifficulty: '42.98M',
  blockReward: '6.25 BTC',
  userHashrate: '0 MH/s',
  userWorkers: 0,
  balance: '0.00000 BTC',
  pendingBalance: '0.00000 BTC',
};

const Dashboard = () => {
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    // This would be an API call in a real application
    const fetchDashboardData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In a real app, you'd get this data from your server
        // const response = await axios.get('/api/stats');
        // setStats(response.data);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Pool Stats Section */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 2,
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(to right, rgba(74, 222, 128, 0.05), rgba(251, 146, 60, 0.05))' 
            : 'linear-gradient(to right, rgba(74, 222, 128, 0.1), rgba(251, 146, 60, 0.1))'
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <Timeline sx={{ mr: 1 }} /> Pool Statistics
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Pool Hashrate
                </Typography>
                <Typography variant="h5" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Speed sx={{ mr: 1, color: theme.palette.primary.main }} />
                  {stats.poolHashrate}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Active Miners
                </Typography>
                <Typography variant="h5" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Dns sx={{ mr: 1, color: theme.palette.primary.main }} />
                  {stats.activeMiners}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Active Workers
                </Typography>
                <Typography variant="h5" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Memory sx={{ mr: 1, color: theme.palette.primary.main }} />
                  {stats.workers}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Last Block Found
                </Typography>
                <Typography variant="h5" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Schedule sx={{ mr: 1, color: theme.palette.primary.main }} />
                  {stats.lastBlock}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* User Stats Section */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Power sx={{ mr: 1 }} /> Your Mining Stats
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography color="textSecondary">Your Hashrate</Typography>
                <Typography variant="h6">{stats.userHashrate}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography color="textSecondary">Your Workers</Typography>
                <Typography variant="h6">{stats.userWorkers}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography color="textSecondary">Balance</Typography>
                <Typography variant="h6">{stats.balance}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography color="textSecondary">Pending</Typography>
                <Typography variant="h6">{stats.pendingBalance}</Typography>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 2 }}>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<CloudUpload />}
                href="/miners"
                fullWidth
              >
                Add New Miners
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Connection Info Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Dns sx={{ mr: 1 }} /> Mining Connection Info
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              Pool Address: <Typography component="span" fontWeight="bold">pool.luckybet.com</Typography>
            </Typography>
            
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Port</TableCell>
                  <TableCell>Difficulty</TableCell>
                  <TableCell>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><code>3333</code></TableCell>
                  <TableCell>Variable</TableCell>
                  <TableCell>Auto-adjusting to your hashrate</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>3334</code></TableCell>
                  <TableCell>Low</TableCell>
                  <TableCell>For GPUs and lower-end ASICs</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>4444</code></TableCell>
                  <TableCell>Solo</TableCell>
                  <TableCell>Solo mining (entire blocks)</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            
            <Box sx={{ mt: 2 }}>
              <Button 
                variant="outlined" 
                color="secondary"
                href="/help"
                fullWidth
              >
                View Setup Guide
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Network Info Section */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <AttachMoney sx={{ mr: 1 }} /> Network Information
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography color="textSecondary">Network Difficulty</Typography>
            <Typography variant="h6">{stats.networkDifficulty}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography color="textSecondary">Block Reward</Typography>
            <Typography variant="h6">{stats.blockReward}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography color="textSecondary">Network Hashrate</Typography>
            <Typography variant="h6">200.5 EH/s</Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

// Styled table components for connection info
const Table = ({ children }) => (
  <Box sx={{ width: '100%', overflowX: 'auto', mt: 1, mb: 1 }}>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      {children}
    </table>
  </Box>
);

const TableHead = ({ children }) => <thead>{children}</thead>;
const TableBody = ({ children }) => <tbody>{children}</tbody>;

const TableRow = ({ children }) => (
  <tr style={{ borderBottom: '1px solid rgba(128, 128, 128, 0.2)' }}>
    {children}
  </tr>
);

const TableCell = ({ children }) => (
  <td style={{ padding: '12px 8px' }}>
    {children}
  </td>
);

export default Dashboard;