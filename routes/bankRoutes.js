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

      // ✅ Extract required fields
    const { bankName, managerName, contactNo, city } = bankDetails;

    // ✅ Validate only the 4 required fields
    if (!bankName || !managerName || !contactNo || !city) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing: businessName, clientName, bankName, managerName",
      });
    }
  
      // ✅ Create new bank details
      // const newBankDetails = new BankDetails(bankDetails);
       const newBankDetails = new BankDetails({ ...bankDetails });

  
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

// ✅ PUT - Update bank details
router.put('/update-bank-details/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    if (!updatedData) {
      return res.status(400).json({
        success: false,
        message: 'Missing updated data',
      });
    }

    const updatedBankDetails = await BankDetails.findByIdAndUpdate(
      id,
      updatedData,
      { new: true }
    );

    if (!updatedBankDetails) {
      return res.status(404).json({
        success: false,
        message: 'Bank details not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Bank details updated successfully',
      data: updatedBankDetails,
    });
  } catch (error) {
    console.error('🔥 Error updating bank details:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
});


// ✅ DELETE - Delete bank details
// ✅ DELETE - Delete bank details
router.delete('/delete-bank-details/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // More flexible ID validation
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'No ID provided',
      });
    }

    // Try to delete regardless of ID format
    const deletedDetails = await BankDetails.findOneAndDelete({
      $or: [
        { _id: id },
        { id: id } // If you're using alternate ID fields
      ]
    });

    if (!deletedDetails) {
      return res.status(404).json({
        success: false,
        message: 'Bank details not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Bank details deleted successfully',
      data: deletedDetails,
    });
  } catch (error) {
    console.error('Error deleting bank details:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
});

module.exports = router;
