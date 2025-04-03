const express = require("express");
const FormData = require("../models/formdatas");  // Import the model

const router = express.Router();

// Endpoint to fetch all form data (clients)
router.get("/formdatas", async (req, res) => {
  try {
    // Fetch all form data from the database
    const allFormData = await FormData.find();

    if (allFormData.length === 0) {
      return res.status(404).json({ message: "No form data found" });
    }

    // Return all form data, including the AccountInformation for each
    const clientsData = allFormData.map((data) => data.AccountInformation);
    res.status(200).json(clientsData);
  } catch (error) {
    console.error("Error fetching form data:", error);
    res.status(500).json({ message: "Failed to fetch form data", error });
  }
});

module.exports = router;
