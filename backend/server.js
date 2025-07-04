const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { execFile } = require("child_process");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Simple URL validator
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Main route to fetch download URL
app.post("/api/download", (req, res) => {
  const videoUrl = req.body.url;

  if (!videoUrl) {
    return res.status(400).json({ error: "URL is required" });
  }

  if (!isValidUrl(videoUrl)) {
    return res.status(400).json({ error: "Invalid URL" });
  }

  const args = ["-g"];

  // Optional: add cookies for platforms like Instagram
  if (videoUrl.includes("instagram.com")) {
    const cookiePath = path.resolve(__dirname, "cookies", "ig_cookies.txt");
    args.push("--cookies", cookiePath);
  }

  args.push(videoUrl);

  execFile("yt-dlp", args, { timeout: 15000 }, (err, stdout, stderr) => {
    if (err) {
      console.error("yt-dlp error:", stderr || err.message);
      return res.status(500).json({
        error: "Failed to fetch download link",
        details: stderr || err.message,
      });
    }

    const downloadUrl = stdout.trim();
    if (!downloadUrl || !downloadUrl.startsWith("http")) {
      return res.status(500).json({ error: "No valid download URL found" });
    }

    res.json({ downloadUrl });
  });
});

// Server start
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
