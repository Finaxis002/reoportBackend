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
        text: `
You are an expert business content writer.

Given the following business description, write a single, detailed, and professionally polished business introduction in fluent English, strictly for immediate use in a project report, business plan, or bank document.

Your introduction should:
- Be up to 1000 words (do not exceed).
- Present rich context, history, and current trends of the business sector in India when relevant.
- Explain the business’s core activities, its importance in the economy, recent market developments, and the typical business process.
- Describe key customer segments, modern technologies or operational trends, government policies, and challenges or opportunities.
- Use a factual, analytical, and engaging tone in flowing paragraphs (not bullet points or lists).
- Ensure all information is relevant to the provided business description and avoid generic filler.
- Do NOT include any placeholders, instructions, prompts, numbering, bullet points, or more than one version. Just output a single, polished introduction.
- Write as if for an Indian audience, unless the business context is explicitly international.

Business Description: ${businessDescription}
        `
      }
    ]
  }
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
