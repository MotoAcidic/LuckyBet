import React, { useState } from 'react';
import {
  Box, Typography, Paper, Button, TextField,
  Divider, Alert, Stepper, Step, StepLabel,
  Card, CardContent, Grid, useTheme
} from '@mui/material';
import { 
  ComputerOutlined, 
  NetworkCheck, 
  AccountBalanceWallet, 
  Check,
  ContentCopy
} from '@mui/icons-material';

const SoloMining = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [workerName, setWorkerName] = useState('');
  const [soloConfig, setSoloConfig] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const theme = useTheme();

  const steps = ['Enter Wallet Details', 'Configure Solo Mining', 'Connect Miners'];

  const handleGenerateConfig = async (e) => {
    e.preventDefault();
    
    if (!walletAddress) {
      setError('Please enter a valid wallet address');
      return;
    }

    try {
      setError('');
      
      // In a real app, this would be an API call
      // const response = await axios.post('/api/pool/solo', {
      //   walletAddress,
      //   workerName: workerName || 'worker1'
      // });
      
      // Simulate API response
      const mockConfig = {
        username: `${walletAddress.substring(0, 8)}...${workerName || 'worker1'}`,
        password: 'x',
        url: 'solo.luckybet.com:4444',
        algorithm: 'SHA-256'
      };
      
      setSoloConfig(mockConfig);
      setActiveStep(1);
    } catch (error) {
      setError('Failed to generate solo mining configuration');
      console.error(error);
    }
  };

  const handleCopyCommand = (command) => {
    navigator.clipboard.writeText(command);
    // Would normally show a success toast/notification
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box component="form" onSubmit={handleGenerateConfig} sx={{ mt: 2 }}>
            <TextField
              label="Wallet Address"
              fullWidth
              margin="normal"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="Enter your cryptocurrency wallet address"
              required
              variant="outlined"
            />
            <TextField
              label="Worker Name (optional)"
              fullWidth
              margin="normal"
              value={workerName}
              onChange={(e) => setWorkerName(e.target.value)}
              placeholder="Give your miner a name (default: worker1)"
              variant="outlined"
            />
            
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              fullWidth 
              sx={{ mt: 3 }}
            >
              Generate Solo Mining Config
            </Button>
          </Box>
        );
        
      case 1:
        return soloConfig && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="success" sx={{ mb: 3 }}>
              Solo mining configuration generated successfully!
            </Alert>
            
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Connection Details</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography color="textSecondary">Pool URL</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography>{soloConfig.url}</Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography color="textSecondary">Username</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography>{soloConfig.username}</Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography color="textSecondary">Password</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography>{soloConfig.password}</Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography color="textSecondary">Algorithm</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography>{soloConfig.algorithm}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button 
                onClick={() => setActiveStep(0)} 
                variant="outlined"
              >
                Back
              </Button>
              <Button 
                onClick={() => setActiveStep(2)} 
                variant="contained" 
                color="primary"
              >
                Continue to Connection Instructions
              </Button>
            </Box>
          </Box>
        );
        
      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Solo Mining Connection Instructions
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {/* GPU Mining */}
            <Paper sx={{ p: 2, mb: 3, borderLeft: `4px solid ${theme.palette.primary.main}` }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
                <ComputerOutlined sx={{ mr: 1 }} /> GPU Mining Instructions
              </Typography>
              
              <Typography variant="body2" sx={{ mt: 1 }}>
                For T-Rex Miner (NVIDIA):
              </Typography>
              <Paper 
                sx={{ 
                  p: 1, 
                  mt: 1, 
                  bgcolor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#f5f5f5',
                  fontFamily: 'monospace',
                  position: 'relative'
                }}
              >
                <pre style={{ margin: 0, overflowX: 'auto' }}>
                  {`t-rex -a sha256 -o stratum+tcp://${soloConfig?.url || 'solo.luckybet.com:4444'} -u ${soloConfig?.username || 'wallet.worker1'} -p x`}
                </pre>
                <Button 
                  size="small"
                  sx={{ position: 'absolute', top: 0, right: 0 }}
                  onClick={() => handleCopyCommand(`t-rex -a sha256 -o stratum+tcp://${soloConfig?.url || 'solo.luckybet.com:4444'} -u ${soloConfig?.username || 'wallet.worker1'} -p x`)}
                >
                  <ContentCopy fontSize="small" />
                </Button>
              </Paper>
              
              <Typography variant="body2" sx={{ mt: 2 }}>
                For TeamRedMiner (AMD):
              </Typography>
              <Paper 
                sx={{ 
                  p: 1, 
                  mt: 1, 
                  bgcolor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#f5f5f5',
                  fontFamily: 'monospace',
                  position: 'relative'
                }}
              >
                <pre style={{ margin: 0, overflowX: 'auto' }}>
                  {`teamredminer -a sha256d -o stratum+tcp://${soloConfig?.url || 'solo.luckybet.com:4444'} -u ${soloConfig?.username || 'wallet.worker1'} -p x`}
                </pre>
                <Button 
                  size="small"
                  sx={{ position: 'absolute', top: 0, right: 0 }}
                  onClick={() => handleCopyCommand(`teamredminer -a sha256d -o stratum+tcp://${soloConfig?.url || 'solo.luckybet.com:4444'} -u ${soloConfig?.username || 'wallet.worker1'} -p x`)}
                >
                  <ContentCopy fontSize="small" />
                </Button>
              </Paper>
            </Paper>
            
            {/* ASIC Mining */}
            <Paper sx={{ p: 2, mb: 3, borderLeft: `4px solid ${theme.palette.secondary.main}` }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
                <NetworkCheck sx={{ mr: 1 }} /> ASIC Mining Instructions
              </Typography>
              
              <Typography variant="body2" gutterBottom sx={{ mt: 1 }}>
                For Antminer and other ASIC devices:
              </Typography>
              <ol>
                <li>Access your ASIC's web interface</li>
                <li>Navigate to the mining configuration section</li>
                <li>Enter the following details:
                  <ul style={{ marginTop: 8 }}>
                    <li>URL: <code>{soloConfig?.url || 'solo.luckybet.com:4444'}</code></li>
                    <li>Worker: <code>{soloConfig?.username || 'wallet.worker1'}</code></li>
                    <li>Password: <code>{soloConfig?.password || 'x'}</code></li>
                  </ul>
                </li>
                <li>Save your settings and start mining</li>
              </ol>
            </Paper>
            
            {/* Important Notes */}
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Important:</strong> Solo mining means you're attempting to find entire blocks by yourself. 
                Rewards can be significant but may be infrequent depending on your hashrate compared to the network.
              </Typography>
            </Alert>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                onClick={() => setActiveStep(1)} 
                variant="outlined"
              >
                Back
              </Button>
              <Button 
                startIcon={<Check />}
                variant="contained" 
                color="success"
                href="/miners"
              >
                View Your Miners
              </Button>
            </Box>
          </Box>
        );
        
      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Solo Mining Setup
      </Typography>
      
      <Typography variant="subtitle1" color="textSecondary" paragraph>
        Configure your miners to find blocks independently and receive full block rewards.
      </Typography>
      
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 2,
          borderTop: `4px solid ${theme.palette.secondary.main}`
        }}
      >
        <Box sx={{ width: '100%', mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {renderStepContent(activeStep)}
      </Paper>
      
      {/* FAQ Section */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Solo Mining FAQ
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
          What is solo mining?
        </Typography>
        <Typography variant="body2" paragraph>
          Solo mining means you're attempting to find blocks by yourself, without joining forces with other miners. 
          When you successfully mine a block, you receive the full block reward.
        </Typography>
        
        <Typography variant="subtitle1" fontWeight="bold">
          Is solo mining better than pool mining?
        </Typography>
        <Typography variant="body2" paragraph>
          It depends on your hashrate. Solo mining is highly variable - you might find a block quickly and earn a large reward,
          or you might go months without finding anything. Pool mining provides more consistent smaller payments.
        </Typography>
        
        <Typography variant="subtitle1" fontWeight="bold">
          How much hashrate do I need?
        </Typography>
        <Typography variant="body2" paragraph>
          For Bitcoin, solo mining is generally only recommended if you have at least 1% of the network hashrate. 
          For smaller cryptocurrencies, you can solo mine with less relative hashrate.
        </Typography>
        
        <Typography variant="subtitle1" fontWeight="bold">
          Are there any fees for solo mining?
        </Typography>
        <Typography variant="body2">
          Our solo mining service charges a 1% fee on any blocks found, which is lower than our pool mining fee.
        </Typography>
      </Paper>
    </Box>
  );
};

export default SoloMining;