# Gmail App Password Setup Guide

Follow these steps to set up Gmail App Password for password reset emails.

## Step-by-Step Instructions

### Step 1: Enable 2-Step Verification
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Look for "2-Step Verification" in the Security section
3. Click on it
4. If not enabled, click "Get Started" and follow the prompts
5. You'll need to verify your phone number

### Step 2: Generate App Password
1. After 2-Step Verification is enabled, go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Or navigate: Google Account → Security → 2-Step Verification → App passwords
2. You may be asked to sign in again
3. Under "Select app", choose "Mail"
4. Under "Select device", choose "Other (Custom name)"
5. Type: "RSCOE Project Management" (or any name you prefer)
6. Click "Generate"
7. **IMPORTANT**: Copy the 16-character password that appears
   - It will look like: `abcd efgh ijkl mnop`
   - Remove the spaces when using it: `abcdefghijklmnop`

### Step 3: Update .env File
1. Open `server/.env` in a text editor
2. Replace the values:
   ```env
   EMAIL_USER=your-actual-gmail@gmail.com
   EMAIL_PASS=abcdefghijklmnop
   FRONTEND_URL=http://localhost:3000
   ```
3. Save the file

### Step 4: Test the Configuration
Run the test script:
```bash
cd server
npm run test-email
```

## Troubleshooting

### "App passwords" option not showing?
- Make sure 2-Step Verification is fully enabled
- Wait a few minutes after enabling 2-Step Verification
- Try refreshing the page

### "Authentication failed" error?
- Make sure you're using the App Password, not your regular Gmail password
- Verify there are no spaces in the App Password in your .env file
- Double-check the email address is correct

### Can't find App Passwords page?
- Direct link: https://myaccount.google.com/apppasswords
- Make sure you're signed in to the correct Google account
- Ensure 2-Step Verification is enabled first

## Quick Links
- [Google Account Security](https://myaccount.google.com/security)
- [App Passwords](https://myaccount.google.com/apppasswords)
- [2-Step Verification Setup](https://support.google.com/accounts/answer/185839)

## Security Note
- App Passwords are more secure than using your regular password
- You can revoke App Passwords at any time from the App Passwords page
- Each App Password is unique and can be used only for the specified app

