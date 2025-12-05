const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Verify JWT token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader ? authHeader.split(' ')[1] : null;

    if (!token) {
        return res.status(401).json({ error: 'لا يوجد رمز مصادقة' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            issuer: process.env.JWT_ISSUER || 'radar961',
            audience: process.env.JWT_AUDIENCE || 'radar961-app'
        });
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'رمز المصادقة غير صالح' });
    }
};

// Check if user is publisher
const isPublisher = async (req, res, next) => {
    try {
        const [rows] = await db.query(
            'SELECT is_publisher, is_admin, is_active, is_verified FROM users WHERE user_id = ?',
            [req.user.user_id]
        );
        if (!rows || rows.length === 0) {
            return res.status(403).json({ error: 'غير مصرح لك' });
        }
        const u = rows[0];
        if (!u.is_active) {
            return res.status(403).json({ error: 'الحساب غير نشط' });
        }
        const isAdminNow = !!u.is_admin;
        const isPublisherNow = !!u.is_publisher;
        const isVerified = !!u.is_verified;
        if (!(isAdminNow || (isPublisherNow && isVerified))) {
            return res.status(403).json({ error: 'يجب أن تكون ناشراً ومفعل الحساب لإنشاء تقرير' });
        }
        next();
    } catch (error) {
        return res.status(500).json({ error: 'خطأ في الخادم' });
    }
};

// Check if user is admin (verify against database)
const isAdmin = async (req, res, next) => {
    try {
        const [rows] = await db.query('SELECT is_admin FROM users WHERE user_id = ? AND is_active = TRUE', [req.user.user_id]);
        if (!rows || rows.length === 0) {
            return res.status(403).json({ error: 'غير مصرح لك' });
        }
        const isAdminNow = !!rows[0].is_admin;
        if (!isAdminNow) {
            return res.status(403).json({ error: 'يجب أن تكون مديراً للوصول إلى هذا المورد' });
        }
        next();
    } catch (error) {
        return res.status(500).json({ error: 'خطأ في الخادم' });
    }
};

module.exports = { verifyToken, isPublisher, isAdmin };
