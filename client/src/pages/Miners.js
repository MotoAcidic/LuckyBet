import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Grid, Card, CardContent,
  Divider, Chip, Avatar, Dialog, DialogActions, DialogContent,
  DialogTitle, TextField, IconButton, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, useTheme, Alert
} from '@mui/material';
import { 
  Add, Delete, Edit, Refresh, Speed, Memory, 
  CheckCircle, Cancel, AccessTime, ContentCopy
} from '@mui/icons-material';

// Mock data (would be fetched from API in a real app)
const initialMiners = [
  { 
    id: 'm1', 
    name: 'Main Rig', 
    type: 'GPU', 
    hashrate: 145.7, 
    status: 'online',
    lastSeen: new Date(),
    shares: { valid: 1247, invalid: 8, stale: 3 },
    workers: 3
  },
  { 
    id: 'm2', 
    name: 'Antminer S19', 
    type: 'ASIC', 
    hashrate: 95.0, 
    status: 'online',
    lastSeen: new Date(),
    shares: { valid: 847, invalid: 2, stale: 1 },
    workers: 1
  },
  { 
    id: 'm3', 
    name: 'Office PC', 
    type: 'GPU', 
    hashrate: 0, 
    status: 'offline',
    lastSeen: new Date(Date.now() - 86400000), // 1 day ago
    shares: { valid: 512, invalid: 4, stale: 2 },
    workers: 1
  },
  { 
    id: 'm4', 
    name: 'Solo Rig', 
    type: 'GPU', 
    hashrate: 210.5, 
    status: 'solo',
    lastSeen: new Date(),
    shares: { valid: 0, invalid: 0, stale: 0 },
    workers: 4
  }
];

const Miners = () => {
  const [miners, setMiners] = useState(initialMiners);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMiner, setEditMiner] = useState(null);
  const [formData, setFormData] = useState({ name: '', type: 'GPU' });
  const [error, setError] = useState('');
  const theme = useTheme();

  useEffect(() => {
    // In a real app, this would be an API call
    const fetchMiners = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Would normally get this from API
        // const response = await axios.get('/api/miners');
        // setMiners(response.data);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching miners:', error);
        setLoading(false);
      }
    };

    fetchMiners();
  }, []);

  const handleOpenDialog = (miner = null) => {
    if (miner) {
      setEditMiner(miner);
      setFormData({ name: miner.name, type: miner.type });
    } else {
      setEditMiner(null);
      setFormData({ name: '', type: 'GPU' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMiner(null);
    setFormData({ name: '', type: 'GPU' });
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    if (!formData.name) {
      setError('Miner name is required');
      return;
    }

    if (editMiner) {
      // Update existing miner
      setMiners(miners.map(miner => 
        miner.id === editMiner.id ? { ...miner, ...formData } : miner
      ));
    } else {
      // Add new miner
      const newMiner = {
        id: `m${Date.now()}`,
        name: formData.name,
        type: formData.type,
        hashrate: 0,
        status: 'pending',
        lastSeen: new Date(),
        shares: { valid: 0, invalid: 0, stale: 0 },
        workers: 0
      };
      setMiners([...miners, newMiner]);
    }

    handleCloseDialog();
  };

  const handleDeleteMiner = (id) => {
    setMiners(miners.filter(miner => miner.id !== id));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return theme.palette.success.main;
      case 'offline':
        return theme.palette.error.main;
      case 'solo':
        return theme.palette.secondary.main;
      default:
        return theme.palette.warning.main;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return <CheckCircle fontSize="small" />;
      case 'offline':
        return <Cancel fontSize="small" />;
      case 'solo':
        return <Speed fontSize="small" />;
      default:
        return <AccessTime fontSize="small" />;
    }
  };

  const handleCopyCommand = (minerName, minerType) => {
    // Generate appropriate mining command based on miner type
    let command = '';
    
    if (minerType === 'GPU') {
      command = `t-rex -a sha256 -o stratum+tcp://pool.luckybet.com:3333 -u YOUR_WALLET.${minerName} -p x`;
    } else {
      command = `stratum+tcp://pool.luckybet.com:3333 -u YOUR_WALLET.${minerName} -p x`;
    }
    
    navigator.clipboard.writeText(command);
    // Would normally show a success toast/notification
  };

  // Calculate total hashrate and other stats
  const totalHashrate = miners.reduce((sum, miner) => sum + miner.hashrate, 0);
  const onlineMiners = miners.filter(miner => miner.status === 'online' || miner.status === 'solo').length;
  const soloMiners = miners.filter(miner => miner.status === 'solo').length;
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Manage Your Miners
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Miners
              </Typography>
              <Typography variant="h5" component="div">
                {miners.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Online Miners
              </Typography>
              <Typography variant="h5" component="div">
                {onlineMiners} / {miners.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Solo Mining
              </Typography>
              <Typography variant="h5" component="div">
                {soloMiners}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Hashrate
              </Typography>
              <Typography variant="h5" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                <Speed sx={{ mr: 1, color: theme.palette.primary.main }} />
                {totalHashrate.toFixed(2)} MH/s
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button 
          variant="contained" 
          color="primary"

          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add New Miner
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => {
            setLoading(true);
            setTimeout(() => setLoading(false), 1000);
          }}
        >
          Refresh Data
        </Button>
      </Box>

      {/* Miners Table */}
      <Paper elevation={3} sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Miner</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Hashrate</TableCell>
                <TableCell align="right">Valid Shares</TableCell>
                <TableCell align="right">Workers</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography>Loading miner data...</Typography>
                  </TableCell>
                </TableRow>
              ) : miners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography>No miners added yet. Add your first miner to get started.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                miners.map((miner) => (
                  <TableRow key={miner.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: miner.type === 'GPU' 
                              ? theme.palette.primary.main 
                              : theme.palette.secondary.main,
                            mr: 2
                          }}
                        >
                          {miner.type === 'GPU' ? <Memory /> : <Speed />}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{miner.name}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            Last seen: {miner.status === 'offline' 
                              ? '1 day ago' 
                              : 'Just now'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{miner.type}</TableCell>
                    <TableCell>
                      <Chip 
                        size="small"
                        label={miner.status}
                        icon={getStatusIcon(miner.status)}
                        sx={{ 
                          bgcolor: `${getStatusColor(miner.status)}15`, 
                          color: getStatusColor(miner.status),
                          fontWeight: 'bold'
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {miner.hashrate > 0 ? `${miner.hashrate.toFixed(2)} MH/s` : 'N/A'}
                    </TableCell>
                    <TableCell align="right">
                      {miner.shares.valid}
                      {miner.shares.invalid > 0 && (
                        <Typography variant="caption" color="error" component="span" sx={{ ml: 1 }}>
                          ({miner.shares.invalid} invalid)
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">{miner.workers}</TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleOpenDialog(miner)}
                        title="Edit miner"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="default"
                        onClick={() => handleCopyCommand(miner.name, miner.type)}
                        title="Copy connection command"
                      >
                        <ContentCopy fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteMiner(miner.id)}
                        title="Delete miner"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Connection Instructions */}
      <Paper elevation={3} sx={{ mt: 4, p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          How to Connect Your Miners
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="bold">
              For GPU Miners:
            </Typography>
            <Typography variant="body2" paragraph>
              Use one of these popular mining software options:
            </Typography>
            <ul>
              <li>
                <Typography>
                  <strong>T-Rex Miner (NVIDIA):</strong> 
                </Typography>
                <Box 
                  component="pre" 
                  sx={{ 
                    bgcolor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#f5f5f5',
                    p: 1,
                    borderRadius: 1,
                    overflow: 'auto',
                    fontSize: '0.8rem',
                    position: 'relative'
                  }}
                >
                  t-rex -a sha256 -o stratum+tcp://pool.luckybet.com:3333 -u YOUR_WALLET.WORKER_NAME -p x
                  <IconButton 
                    size="small" 
                    sx={{ position: 'absolute', top: 0, right: 0 }}
                    onClick={() => navigator.clipboard.writeText('t-rex -a sha256 -o stratum+tcp://pool.luckybet.com:3333 -u YOUR_WALLET.WORKER_NAME -p x')}
                  >
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Box>
              </li>
              <li>
                <Typography>
                  <strong>TeamRedMiner (AMD):</strong> 
                </Typography>
                <Box 
                  component="pre" 
                  sx={{ 
                    bgcolor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#f5f5f5',
                    p: 1,
                    borderRadius: 1,
                    overflow: 'auto',
                    fontSize: '0.8rem',
                    position: 'relative'
                  }}
                >
                  teamredminer -a sha256d -o stratum+tcp://pool.luckybet.com:3333 -u YOUR_WALLET.WORKER_NAME -p x
                  <IconButton 
                    size="small"
                    sx={{ position: 'absolute', top: 0, right: 0 }}
                    onClick={() => navigator.clipboard.writeText('teamredminer -a sha256d -o stratum+tcp://pool.luckybet.com:3333 -u YOUR_WALLET.WORKER_NAME -p x')}
                  >
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Box>
              </li>
            </ul>
            <Typography variant="body2" mt={2}>
              Replace <strong>YOUR_WALLET</strong> with your wallet address and <strong>WORKER_NAME</strong> with your desired miner name.
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="bold">
              For ASIC Miners:
            </Typography>
            <Typography variant="body2" paragraph>
              Configure your ASIC device with these pool settings:
            </Typography>
            <Typography component="div" variant="body2">
              <ul>
                <li><strong>URL:</strong> stratum+tcp://pool.luckybet.com:3333</li>
                <li><strong>Worker:</strong> YOUR_WALLET.WORKER_NAME</li>
                <li><strong>Password:</strong> x</li>
              </ul>
            </Typography>
            
            <Alert severity="info" sx={{ mt: 2 }}>
              For optimal performance with ASICs, we recommend using a stratum port that matches your device's hashrate capability. For higher-end ASICs, use port 3336.
            </Alert>
            
            <Box sx={{ mt: 2 }}>
              <Button 
                variant="outlined" 
                color="secondary"
                href="/help"
              >
                View Detailed Setup Guide
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Add/Edit Miner Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editMiner ? 'Edit Miner' : 'Add New Miner'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Miner Name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            select
            margin="dense"
            name="type"
            label="Miner Type"
            fullWidth
            variant="outlined"
            value={formData.type}
            onChange={handleInputChange}
            SelectProps={{
              native: true,
            }}
          >
            <option value="GPU">GPU</option>
            <option value="ASIC">ASIC</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editMiner ? 'Save Changes' : 'Add Miner'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Miners;