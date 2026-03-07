// Test script to verify email configuration
// Run with: node test-email.js

require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('📧 Testing Email Configuration...\n');

  // Check if environment variables are set
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || emailUser === 'your-email@gmail.com') {
    console.error('❌ ERROR: EMAIL_USER not configured in .env file');
    console.log('   Please set EMAIL_USER in server/.env\n');
    return;
  }

  if (!emailPass || emailPass === 'your-app-password') {
    console.error('❌ ERROR: EMAIL_PASS not configured in .env file');
    console.log('   Please set EMAIL_PASS in server/.env\n');
    return;
  }

  console.log('✅ Environment variables found');
  console.log(`   Email: ${emailUser}\n`);

  // Create transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });

  // Test connection
  try {
    console.log('🔌 Testing email connection...');
    await transporter.verify();
    console.log('✅ Email server connection successful!\n');

    // Send test email
    console.log('📤 Sending test email...');
    const testEmail = {
      from: emailUser,
      to: emailUser, // Send to yourself
      subject: 'Test Email - Password Reset System',
      html: `
        <h2>Email Configuration Test</h2>
        <p>If you received this email, your email configuration is working correctly!</p>
        <p>Your password reset functionality should now work properly.</p>
        <p>Best regards,<br>RSCOE Project Management System</p>
      `
    };

    const info = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Check your inbox at: ${emailUser}\n`);
    console.log('🎉 Email configuration is working correctly!\n');

  } catch (error) {
    console.error('❌ Email test failed:\n');
    
    if (error.code === 'EAUTH') {
      console.error('   Authentication failed. Please check:');
      console.error('   - Your email address is correct');
      console.error('   - You are using an App Password (not your regular password)');
      console.error('   - 2-Step Verification is enabled on your Google Account\n');
    } else if (error.code === 'ECONNECTION') {
      console.error('   Connection failed. Please check:');
      console.error('   - Your internet connection');
      console.error('   - Firewall settings\n');
    } else {
      console.error(`   Error: ${error.message}\n`);
    }
    
    console.log('💡 Troubleshooting tips:');
    console.log('   1. For Gmail: Use App Password, not regular password');
    console.log('   2. Enable "Less secure app access" if using non-Gmail');
    console.log('   3. Check your .env file is in the server/ directory');
    console.log('   4. Restart the server after changing .env file\n');
  }
}

testEmail();

