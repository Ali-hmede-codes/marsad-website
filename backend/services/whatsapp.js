const path = require('path');
const fs = require('fs');
const { Client, LocalAuth } = require('whatsapp-web.js');
const QRCode = require('qrcode');

let client;
let lastQr = null;
let isReady = false;
let isAuthenticated = false;
let initError = null;
let executablePathUsed = null;
let manualChannelsCache = null;
let templatesCache = null;

const ENABLED = (process.env.WHATSAPP_ENABLED || 'true').toLowerCase() === 'true';

function resolveChromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  if (process.env.PUPPETEER_EXECUTABLE_PATH) return process.env.PUPPETEER_EXECUTABLE_PATH;
  const candidates = [];
  if (process.platform === 'win32') {
    candidates.push(
      'C:/Program Files/Google/Chrome/Application/chrome.exe',
      'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
      process.env.LOCALAPPDATA ? `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe` : ''
    );
  } else if (process.platform === 'darwin') {
    candidates.push('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
  } else {
    candidates.push(
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
      '/snap/bin/chromium'
    );
  }
  for (const p of candidates) {
    if (p && fs.existsSync(p)) return p;
  }
  return undefined;
}

function initWhatsApp() {
  if (!ENABLED) return;
  if (client) return;
  executablePathUsed = resolveChromePath();
  client = new Client({
    authStrategy: new LocalAuth({ dataPath: path.join(__dirname, '../.wwebjs_auth') }),
    puppeteer: {
      headless: 'new',
      args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--disable-gpu','--no-zygote','--single-process'],
      executablePath: executablePathUsed
    }
  });
  client.on('qr', (qr) => { lastQr = qr; });
  client.on('authenticated', () => { isAuthenticated = true; initError = null; lastQr = null; });
  client.on('auth_failure', (msg) => { isAuthenticated = false; initError = String(msg || 'auth_failure'); });
  client.on('ready', () => { isReady = true; initError = null; lastQr = null; });
  client.on('disconnected', (reason) => { isReady = false; initError = String(reason || 'disconnected'); });
  try {
    client.initialize();
  } catch (e) {
    initError = e && e.message ? e.message : 'initialize_failed';
  }
}

async function getAdminChannels() {
  if (!client || !isReady) return [];
  const chats = await client.getChats();
  const me = client.info && client.info.wid && client.info.wid._serialized;
  const out = [];
  for (const c of chats) {
    if (c.isChannel) {
      let subs = [];
      try {
        subs = await c.getSubscribers(200);
      } catch (_) {
        subs = [];
      }
      const mine = subs.find((s) => {
        const sid = (s && (s.id && (s.id._serialized || s.id))) || s && (s.userId || s.wid && s.wid._serialized) || (s && s._serialized) || null;
        return sid === me;
      });
      const amAdmin = !!mine && (!!mine.isAdmin || !!mine.isSuperAdmin || !!mine.isOwner || !!mine.isChannelAdmin);
      if (amAdmin) {
        out.push({ id: c.id && c.id._serialized ? c.id._serialized : c.id, name: c.name || c.formattedTitle || '' });
      }
    }
  }
  return out;
}

async function getAllChannels() {
  if (!client || !isReady) return [];
  const chats = await client.getChats();
  const out = [];
  for (const c of chats) {
    if (c.isChannel) {
      out.push({ id: c.id && c.id._serialized ? c.id._serialized : c.id, name: c.name || c.formattedTitle || '' });
    }
  }
  return out;
}

async function sendToAdminChannels(message) {
  if (!client || !isReady) return;
  const channels = await getAdminChannels();
  for (const ch of channels) {
    try {
      const chat = await client.getChatById(ch.id);
      if (!chat || !chat.isChannel) continue;
      await chat.sendMessage(String(message));
    } catch (_) {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

function getManualChannels() {
  if (Array.isArray(manualChannelsCache)) return manualChannelsCache;
  const dataPath = path.join(__dirname, '../data/whatsapp_channels.json');
  try {
    const raw = fs.readFileSync(dataPath, 'utf-8');
    const parsed = JSON.parse(raw);
    manualChannelsCache = Array.isArray(parsed) ? parsed.map(s => String(s).trim()).filter(Boolean) : [];
    return manualChannelsCache;
  } catch (_) {
    const env = (process.env.WHATSAPP_CHANNEL_IDS || '')
      .split(',')
      .map(s => String(s).trim())
      .filter(Boolean);
    manualChannelsCache = env;
    return manualChannelsCache;
  }
}

async function saveManualChannels(ids) {
  const arr = Array.isArray(ids) ? ids.map(s => String(s).trim()).filter(Boolean) : [];
  const dataPath = path.join(__dirname, '../data/whatsapp_channels.json');
  await fs.promises.mkdir(path.dirname(dataPath), { recursive: true });
  await fs.promises.writeFile(dataPath, JSON.stringify(arr, null, 2), 'utf-8');
  manualChannelsCache = arr;
  return manualChannelsCache;
}

async function sendToManualChannels(message) {
  if (!client || !isReady) return;
  const ids = getManualChannels();
  for (const id of ids) {
    try {
      const chat = await client.getChatById(id);
      if (!chat || !chat.isChannel) continue;
      await chat.sendMessage(String(message));
    } catch (_) {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function onNewReport(categoryName, location, categoryId) {
  if (!ENABLED) return;
  const msg = formatWhatsAppMessage(categoryId != null ? String(categoryId) : null, String(categoryName), String(location));
  const manual = getManualChannels();
  if (manual && manual.length) {
    await sendToManualChannels(msg);
  } else {
    await sendToAdminChannels(msg);
  }
}

function getStatus() {
  return { enabled: ENABLED, ready: isReady, authenticated: isAuthenticated, hasQr: !!lastQr, error: initError, chromePath: executablePathUsed || null };
}

async function getQrPng() {
  if (!lastQr) return null;
  const buf = await QRCode.toBuffer(lastQr);
  return buf;
}

async function getQrDataUrl() {
  if (!lastQr) return null;
  const data = await QRCode.toDataURL(lastQr);
  return data;
}

async function getQrSvg() {
  if (!lastQr) return null;
  const svg = await QRCode.toString(lastQr, { type: 'svg' });
  return svg;
}

function getTemplates() {
  const p = path.join(__dirname, '../data/whatsapp_templates.json');
  try {
    const raw = fs.readFileSync(p, 'utf-8');
    const parsed = JSON.parse(raw);
    templatesCache = parsed && typeof parsed === 'object' ? parsed : {};
    return templatesCache;
  } catch (_) {
    return templatesCache || {};
  }
}

async function saveTemplates(obj) {
  const p = path.join(__dirname, '../data/whatsapp_templates.json');
  await fs.promises.mkdir(path.dirname(p), { recursive: true });
  const toWrite = obj && typeof obj === 'object' ? obj : {};
  await fs.promises.writeFile(p, JSON.stringify(toWrite, null, 2), 'utf-8');
  templatesCache = toWrite;
  return templatesCache;
}

function formatWhatsAppMessage(categoryId, categoryName, location) {
  const t = getTemplates();
  const byId = t.byId && typeof t.byId === 'object' ? t.byId : {};
  const byName = t.byName && typeof t.byName === 'object' ? t.byName : {};
  const d = typeof t.default === 'string' ? t.default : '🔴{name} في منطقة : {location}';
  const keyId = categoryId != null ? String(categoryId) : null;
  const chosen = (keyId && byId[keyId]) || byName[categoryName] || d;
  return String(chosen)
    .replaceAll('{id}', keyId || '')
    .replaceAll('{name}', categoryName || '')
    .replaceAll('{location}', location || '');
}

async function restartClient() {
  try {
    if (client && typeof client.destroy === 'function') {
      await client.destroy();
    }
  } catch (_) {}
  client = null;
  lastQr = null;
  isReady = false;
  isAuthenticated = false;
  initError = null;
  executablePathUsed = null;
  initWhatsApp();
  return getStatus();
}

async function clearAuth() {
  try {
    const authDir = path.join(__dirname, '../.wwebjs_auth');
    if (fs.existsSync(authDir)) {
      await fs.promises.rm(authDir, { recursive: true, force: true });
    }
  } catch (_) {}
  return true;
}

module.exports = { initWhatsApp, getAdminChannels, getAllChannels, sendToAdminChannels, getManualChannels, saveManualChannels, sendToManualChannels, onNewReport, getStatus, getQrPng, getQrDataUrl, getQrSvg, restartClient, clearAuth, getTemplates, saveTemplates };
