const EventEmitter = require('events');
const crypto = require('crypto');

/**
 * Payment Manager for a mining pool
 * Handles share calculations, block rewards, and miner payments
 */
class PaymentManager extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      paymentInterval: 3600000, // 1 hour in ms
      minPayment: 0.01, // Minimum amount to trigger payment
      poolFee: 1.0, // Pool fee percentage
      payoutScheme: 'pplns', // Pay Per Last N Shares
      pplnsWindow: 2, // N value for PPLNS in hours
      ...options
    };
    
    this.miners = new Map(); // userId -> miner data
    this.shares = []; // Array of share objects for PPLNS
    this.blocks = []; // Array of found blocks
    this.pendingPayments = new Map(); // userId -> pending payment amount
    
    // Payment processor status
    this.status = {
      enabled: true,
      lastPaymentTime: 0,
      nextPaymentTime: Date.now() + this.options.paymentInterval,
      totalPaid: 0,
      totalFees: 0
    };
  }
  
  /**
   * Initialize payment processor
   */
  init() {
    // Set up periodic payments
    if (this.options.paymentInterval > 0) {
      this.paymentTimer = setInterval(() => {
        this.processPayments();
      }, this.options.paymentInterval);
      
      console.log(`Payment processor initialized with ${this.options.paymentInterval / 60000} minute interval`);
    }
    
    // Set up periodic cleanup
    this.cleanupTimer = setInterval(() => {
      this.cleanupOldShares();
    }, 300000); // Clean up every 5 minutes
  }
  
  /**
   * Record a share from a miner
   */
  recordShare(minerId, userId, difficulty) {
    if (!userId) return;
    
    // Create miner entry if not exists
    if (!this.miners.has(userId)) {
      this.miners.set(userId, {
        userId,
        workers: new Map(),
        shares: 0,
        totalDifficulty: 0,
        blocksFound: 0,
        pendingBalance: 0,
        totalPaid: 0,
        lastShare: Date.now()
      });
    }
    
    const miner = this.miners.get(userId);
    
    // Update miner stats
    miner.shares++;
    miner.totalDifficulty += difficulty;
    miner.lastShare = Date.now();
    
    // Track worker if we have a worker ID
    if (minerId) {
      if (!miner.workers.has(minerId)) {
        miner.workers.set(minerId, {
          id: minerId,
          shares: 0,
          totalDifficulty: 0,
          lastShare: Date.now()
        });
      }
      
      const worker = miner.workers.get(minerId);
      worker.shares++;
      worker.totalDifficulty += difficulty;
      worker.lastShare = Date.now();
    }
    
    // Record share for PPLNS
    this.shares.push({
      userId,
      minerId,
      difficulty,
      timestamp: Date.now()
    });
  }
  
  /**
   * Record a found block
   */
  recordFoundBlock(height, hash, reward, finder) {
    const blockReward = parseFloat(reward);
    
    // Create block record
    const block = {
      height,
      hash,
      reward: blockReward,
      finder,
      timestamp: Date.now(),
      processed: false
    };
    
    this.blocks.push(block);
    
    console.log(`Block found at height ${height} by ${finder} with reward ${reward}`);
    
    // Update miner stats for finder
    if (finder && this.miners.has(finder)) {
      const miner = this.miners.get(finder);
      miner.blocksFound++;
    }
    
    // Calculate rewards for this block
    this.calculateBlockRewards(block);
    
    // Emit event
    this.emit('blockFound', block);
    
    // Trigger payment processing if auto-payment is enabled
    if (this.options.paymentInterval === 0) {
      this.processPayments();
    }
  }
  
  /**
   * Calculate rewards for a block based on shares
   */
  calculateBlockRewards(block) {
    // Calculate the pool fee
    const poolFee = block.reward * (this.options.poolFee / 100);
    const rewardAfterFee = block.reward - poolFee;
    
    // Update pool stats
    this.status.totalFees += poolFee;
    
    // For solo mining, all reward goes to finder
    if (this.options.payoutScheme === 'solo') {
      if (block.finder && this.miners.has(block.finder)) {
        const miner = this.miners.get(block.finder);
        miner.pendingBalance += rewardAfterFee;
        
        // Record pending payment
        if (!this.pendingPayments.has(block.finder)) {
          this.pendingPayments.set(block.finder, 0);
        }
        this.pendingPayments.set(block.finder, this.pendingPayments.get(block.finder) + rewardAfterFee);
      }
      
      return;
    }
    
    // For PPLNS, calculate rewards based on shares in the window
    const now = Date.now();
    const windowTime = this.options.pplnsWindow * 60 * 60 * 1000; // Convert hours to ms
    
    // Filter shares within the PPLNS window
    const pplnsShares = this.shares.filter(share => 
      share.timestamp >= (now - windowTime)
    );
    
    if (pplnsShares.length === 0) {
      console.log(`No shares in PPLNS window for block ${block.height}`);
      return;
    }
    
    // Calculate total difficulty in window
    const totalDifficulty = pplnsShares.reduce((sum, share) => sum + share.difficulty, 0);
    
    // Calculate per-miner rewards
    const minerRewards = new Map();
    
    for (const share of pplnsShares) {
      const minerShare = share.difficulty / totalDifficulty;
      const minerReward = rewardAfterFee * minerShare;
      
      if (!minerRewards.has(share.userId)) {
        minerRewards.set(share.userId, 0);
      }
      
      minerRewards.set(share.userId, minerRewards.get(share.userId) + minerReward);
    }
    
    // Update miner balances
    for (const [userId, reward] of minerRewards.entries()) {
      if (this.miners.has(userId)) {
        const miner = this.miners.get(userId);
        miner.pendingBalance += reward;
        
        // Record pending payment
        if (!this.pendingPayments.has(userId)) {
          this.pendingPayments.set(userId, 0);
        }
        this.pendingPayments.set(userId, this.pendingPayments.get(userId) + reward);
      }
    }
    
    // Mark block as processed
    block.processed = true;
    
    console.log(`Block ${block.height} rewards calculated with ${this.options.payoutScheme} scheme`);
  }
  
  /**
   * Process pending payments
   */
  processPayments() {
    const now = Date.now();
    console.log(`Processing payments at ${new Date(now).toISOString()}`);
    
    // Skip if payments are disabled
    if (!this.status.enabled) {
      console.log('Payments are disabled');
      return;
    }
    
    // Process each miner with pending balance above minimum threshold
    for (const [userId, pendingAmount] of this.pendingPayments.entries()) {
      if (pendingAmount >= this.options.minPayment) {
        // In a real implementation, you would send crypto payment here
        console.log(`Paying ${pendingAmount} to ${userId}`);
        
        // Generate simulated transaction ID
        const txId = crypto.randomBytes(32).toString('hex');
        
        // Record payment
        const payment = {
          userId,
          amount: pendingAmount,
          timestamp: now,
          txId
        };
        
        // Update miner stats
        if (this.miners.has(userId)) {
          const miner = this.miners.get(userId);
          miner.totalPaid += pendingAmount;
          miner.pendingBalance = 0;
        }
        
        // Clear pending payment
        this.pendingPayments.set(userId, 0);
        
        // Update pool stats
        this.status.totalPaid += pendingAmount;
        
        // Emit payment event
        this.emit('payment', payment);
      }
    }
    
    // Update payment timing
    this.status.lastPaymentTime = now;
    this.status.nextPaymentTime = now + this.options.paymentInterval;
    
    console.log(`Payments processed, next payment at ${new Date(this.status.nextPaymentTime).toISOString()}`);
  }
  
  /**
   * Clean up old shares to prevent memory leaks
   */
  cleanupOldShares() {
    const now = Date.now();
    const maxAge = Math.max(24 * 60 * 60 * 1000, this.options.pplnsWindow * 60 * 60 * 1000 * 2);
    
    // Keep shares from last 24 hours or 2x PPLNS window, whichever is greater
    this.shares = this.shares.filter(share => 
      share.timestamp >= (now - maxAge)
    );
    
    // Keep only last 100 blocks
    if (this.blocks.length > 100) {
      this.blocks = this.blocks.slice(-100);
    }
  }
  
  /**
   * Get miner stats by userId
   */
  getMinerStats(userId) {
    if (!this.miners.has(userId)) {
      return null;
    }
    
    const miner = this.miners.get(userId);
    
    // Calculate estimated hashrate based on recent shares
    let estimatedHashrate = 0;
    const recentShares = this.shares.filter(
      share => share.userId === userId && share.timestamp > Date.now() - 600000 // Last 10 minutes
    );
    
    if (recentShares.length > 0) {
      const totalDiff = recentShares.reduce((sum, share) => sum + share.difficulty, 0);
      estimatedHashrate = totalDiff * 8192 / 600; // Rough estimate, would depend on actual algorithm
    }
    
    return {
      userId: miner.userId,
      shares: miner.shares,
      totalDifficulty: miner.totalDifficulty,
      blocksFound: miner.blocksFound,
      pendingBalance: miner.pendingBalance,
      totalPaid: miner.totalPaid,
      lastShare: miner.lastShare,
      workers: Array.from(miner.workers.values()),
      estimatedHashrate
    };
  }
  
  /**
   * Get all miners stats
   */
  getAllMinersStats() {
    const minerStats = [];
    
    for (const [userId, miner] of this.miners.entries()) {
      minerStats.push(this.getMinerStats(userId));
    }
    
    return minerStats;
  }
  
  /**
   * Get pool stats
   */
  getPoolStats() {
    // Calculate current hashrate based on recent shares
    let currentHashrate = 0;
    const recentShares = this.shares.filter(
      share => share.timestamp > Date.now() - 600000 // Last 10 minutes
    );
    
    if (recentShares.length > 0) {
      const totalDiff = recentShares.reduce((sum, share) => sum + share.difficulty, 0);
      currentHashrate = totalDiff * 8192 / 600; // Rough estimate, would depend on actual algorithm
    }
    
    return {
      miners: this.miners.size,
      currentHashrate,
      blocksFound: this.blocks.length,
      lastBlockFound: this.blocks.length > 0 ? this.blocks[this.blocks.length - 1].timestamp : 0,
      totalPaid: this.status.totalPaid,
      totalFees: this.status.totalFees,
      lastPaymentTime: this.status.lastPaymentTime,
      nextPaymentTime: this.status.nextPaymentTime
    };
  }
  
  /**
   * Enable/disable payments
   */
  setPaymentsEnabled(enabled) {
    this.status.enabled = enabled;
    console.log(`Payments ${enabled ? 'enabled' : 'disabled'}`);
  }
  
  /**
   * Cleanup resources
   */
  shutdown() {
    if (this.paymentTimer) {
      clearInterval(this.paymentTimer);
    }
    
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    
    console.log('Payment processor shut down');
  }
}

module.exports = PaymentManager;