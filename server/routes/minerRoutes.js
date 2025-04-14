const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

/**
 * @route   GET /api/miners
 * @desc    Get all miners for the authenticated user
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    // This would usually query a database, but for this example,
    // we'll get data directly from the payment manager
    const { paymentManager } = req.app.locals;
    
    if (!paymentManager) {
      return res.status(500).json({ 
        message: 'Payment manager not available' 
      });
    }
    
    const minerStats = paymentManager.getMinerStats(req.user.id);
    
    if (!minerStats) {
      return res.status(200).json({ 
        miners: [],
        totalHashrate: 0,
        pendingBalance: 0,
        totalPaid: 0
      });
    }
    
    // Format workers for the response
    const workers = minerStats.workers.map(worker => ({
      id: worker.id,
      name: worker.id.split('.')[1] || 'default',
      hashrate: worker.estimatedHashrate || 0,
      shares: worker.shares,
      lastSeen: worker.lastShare,
      status: (Date.now() - worker.lastShare < 10 * 60 * 1000) ? 'online' : 'offline'
    }));
    
    res.json({
      miners: workers,
      totalHashrate: minerStats.estimatedHashrate,
      pendingBalance: minerStats.pendingBalance,
      totalPaid: minerStats.totalPaid
    });
    
  } catch (err) {
    console.error('Error fetching miners:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/miners/stats
 * @desc    Get detailed stats for a specific miner
 * @access  Private
 */
router.get('/stats/:minerId', auth, async (req, res) => {
  try {
    const { minerId } = req.params;
    const { paymentManager } = req.app.locals;
    
    if (!paymentManager) {
      return res.status(500).json({ 
        message: 'Payment manager not available' 
      });
    }
    
    const minerStats = paymentManager.getMinerStats(req.user.id);
    
    if (!minerStats) {
      return res.status(404).json({ message: 'Miner not found' });
    }
    
    // Find the specific worker
    const worker = minerStats.workers.find(w => w.id === minerId);
    
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }
    
    // Get recent shares for this worker from the payment manager's shares array
    const { shares } = paymentManager;
    const recentShares = shares
      .filter(share => share.minerId === minerId)
      .slice(-100) // Get last 100 shares
      .map(share => ({
        timestamp: share.timestamp,
        difficulty: share.difficulty
      }));
    
    res.json({
      id: worker.id,
      name: worker.id.split('.')[1] || 'default',
      hashrate: worker.estimatedHashrate || 0,
      shares: worker.shares,
      validShares: worker.shares,
      invalidShares: 0, // This would come from a real database
      lastSeen: worker.lastShare,
      status: (Date.now() - worker.lastShare < 10 * 60 * 1000) ? 'online' : 'offline',
      recentShares
    });
    
  } catch (err) {
    console.error('Error fetching miner stats:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/miners/all
 * @desc    Get all miners on the pool (admin only)
 * @access  Private/Admin
 */
router.get('/all', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const { paymentManager } = req.app.locals;
    
    if (!paymentManager) {
      return res.status(500).json({ 
        message: 'Payment manager not available' 
      });
    }
    
    const allMiners = paymentManager.getAllMinersStats();
    
    res.json({
      miners: allMiners,
      totalMiners: allMiners.length
    });
    
  } catch (err) {
    console.error('Error fetching all miners:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/miners/name
 * @desc    Update miner name
 * @access  Private
 */
router.post('/name', auth, async (req, res) => {
  try {
    const { minerId, name } = req.body;
    
    if (!minerId || !name) {
      return res.status(400).json({ message: 'Miner ID and name required' });
    }
    
    // In a real implementation, this would update a database
    // For this example, we'll just return success
    
    res.json({ 
      success: true,
      message: `Miner ${minerId} renamed to ${name}` 
    });
    
  } catch (err) {
    console.error('Error updating miner name:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;