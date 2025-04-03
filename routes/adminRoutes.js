const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET; // ✅ Load from .env

// ✅ Register Admin Route
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    // Create new admin
    const admin = new Admin({ username, password });
    await admin.save();

    // Generate JWT token
    const token = jwt.sign({ id: admin._id, username: admin.username }, JWT_SECRET, {
      expiresIn: '1h'
    });

    res.status(201).json({ message: 'Admin registered successfully', token });
  } catch (error) {
    console.error('Error registering admin:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// ✅ Login Admin Route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: admin._id, username: admin.username }, JWT_SECRET, {
      expiresIn: '1h'
    });

    res.status(200).json({ token, message: 'Login successful' });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// ✅ Fetch All Admins
router.get('/', async (req, res) => {
  try {
    const admins = await Admin.find({}, 'username');
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admins' });
  }
});

module.exports = router;
