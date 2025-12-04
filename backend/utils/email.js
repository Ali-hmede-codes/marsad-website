const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.sendVerificationEmail = async (email, token) => {
    const verificationUrl = `${process.env.FRONTEND_URL}/login.html?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'تأكيد البريد الإلكتروني - مرصد لبنان',
        html: `
            <div dir="rtl" style="text-align: right; font-family: Arial, sans-serif;">
                <h1>تأكيد البريد الإلكتروني</h1>
                <p>مرحباً،</p>
                <p>الرجاء النقر على الرابط أدناه لتفعيل حسابك:</p>
                <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">تفعيل الحساب</a>
                <p>أو انسخ الرابط التالي:</p>
                <p>${verificationUrl}</p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};
