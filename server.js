const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Helper to read JSON from /data
function readJson(filename) {
  const filePath = path.join(__dirname, 'data', filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

// API endpoints to serve JSON data
app.get('/api/test', (req, res) => {
  res.json(readJson('test.json'));
});

app.get('/api/theme', (req, res) => {
  res.json(readJson('theme.json'));
});

app.get('/api/lang', (req, res) => {
  res.json(readJson('lang.json'));
});

// Serve static frontend assets
app.use(express.static(path.join(__dirname, 'public')));

// SPA fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
}); 