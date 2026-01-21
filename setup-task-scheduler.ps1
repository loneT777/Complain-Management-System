# Windows Task Scheduler - Setup Script
# This script creates scheduled tasks for automatic backups
# File: setup-task-scheduler.ps1

# Requires Administrator privileges
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    pause
    exit
}

$projectPath = "C:\Users\DELL\Documents\GitHub\Complain-Management-System"
$scriptPath = "$projectPath\run-backup.ps1"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setting up Backup Task Scheduler" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Task 1: Daily Database Backup at 2:00 AM
Write-Host "Creating Task 1: Daily Database Backup..." -ForegroundColor Green

$taskName1 = "ComplaintSystem-DatabaseBackup"
$description1 = "Daily database backup for Complaint Management System"
$action1 = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`" -BackupType database"
$trigger1 = New-ScheduledTaskTrigger -Daily -At 2:00AM
$settings1 = New-ScheduledTaskSettingsSet -StartWhenAvailable -RunOnlyIfNetworkAvailable

# Remove existing task if exists
$existingTask1 = Get-ScheduledTask -TaskName $taskName1 -ErrorAction SilentlyContinue
if ($existingTask1) {
    Unregister-ScheduledTask -TaskName $taskName1 -Confirm:$false
    Write-Host "Removed existing task: $taskName1" -ForegroundColor Yellow
}

# Create new task
Register-ScheduledTask -TaskName $taskName1 -Action $action1 -Trigger $trigger1 -Settings $settings1 -Description $description1
Write-Host "✓ Task created: $taskName1" -ForegroundColor Green
Write-Host "  Schedule: Daily at 2:00 AM" -ForegroundColor Gray
Write-Host ""

# Task 2: Weekly Full Backup (Sundays at 3:00 AM)
Write-Host "Creating Task 2: Weekly Full Backup..." -ForegroundColor Green

$taskName2 = "ComplaintSystem-FullBackup"
$description2 = "Weekly full backup (database + files) for Complaint Management System"
$action2 = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`" -BackupType full"
$trigger2 = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At 3:00AM
$settings2 = New-ScheduledTaskSettingsSet -StartWhenAvailable -RunOnlyIfNetworkAvailable

# Remove existing task if exists
$existingTask2 = Get-ScheduledTask -TaskName $taskName2 -ErrorAction SilentlyContinue
if ($existingTask2) {
    Unregister-ScheduledTask -TaskName $taskName2 -Confirm:$false
    Write-Host "Removed existing task: $taskName2" -ForegroundColor Yellow
}

# Create new task
Register-ScheduledTask -TaskName $taskName2 -Action $action2 -Trigger $trigger2 -Settings $settings2 -Description $description2
Write-Host "✓ Task created: $taskName2" -ForegroundColor Green
Write-Host "  Schedule: Weekly on Sundays at 3:00 AM" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tasks created:" -ForegroundColor Yellow
Write-Host "1. $taskName1 - Daily at 2:00 AM" -ForegroundColor White
Write-Host "2. $taskName2 - Weekly (Sundays) at 3:00 AM" -ForegroundColor White
Write-Host ""
Write-Host "You can manage these tasks in:" -ForegroundColor Yellow
Write-Host "Task Scheduler -> Task Scheduler Library" -ForegroundColor White
Write-Host ""
Write-Host "To test the backup manually, run:" -ForegroundColor Yellow
Write-Host "  .\run-backup.ps1 -BackupType database" -ForegroundColor White
Write-Host "  .\run-backup.ps1 -BackupType full" -ForegroundColor White
Write-Host ""

pause
