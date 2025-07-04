const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { exec } = require("child_process");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/api/download", (req, res) => {
  const videoUrl = req.body.url;
  if (!videoUrl) return res.status(400).json({ error: "URL required" });

  // Use yt-dlp to extract the download link
  exec(`yt-dlp -f best -g "${videoUrl}"`, (err, stdout, stderr) => {
    if (err) {
      console.error(stderr);
      return res.status(500).json({ error: "Failed to fetch download link" });
    }
    const downloadUrl = stdout.trim();
    res.json({ downloadUrl });
  });
});

app.listen(3000, () => {
  console.log("Server running on https://videominiapp.onrender.com/");
});




 