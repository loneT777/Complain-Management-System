# Forgot Password - Quick Test Guide

## 🚀 Quick Start

### 1. Configure Email (Choose One Option)

#### Option A: Gmail (Production)
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-gmail-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@gmail.com
MAIL_FROM_NAME="Leave Management System"
FRONTEND_URL=http://localhost:3000
```

#### Option B: Mailtrap (Testing - Recommended for Development)
1. Sign up at https://mailtrap.io (Free)
2. Get credentials from your inbox
3. Update `.env`:
```env
MAIL_MAILER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your-mailtrap-username
MAIL_PASSWORD=your-mailtrap-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@leavesystem.com
MAIL_FROM_NAME="Leave Management System"
FRONTEND_URL=http://localhost:3000
```

### 2. Clear Config Cache
```bash
php artisan config:clear
php artisan cache:clear
```

### 3. Start the Application

**Terminal 1 - Laravel Backend:**
```bash
php artisan serve
```

**Terminal 2 - React Frontend:**
```bash
cd react
npm run dev
```

## 🧪 Testing the Flow

### Step 1: Access Login Page
- Open: http://localhost:3000/login
- You should see "Forgot password?" link below the password field

### Step 2: Click Forgot Password
- Click the "Forgot password?" link
- Should redirect to: http://localhost:3000/forgot-password

### Step 3: Request Reset Link
- Enter a valid user email from your database
- Click "SEND RESET LINK"
- Check your email inbox (or Mailtrap inbox)

### Step 4: Open Email
- You'll receive an email with subject "Password Reset Request"
- Click the "Reset Password" button (or copy the link)

### Step 5: Reset Password
- You'll be redirected to the reset password page
- Enter your email (should be pre-filled)
- Enter new password (minimum 8 characters)
- Confirm password
- Click "RESET PASSWORD"

### Step 6: Login with New Password
- After successful reset, you'll be redirected to login
- Login with your new password

## 🔍 Testing Checklist

- [ ] Forgot password link appears on login page
- [ ] Can navigate to forgot password page
- [ ] Email validation works (invalid email shows error)
- [ ] Email is sent successfully
- [ ] Email contains correct reset link
- [ ] Reset link opens the reset password page
- [ ] Token and email are pre-filled from URL
- [ ] Password validation works (min 8 chars)
- [ ] Password confirmation validation works
- [ ] Can successfully reset password
- [ ] Can login with new password
- [ ] Old password no longer works
- [ ] Expired token shows error (after 24 hours)
- [ ] Invalid token shows error

## 🐛 Troubleshooting

### Email Not Sending

**Check Laravel logs:**
```bash
tail -f storage/logs/laravel.log
```

**Test email manually:**
```bash
php artisan tinker
```
```php
Mail::raw('Test', function($msg) { 
    $msg->to('test@example.com')->subject('Test'); 
});
```

### Common Issues

1. **"Connection refused"** - Check MAIL_HOST and MAIL_PORT
2. **"Authentication failed"** - Check MAIL_USERNAME and MAIL_PASSWORD
3. **"Reset link not working"** - Verify FRONTEND_URL in .env
4. **"Token invalid"** - Make sure migration was run

### Database Check

Check if password reset was recorded:
```bash
php artisan tinker
```
```php
DB::table('password_resets')->get();
```

## 📧 Sample Test Email

If using Mailtrap:
1. Go to https://mailtrap.io
2. Login and check your inbox
3. You'll see the email without actually sending it

## 🔐 Security Notes

- Tokens expire after 24 hours
- Used tokens are deleted
- All user sessions are revoked after reset
- Email existence is not revealed to prevent enumeration
- Passwords must be minimum 8 characters

## API Endpoints

### Forgot Password
```
POST /api/forgot-password
Body: { "email": "user@example.com" }
```

### Reset Password
```
POST /api/reset-password
Body: { 
    "email": "user@example.com",
    "token": "reset-token-from-email",
    "password": "newpassword123",
    "password_confirmation": "newpassword123"
}
```

## Need Help?

Check the comprehensive guide: `PASSWORD_RESET_SETUP.md`
