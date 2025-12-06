const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const whatsapp = require('../services/whatsapp');

router.use(verifyToken, isAdmin);

router.get('/status', (req, res) => {
  res.json(whatsapp.getStatus());
});

router.get('/channels', async (req, res) => {
  const channels = await whatsapp.getAdminChannels();
  res.json(channels);
});

router.get('/channels/all', async (req, res) => {
  const channels = await whatsapp.getAllChannels();
  res.json(channels);
});

router.get('/channels/manual', async (req, res) => {
  const ids = whatsapp.getManualChannels();
  res.json(ids);
});

router.put('/channels/manual', async (req, res) => {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids.map((s) => String(s).trim()).filter(Boolean) : [];
    const saved = await whatsapp.saveManualChannels(ids);
    res.json(saved);
  } catch (e) {
    res.status(400).json({ error: 'تعذر حفظ القنوات اليدوية' });
  }
});

router.get('/qr.png', async (req, res) => {
  const buf = await whatsapp.getQrPng();
  if (!buf) {
    res.status(404).json({ error: 'QR غير متاح' });
    return;
  }
  res.set('Content-Type', 'image/png');
  res.send(buf);
});

router.get('/qr.svg', async (req, res) => {
  const svg = await whatsapp.getQrSvg();
  if (!svg) {
    res.status(404).json({ error: 'QR غير متاح' });
    return;
  }
  res.set('Content-Type', 'image/svg+xml');
  res.send(svg);
});

router.get('/qr-data', async (req, res) => {
  const dataUrl = await whatsapp.getQrDataUrl();
  if (!dataUrl) {
    res.status(404).json({ error: 'QR غير متاح' });
    return;
  }
  res.json({ dataUrl });
});

router.post('/restart', async (req, res) => {
  const st = await whatsapp.restartClient();
  res.json(st);
});

router.post('/auth/clear', async (req, res) => {
  await whatsapp.clearAuth();
  const st = await whatsapp.restartClient();
  res.json(st);
});

module.exports = router;
