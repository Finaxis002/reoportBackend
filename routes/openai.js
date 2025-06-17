const express = require("express");
const router = express.Router();

router.post("/generate-introduction", async (req, res) => {
  const { businessDescription } = req.body;

  if (!businessDescription) {
    return res.status(400).json({ error: "Business description is required" });
  }

  try {
    const MODEL_NAME = "gemini-1.5-flash-latest"; 

    // *** UPDATED: Even stricter prompt to prevent placeholders ***
    let chatHistory = [
      {
        role: "user",
        parts: [
          {
            text: `Based on the following business description, write a single, complete, and professional business introduction that is ready for immediate use. Do NOT include any placeholders like [insert text here], numbering, or multiple versions. Just the polished introduction itself.`,
          },
          {
            text: `Business Description: ${businessDescription}`,
          },
        ],
      },
    ];

    const payload = {
      contents: chatHistory,
      generationConfig: {
        temperature: 0.7, 
        candidateCount: 1, 
      },
    };

    const apiKey = process.env.GEMINI_API_KEY; 
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (
      result.candidates &&
      result.candidates.length > 0 &&
      result.candidates[0].content &&
      result.candidates[0].content.parts &&
      result.candidates[0].content.parts.length > 0
    ) {
      const text = result.candidates[0].content.parts[0].text;
      res.json({ introduction: text.trim() });
    } else {
      console.error("Unexpected Gemini API response structure or no candidates:", JSON.stringify(result, null, 2));
      res.status(500).json({ error: "Failed to generate introduction from AI." });
    }
  } catch (err) {
    console.error("Backend error during Gemini API call:", err.message);
    res.status(500).json({ error: "Failed to generate introduction from AI due to server error." });
  }
});

module.exports = router;
