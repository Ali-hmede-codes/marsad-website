const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const https = require('https');
require('dotenv').config();
const whatsapp = require('./services/whatsapp');

const app = express();
app.set('trust proxy', true);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

app.disable('x-powered-by');
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://127.0.0.1:3000,http://localhost:3000').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
    origin: function (origin, cb) {
        if (!origin) return cb(null, true);
        if (allowedOrigins.includes(origin)) return cb(null, true);
        return cb(null, false);
    }
}));
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Permissions-Policy', 'geolocation=(self), microphone=(), camera=()');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https: http:;");
    next();
});
app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Block non-dist JS files from being served directly
app.use((req, res, next) => {
    if (req.method === 'GET' && req.path.startsWith('/js/')) {
        const allowed = req.path.startsWith('/js/dist/') && req.path.endsWith('.min.js');
        if (!allowed) {
            return res.status(403).send('Forbidden');
        }
    }
    next();
});

app.get('/index.html', (req, res) => res.redirect(301, '/'));
app.get('/index', (req, res) => res.redirect(301, '/'));
app.get('/login.html', (req, res) => res.redirect(301, '/login'));
app.get('/register.html', (req, res) => res.redirect(301, '/register'));
app.get('/admin.html', (req, res) => res.redirect(301, '/admin'));

app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../frontend/index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, '../frontend/login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, '../frontend/register.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, '../frontend/admin.html')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/whatsapp', require('./routes/whatsapp'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
});

// Serve index.html for all non-API routes (SPA support)
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/')) {
        res.status(404).send('Not Found');
    } else {
        res.status(404).json({ error: 'المسار غير موجود' });
    }
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const ENABLE_HTTPS = (process.env.ENABLE_HTTPS || 'false').toLowerCase() === 'true';
const keyPath = process.env.SSL_KEY_PATH;
const certPath = process.env.SSL_CERT_PATH;
const caPath = process.env.SSL_CA_PATH;
if (ENABLE_HTTPS && keyPath && certPath && fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    const options = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
    };
    if (caPath && fs.existsSync(caPath)) options.ca = fs.readFileSync(caPath);
    https.createServer(options, app).listen(PORT, HOST, () => {
        console.log(`✓ HTTPS server running on port ${PORT}`);
        console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    });
} else {
    app.listen(PORT, HOST, () => {
        console.log(`✓ Server running on port ${PORT}`);
        console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    });
}

whatsapp.initWhatsApp();

const rateMap = new Map();
function createRateLimiter(limit, windowMs) {
    return (req, res, next) => {
        const ip = (req.ip || req.connection.remoteAddress || '0');
        const key = ip + '|' + req.method + '|' + req.originalUrl;
        const now = Date.now();
        const entry = rateMap.get(key) || { count: 0, start: now };
        if (now - entry.start > windowMs) {
            entry.count = 0;
            entry.start = now;
        }
        entry.count++;
        rateMap.set(key, entry);
        if (entry.count > limit) {
            res.status(429).json({ error: 'تم تجاوز الحد المسموح للطلبات' });
            return;
        }
        next();
    };
}
const authLimiter = createRateLimiter(5, 60 * 1000);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
const reportLimiter = createRateLimiter(60, 60 * 1000);
app.use('/api/reports', reportLimiter);
