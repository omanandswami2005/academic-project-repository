# Fix: Email Not Sending Issue

## Problem
The forgot password feature works, but emails are not being sent because the `.env` file has placeholder values.

## Solution

### Step 1: Edit the .env File
1. Open `server/.env` in a text editor (Notepad, VS Code, etc.)
2. Replace the placeholder values with your actual credentials:

**Before (Current):**
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:3000
```

**After (Your actual values):**
```env
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASS=your-actual-app-password-16-chars
FRONTEND_URL=http://localhost:3000
```

### Step 2: Get Gmail App Password
If you haven't already:
1. Go to https://myaccount.google.com/apppasswords
2. Generate an App Password for "Mail"
3. Copy the 16-character password (remove spaces)
4. Paste it in `EMAIL_PASS` in your `.env` file

### Step 3: Test Email Configuration
After updating `.env`, test it:
```bash
cd server
npm run test-email
```

This will:
- ✅ Verify your credentials are correct
- ✅ Test the email connection
- ✅ Send a test email to your inbox

### Step 4: Restart the Server
After updating `.env`, restart your server:
1. Stop the current server (Ctrl+C)
2. Start it again: `npm start`

### Step 5: Try Forgot Password Again
1. Go to the login page
2. Click "Forgot Password?"
3. Enter your email
4. Check your inbox for the reset link

## Check Server Console
After trying forgot password, check your server console. You should now see:
- ✅ "Password reset email sent successfully!" if working
- ❌ Error messages if there's still an issue

## Common Issues

### "Authentication failed" error
- Make sure you're using App Password, not regular password
- Verify no spaces in the App Password
- Check email address is correct

### "Email credentials not configured"
- Make sure `.env` file is in `server/` directory
- Verify you saved the `.env` file after editing
- Restart the server after changing `.env`

### Still not receiving emails?
- Check spam/junk folder
- Verify the email address in your account matches
- Check server console for detailed error messages

