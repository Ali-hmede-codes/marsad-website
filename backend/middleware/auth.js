const jwt = require('jsonwebtoken');

// Verify JWT token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader ? authHeader.split(' ')[1] : null; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'لا يوجد رمز مصادقة' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'رمز المصادقة غير صالح' });
    }
};

// Check if user is publisher
const isPublisher = (req, res, next) => {
    if (!req.user.is_publisher && !req.user.is_admin) {
        return res.status(403).json({ error: 'يجب أن تكون ناشراً لإنشاء تقرير' });
    }
    next();
};

// Check if user is admin
const isAdmin = (req, res, next) => {
    if (!req.user.is_admin) {
        return res.status(403).json({ error: 'يجب أن تكون مديراً للوصول إلى هذا المورد' });
    }
    next();
};

module.exports = { verifyToken, isPublisher, isAdmin };
