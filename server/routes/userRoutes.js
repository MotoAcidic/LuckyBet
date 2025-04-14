const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
// You'll need to create a User model
// const User = require('../models/User');

// User authentication middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Find user by id and token
    // const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });
    
    if (!user) {
      throw new Error();
    }
    
    req.token = token;
    req.user = user;
    next();
  } catch (e) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    // const existingUser = await User.findOne({ email });
    // if (existingUser) {
    //   return res.status(400).send({ error: 'Email already in use.' });
    // }
    
    // Create new user
    // const user = new User({ username, email, password });
    // await user.save();
    
    // Generate JWT token
    // const token = await user.generateAuthToken();
    
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    // const user = await User.findOne({ email });
    // if (!user) {
    //   return res.status(401).send({ error: 'Invalid login credentials.' });
    // }
    
    // Check password
    // const isPasswordMatch = await bcrypt.compare(password, user.password);
    // if (!isPasswordMatch) {
    //   return res.status(401).send({ error: 'Invalid login credentials.' });
    // }
    
    // Generate new token
    // const token = await user.generateAuthToken();
    
    res.send({ user, token });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Logout user
router.post('/logout', auth, async (req, res) => {
  try {
    // Remove current token
    // req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
    // await req.user.save();
    
    res.send({ message: 'Logged out successfully.' });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  res.send(req.user);
});

// Update user profile
router.patch('/profile', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['username', 'email', 'password', 'walletAddress'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));
  
  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates.' });
  }
  
  try {
    updates.forEach(update => req.user[update] = req.body[update]);
    // await req.user.save();
    res.send(req.user);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

module.exports = router;