/*
 * Simple helper to immediately show today's reports on the map
 * - Serves the frontend over http://localhost:<PORT>/
 * - Verifies backend availability and warms up today's reports
 * - Opens the default browser to the map page
 *
 * Usage:
 *   node scripts/refresh-map-now.js
 *
 * Env vars:
 *   PORT     (default 8080)
 *   API_URL  (default http://localhost:3000/api)
 */

const express = require('express');
const path = require('path');
const axios = require('axios');
const { exec } = require('child_process');

const PORT = process.env.PORT || 8080;
const BACKEND_API = process.env.API_URL || 'http://localhost:3000/api';

async function warmTodayReports() {
  try {
    const res = await axios.get(`${BACKEND_API}/reports/today`, { timeout: 5000 });
    const count = Array.isArray(res.data) ? res.data.length : 0;
    console.log(`Fetched today's reports from backend: ${count}`);
    return { ok: true, count };
  } catch (err) {
    console.warn(`Backend fetch failed: ${err.message}`);
    return { ok: false, error: err.message };
  }
}

function openBrowser(url) {
  if (process.platform === 'win32') {
    exec(`start "" "${url}"`);
  } else if (process.platform === 'darwin') {
    exec(`open "${url}"`);
  } else {
    exec(`xdg-open "${url}"`);
  }
}

async function main() {
  const app = express();
  const rootDir = path.resolve(__dirname, '..');
  const frontendDir = path.join(rootDir, 'frontend');

  app.use(express.static(frontendDir));

  app.get('/', (_req, res) => {
    res.sendFile(path.join(frontendDir, 'index.html'));
  });

  app.get('/health', async (_req, res) => {
    const result = await warmTodayReports();
    if (result.ok) {
      res.json({ ok: true, backend: BACKEND_API, count: result.count });
    } else {
      res.status(500).json({ ok: false, backend: BACKEND_API, error: result.error });
    }
  });

  app.listen(PORT, async () => {
    const url = `http://localhost:${PORT}/index.html`;
    console.log(`Frontend served at ${url}`);
    await warmTodayReports();
    openBrowser(url);
  });
}

main().catch((e) => {
  console.error('Failed to start refresh-map-now:', e);
  process.exit(1);
});

