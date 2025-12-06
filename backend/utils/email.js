const nodemailer = require('nodemailer');

function createTransporter() {
    if (process.env.SMTP_HOST) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587', 10),
            secure: (process.env.SMTP_SECURE || '').toString().toLowerCase() === 'true' || (process.env.SMTP_PORT === '465'),
            auth: {
                user: process.env.SMTP_USER || process.env.EMAIL_USER,
                pass: process.env.SMTP_PASS || process.env.EMAIL_PASS
            }
        });
    }

    return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
}

const transporter = createTransporter();

exports.sendVerificationEmail = async (email, token) => {
    const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
    const siteName = process.env.SITE_NAME || 'الرادار961';
    const verificationUrl = `${frontend}/login?token=${token}`;

    const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER || process.env.EMAIL_USER,
        to: email,
        subject: `تأكيد البريد الإلكتروني - ${siteName}`,
        html: `
            <div dir="rtl" style="text-align: right; font-family: Arial, sans-serif;">
                <h1>${siteName}</h1>
                <p>مرحباً،</p>
                <p>الرجاء النقر على الرابط أدناه لتفعيل حسابك:</p>
                <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">تفعيل الحساب</a>
                <p>أو انسخ الرابط التالي:</p>
                <p>${verificationUrl}</p>
                <p style="margin-top: 16px; color: #555;">هذا البريد مرسل من ${siteName} (${new URL(frontend).hostname})</p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};
