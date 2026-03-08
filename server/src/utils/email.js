const nodemailer = require('nodemailer');

/**
 * Creates and returns a configured nodemailer transporter.
 * Returns null if email credentials are not configured.
 */
const createTransporter = () => {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || emailUser === 'your-email@gmail.com' || !emailPass || emailPass === 'your-app-password') {
        console.error('❌ Email credentials not configured properly!');
        console.error('   Please set EMAIL_USER and EMAIL_PASS in server/.env file');
        return null;
    }

    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: emailUser,
            pass: emailPass,
        },
    });
};

/**
 * Sends a password reset email to the user.
 */
const sendResetEmail = async (user, resetToken) => {
    const transporter = createTransporter();
    if (!transporter) {
        return { success: false, error: 'Email service is not configured.' };
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Password Reset Request',
        html: `
      <h2>Password Reset Request</h2>
      <p>Hello ${user.username},</p>
      <p>You requested to reset your password. Click the link below to reset it:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4169E1; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Best regards,<br>RSCOE Project Management System</p>
    `,
    };

    try {
        console.log(`📧 Attempting to send password reset email to: ${user.email}`);
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Password reset email sent successfully! Message ID: ${info.messageId}`);
        return { success: true };
    } catch (emailError) {
        console.error('❌ Email Error:', emailError.message);
        return { success: false, error: emailError.message };
    }
};

module.exports = { createTransporter, sendResetEmail };
