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
    console.log("Password match status: ", isMatch); 
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


// ✅ Update Admin Route (PUT)

// router.put('/admin/:id', upload.single('caSign'), async (req, res) => {
//   const { id } = req.params;
//   const { username, password, roles } = req.body;
//   console.log('Raw req.body:', req.body);

//   console.log('Received password:', password);
// console.log('Is password hashed? ', password && password.startsWith('$2b$'));

// console.log('Password before hashing:', JSON.stringify(password), 'length:', password.length);

//   try {
//     const admin = await Admin.findById(id);
//     if (!admin) return res.status(404).json({ message: 'Admin not found' });

//     if (username) admin.username = username.toLowerCase().trim();

//     if (password) {
//       if (password.startsWith('$2b$')) {
//         // Password is already hashed, assign as-is (skip re-hashing)
//         admin.password = password;
//         console.log('Password appears already hashed, skipping re-hash');
//       } else {
//         // Plain password, assign trimmed and hash via pre-save hook
//         admin.password = password.trim();
//       }
//     }

//     if (roles) {
//       if (typeof roles === 'string') admin.roles = JSON.parse(roles);
//       else admin.roles = roles;
//     }

//     if (req.file) admin.caSign = `/uploads/${req.file.filename}`;
    

//     await admin.save();

//     res.status(200).json({ message: 'Admin updated successfully' });
//   } catch (error) {
//     console.error('Error updating admin:', error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// });

router.put('/admin/:id', async (req, res) => {
  console.log('Raw req.body:', req.body);

  const { id } = req.params;
  const { username, password, roles } = req.body;

  try {
    const admin = await Admin.findById(id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    if (username) admin.username = username.toLowerCase().trim();

    if (password) {
      if (password.startsWith('$2b$')) {
        admin.password = password;
        console.log('Password appears already hashed, skipping re-hash');
      } else {
        admin.password = password.trim();
      }
    }

    if (roles) {
      if (typeof roles === 'string') admin.roles = JSON.parse(roles);
      else admin.roles = roles;
    }

    // Remove caSign update here

    await admin.save();

    res.status(200).json({ message: 'Admin updated successfully' });
  } catch (error) {
    console.error('Error updating admin:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});




module.exports = router;
