const express = require('express');
const router = express.Router();
const BankDetails = require('../models/BankDetails');

// ✅ POST - Add new bank details
router.post("/add-bank-details", async (req, res) => {
    try {
      const { bankDetails } = req.body; // ✅ Destructure `bankDetails`
  
      if (!bankDetails) {
        return res
          .status(400)
          .json({ success: false, message: "Missing bank details" });
      }
  
      // ✅ Create new bank details
      const newBankDetails = new BankDetails(bankDetails);
  
      await newBankDetails.save(); // ✅ Save to MongoDB
  
      return res.status(201).json({
        success: true,
        message: "Bank details added successfully",
        data: newBankDetails,
      });
    } catch (error) {
      console.error("🔥 Error adding bank details:", error);
      return res.status(500).json({
        success: false,
        message: "Server Error",
        error: error.message,
      });
    }
  });
  

// ✅ GET - Fetch all bank details
router.get('/get-bank-details', async (req, res) => {
  try {
    const bankDetails = await BankDetails.find();
    return res.status(200).json({
      success: true,
      data: bankDetails,
    });
  } catch (error) {
    console.error('🔥 Error fetching bank details:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
});

// ✅ DELETE - Delete bank details
router.delete('/delete-bank-details/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await BankDetails.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Bank details deleted successfully',
    });
  } catch (error) {
    console.error('🔥 Error deleting bank details:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
});


module.exports = router;
