const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = 5000;

app.use(cors()); // Allow frontend access

const SONAR_API_KEY = process.env.SONAR_API_KEY;

app.get("/api/news/:area", async (req, res) => {
  const area = req.params.area;
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
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SONAR_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      console.error("⚠️ Unexpected response:", data);
      return res.status(500).json({ error: "Invalid response from Sonar API" });
    }

    const content = data.choices[0].message.content;
    const newsArray = JSON.parse(content);
    res.json(newsArray);
  } catch (error) {
    console.error("❌ Something went wrong:", error);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
