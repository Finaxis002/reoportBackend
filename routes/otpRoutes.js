const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// In-memory OTP store
const otpStore = {};

// Set up mail transporter using environment credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send OTP to static email from .env
router.post('/send-otp', async (req, res) => {
  const { employeeId } = req.body;

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000;

  otpStore[employeeId] = { otp, expiresAt };

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_RECEIVER, // ✅ Use static .env email
      subject: `OTP for ${employeeId}`,
      text: `Employee ID: ${employeeId}\nYour OTP is ${otp} (valid for 5 minutes).`,
    });

    res.json({ success: true, message: 'OTP sent to admin email.' });
  } catch (err) {
    console.error('❌ Failed to send OTP:', err);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP
router.post('/verify-otp', (req, res) => {
  const { employeeId, otp } = req.body;
  const record = otpStore[employeeId];

  if (!record) return res.status(400).json({ error: 'No OTP generated' });
  if (Date.now() > record.expiresAt) return res.status(400).json({ error: 'OTP expired' });
  if (record.otp !== otp) return res.status(401).json({ error: 'Invalid OTP' });

  delete otpStore[employeeId];
  res.json({ success: true, message: 'OTP verified' });
});

module.exports = router;
