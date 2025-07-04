const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { execFile } = require("child_process");
const PORT = process.env.PORT || 3000;

const app = express();

// Allow all origins for now; you can restrict to your frontend URLs
app.use(cors());

// Parse JSON bodies
app.use(bodyParser.json());

// Simple URL validation
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

app.post("/api/download", (req, res) => {
  const videoUrl = req.body.url;
  if (!videoUrl) {
    return res.status(400).json({ error: "URL is required" });
  }
  if (!isValidUrl(videoUrl)) {
    return res.status(400).json({ error: "Invalid URL" });
  }

  // Run yt-dlp without -f best to let it pick best available formats automatically
  // Use execFile to avoid shell injection risks
  execFile(
    "yt-dlp",
    ["-g", videoUrl],
    { timeout: 15000 }, // 15 seconds timeout
    (err, stdout, stderr) => {
      if (err) {
        console.error("yt-dlp error:", stderr || err.message);
        return res.status(500).json({
          error: "Failed to fetch download link",
          details: stderr || err.message,
        });
      }
      const downloadUrl = stdout.trim();
      if (!downloadUrl) {
        return res.status(500).json({ error: "No download URL found" });
      }
      res.json({ downloadUrl });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
