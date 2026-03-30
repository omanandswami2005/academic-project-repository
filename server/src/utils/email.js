const { Resend } = require('resend');

// Lazy-init Resend client — only fails at send time if key is missing
let resendClient = null;
const getResend = () => {
    if (!resendClient) {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey || apiKey === 'your-resend-api-key') {
            return null;
        }
        resendClient = new Resend(apiKey);
    }
    return resendClient;
};

/**
 * Sends a password reset email via Resend (https://resend.com — free tier: 3,000 emails/month).
 * FROM address: use 'onboarding@resend.dev' for testing (sandbox, only sends to your Resend signup email).
 * For production: verify your domain in Resend dashboard and set FROM_EMAIL env var.
 */
const sendResetEmail = async (user, resetToken) => {
    const resend = getResend();
    if (!resend) {
        console.error('❌ Email not configured: set RESEND_API_KEY in server/.env');
        console.error('   Sign up free at https://resend.com → API Keys → Create Key');
        return { success: false, error: 'Email service is not configured.' };
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';

    try {
        console.log(`📧 Sending password reset email to: ${user.email}`);
        const { data, error } = await resend.emails.send({
            from: `APRS System <${fromEmail}>`,
            to: [user.email],
            subject: 'Password Reset Request — RSCOE APRS',
            html: `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="background: linear-gradient(135deg, #4169E1, #6c63ff); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">RSCOE APRS</h1>
    <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0;">Academic Project Repository System</p>
  </div>
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #eee;">
    <h2 style="color: #4169E1;">Password Reset Request</h2>
    <p>Hello <strong>${user.username}</strong>,</p>
    <p>We received a request to reset your password. Click the button below to set a new password:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background-color: #4169E1; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Reset My Password</a>
    </div>
    <p style="color: #666; font-size: 14px;">This link expires in <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email.</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    <p style="color: #999; font-size: 12px; text-align: center;">RSCOE Project Management System &bull; Sinhgad College of Engineering</p>
  </div>
</body>
</html>
            `,
        });

        if (error) {
            console.error('❌ Resend error:', error);
            return { success: false, error: error.message };
        }

        console.log(`✅ Password reset email sent! ID: ${data.id}`);
        return { success: true };
    } catch (err) {
        console.error('❌ Email send failed:', err.message);
        return { success: false, error: err.message };
    }
};

module.exports = { sendResetEmail };
