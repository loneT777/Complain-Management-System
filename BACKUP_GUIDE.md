# Backup System - User Guide
# Complaint Management System

## Overview
This backup system provides automated database and file backups for your Complaint Management System.

## Components

### 1. Laravel Artisan Commands
- `backup:database` - Backs up MySQL database only
- `backup:full` - Backs up database + storage files (attachments, uploads)

### 2. PowerShell Scripts
- `run-backup.ps1` - Executes backup commands
- `setup-task-scheduler.ps1` - Creates Windows scheduled tasks

## Installation & Setup

### Step 1: Test Manual Backup

Open PowerShell in the project directory and test the commands:

```powershell
# Test database backup
php artisan backup:database

# Test full backup
php artisan backup:full --clean
```

Backups will be saved to: `storage/app/backups/`

### Step 2: Setup Windows Task Scheduler

1. **Open PowerShell as Administrator**
   - Right-click on PowerShell
   - Select "Run as Administrator"

2. **Navigate to project directory**
   ```powershell
   cd C:\Users\DELL\Documents\GitHub\Complain-Management-System
   ```

3. **Run the setup script**
   ```powershell
   .\setup-task-scheduler.ps1
   ```

This will create two scheduled tasks:
- **Daily Database Backup** - Runs every day at 2:00 AM
- **Weekly Full Backup** - Runs every Sunday at 3:00 AM

### Step 3: Verify Tasks

1. Open **Task Scheduler** (Press Win + R, type `taskschd.msc`)
2. Navigate to **Task Scheduler Library**
3. Look for:
   - `ComplaintSystem-DatabaseBackup`
   - `ComplaintSystem-FullBackup`

## Manual Backup Commands

### Using PowerShell Script

```powershell
# Database backup only
.\run-backup.ps1 -BackupType database

# Full backup (database + files)
.\run-backup.ps1 -BackupType full
```

### Using Laravel Artisan

```powershell
# Database backup
php artisan backup:database

# Database backup with cleanup
php artisan backup:database --clean

# Full backup
php artisan backup:full

# Full backup with cleanup
php artisan backup:full --clean
```

## Backup Schedule

| Backup Type | Frequency | Time | Retention |
|-------------|-----------|------|-----------|
| Database | Daily | 2:00 AM | 30 days |
| Full Backup | Weekly | Sunday 3:00 AM | 7 backups |

## Backup Locations

All backups are stored in:
```
storage/app/backups/
├── backup-2026-01-19_140530.sql      (Database only)
├── backup-2026-01-18_140530.sql      (Database only)
├── full-backup-2026-01-19_030015.zip (Full backup)
└── full-backup-2026-01-12_030015.zip (Full backup)
```

## What's Included in Backups

### Database Backup (`backup:database`)
- Complete MySQL database dump
- All tables, data, and structure
- Saved as `.sql` file

### Full Backup (`backup:full`)
- Database backup
- Storage files (`storage/app/public/`)
- Uploaded attachments and files
- Public storage files
- Configuration file (`.env`)
- Saved as `.zip` archive

## Backup Cleanup

The `--clean` option automatically removes old backups:
- Database backups older than 30 days
- Keeps only last 7 full backups

## Logs

Backup logs are stored in:
```
storage/logs/backup.log
```

View recent logs:
```powershell
Get-Content storage\logs\backup.log -Tail 50
```

## Troubleshooting

### mysqldump not found
If you get "mysqldump is not recognized" error:

1. Find MySQL bin directory (usually `C:\Program Files\MySQL\MySQL Server X.X\bin`)
2. Add to System PATH:
   - Open System Properties → Advanced → Environment Variables
   - Edit "Path" variable
   - Add MySQL bin directory
   - Restart PowerShell

### Permission Denied
- Run PowerShell as Administrator
- Check that `storage/app/backups` directory has write permissions

### Task Scheduler Not Running
1. Open Task Scheduler
2. Right-click the task → Properties
3. Check "Run whether user is logged on or not"
4. Enter your Windows password
5. Check "Run with highest privileges"

### Testing Task Manually
1. Open Task Scheduler
2. Right-click the task → Run
3. Check `storage/logs/backup.log` for results

## Restoring from Backup

### Restore Database

```powershell
# Method 1: Using MySQL command
mysql -u root -p complaint_management < storage\app\backups\backup-2026-01-19_140530.sql

# Method 2: Using phpMyAdmin
# 1. Open phpMyAdmin
# 2. Select database
# 3. Go to Import tab
# 4. Choose the .sql file
# 5. Click Go
```

### Restore Files

```powershell
# Extract the zip file
Expand-Archive -Path storage\app\backups\full-backup-2026-01-19_030015.zip -DestinationPath restore-temp\

# Copy storage files back
Copy-Item restore-temp\storage\* -Destination storage\app\public\ -Recurse -Force

# Restore database from the extracted SQL file
mysql -u root -p complaint_management < restore-temp\database\backup-2026-01-19_030015.sql
```

## Customization

### Change Backup Schedule

Edit `app/Console/Kernel.php`:

```php
// Change database backup time
$schedule->command('backup:database --clean')
    ->dailyAt('04:00'); // Change to 4:00 AM

// Change full backup day/time
$schedule->command('backup:full --clean')
    ->weekly()
    ->wednesdays() // Change to Wednesday
    ->at('05:00'); // Change to 5:00 AM
```

### Change Retention Period

Edit backup command files:
- `app/Console/Commands/DatabaseBackup.php` - Line ~97 ($daysToKeep)
- `app/Console/Commands/FullBackup.php` - Line ~124 (array_slice value)

## Best Practices

1. **Test Regularly** - Test restore process monthly
2. **Monitor Logs** - Check backup logs weekly
3. **Off-site Backups** - Copy backups to cloud storage/external drive
4. **Verify Backups** - Ensure backup files are not corrupted
5. **Disk Space** - Monitor available disk space for backups

## Support & Maintenance

For issues or questions:
1. Check logs in `storage/logs/backup.log`
2. Verify MySQL credentials in `.env` file
3. Ensure storage directory has write permissions
4. Check Task Scheduler event logs

---
**Last Updated:** January 19, 2026
**Version:** 1.0
