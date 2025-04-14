const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

/**
 * @route   GET /api/stats
 * @desc    Get overall pool statistics
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // Get shared instances from the app
    const { stratumManager, paymentManager } = req.app.locals;
    
    if (!stratumManager || !paymentManager) {
      return res.status(500).json({ 
        message: 'Mining services not available' 
      });
    }
    
    // Get stats from payment manager
    const poolStats = paymentManager.getPoolStats();
    
    // Get active miners count from stratum manager
    const activeMinerCount = stratumManager.clients.size;
    
    // Get recent blocks
    const recentBlocks = paymentManager.blocks
      .slice(-10) // Get last 10 blocks
      .map(block => ({
        height: block.height,
        hash: block.hash,
        timestamp: block.timestamp,
        reward: block.reward,
        finder: block.finder ? block.finder.substring(0, 10) + '...' : 'Unknown'
      }));
    
    // Response data
    const stats = {
      hashrate: poolStats.currentHashrate,
      miners: {
        total: poolStats.miners,
        active: activeMinerCount
      },
      blocks: {
        total: poolStats.blocksFound,
        lastFoundTime: poolStats.lastBlockFound,
        recentBlocks
      },
      payments: {
        total: poolStats.totalPaid,
        lastPaymentTime: poolStats.lastPaymentTime,
        nextPaymentTime: poolStats.nextPaymentTime
      }
    };
    
    res.json(stats);
    
  } catch (err) {
    console.error('Error fetching pool stats:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/stats/hashrate/history
 * @desc    Get hashrate history for charting
 * @access  Public
 */
router.get('/hashrate/history', async (req, res) => {
  try {
    // In a real implementation, this would query a time-series database
    // For this example, we'll generate mock data
    
    const now = Date.now();
    const twoWeeksAgo = now - (14 * 24 * 60 * 60 * 1000);
    const dataPoints = [];
    
    // Generate 14 days of hourly data points
    for (let i = 0; i < 14 * 24; i++) {
      const timestamp = twoWeeksAgo + (i * 60 * 60 * 1000);
      
      // Generate some realistic-looking hashrate fluctuations
      // Base value with gradual upward trend plus some random noise
      const baseHashrate = 10000000 + (i * 10000); 
      const noise = Math.random() * 2000000 - 1000000; // +/- 1 TH/s noise
      const timeOfDayEffect = Math.sin((timestamp % 86400000) / 86400000 * Math.PI * 2) * 500000;
      
      dataPoints.push({
        timestamp,
        hashrate: Math.max(0, baseHashrate + noise + timeOfDayEffect)
      });
    }
    
    res.json(dataPoints);
    
  } catch (err) {
    console.error('Error fetching hashrate history:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/stats/user
 * @desc    Get authenticated user's statistics
 * @access  Private
 */
router.get('/user', auth, async (req, res) => {
  try {
    const { paymentManager } = req.app.locals;
    
    if (!paymentManager) {
      return res.status(500).json({ 
        message: 'Payment manager not available' 
      });
    }
    
    const minerStats = paymentManager.getMinerStats(req.user.id);
    
    if (!minerStats) {
      return res.status(200).json({
        hashrate: 0,
        workers: 0,
        shares: 0,
        pendingBalance: 0,
        totalPaid: 0,
        blocksFound: 0
      });
    }
    
    // Calculate average hashrate over time periods
    const now = Date.now();
    const last1h = now - (60 * 60 * 1000);
    const last24h = now - (24 * 60 * 60 * 1000);
    
    const { shares } = paymentManager;
    
    const userShares = shares.filter(share => share.userId === req.user.id);
    const shares1h = userShares.filter(share => share.timestamp >= last1h);
    const shares24h = userShares.filter(share => share.timestamp >= last24h);
    
    const hashrate1h = shares1h.length > 0
      ? shares1h.reduce((sum, share) => sum + share.difficulty, 0) * 8192 / 3600
      : 0;
    
    const hashrate24h = shares24h.length > 0
      ? shares24h.reduce((sum, share) => sum + share.difficulty, 0) * 8192 / 86400
      : 0;
    
    res.json({
      hashrate: {
        current: minerStats.estimatedHashrate,
        '1h': hashrate1h,
        '24h': hashrate24h
      },
      workers: minerStats.workers.length,
      shares: minerStats.shares,
      pendingBalance: minerStats.pendingBalance,
      totalPaid: minerStats.totalPaid,
      blocksFound: minerStats.blocksFound,
      lastShare: minerStats.lastShare
    });
    
  } catch (err) {
    console.error('Error fetching user stats:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/stats/blocks
 * @desc    Get detailed block information
 * @access  Public
 */
router.get('/blocks', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    const { paymentManager } = req.app.locals;
    
    if (!paymentManager) {
      return res.status(500).json({ 
        message: 'Payment manager not available' 
      });
    }
    
    const { blocks } = paymentManager;
    
    // Sort blocks by timestamp (newest first)
    const sortedBlocks = [...blocks].sort((a, b) => b.timestamp - a.timestamp);
    
    // Paginate
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;
    
    const paginatedBlocks = sortedBlocks.slice(startIndex, endIndex).map(block => ({
      height: block.height,
      hash: block.hash,
      timestamp: block.timestamp,
      reward: block.reward,
      finder: block.finder ? block.finder.substring(0, 10) + '...' : 'Unknown'
    }));
    
    res.json({
      blocks: paginatedBlocks,
      totalBlocks: blocks.length,
      totalPages: Math.ceil(blocks.length / limitNum),
      currentPage: pageNum
    });
    
  } catch (err) {
    console.error('Error fetching blocks:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/stats/luck
 * @desc    Get pool luck statistics
 * @access  Public
 */
router.get('/luck', async (req, res) => {
  try {
    // In a real implementation, this would be calculated from actual data
    // For this example, we'll generate mock data
    
    // Simulate pool luck for last 100 blocks
    const luckData = [];
    let expectedShares = 0;
    
    for (let i = 0; i < 100; i++) {
      // Network difficulty (simulated)
      const networkDiff = 1000000 + Math.random() * 100000;
      
      // Expected shares for this difficulty (theoretical)
      expectedShares = networkDiff / 0.5; // 0.5 is share difficulty in this example
      
      // Actual shares found (randomized around expected)
      const luckFactor = Math.random() * 2; // Random luck between 0-200%
      const actualShares = expectedShares * luckFactor;
      
      // Calculate luck percentage (100% is average, <100% is lucky, >100% is unlucky)
      const luckPercentage = (actualShares / expectedShares) * 100;
      
      luckData.push({
        blockHeight: 700000 + i,
        expectedShares,
        actualShares,
        luck: luckPercentage,
        timestamp: Date.now() - (i * 600 * 1000) // Approximately 10 minutes per block
      });
    }
    
    // Overall luck calculation (average of last 100 blocks)
    const overallLuck = luckData.reduce((sum, block) => sum + block.luck, 0) / luckData.length;
    
    res.json({
      currentLuck: luckData[0].luck,
      overallLuck,
      luckHistory: luckData.slice(0, 30) // Return only last 30 blocks for chart
    });
    
  } catch (err) {
    console.error('Error calculating pool luck:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;