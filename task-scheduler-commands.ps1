# Task Scheduler Management Commands
# Complaint Management System - Backup Tasks

# ============================================
# CHECK STATUS
# ============================================

# View all backup tasks
Get-ScheduledTask -TaskName "ComplaintSystem*" | Select-Object TaskName, State, @{Label="NextRun";Expression={(Get-ScheduledTaskInfo -TaskName $_.TaskName).NextRunTime}} | Format-Table -AutoSize

# ============================================
# DISABLE TASKS
# ============================================

# Disable database backup
Disable-ScheduledTask -TaskName "ComplaintSystem-DatabaseBackup"

# Disable full backup (if exists)
Disable-ScheduledTask -TaskName "ComplaintSystem-FullBackup"

# Disable all backup tasks
Get-ScheduledTask -TaskName "ComplaintSystem*" | Disable-ScheduledTask

# ============================================
# ENABLE TASKS
# ============================================

# Enable database backup
Enable-ScheduledTask -TaskName "ComplaintSystem-DatabaseBackup"

# Enable full backup (if exists)
Enable-ScheduledTask -TaskName "ComplaintSystem-FullBackup"

# Enable all backup tasks
Get-ScheduledTask -TaskName "ComplaintSystem*" | Enable-ScheduledTask

# ============================================
# RUN TASKS MANUALLY
# ============================================

# Run database backup now
Start-ScheduledTask -TaskName "ComplaintSystem-DatabaseBackup"

# Run full backup now
Start-ScheduledTask -TaskName "ComplaintSystem-FullBackup"

# ============================================
# DELETE TASKS
# ============================================

# Delete database backup task
Unregister-ScheduledTask -TaskName "ComplaintSystem-DatabaseBackup" -Confirm:$false

# Delete full backup task
Unregister-ScheduledTask -TaskName "ComplaintSystem-FullBackup" -Confirm:$false

# Delete all backup tasks
Get-ScheduledTask -TaskName "ComplaintSystem*" | Unregister-ScheduledTask -Confirm:$false

# ============================================
# VIEW TASK HISTORY
# ============================================

# View last run result
Get-ScheduledTaskInfo -TaskName "ComplaintSystem-DatabaseBackup" | Select-Object LastRunTime, LastTaskResult, NextRunTime

# Show task details
Get-ScheduledTask -TaskName "ComplaintSystem-DatabaseBackup" | Get-ScheduledTaskInfo | Format-List

# ============================================
# NOTES
# ============================================
# Task State Values:
#   - Ready    = Task is enabled and scheduled
#   - Disabled = Task is disabled, won't run automatically
#   - Running  = Task is currently executing

# Last Task Result Codes:
#   - 0         = Success
#   - 1         = Failed
#   - 0x41301  = Task is currently running
