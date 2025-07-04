const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { exec } = require("child_process");
const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors({
  origin: ["http://127.0.0.1:5500", "https://videominiapp.netlify.app"]
}));

app.use(bodyParser.json());

app.post("/api/download", (req, res) => {
  const videoUrl = req.body.url;
  if (!videoUrl) return res.status(400).json({ error: "URL required" });

  // ✅ Use yt-dlp directly (not youtube-dl or youtube-dl-exec)
  exec(`yt-dlp -f best -g "${videoUrl}"`, (err, stdout, stderr) => {
    if (err) {
      console.error("yt-dlp error:", stderr);
      return res.status(500).json({ error: "Failed to fetch download link" });
    }

    const downloadUrl = stdout.trim();
    res.json({ downloadUrl });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
