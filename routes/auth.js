const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sendWelcomeEmail } = require('../utils/emailService');

const router = express.Router();

// User registration - UPDATED WITH FILE ID FOR EMAIL
router.post('/register', async (req, res) => {
  try {
    const { name, email, whatsapp, password, fileId } = req.body;

    console.log('🔵 REGISTRATION ATTEMPT:', { name, email, whatsapp, fileId });

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Validate required fields
    if (!name || !email || !whatsapp || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user with WhatsApp
    const user = new User({
      name,
      email,
      whatsapp,
      passwordHash
    });

    await user.save();
    console.log('🟢 User registered successfully:', user._id);

    // ✅ AUTO LOGIN: Generate token immediately
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // ✅ SEND WELCOME EMAIL WITH DOWNLOAD LINK & SOCIAL MEDIA
    const appUrl = `${req.protocol}://${req.get('host')}`;
    const fileTopic = "Your Requested File"; // You can customize this based on actual file data
    
    sendWelcomeEmail(email, name, fileTopic, fileId, appUrl).catch(console.error);

    res.status(201).json({
      success: true,
      message: 'Registration successful! You can now download your file.',
      token, // ✅ Token sent for auto login
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        whatsapp: user.whatsapp 
      }
    });
    
  } catch (error) {
    console.error('🔴 Registration error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🟡 LOGIN ATTEMPT:', { email });

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        whatsapp: user.whatsapp 
      }
    });
  } catch (error) {
    console.error('🔴 Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify token endpoint
router.get('/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-passwordHash');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    res.json({
      valid: true,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        whatsapp: user.whatsapp,
        role: user.role 
      }
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;