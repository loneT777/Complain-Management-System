# Database Backup Task Scheduler
# This PowerShell script runs Laravel backup commands
# File: run-backup.ps1

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('database', 'full')]
    [string]$BackupType = 'database'
)

# Change to project directory
$projectPath = "C:\Users\DELL\Documents\GitHub\Complain-Management-System"
Set-Location $projectPath

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Complaint Management System - Backup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Backup Type: $BackupType" -ForegroundColor Yellow
Write-Host "Started at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

try {
    # Run the appropriate backup command
    if ($BackupType -eq 'full') {
        Write-Host "Running full backup (database + files)..." -ForegroundColor Green
        php artisan backup:full --clean
    } else {
        Write-Host "Running database backup..." -ForegroundColor Green
        php artisan backup:database --clean
    }

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Backup completed at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan

    # Log to file
    $logPath = "$projectPath\storage\logs\backup.log"
    $logMessage = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $BackupType backup completed successfully"
    Add-Content -Path $logPath -Value $logMessage

    exit 0
} catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "Backup failed!" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red

    # Log error
    $logPath = "$projectPath\storage\logs\backup.log"
    $logMessage = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $BackupType backup FAILED: $_"
    Add-Content -Path $logPath -Value $logMessage

    exit 1
}
