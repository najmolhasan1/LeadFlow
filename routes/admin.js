const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const File = require('../models/File');
const auth = require('../middleware/auth');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Create temp directory if it doesn't exist
if (!fs.existsSync('temp')) {
  fs.mkdirSync('temp');
}

// Admin registration (first time setup)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log('Admin registration attempt:', { name, email });

    // Check if admin exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already registered' });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create admin
    const admin = new User({
      name,
      email,
      passwordHash,
      role: 'admin'
    });

    await admin.save();

    const token = jwt.sign(
      { userId: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Admin registered successfully',
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email }
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Admin login attempt:', { email });

    const admin = await User.findOne({ email, role: 'admin' });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const token = jwt.sign(
      { userId: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Admin login successful',
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});




// Get all users (admin only) - UPDATED WITH FILE POPULATION
router.get('/users', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const users = await User.find({ role: 'user' })
      .select('-passwordHash')
      .populate('registeredForFile', 'topic fileName');
    
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});



// Export users as CSV - UPDATED WITH NEW FIELDS
router.get('/users/export', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const users = await User.find({ role: 'user' })
      .select('name email whatsapp eduLevel knowledgeLevel sourcePlatform createdAt')
      .populate('registeredForFile', 'topic');
    
    const csvWriter = createCsvWriter({
      path: 'temp/users.csv',
      header: [
        { id: 'name', title: 'Name' },
        { id: 'email', title: 'Email' },
        { id: 'whatsapp', title: 'WhatsApp Number' },
        { id: 'eduLevel', title: 'Education Level' },
        { id: 'knowledgeLevel', title: 'Knowledge Level' },
        { id: 'sourcePlatform', title: 'Source Platform' },
        { id: 'registeredForFile', title: 'Registered For File' },
        { id: 'createdAt', title: 'Registration Date & Time' }
      ]
    });

    const csvData = users.map(user => ({
      name: user.name,
      email: user.email,
      whatsapp: user.whatsapp,
      eduLevel: user.eduLevel,
      knowledgeLevel: user.knowledgeLevel,
      sourcePlatform: user.sourcePlatform,
      registeredForFile: user.registeredForFile ? user.registeredForFile.topic : 'N/A',
      createdAt: new Date(user.createdAt).toLocaleString()
    }));

    await csvWriter.writeRecords(csvData);
    
    res.download('temp/users.csv', 'users.csv', (err) => {
      if (err) {
        console.error('CSV download error:', err);
        res.status(500).json({ message: 'Error downloading CSV file' });
      }
    });
  } catch (error) {
    console.error('Export users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Get admin profile (protected)
router.get('/profile', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const admin = await User.findById(req.user._id).select('-passwordHash');
    res.json(admin);
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete user
router.delete('/users/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
