const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

/**
 * @route   GET /api/payments
 * @desc    Get user payment history
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const { paymentManager } = req.app.locals;
    
    if (!paymentManager) {
      return res.status(500).json({ 
        message: 'Payment manager not available' 
      });
    }
    
    // In a real implementation, this would query a database
    // For this example, we'll generate mock data
    
    // Get the authenticated user's payment history
    const paymentHistory = paymentManager.getPaymentHistory(req.user.id);
    
    if (!paymentHistory || paymentHistory.length === 0) {
      return res.json({
        payments: [],
        totalPaid: 0
      });
    }
    
    // Calculate total paid
    const totalPaid = paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);
    
    res.json({
      payments: paymentHistory,
      totalPaid
    });
    
  } catch (err) {
    console.error('Error fetching payment history:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/payments/withdraw
 * @desc    Request a withdrawal
 * @access  Private
 */
router.post('/withdraw', auth, async (req, res) => {
  try {
    const { address, amount } = req.body;
    
    // Validate input
    if (!address || !amount) {
      return res.status(400).json({ 
        message: 'Please provide both address and amount' 
      });
    }
    
    // Validate amount is numeric and positive
    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return res.status(400).json({ 
        message: 'Amount must be a positive number' 
      });
    }
    
    const { paymentManager } = req.app.locals;
    
    if (!paymentManager) {
      return res.status(500).json({ 
        message: 'Payment manager not available' 
      });
    }
    
    // Check if user has enough balance
    const minerStats = paymentManager.getMinerStats(req.user.id);
    
    if (!minerStats || minerStats.pendingBalance < withdrawAmount) {
      return res.status(400).json({ 
        message: 'Insufficient balance' 
      });
    }
    
    // Process withdrawal
    const withdrawal = await paymentManager.requestWithdrawal({
      userId: req.user.id,
      address,
      amount: withdrawAmount,
      timestamp: Date.now(),
      status: 'pending'
    });
    
    res.json({
      message: 'Withdrawal request submitted successfully',
      withdrawal: {
        id: withdrawal.id,
        amount: withdrawal.amount,
        address: withdrawal.address,
        status: withdrawal.status,
        timestamp: withdrawal.timestamp
      }
    });
    
  } catch (err) {
    console.error('Error processing withdrawal:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/payments/pending
 * @desc    Get pending withdrawals
 * @access  Private
 */
router.get('/pending', auth, async (req, res) => {
  try {
    const { paymentManager } = req.app.locals;
    
    if (!paymentManager) {
      return res.status(500).json({ 
        message: 'Payment manager not available' 
      });
    }
    
    // Get the authenticated user's pending withdrawals
    const pendingWithdrawals = paymentManager.getPendingWithdrawals(req.user.id);
    
    res.json({ pendingWithdrawals });
    
  } catch (err) {
    console.error('Error fetching pending withdrawals:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/payments/settings
 * @desc    Get user payment settings
 * @access  Private
 */
router.get('/settings', auth, async (req, res) => {
  try {
    // In a real implementation, this would query a database
    // For this example, we'll return default settings
    
    res.json({
      autoThreshold: 0.01, // Automatic payment threshold in BTC
      payoutAddress: req.user.payoutAddress || '',
      paymentMethod: req.user.paymentMethod || 'bitcoin',
      notifyPayment: req.user.notifyPayment !== false
    });
    
  } catch (err) {
    console.error('Error fetching payment settings:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT /api/payments/settings
 * @desc    Update user payment settings
 * @access  Private
 */
router.put('/settings', auth, async (req, res) => {
  try {
    const { autoThreshold, payoutAddress, paymentMethod, notifyPayment } = req.body;
    
    // Validate input
    if (autoThreshold !== undefined) {
      const threshold = parseFloat(autoThreshold);
      if (isNaN(threshold) || threshold < 0) {
        return res.status(400).json({ 
          message: 'Auto threshold must be a positive number' 
        });
      }
    }
    
    // In a real implementation, this would update the database
    // For this example, we'll just return success
    
    res.json({
      message: 'Payment settings updated successfully',
      settings: {
        autoThreshold: autoThreshold || 0.01,
        payoutAddress: payoutAddress || req.user.payoutAddress || '',
        paymentMethod: paymentMethod || req.user.paymentMethod || 'bitcoin',
        notifyPayment: notifyPayment !== undefined ? notifyPayment : req.user.notifyPayment !== false
      }
    });
    
  } catch (err) {
    console.error('Error updating payment settings:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;