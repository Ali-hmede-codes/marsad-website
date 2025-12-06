const path = require('path');
const { Client, LocalAuth } = require('whatsapp-web.js');
const QRCode = require('qrcode');

let client;
let lastQr = null;
let isReady = false;
let isAuthenticated = false;
let initError = null;

const ENABLED = (process.env.WHATSAPP_ENABLED || 'true').toLowerCase() === 'true';

function initWhatsApp() {
  if (!ENABLED) return;
  if (client) return;
  client = new Client({
    authStrategy: new LocalAuth({ dataPath: path.join(__dirname, '../.wwebjs_auth') }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--disable-gpu','--no-zygote','--single-process'],
      executablePath: process.env.CHROME_PATH || undefined
    }
  });
  client.on('qr', (qr) => { lastQr = qr; });
  client.on('authenticated', () => { isAuthenticated = true; initError = null; });
  client.on('auth_failure', (msg) => { isAuthenticated = false; initError = String(msg || 'auth_failure'); });
  client.on('ready', () => { isReady = true; initError = null; });
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
      const mine = subs.find((s) => s.id && s.id._serialized === me);
      const amAdmin = !!mine && (!!mine.isAdmin || !!mine.isSuperAdmin || !!mine.isOwner);
      if (amAdmin) {
        out.push({ id: c.id && c.id._serialized ? c.id._serialized : c.id, name: c.name || c.formattedTitle || '' });
      }
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
  }
}

async function onNewReport(categoryName, location) {
  if (!ENABLED) return;
  const msg = `${String(categoryName)} في منطقة : ${String(location)}`;
  await sendToAdminChannels(msg);
}

function getStatus() {
  return { enabled: ENABLED, ready: isReady, authenticated: isAuthenticated, hasQr: !!lastQr, error: initError };
}

async function getQrPng() {
  if (!lastQr) return null;
  const buf = await QRCode.toBuffer(lastQr);
  return buf;
}

module.exports = { initWhatsApp, getAdminChannels, sendToAdminChannels, onNewReport, getStatus, getQrPng };
