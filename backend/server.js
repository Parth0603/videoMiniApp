const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const youtubeDl = require("youtube-dl-exec").default; // Note the .default
const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors(
  {
  origin: "https://videominiapp.netlify.app",
  
  // your frontend URL here
}
));
app.use(bodyParser.json());

app.post("/api/download", async (req, res) => {
  const videoUrl = req.body.url;
  if (!videoUrl) return res.status(400).json({ error: "URL required" });

  try {
    const output = await youtubeDl(videoUrl, {
      format: "best",
      dumpSingleJson: true,
      noWarnings: true,
      noCheckCertificates: true,
      noCallHome: true,
      noPlaylist: true,
      simulate: true,
    });
    if (!output || !output.url) {
      return res.status(500).json({ error: "Failed to fetch download link" });
    }
    res.json({ downloadUrl: output.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch download link" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
