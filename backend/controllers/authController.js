const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/database');
const { isValidEmail, sanitizeInput } = require('../utils/validation');
const { sendVerificationEmail } = require('../utils/email');

// Register new user
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ error: 'البريد الإلكتروني غير صالح' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
        }

        // Check if user exists
        const [existing] = await db.query('SELECT user_id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'البريد الإلكتروني مستخدم بالفعل' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Insert user
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, verification_token, token_expires, is_verified) VALUES (?, ?, ?, ?, ?, FALSE)',
            [sanitizeInput(name), email, hashedPassword, verificationToken, tokenExpires]
        );

        // Send verification email
        try {
            await sendVerificationEmail(email, verificationToken);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Don't fail registration, but warn user
        }

        res.status(201).json({
            message: 'تم التسجيل بنجاح. الرجاء التحقق من بريدك الإلكتروني لتفعيل الحساب.',
            user_id: result.insertId
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'خطأ في الخادم' });
    }
};

// Verify email
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: 'رمز التحقق مطلوب' });
        }

        // Find user with token and valid expiry
        const [users] = await db.query(
            'SELECT user_id FROM users WHERE verification_token = ? AND token_expires > NOW()',
            [token]
        );

        if (users.length === 0) {
            return res.status(400).json({ error: 'رمز التحقق غير صالح أو منتهي الصلاحية' });
        }

        // Update user
        await db.query(
            'UPDATE users SET is_verified = TRUE, verification_token = NULL, token_expires = NULL WHERE user_id = ?',
            [users[0].user_id]
        );

        res.json({ message: 'تم تفعيل الحساب بنجاح' });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: 'خطأ في الخادم' });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبان' });
        }

        // Find user
        const [users] = await db.query(
            'SELECT * FROM users WHERE email = ? AND is_active = TRUE',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
        }

        const user = users[0];

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
        }

        // Check verification
        if (!user.is_verified) {
            return res.status(403).json({ error: 'الرجاء تفعيل حسابك عبر البريد الإلكتروني أولاً' });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                user_id: user.user_id,
                email: user.email,
                is_admin: user.is_admin,
                is_publisher: user.is_publisher
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '7d',
                issuer: process.env.JWT_ISSUER || 'radar961',
                audience: process.env.JWT_AUDIENCE || 'radar961-app'
            }
        );

        res.json({
            message: 'تم تسجيل الدخول بنجاح',
            token,
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                is_admin: user.is_admin,
                is_publisher: user.is_publisher,
                user_pic: user.user_pic
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'خطأ في الخادم' });
    }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT user_id, name, email, user_pic, is_admin, is_publisher, reports_count FROM users WHERE user_id = ?',
            [req.user.user_id]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'المستخدم غير موجود' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'خطأ في الخادم' });
    }
};

