# Email Backup Configuration Guide

## Setup Email Notifications for Backups

Your backup system will now send backup files to: **thasneemmohamed802@gmail.com**

## Step 1: Configure Email Settings

Open your `.env` file and add these email settings:

### Option 1: Using Gmail (Recommended for Testing)

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-gmail@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-gmail@gmail.com
MAIL_FROM_NAME="Complaint System"

# Backup notification email
BACKUP_EMAIL_TO=thasneemmohamed802@gmail.com
```

#### How to Get Gmail App Password:

1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** (left sidebar)
3. Enable **2-Step Verification** (if not already enabled)
4. Search for **App passwords**
5. Click **App passwords**
6. Select **Mail** and **Windows Computer**
7. Click **Generate**
8. Copy the 16-character password (it will look like: `xxxx xxxx xxxx xxxx`)
9. Use this password in `MAIL_PASSWORD` (remove spaces)

---

### Option 2: Using Mailtrap (For Testing Without Real Emails)

```env
MAIL_MAILER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your-mailtrap-username
MAIL_PASSWORD=your-mailtrap-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@complaintmanagement.com
MAIL_FROM_NAME="${APP_NAME}"

# Backup notification email
BACKUP_EMAIL_TO=thasneemmohamed802@gmail.com
```

Get Mailtrap credentials:
1. Go to https://mailtrap.io/
2. Sign up for free
3. Go to **Inboxes** → **SMTP Settings**
4. Copy username and password

---

### Option 3: Using Office 365 / Outlook

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp-mail.outlook.com
MAIL_PORT=587
MAIL_USERNAME=your-email@outlook.com
MAIL_PASSWORD=your-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@outlook.com
MAIL_FROM_NAME="${APP_NAME}"

# Backup notification email
BACKUP_EMAIL_TO=thasneemmohamed802@gmail.com
```

---

## Step 2: Test Email Configuration

### Test 1: Basic Email Test

```powershell
php artisan tinker
```

Then run:
```php
Mail::raw('Test email from backup system', function($message) {
    $message->to('thasneemmohamed802@gmail.com')
            ->subject('Test Email');
});
exit
```

### Test 2: Test Database Backup with Email

```powershell
php artisan backup:database --clean
```

Check your email: `thasneemmohamed802@gmail.com`

### Test 3: Test Full Backup with Email

```powershell
php artisan backup:full --clean
```

---

## What You'll Receive in Email:

### Email Contains:
- ✓ Backup type (Database or Full Backup)
- ✓ Status (Success or Failed)
- ✓ Date & time of backup
- ✓ Filename
- ✓ File size
- ✓ File location on server
- ✓ **Backup file attached** (if less than 20MB)

### For Large Files:
If backup file is larger than 20MB, you'll receive the email with:
- All backup details
- Note explaining file is too large
- File location path on server

---

## Troubleshooting

### Error: "Failed to authenticate"
- Check username and password
- For Gmail: Make sure you're using App Password, not regular password
- Make sure 2-Step Verification is enabled

### Error: "Connection refused"
- Check MAIL_HOST and MAIL_PORT
- Check firewall settings
- Try different port (465 for SSL, 587 for TLS)

### Error: "Could not instantiate mail function"
- Make sure PHP has mail extensions enabled
- Check php.ini for mail configuration

### Email Not Received
- Check spam/junk folder
- Verify BACKUP_EMAIL_TO is correct
- Check storage/logs/laravel.log for errors
- Try with Mailtrap first to test

---

## Change Email Recipient

To change who receives backup emails, update in `.env`:

```env
BACKUP_EMAIL_TO=newemail@example.com
```

Or send to multiple emails:
```env
BACKUP_EMAIL_TO=email1@example.com,email2@example.com
```

Then update `app/Console/Commands/DatabaseBackup.php` and `FullBackup.php`:

```php
// Change from:
Mail::to($emailTo)->send(...)

// To:
Mail::to(explode(',', $emailTo))->send(...)
```

---

## Automated Schedule

Your Task Scheduler will automatically send emails:
- **Daily at 2:00 AM** - Database backup to your email
- **Weekly (Sundays) at 3:00 AM** - Full backup to your email

---

## Security Notes

⚠️ **Important:**
- Never commit `.env` file to Git
- Keep email credentials secure
- Use App Passwords for Gmail (not your main password)
- Consider using dedicated email account for system notifications
- Large attachments may be blocked by some email providers

---

## Quick Start Commands

```powershell
# After configuring .env file:

# 1. Clear config cache
php artisan config:clear

# 2. Test database backup with email
php artisan backup:database

# 3. Check if email was sent (check logs)
Get-Content storage\logs\laravel.log -Tail 50

# 4. Test full backup with email
php artisan backup:full
```

---

**Need Help?** Check `storage/logs/laravel.log` for detailed error messages.
