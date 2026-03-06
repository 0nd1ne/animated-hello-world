const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

const publicDir = path.join(__dirname, 'public');
const indexTemplatePath = path.join(publicDir, 'index.html');
const GREETING_PLACEHOLDER = '__GREETING_NAME__';

let viewCount = 0;
const sseClients = new Set();

const broadcastViews = () => {
  const payload = `data: ${JSON.stringify({ views: viewCount })}\n\n`;

  for (const client of sseClients) {
    client.write(payload);
  }
};

app.use(express.static(publicDir, { index: false }));

function sanitizeName(name) {
  if (typeof name !== 'string') {
    return 'World';
  }

  const sanitized = name.trim().replace(/[^a-zA-Z0-9 .'-]/g, '');
  return sanitized || 'World';
}

app.get('/api/views', (req, res) => {
  res.json({ views: viewCount });
});

app.get('/api/views/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  res.write(`data: ${JSON.stringify({ views: viewCount })}\n\n`);
  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
    res.end();
  });
});

app.get('/', (req, res) => {
  viewCount += 1;
  broadcastViews();

  const name = sanitizeName(req.query.name);
  const indexTemplate = fs.readFileSync(indexTemplatePath, 'utf8');
  const html = indexTemplate.replace(GREETING_PLACEHOLDER, name);

  res.type('html').send(html);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
