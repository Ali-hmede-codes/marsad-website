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

router.get('/qr.png', async (req, res) => {
  const buf = await whatsapp.getQrPng();
  if (!buf) {
    res.status(404).json({ error: 'QR غير متاح' });
    return;
  }
  res.set('Content-Type', 'image/png');
  res.send(buf);
});

module.exports = router;
