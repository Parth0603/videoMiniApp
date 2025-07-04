const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { youtubeDl } = require("youtube-dl-exec");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/api/download", async (req, res) => {
  const videoUrl = req.body.url;
  if (!videoUrl) return res.status(400).json({ error: "URL required" });

  try {
    // Use youtube-dl-exec to get best format direct URL
    const info = await youtubeDl(videoUrl, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
      youtubeSkipDashManifest: true,
      format: "best",
    });

    // 'url' property holds the direct download link
    if (!info || !info.url) {
      return res.status(500).json({ error: "Could not extract download URL" });
    }

    res.json({ downloadUrl: info.url });
  } catch (error) {
    console.error("youtube-dl-exec error:", error);
    res.status(500).json({ error: "Failed to fetch download link" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
