# Password Reset Email Configuration Guide

## Overview
This document explains how to configure email for the password reset functionality in the Leave Management System.

## Email Configuration Steps

### 1. Update .env File

Add or update the following environment variables in your `.env` file:

```env
# Mail Configuration
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@gmail.com
MAIL_FROM_NAME="${APP_NAME}"

# Frontend URL (for reset link)
FRONTEND_URL=http://localhost:3000
```

### 2. Gmail Configuration (If using Gmail)

If you're using Gmail, you need to create an **App Password**:

1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification (if not already enabled)
4. Go to "App passwords"
5. Generate a new app password for "Mail"
6. Use this generated password as your `MAIL_PASSWORD`

**Never use your actual Gmail password!**

### 3. Alternative Email Providers

#### Using Mailtrap (for testing)
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your-mailtrap-username
MAIL_PASSWORD=your-mailtrap-password
MAIL_ENCRYPTION=tls
```

#### Using SendGrid
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=your-sendgrid-api-key
MAIL_ENCRYPTION=tls
```

#### Using Mailgun
```env
MAIL_MAILER=mailgun
MAILGUN_DOMAIN=your-domain.mailgun.org
MAILGUN_SECRET=your-mailgun-api-key
```

### 4. Run Migration

Run the password reset migration:

```bash
php artisan migrate
```

This will create the `password_resets` table.

### 5. Testing Email Configuration

Test if email is working:

```bash
php artisan tinker
```

Then run:

```php
Mail::raw('Test email', function($message) {
    $message->to('recipient@example.com')
            ->subject('Test Email');
});
```

Check if the email was sent successfully.

### 6. Frontend Configuration

Ensure the React app is configured properly:

1. The `VITE_API_URL` should point to your Laravel API
2. The forgot password link in login page should route to `/forgot-password`
3. The reset password page should handle the token from the URL

## Usage Flow

1. **User clicks "Forgot password?" on login page**
   - Redirected to `/forgot-password`

2. **User enters email address**
   - POST request to `/api/forgot-password`
   - System generates reset token and sends email

3. **User receives email**
   - Email contains reset link with token and email
   - Link format: `http://localhost:3000/reset-password?token=XXX&email=user@example.com`

4. **User clicks reset link**
   - Redirected to `/reset-password` page
   - Token and email extracted from URL

5. **User enters new password**
   - POST request to `/api/reset-password` with token, email, and new password
   - Password is updated and tokens are cleared

6. **User logs in with new password**

## Security Features

- ✅ Tokens are hashed in the database
- ✅ Tokens expire after 24 hours
- ✅ Used tokens are deleted after password reset
- ✅ All user sessions are revoked after password reset
- ✅ Email existence is not revealed for security
- ✅ Password must be at least 8 characters
- ✅ Password confirmation required

## Troubleshooting

### Email not sending

1. Check `.env` configuration
2. Verify mail credentials
3. Check Laravel logs: `storage/logs/laravel.log`
4. Test with Mailtrap for debugging
5. Ensure port 587 is not blocked by firewall

### Token invalid/expired

1. Check if migration was run
2. Verify token hasn't expired (24 hours)
3. Make sure token is correctly passed in URL
4. Check database `password_resets` table

### Reset link not working

1. Verify `FRONTEND_URL` in `.env`
2. Check React routes are properly configured
3. Ensure CORS is configured in Laravel

## Files Modified

### Frontend
- `react/src/views/auth/ForgotPassword.jsx` - Forgot password page
- `react/src/views/auth/ResetPassword.jsx` - Reset password page
- `react/src/views/auth/login.jsx` - Added forgot password link
- `react/src/routes/MainRoutes.jsx` - Added routes

### Backend
- `app/Http/Controllers/Auth/PasswordResetController.php` - Controller
- `routes/api.php` - API routes
- `database/migrations/2026_01_13_000001_create_password_resets_table.php` - Migration
- `resources/views/emails/password-reset.blade.php` - Email template

## Production Considerations

1. **Use a proper email service** (SendGrid, Mailgun, AWS SES)
2. **Configure SPF and DKIM** records for your domain
3. **Use HTTPS** for all URLs
4. **Set proper `FRONTEND_URL`** to your production domain
5. **Monitor email delivery** rates and bounces
6. **Keep mail credentials secure** - never commit to version control
7. **Consider rate limiting** on password reset endpoint
8. **Add CAPTCHA** to prevent abuse
