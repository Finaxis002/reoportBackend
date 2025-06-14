const express = require('express');
const router = express.Router();
const nodemailer = require("nodemailer");

let currentOTP = null;
router.post("/send-otp", async (req, res) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    currentOTP = otp; // Store in memory

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "shardaassociates.in@gmail.com",
        pass: "ullq uygv ynkk rfsi", // App Password
      },
    });

    const mailOptions = {
      from: '"Sharda Associates" <shardaassociates.in@gmail.com>',
      to: "caanunaysharda@gmail.com",
      subject: "OTP for Export Request",
      html: `<p>Your OTP for exporting bank data is: <strong>${otp}</strong></p>`,
    };

    await transporter.sendMail(mailOptions);
    return res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("❌ Error sending OTP:", err);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
});


router.post("/verify-otp", (req, res) => {
  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({ success: false, message: "OTP is required" });
  }

  if (otp === currentOTP) {
    currentOTP = null; // Invalidate OTP after use
    return res.json({ success: true, message: "OTP verified" });
  }

  return res.status(400).json({ success: false, message: "Invalid OTP" });
});

module.exports = router;