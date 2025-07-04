const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Multer setup to accept one file field 'cookiesFile'
const upload = multer({ dest: 'temp/' });

// Helper to validate URL
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

// Handle POST with optional file upload
app.post('/api/download', upload.single('cookiesFile'), (req, res) => {
  const videoUrl = req.body.url;

  if (!videoUrl) {
    return res.status(400).json({ error: 'URL is required' });
  }

  if (!isValidUrl(videoUrl)) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  const args = ['-g', videoUrl];

  // If cookies file uploaded, add --cookies argument
  if (req.file) {
    args.splice(1, 0, '--cookies', path.resolve(req.file.path));
  }

  execFile('yt-dlp', args, { timeout: 15000 }, (err, stdout, stderr) => {
    // Delete temp cookie file after use
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }

    if (err) {
      console.error('yt-dlp error:', stderr || err.message);
      return res.status(500).json({
        error: 'Failed to fetch download link',
        details: stderr || err.message,
      });
    }

    const downloadUrl = stdout.trim();
    if (!downloadUrl || !downloadUrl.startsWith('http')) {
      return res.status(500).json({ error: 'No valid download URL found' });
    }

    res.json({ downloadUrl });
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
