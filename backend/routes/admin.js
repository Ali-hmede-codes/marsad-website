const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');

router.use(verifyToken, isAdmin);
router.get('/status', (req, res) => {
    res.json({ ok: true, user: { user_id: req.user.user_id, email: req.user.email, is_admin: req.user.is_admin } });
});

module.exports = router;
