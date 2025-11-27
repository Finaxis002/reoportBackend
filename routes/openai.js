const express = require("express");
const router = express.Router();
const nlp = require("compromise");





async function fetchPixabayImages(query, count = 3) {
  const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;
  const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&per_page=${count}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data.hits.map(img => img.largeImageURL || img.webformatURL);
  } catch (err) {





    console.error("Error fetching Pixabay images:", err.message);
    return [];
  }
}


router.post("/generate-section", async (req, res) => {
  const {
    section,
    businessName,
    businessDescription,
    averageDSCR,
    averageCurrentRatio,
    BEP,
    wordLimit = 1000,
  } = req.body;
  if (!section || !businessDescription) {
    return res
      .status(400)
      .json({ error: "Section and business description are required" });
  }

  // Define prompts for each section:
  const prompts = {
    introduction: `
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

 - DO NOT use or refer to any placeholders (like [Farm Name] etc).
- DO NOT instruct, suggest, or ask the user to provide any additional information.

 Business Description: ${businessDescription}
    `,
    about: `
You are an expert business content writer.

Given the business name and description below, write a detailed, connected, and professionally polished “About the Project” section. It must be structured as follows:

- Begin with a strong, engaging paragraph introducing the project by its business name, sector, and the core business opportunity or value proposition.
- In the subsequent paragraphs, describe the business model, operational framework, and the unique aspects of this project/unit. Explain infrastructure, production methods, technology, compliance or regulatory approach, and the company’s commitment to quality, safety, and customer experience.
- Highlight modern systems, sustainability initiatives, waste management, brand positioning, and the potential for expansion, as relevant.
- Touch on marketing strategy, customer segments, community impact, and future growth prospects as appropriate to the sector.
- The writing should be factual, fluent, and persuasive—NOT bullet points, NOT generic. Write in professional, flowing English, ready for use in a business plan or project report.
- Limit to approximately 800-1000 words.
- DO NOT use any placeholders, lists, or output more than one version.
Business Name: ${businessName} Business Description: ${businessDescription}
    `,
    products_services: `
You are an expert project report writer for Indian businesses.

Given the following business description, write a “Product and Services” section suitable for a Detailed Project Report or business plan.

**Follow this structure:**

1. **Introductory Paragraph:**  
   Start with a 4–7 sentence descriptive introduction that:
   - Explains the business’s philosophy, vision, and what sets it apart in the sector.
   - Describes how the business integrates innovation, quality, and customer focus.
   - Summarizes the value it brings to its market or community, going beyond traditional offerings.
   - Sets the context for the detailed product and service offerings.

2. **Products and Services (with Headings):**  
   For each major product or service:
   - Begin with a heading (the product or service name).
   - Follow with a detailed descriptive paragraph (5–8 sentences) that explains:
     - What the product or service is, and who it serves.
     - Key features, benefits, or technology/processes used.
     - Why it is valuable, what differentiates it, and how it fits the needs of the Indian market or target segment.
     - Any value addition, sustainability, or quality practices (if applicable).

**Guidelines:**
- Do NOT use bullet points, lists, or placeholders.
- Write in professional, flowing English as in top-quality Indian bankable DPRs.
- Ensure all text is ready to paste directly into a project report.
- Be thorough—cover all relevant major products, services, and by-products for this type of business.
- Total output should be 700–1200 words for a comprehensive section.

Business Description: ${businessDescription}


    `,
    scope: `
You are an expert project report writer.

Given the following business description, write a comprehensive “Scope of the Project” section suitable for a bankable project report, Detailed Project Report (DPR), or business plan in India.

**Requirements:**
- Write in fluent, formal, and analytical English, using well-structured, flowing paragraphs (no lists or bullet points).
- DO NOT include or suggest any placeholders, variables, or instructions to the reader or client (such as [insert], [specify], etc). Write the narrative as if the project is being described in a generic but highly professional manner, ready for immediate use in any proposal or appraisal.
- The section should be 800–1000 words (if possible) and explain:
  - What the project will do and its operational/production process, infrastructure, technology, and activities.
  - The key products/services and business model in the Indian context.
  - The scale, market focus, and target customer segments (keep generic; do not mention any specific city/state or quantity).
  - Current industry opportunities, market trends, and growth drivers for the business in India.
  - Regulatory, government policy, and compliance requirements (in general terms).
  - Opportunities for expansion, diversification, and value-addition.
  - Economic and social impacts, employment creation, and environmental or sustainability considerations.
  - Typical challenges and how the project’s model or approach addresses them.

- DO NOT use or refer to any placeholders (like [city], [number], [date], etc).
- DO NOT instruct, suggest, or ask the user to provide any additional information.
- DO NOT include explanations of your process or any AI-related disclaimers.
- DO NOT repeat or rephrase the prompt instructions.

Business Description: ${businessDescription}

    `,
    market_potential: `
You are a top-tier business analyst and project report writer with a deep understanding of India’s economic landscape.

Given the business description below, draft a thorough “Market Potential” section suitable for a professional Indian project report.  
**Your output must be ready for direct use in a bankable DPR, business plan, or loan application.**

**Write 900–1200 words in clear, formal, analytical English using detailed, connected paragraphs (do NOT use lists or bullet points).**  
**The writing must be rich in recent data, financial numbers, and explicit year references.**

**Your section MUST:**
- Provide recent market size and value estimates (in INR and USD, if possible), using actual or estimated values for FY{current year}, FY{last year}, and the next 3–5 years.
- State the sector’s recent compound annual growth rate (CAGR) with a credible, current estimate (range if needed, but no placeholders).
- Reference recent trends, demand/supply shifts, key drivers, and consumption data shaping the market.
- Clearly relate growth or changes to recent fiscal years (e.g., “In FY2023-24, India’s market for laundry services was valued at…” or “Pork demand increased by X% from FY2022 to FY2024…”).
- Highlight financial performance and emerging opportunities for revenue, investment, and profitability, citing brand examples or market leaders if relevant.
- Address:
  • Who the main customer segments are and how their spending patterns or market share are evolving.
  • The role of technology, digitalization, e-commerce, and process innovation in expanding market reach and operational efficiency.
  • The impact of government policies, GST, subsidies, schemes, or regulatory support on sector growth.
  • India’s role in global or export markets if significant.
  • Sector challenges and risks (e.g., price sensitivity, disease, competition, trust issues), and strategies or trends to address them.
- Use strong finance/market terminology: “market share,” “revenue,” “annual growth,” “turnover,” “profitability,” “capital investment,” “return on investment (ROI),” “market penetration,” “consumer base,” “organized/unorganized sector,” “urban vs. rural split,” etc.
- Avoid all placeholders, generic filler, or AI instructions—output must be a continuous, polished section, ready to paste.

- DO NOT use or refer to any placeholders (like  [Insert Percentage], [Insert Target Percentage] etc).
- DO NOT instruct, suggest, or ask the user to provide any additional information.
- DO NOT include explanations of your process or any AI-related disclaimers.
- DO NOT repeat or rephrase the prompt instructions.
Business Description: ${businessDescription}


    `,

    swot: `
You are an expert Indian business analyst and project report writer.

Given the following business description, generate a comprehensive, professional SWOT Analysis (Strengths, Weaknesses, Opportunities, Threats) suitable for use in a Detailed Project Report or business plan for India.

Your output must:
- Present the SWOT as four clear sections: Strengths, Weaknesses, Opportunities, Threats (each as a bold heading, with a line break before the next section).
- Under each section, number each point (1, 2, 3, etc). For each point, start with a brief heading (bold, max 1 line), then a paragraph (2–4 sentences) elaborating on the point.
- Write as:  
  Strengths 
  1. [Bold Heading]  
     [Paragraph]  
  2. [Bold Heading]  
     [Paragraph]  
  ...and so on for Weaknesses, Opportunities, Threats.
- Do NOT use bullet points or placeholders.
-DO NOT use asterisk(*) 
- Write in formal, flowing English ready for direct inclusion in a professional project report or DPR.
- Focus on realities, trends, and opportunities relevant to the Indian market and regulatory environment for this sector.

Business Description: ${businessDescription}
`,

    conclusion: `
You are a business content expert. Based on the following business description, write a professional, detailed, and polished conclusion for a project report, business plan, or loan application in the context of India.

The conclusion should:

Summarize the key strengths of the business, such as market potential, industry trends, and competitive advantages.

Discuss the financial and operational viability of the business, including critical financial metrics like the Debt Service Coverage Ratio (DSCR), current ratio, break-even point, and any other relevant financial indicators.

Highlight the social and economic impact of the business, such as job creation, rural development, and any positive societal outcomes.

Provide an overall assessment of the project's feasibility, including technical, social, and commercial aspects.

Conclude with a statement that reinforces the business’s potential to succeed in the current market environment and its capacity for future growth

Business Description: ${businessDescription} average DSCR : ${averageDSCR} Average Current Ratio : ${averageCurrentRatio}  Break even Point : ${BEP}

`,
  };

  try {

     console.log("Prompt Sent to Gemini:", prompts[section]);
    const MODEL_NAME = "gemini-2.5-flash";
    const chatHistory = [
      {
        role: "user",
        parts: [{ text: prompts[section] }],
      },
    ];

    const payload = {
      contents: chatHistory,
      generationConfig: { temperature: 0.7, candidateCount: 1 },
    };

    const apiKey = process.env.GEMINI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
     console.log("Gemini API Response:", result);
    if (
      result.candidates &&
      result.candidates.length > 0 &&
      result.candidates[0].content &&
      result.candidates[0].content.parts &&
      result.candidates[0].content.parts.length > 0
    ) {
      const text = result.candidates[0].content.parts[0].text;
      // Fetch relevant images from Pixabay using either section or businessDescription
      const imageQuery = section.includes("market") ? "market trends" : businessDescription.split(" ").slice(0, 4).join(" ");
      const images = await fetchPixabayImages(imageQuery);
      res.json({ sectionText: text.trim(), images });
    } else {
      res.status(500).json({ error: "Failed to generate section from AI." });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

module.exports = router;
