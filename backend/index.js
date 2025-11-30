const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = 5000;

app.use(cors()); // Allow frontend access

const SONAR_API_KEY = process.env.SONAR_API_KEY;

app.get("/api/news/:area", async (req, res) => {
  const area = req.params.area;

  // <-- USE THE FULL PROMPT HERE (don't replace with a placeholder) -->
  const prompt = `
Provide the 4 most recent and verified news updates related to real estate and infrastructure in ${area}. Focus strictly on factual updates such as:
- New residential or commercial project launches
- Large-scale investments or acquisitions by builders or developers
- Infrastructure developments (roads, metro, bridges, industrial parks, smart city projects)
- Government or private partnerships impacting local real estate

Exclude general market trends, blog posts, or speculative commentary.

Return the response in this exact JSON format (no extra text):
[
  {
    "title": "<Official news headline>",
    "description": "<Concise 25–40 word summary suitable for card UI; include key project names, companies, or locations>",
    "source": "<Verified publication or news outlet>",
    "link": "<Direct URL to the full article>"
  },
  {
    "title": "...",
    "description": "...",
    "source": "...",
    "link": "..."
  }
]

Make sure:
- The news is from the past 30 days only.
- Every link is a valid working URL to a credible news site.
- Each description is objective, informative, and grammatically correct.
- Always return exactly 4 results in the array.
- Focus on relevance and authenticity, matching the tone of a professional real estate intelligence platform like BhuviSx.
`;

  try {
    // call Sonar
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SONAR_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [{ role: "user", content: prompt }]
      })
    });

    // read raw text (model often wraps output)
    const raw = await response.text();

    // quick debug save (optional)
    try {
      if (!fs.existsSync("./data")) fs.mkdirSync("./data");
      fs.writeFileSync(`./data/sonar_raw_${safeAreaName(area)}.txt`, raw);
    } catch (e) { /* ignore write errors */ }

    // Try to extract JSON array
    let content = raw;

    // Strip code fences like ```json ... ``` or ```
    const fenceMatch = content.match(/```(?:json)?\n([\s\S]*?)```/i);
    if (fenceMatch && fenceMatch[1]) content = fenceMatch[1].trim();

    // If content does not start with [ try to find first array substring
    if (!content.trim().startsWith("[")) {
      const arrMatch = content.match(/\[[\s\S]*\]/);
      if (arrMatch) content = arrMatch[0];
    }

    // Remove single backticks if wrapped
    if (/^`[\s\S]*`$/.test(content.trim())) {
      content = content.trim().replace(/^`|`$/g, "");
    }

    // Final parse
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      console.error("Failed to parse JSON after cleanup. Raw response saved.");
      return res.status(500).json({
        error: "Failed to parse Sonar JSON. Raw saved to backend/data for inspection.",
      });
    }

    // Basic validation (array of up to 4; you can change to require 4)
    if (!Array.isArray(parsed)) {
      return res.status(500).json({ error: "Parsed response is not an array" });
    }

    return res.json(parsed);
  } catch (error) {
    console.error("❌ Something went wrong:", error);
    return res.status(500).json({ error: "Failed to fetch news" });
  }
});


app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
