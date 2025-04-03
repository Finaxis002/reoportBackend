// otpRoutes.js
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

// Dummy in-memory store (you can use Redis or DB instead)
const otpStore = {}; // You can keep this as a global in-memory store

// 🔐 Send OTP to Admin when an employee attempts to log in
router.post("/send-otp", async (req, res) => {
  const { name } = req.body;
  const adminEmail = "priyadiwaker2020@gmail.com";

  if (!name) {
    return res.status(400).json({ error: "Employee name is required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
  otpStore[adminEmail] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "priyadiwaker2020@gmail.com",
        pass: "lwum womt umfc jvlk", // App Password
      },
    });

    await transporter.sendMail({
      from: "Report Management System",
      to: adminEmail,
      subject: "Employee Login – OTP Verification",
      html: `
        <div style="font-family: Arial, sans-serif; font-size: 15px; color: #333;">
          <p><strong>Employee Login Request</strong></p>
          <p>An employee is trying to log in to the <strong>Report Management System</strong>.</p>
          <p><strong>Employee Name:</strong> ${name}</p>
          <p>Use the OTP below to approve login:</p>
          <p style="font-size: 20px; font-weight: bold; color: #2c3e50; margin: 12px 0;">${otp}</p>
          <p>This OTP is valid for <strong>5 minutes</strong>.</p>
          <br/>
          <p>Regards,<br/>Report Management System</p>
        </div>
      `,
    });

    res.status(200).json({ message: "OTP sent to admin successfully" });
  } catch (error) {
    console.error("Error sending OTP to admin:", error);
    res.status(500).json({ error: "Failed to send OTP to admin" });
  }
});



// ✅ Verify OTP entered by admin for login approval
router.post("/verify-otp", (req, res) => {
  const { otp } = req.body;
  const adminEmail = "priyadiwaker2020@gmail.com";

  if (!otp) return res.status(400).json({ error: "OTP is required" });

  const storedData = otpStore[adminEmail];
  if (!storedData) return res.status(400).json({ error: "No OTP found" });

  if (Date.now() > storedData.expiresAt) {
    delete otpStore[adminEmail];
    return res.status(400).json({ error: "OTP expired" });
  }

  if (String(storedData.otp) !== String(otp)) {
    return res.status(400).json({ error: "Invalid OTP" });
  }

  delete otpStore[adminEmail]; // One-time use
  res.status(200).json({ message: "✅ OTP verified for login" });
});





// Add to your existing otpRoutes.js

// In-memory store for PDF OTPs
const pdfOtpStore = {};

router.post("/send-otp-download", async (req, res) => {
  const { employeeName } = req.body;
  const email = "priyadiwaker2020@gmail.com"; // Admin email

  if (!employeeName) return res.status(400).json({ error: "Employee name is required" });

  const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
  pdfOtpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "priyadiwaker2020@gmail.com",
        pass: "lwum womt umfc jvlk", // use Gmail app password
      },
    });

    await transporter.sendMail({
      from: "Report Management System",
      to: email,
      subject: "PDF Download OTP Request",
      html: `
        <div style="font-family: Arial, sans-serif; font-size: 15px; color: #333;">
          <p>An OTP request has been triggered for PDF download by employee: <strong>${employeeName}</strong>.</p>
          <p>Use this OTP to authorize the download:</p>
          <p style="font-size: 20px; font-weight: bold;">${otp}</p>
          <p>This OTP will expire in <strong>5 minutes</strong>.</p>
          <br />
          <p>Regards,<br/>Report Management System</p>
        </div>
      `,
    });

    res.status(200).json({ message: "OTP sent to admin successfully" });
  } catch (error) {
    console.error("Error sending OTP email for download:", error);
    res.status(500).json({ error: "Failed to send OTP for download" });
  }
});

router.post("/verify-otp-download", (req, res) => {
  const { otp } = req.body;
  const email = "priyadiwaker2020@gmail.com";

  console.log("🧾 Received OTP:", otp);
  console.log("📦 Stored OTP:", pdfOtpStore[email]);

  if (!otp) return res.status(400).json({ error: "OTP is required" });

  const storedData = pdfOtpStore[email];
  if (!storedData) return res.status(400).json({ error: "No OTP found" });

  if (Date.now() > storedData.expiresAt) {
    delete pdfOtpStore[email];
    return res.status(400).json({ error: "OTP expired" });
  }

  if (String(storedData.otp) !== String(otp)) {
    return res.status(400).json({ error: "Invalid OTP" });
  }

  delete pdfOtpStore[email]; // One-time use
  res.status(200).json({ message: "✅ OTP verified for download" });
});


  
module.exports = router;
