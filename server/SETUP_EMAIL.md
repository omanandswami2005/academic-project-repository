# Email Setup Guide

This guide will help you configure email functionality for password reset features.

## Quick Setup

1. **Create `.env` file** (if not already created)
   - Location: `server/.env`
   - Copy from template or use the provided `.env` file

2. **Configure Email Credentials**
   - Open `server/.env`
   - Fill in `EMAIL_USER` and `EMAIL_PASS`

3. **Test Email Configuration**
   ```bash
   cd server
   node test-email.js
   ```

## Gmail Setup (Recommended)

### Step 1: Enable 2-Step Verification
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable "2-Step Verification" if not already enabled

### Step 2: Generate App Password
1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" and "Other (Custom name)"
3. Enter "RSCOE Project Management" as the name
4. Click "Generate"
5. Copy the 16-character password (no spaces)

### Step 3: Update .env File
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx  # The 16-character app password (remove spaces)
FRONTEND_URL=http://localhost:3000
```

## Other Email Providers

### Outlook/Hotmail
Update the nodemailer configuration in `server/Index.js`:

```javascript
const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

### Yahoo Mail
```javascript
const transporter = nodemailer.createTransport({
  service: 'yahoo',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

### Custom SMTP
```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.yourdomain.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## Testing

Run the test script:
```bash
cd server
node test-email.js
```

This will:
- ✅ Verify environment variables are set
- ✅ Test email server connection
- ✅ Send a test email to your configured address

## Troubleshooting

### "Authentication failed" error
- **Gmail**: Make sure you're using an App Password, not your regular password
- **Other providers**: Check if "Less secure app access" needs to be enabled

### "Connection failed" error
- Check your internet connection
- Verify firewall isn't blocking the connection
- For corporate networks, check if SMTP ports are blocked

### Email not received
- Check spam/junk folder
- Verify the email address in `.env` is correct
- Check email server logs in console

### Environment variables not loading
- Make sure `.env` file is in `server/` directory
- Restart the server after changing `.env` file
- Verify `require('dotenv').config()` is at the top of `Index.js`

## Production Setup

For production, consider using:
- **SendGrid** - Reliable email service with free tier
- **AWS SES** - Scalable email service
- **Mailgun** - Developer-friendly email API
- **Postmark** - Transactional email service

Update the nodemailer configuration accordingly for these services.

## Security Notes

- ⚠️ Never commit `.env` file to version control
- ⚠️ Use App Passwords, not regular passwords
- ⚠️ Rotate passwords regularly
- ⚠️ Use environment-specific credentials for production

