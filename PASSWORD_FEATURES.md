# Password Management Features

This document describes the password management features that have been implemented in the project management system.

## Features Implemented

### 1. Display User Name After Login
- The user's name is now displayed in the navigation bar after successful login
- The name is retrieved from localStorage and shown as "Welcome, [Username]"
- Location: `src/components/DashboardLayout.jsx`

### 2. Password Update Functionality
- Users can update their password from the Profile page
- Requires current password verification
- Includes password strength validation (minimum 6 characters)
- Password confirmation field to prevent typos
- Location: `src/pages/ProfilePage.jsx`
- Backend endpoint: `POST /update-password`

### 3. Forgot Password Flow
- Users can request a password reset via email
- "Forgot Password?" button on the login page redirects to forgot password page
- Location: `src/pages/ForgotPassword.jsx`
- Backend endpoint: `POST /forgot-password`

### 4. Reset Password via Email Link
- Users receive an email with a reset link when they request password reset
- Clicking the link redirects to a reset password page
- Token-based authentication (tokens expire after 1 hour)
- Location: `src/pages/ResetPassword.jsx`
- Backend endpoint: `POST /reset-password/:token`

## Email Configuration

To enable email functionality for password resets, you need to configure email credentials:

1. Create a `.env` file in the `server` directory
2. Add the following variables:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   FRONTEND_URL=http://localhost:3000
   ```
   - `FRONTEND_URL`: The base URL of your frontend application (used in password reset emails)

### Gmail Setup Instructions

1. Go to your Google Account settings
2. Navigate to Security > 2-Step Verification
3. Generate an "App Password" (not your regular password)
4. Use this app password in the `EMAIL_PASS` variable

### Other Email Providers

For other email providers (Outlook, Yahoo, etc.), you may need to modify the nodemailer configuration in `server/Index.js` to use different service settings or SMTP configuration.

## Backend API Endpoints

### Update Password (Authenticated)
- **Endpoint**: `POST /update-password`
- **Body**: 
  ```json
  {
    "userId": "user_id",
    "currentPassword": "current_password",
    "newPassword": "new_password"
  }
  ```
- **Response**: Success message

### Forgot Password
- **Endpoint**: `POST /forgot-password`
- **Body**: 
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response**: Success message (always returns success for security, even if email doesn't exist)

### Reset Password (with token)
- **Endpoint**: `POST /reset-password/:token`
- **Body**: 
  ```json
  {
    "password": "new_password"
  }
  ```
- **Response**: Success message

## Database Changes

The User model has been updated to include:
- `resetPasswordToken`: Stores hashed reset token
- `resetPasswordExpires`: Stores token expiration timestamp

## Frontend Routes

New routes added to `src/App.jsx`:
- `/forgot-password` - Forgot password page
- `/reset-password/:token` - Reset password page (accessed via email link)

## Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt before storage
2. **Token Security**: Reset tokens are hashed before storage in database
3. **Token Expiration**: Reset tokens expire after 1 hour
4. **Email Privacy**: Forgot password endpoint doesn't reveal if email exists
5. **Password Validation**: Minimum 6 characters required

## Testing

To test the features:

1. **Display Name**: Login and check the navigation bar
2. **Update Password**: 
   - Go to Profile page
   - Click "Change Password"
   - Enter current and new passwords
3. **Forgot Password**:
   - Click "Forgot Password?" on login page
   - Enter email address
   - Check email for reset link
4. **Reset Password**:
   - Click the link in the email
   - Enter new password
   - Login with new password

## Notes

- Make sure MongoDB is running before testing
- Email functionality requires proper `.env` configuration
- The reset link URL in emails uses `http://localhost:3000` - update this for production
- For production, consider using environment-specific email services (SendGrid, AWS SES, etc.)

