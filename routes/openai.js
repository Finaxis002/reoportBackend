const express = require("express");
const router = express.Router();
// Import the Google Generative AI library
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable
// Ensure your .env file has GEMINI_API_KEY=YOUR_API_KEY
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/generate-introduction", async (req, res) => {
  const { businessDescription } = req.body;

  if (!businessDescription) {
    return res.status(400).json({ error: "Business description is required" });
  }

  try {
    // *** CHANGE HERE: Using 'gemini-1.5-flash-latest' model ***
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = `Write a professional business introduction based on the following business description:\n\n${businessDescription}`;

    // Call the generateContent method with the prompt
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text(); // Extract the generated text

    res.json({ introduction: text.trim() });
  } catch (err) {
    console.error("Gemini API error:", err.message);
    res.status(500).json({ error: "Failed to generate introduction" });
  }
});

module.exports = router;
