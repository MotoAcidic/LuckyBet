const net = require('net');
const EventEmitter = require('events');
const crypto = require('crypto');

/**
 * StratumManager class to handle Stratum mining protocol communication
 * Supports both SHA-256 (Bitcoin) and ETHASH (Ethereum) algorithms
 */
class StratumManager extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      port: options.port || 3333,
      host: options.host || '0.0.0.0',
      algorithm: options.algorithm || 'SHA-256',
      coinbaseAddress: options.coinbaseAddress || '',
      difficulty: options.difficulty || 'auto',
      poolName: options.poolName || 'LuckyBet Mining Pool',
      stratumVersion: options.stratumVersion || 2,
      ...options
    };
    
    this.server = null;
    this.clients = new Map();
    this.jobs = new Map();
    this.nextJobId = 1;
    this.nextClientId = 1;
    
    // Block template data (would be fetched from Bitcoin/Ethereum node in production)
    this.currentBlockTemplate = {
      height: 0,
      prevHash: '',
      coinbaseValue: 0,
      target: '',
      bits: '',
      timestamp: 0,
    };
    
    this.difficultyLevels = {
      low: this.options.algorithm === 'SHA-256' ? 8 : 2000000000,
      medium: this.options.algorithm === 'SHA-256' ? 16 : 4000000000,
      high: this.options.algorithm === 'SHA-256' ? 32 : 8000000000,
      auto: this.options.algorithm === 'SHA-256' ? 16 : 4000000000 // Default values for auto
    };
    
    this.initializeBlockTemplate();
    setInterval(() => this.updateBlockTemplate(), 30000); // Update block template every 30 seconds
  }
  
  /**
   * Initialize a mock block template for testing purposes
   * In production, this would fetch from a Bitcoin/Ethereum node
   */
  initializeBlockTemplate() {
    if (this.options.algorithm === 'SHA-256') {
      // Bitcoin-like block template
      this.currentBlockTemplate = {
        height: 750000,
        prevHash: 'f00d...beef', // This would be the actual previous block hash
        coinbaseValue: 625000000, // 6.25 BTC in satoshis
        target: '1d00ffff', // Target difficulty
        bits: '1d00ffff',
        timestamp: Math.floor(Date.now() / 1000),
        version: 4,
        merkleRoot: '',
        transactions: []
      };
    } else if (this.options.algorithm === 'ETHASH') {
      // Ethereum-like block template
      this.currentBlockTemplate = {
        height: 15000000,
        prevHash: '0x0987...6543',
        coinbaseValue: 2000000000000000000, // 2 ETH in wei
        target: '0x0000ffff00000000000000000000ffff00000000000000000000ffff00000000',
        difficulty: 2000000000,
        timestamp: Math.floor(Date.now() / 1000),
        number: 15000000,
        gasLimit: 30000000,
        gasUsed: 0,
        transactions: []
      };
    }
    
    this.broadcastMiningJob();
  }
  
  /**
   * Update the block template
   * In production, this would fetch from a Bitcoin/Ethereum node
   */
  updateBlockTemplate() {
    // Increment block height and timestamp for simulation
    if (this.options.algorithm === 'SHA-256') {
      this.currentBlockTemplate.height++;
      this.currentBlockTemplate.timestamp = Math.floor(Date.now() / 1000);
    } else if (this.options.algorithm === 'ETHASH') {
      this.currentBlockTemplate.height++;
      this.currentBlockTemplate.number++;
      this.currentBlockTemplate.timestamp = Math.floor(Date.now() / 1000);
    }
    
    this.broadcastMiningJob();
  }
  
  /**
   * Start the stratum server
   */
  start() {
    this.server = net.createServer((socket) => this.handleConnection(socket));
    
    this.server.listen(this.options.port, this.options.host, () => {
      console.log(`Stratum server (${this.options.algorithm}) listening on ${this.options.host}:${this.options.port}`);
    });
    
    this.server.on('error', (err) => {
      console.error(`Stratum server error:`, err);
      this.emit('error', err);
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('Shutting down stratum server...');
      this.shutdown();
      process.exit(0);
    });
    
    return this.server;
  }
  
  /**
   * Handle new client connection
   */
  handleConnection(socket) {
    const clientId = this.nextClientId++;
    const clientIp = socket.remoteAddress;
    
    console.log(`New miner connection from ${clientIp}, assigned ID: ${clientId}`);
    
    const client = {
      id: clientId,
      socket: socket,
      ip: clientIp,
      difficulty: this.difficultyLevels.auto,
      subscription: null,
      authorized: false,
      userId: null,
      workerName: null,
      shares: {
        valid: 0,
        invalid: 0,
        stale: 0
      },
      lastActivity: Date.now(),
      pendingDifficulty: null
    };
    
    this.clients.set(clientId, client);
    
    socket.on('data', (data) => {
      // For each full line in the incoming data
      const dataStr = data.toString('utf8');
      const messages = dataStr.split('\n');
      
      for (let message of messages) {
        if (!message.trim()) continue;
        
        try {
          const jsonData = JSON.parse(message);
          this.handleMessage(client, jsonData);
        } catch (e) {
          console.error(`Failed to parse message from client ${clientId}:`, e);
          // Send error response
          this.sendJson(client, {
            id: null,
            error: { code: -32700, message: 'Parse error' },
            result: null
          });
        }
      }
    });
    
    socket.on('error', (err) => {
      console.error(`Socket error from client ${clientId}:`, err);
      this.removeClient(client);
    });
    
    socket.on('close', () => {
      console.log(`Connection closed for client ${clientId}`);
      this.removeClient(client);
    });
    
    // Send initial difficulty
    this.sendJson(client, {
      id: null,
      method: 'mining.set_difficulty',
      params: [client.difficulty]
    });
  }
  
  /**
   * Handle stratum message from client
   */
  handleMessage(client, message) {
    if (!message.method && message.result !== undefined) {
      // This is a response to a previous request
      this.handleResponse(client, message);
      return;
    }
    
    // Handle different stratum methods
    switch (message.method) {
      case 'mining.subscribe':
        this.handleSubscribe(client, message);
        break;
      
      case 'mining.authorize':
        this.handleAuthorize(client, message);
        break;
        
      case 'mining.submit':
        this.handleSubmit(client, message);
        break;
        
      case 'mining.get_transactions':
        this.handleGetTransactions(client, message);
        break;
        
      default:
        console.warn(`Unknown method from client ${client.id}: ${message.method}`);
        this.sendJson(client, {
          id: message.id,
          error: { code: -32601, message: 'Method not found' },
          result: null
        });
    }
  }
  
  /**
   * Handle mining.subscribe request
   */
  handleSubscribe(client, message) {
    // Generate subscription ID and extranonce for client
    const subscriptionId = crypto.randomBytes(8).toString('hex');
    const extranonce1 = crypto.randomBytes(4).toString('hex');
    const extranonce2Size = 4;
    
    client.subscription = {
      id: subscriptionId,
      extranonce1: extranonce1,
      extranonce2Size: extranonce2Size
    };
    
    // Different response format based on algorithm
    let result;
    if (this.options.algorithm === 'SHA-256') {
      // Bitcoin-style response
      result = [
        [
          ["mining.set_difficulty", subscriptionId],
          ["mining.notify", subscriptionId]
        ],
        extranonce1,
        extranonce2Size
      ];
    } else {
      // Ethereum-style response
      result = {
        id: message.id,
        result: [
          subscriptionId,
          extranonce1
        ],
        error: null
      };
    }
    
    this.sendJson(client, {
      id: message.id,
      error: null,
      result: result
    });
    
    // Send first job immediately after subscription
    this.sendMiningJob(client);
    
    console.log(`Client ${client.id} subscribed with extranonce1: ${extranonce1}`);
  }
  
  /**
   * Handle mining.authorize request
   */
  handleAuthorize(client, message) {
    // Parse username (wallet address) and worker name
    const username = message.params[0];
    const password = message.params[1]; // Usually ignored or used for worker settings
    
    let userId, workerName;
    
    // Extract wallet address and worker name from username
    if (username.includes('.')) {
      [userId, workerName] = username.split('.');
    } else {
      userId = username;
      workerName = 'default';
    }
    
    // In a real implementation, you would validate wallet address format
    // For now, we'll accept any username format
    client.authorized = true;
    client.userId = userId;
    client.workerName = workerName;
    
    // Adjust difficulty based on worker name hint (if present in password)
    if (password) {
      if (password.includes('d=low') || password.includes('diff=low')) {
        client.difficulty = this.difficultyLevels.low;
        this.sendJson(client, {
          id: null,
          method: 'mining.set_difficulty',
          params: [client.difficulty]
        });
      } else if (password.includes('d=high') || password.includes('diff=high')) {
        client.difficulty = this.difficultyLevels.high;
        this.sendJson(client, {
          id: null,
          method: 'mining.set_difficulty',
          params: [client.difficulty]
        });
      }
    }
    
    // Send success response
    this.sendJson(client, {
      id: message.id,
      error: null,
      result: true
    });
    
    console.log(`Client ${client.id} authorized as ${userId}.${workerName} with difficulty ${client.difficulty}`);
    
    // Emit authorization event
    this.emit('authorize', client.id, userId, workerName);
  }
  
  /**
   * Handle mining.submit request (share submission)
   */
  handleSubmit(client, message) {
    if (!client.authorized) {
      this.sendJson(client, {
        id: message.id,
        error: { code: -1, message: 'Unauthorized worker' },
        result: null
      });
      return;
    }
    
    // Update client's last activity time
    client.lastActivity = Date.now();
    
    // A real implementation would validate the share against the job
    // For this example, we'll randomly accept/reject shares with 95% acceptance
    const isValid = Math.random() < 0.95;
    
    if (isValid) {
      client.shares.valid++;
      
      // Send success response
      this.sendJson(client, {
        id: message.id,
        error: null,
        result: true
      });
      
      console.log(`Client ${client.id} (${client.userId}.${client.workerName}) submitted valid share`);
      
      // Emit share event
      this.emit('share', client.id, client.userId, client.difficulty, true);
      
      // Check if share is a block (simulate with 1/5000 probability)
      if (Math.random() < 0.0002) { // 1/5000 chance
        console.log(`Block found by client ${client.id} (${client.userId}.${client.workerName})`);
        
        // Emit block found event
        this.emit('blockFound', {
          height: this.currentBlockTemplate.height,
          hash: crypto.randomBytes(32).toString('hex'),
          reward: this.options.algorithm === 'SHA-256' ? 6.25 : 2,
          finder: client.userId
        });
        
        // Update block template after block found
        this.updateBlockTemplate();
      }
    } else {
      client.shares.invalid++;
      
      // Send error response
      this.sendJson(client, {
        id: message.id,
        error: { code: -2, message: 'Invalid share' },
        result: null
      });
      
      console.log(`Client ${client.id} (${client.userId}.${client.workerName}) submitted invalid share`);
      
      // Emit invalid share event
      this.emit('share', client.id, client.userId, client.difficulty, false);
    }
    
    // Dynamic difficulty adjustment (in a real implementation)
    // this.adjustDifficulty(client);
  }
  
  /**
   * Handle mining.get_transactions request
   */
  handleGetTransactions(client, message) {
    // In a real implementation, you would return transaction hashes
    // For this example, we'll just return an empty array
    this.sendJson(client, {
      id: message.id,
      error: null,
      result: []
    });
  }
  
  /**
   * Handle client response to server request
   */
  handleResponse(client, message) {
    // This is not usually needed for stratum but included for completeness
    console.log(`Client ${client.id} sent response:`, message);
  }
  
  /**
   * Send mining job to a client
   */
  sendMiningJob(client) {
    if (!client.subscription) return;
    
    const jobId = `${this.nextJobId++}`;
    
    // Store job for later verification
    this.jobs.set(jobId, {
      id: jobId,
      height: this.currentBlockTemplate.height,
      difficulty: client.difficulty,
      timestamp: Date.now()
    });
    
    // Clean up old jobs
    this.cleanupOldJobs();
    
    // Different job format based on algorithm
    if (this.options.algorithm === 'SHA-256') {
      // Bitcoin-style job
      this.sendJson(client, {
        id: null,
        method: 'mining.notify',
        params: [
          jobId,
          this.currentBlockTemplate.prevHash.substring(0, 64),
          crypto.randomBytes(32).toString('hex').substring(0, 64), // coinbase part 1 (would be properly formed in real implementation)
          crypto.randomBytes(32).toString('hex').substring(0, 64), // coinbase part 2
          [], // merkle branches
          this.currentBlockTemplate.version.toString(16),
          this.currentBlockTemplate.bits,
          this.currentBlockTemplate.timestamp.toString(16),
          true // clean jobs
        ]
      });
    } else {
      // Ethereum-style job
      this.sendJson(client, {
        id: null,
        method: 'mining.notify',
        params: [
          jobId,
          this.currentBlockTemplate.height.toString(16), // block header without nonce
          this.currentBlockTemplate.prevHash.substring(2), // remove '0x'
          crypto.randomBytes(32).toString('hex'), // seed hash (would be computed properly in real implementation)
          this.currentBlockTemplate.target.substring(2), // remove '0x'
          true // clean jobs
        ]
      });
    }
  }
  
  /**
   * Broadcast mining job to all authorized clients
   */
  broadcastMiningJob() {
    for (const [clientId, client] of this.clients.entries()) {
      if (client.authorized) {
        this.sendMiningJob(client);
      }
    }
  }
  
  /**
   * Clean up old jobs to prevent memory leaks
   */
  cleanupOldJobs() {
    const now = Date.now();
    
    // Keep only jobs from last 10 minutes
    for (const [jobId, job] of this.jobs.entries()) {
      if (now - job.timestamp > 10 * 60 * 1000) {
        this.jobs.delete(jobId);
      }
    }
  }
  
  /**
   * Send JSON message to client
   */
  sendJson(client, message) {
    if (!client.socket || client.socket.destroyed) return;
    
    try {
      const messageStr = JSON.stringify(message) + '\n';
      client.socket.write(messageStr);
    } catch (e) {
      console.error(`Error sending message to client ${client.id}:`, e);
    }
  }
  
  /**
   * Remove client
   */
  removeClient(client) {
    this.clients.delete(client.id);
    console.log(`Client ${client.id} removed, total clients: ${this.clients.size}`);
    
    // Close socket if still open
    if (client.socket && !client.socket.destroyed) {
      try {
        client.socket.destroy();
      } catch (e) {
        console.error(`Error destroying socket for client ${client.id}:`, e);
      }
    }
    
    // Emit disconnect event
    this.emit('disconnect', client.id, client.userId, client.workerName);
  }
  
  /**
   * Get total hashrate of all clients (simulated)
   */
  getTotalHashrate() {
    // In a real implementation, this would be calculated from shares
    // For this example, we'll estimate based on difficulties
    let totalHashrate = 0;
    
    for (const [clientId, client] of this.clients.entries()) {
      if (client.authorized && client.lastActivity > Date.now() - 5 * 60 * 1000) {
        // Rough estimation based on difficulty
        const clientHashrate = client.difficulty * (this.options.algorithm === 'SHA-256' ? 1e6 : 1e3);
        totalHashrate += clientHashrate;
      }
    }
    
    return totalHashrate;
  }
  
  /**
   * Get list of miners
   */
  getMiners() {
    const miners = [];
    
    for (const [clientId, client] of this.clients.entries()) {
      if (client.authorized) {
        miners.push({
          id: client.id,
          ip: client.ip,
          userId: client.userId,
          workerName: client.workerName,
          difficulty: client.difficulty,
          shares: { ...client.shares },
          lastActivity: client.lastActivity
        });
      }
    }
    
    return miners;
  }
  
  /**
   * Shutdown the server
   */
  shutdown() {
    if (this.server) {
      this.server.close();
    }
    
    // Close all client connections
    for (const [clientId, client] of this.clients.entries()) {
      this.removeClient(client);
    }
    
    console.log(`Stratum server (${this.options.algorithm}) on port ${this.options.port} shut down`);
  }
}

module.exports = StratumManager;