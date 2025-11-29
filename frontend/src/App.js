import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [area, setArea] = useState("Pune");
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFetchNews = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`http://localhost:5000/api/news/${area}`);
      setNews(response.data);
    } catch (err) {
      setError("Failed to fetch news. Please try again.");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="app-container">
      <h1 className="title">🏗️ Real Estate & Infrastructure News</h1>

      <div className="controls">
        <select
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="dropdown"
        >
          <option value="Deccan Gymkhana">Deccan Gymkhana</option>
          <option value="Model Colony">Model Colony</option>
          <option value="Swargate">Swargate</option>
          <option value="Tilak Road">Tilak Road</option>
        </select>

        <button onClick={handleFetchNews} disabled={loading} className="btn">
          {loading ? "Loading..." : "Fetch News"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="news-container">
        {news.length > 0 ? (
          news.map((item, index) => (
            <div key={index} className="news-card">
              <h2 className="news-title">{item.title}</h2>
              <p className="news-description">{item.description}</p>
              <p className="news-source">Source: {item.source}</p>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="read-more"
              >
                Read More →
              </a>
            </div>
          ))
        ) : (
          !loading && <p className="no-news">No news loaded yet.</p>
        )}
      </div>
    </div>
  );
}

export default App;
