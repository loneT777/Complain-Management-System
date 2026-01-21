<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Carbon\Carbon;
use ZipArchive;

class FullBackup extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'backup:full {--clean : Clean old backups}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create full backup including database and storage files';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('Starting full backup process...');
        
        $startTime = microtime(true);

        // Create backup directory if it doesn't exist
        $backupPath = storage_path('app/backups');
        if (!file_exists($backupPath)) {
            mkdir($backupPath, 0755, true);
        }

        // Generate backup filename with timestamp
        $timestamp = Carbon::now()->format('Y-m-d_His');
        $zipFilename = "full-backup-{$timestamp}.zip";
        $zipFilepath = $backupPath . '/' . $zipFilename;

        // Step 1: Backup database
        $this->info('Step 1/3: Backing up database...');
        $this->call('backup:database');

        // Step 2: Create zip archive
        $this->info('Step 2/3: Creating archive with storage files...');
        
        // Check if ZipArchive is available
        if (!class_exists('ZipArchive')) {
            $this->warn('ZipArchive extension not available. Using PowerShell compression...');
            return $this->createBackupWithPowerShell($backupPath, $timestamp);
        }

        $zip = new ZipArchive();
        if ($zip->open($zipFilepath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            $this->error('Failed to create zip file!');
            return Command::FAILURE;
        }

        // Add database backup (latest one)
        $dbBackups = glob($backupPath . '/backup-*.sql');
        if (!empty($dbBackups)) {
            rsort($dbBackups); // Sort by date descending
            $latestDbBackup = $dbBackups[0];
            $zip->addFile($latestDbBackup, 'database/' . basename($latestDbBackup));
            $this->line('✓ Added database backup');
        }

        // Add storage files (uploaded attachments, etc.)
        $storagePath = storage_path('app/public');
        if (is_dir($storagePath)) {
            $this->addDirectoryToZip($zip, $storagePath, 'storage');
            $this->line('✓ Added storage files');
        }

        // Add uploads from public/storage if it exists
        $publicStoragePath = public_path('storage');
        if (is_dir($publicStoragePath) && !is_link($publicStoragePath)) {
            $this->addDirectoryToZip($zip, $publicStoragePath, 'public_storage');
            $this->line('✓ Added public storage files');
        }

        // Add .env file (be careful with this in production!)
        $envFile = base_path('.env');
        if (file_exists($envFile)) {
            $zip->addFile($envFile, 'config/.env');
            $this->line('✓ Added configuration file');
        }

        $zip->close();

        // Step 3: Verify and report
        $this->info('Step 3/3: Verifying backup...');
        
        if (file_exists($zipFilepath)) {
            $size = $this->formatBytes(filesize($zipFilepath));
            $duration = round(microtime(true) - $startTime, 2);
            
            $this->newLine();
            $this->info('════════════════════════════════════════');
            $this->info('✓ Full backup completed successfully!');
            $this->info('════════════════════════════════════════');
            $this->info("Backup file: {$zipFilename}");
            $this->info("Size: {$size}");
            $this->info("Duration: {$duration} seconds");
            $this->info("Location: {$zipFilepath}");
            $this->info('════════════════════════════════════════');

            // Clean old backups if requested
            if ($this->option('clean')) {
                $this->cleanOldBackups($backupPath);
            }

            return Command::SUCCESS;
        } else {
            $this->error('Backup file was not created!');
            return Command::FAILURE;
        }
    }

    /**
     * Add directory to zip archive recursively
     *
     * @param ZipArchive $zip
     * @param string $directory
     * @param string $zipPath
     * @return void
     */
    protected function addDirectoryToZip($zip, $directory, $zipPath = '')
    {
        $files = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($directory),
            \RecursiveIteratorIterator::LEAVES_ONLY
        );

        foreach ($files as $file) {
            if (!$file->isDir()) {
                $filePath = $file->getRealPath();
                $relativePath = substr($filePath, strlen($directory) + 1);
                $zip->addFile($filePath, $zipPath . '/' . $relativePath);
            }
        }
    }

    /**
     * Clean old backup files (keep last 7 full backups)
     *
     * @param string $backupPath
     * @return void
     */
    protected function cleanOldBackups($backupPath)
    {
        $this->newLine();
        $this->info('Cleaning old backups...');

        // Keep last 7 full backups
        $files = glob($backupPath . '/full-backup-*.zip');
        rsort($files); // Sort by date descending
        $deleted = 0;

        foreach (array_slice($files, 7) as $file) {
            if (is_file($file)) {
                unlink($file);
                $deleted++;
                $this->line('Deleted: ' . basename($file));
            }
        }

        // Also clean old database-only backups (keep last 30 days)
        $dbFiles = glob($backupPath . '/backup-*.sql');
        $now = time();
        $daysToKeep = 30;

        foreach ($dbFiles as $file) {
            if (is_file($file)) {
                if ($now - filemtime($file) >= 60 * 60 * 24 * $daysToKeep) {
                    unlink($file);
                    $deleted++;
                    $this->line('Deleted: ' . basename($file));
                }
            }
        }

        $this->info("Cleaned {$deleted} old backup(s).");
    }

    /**
     * Format bytes to human readable format
     *
     * @param int $bytes
     * @return string
     */
    protected function formatBytes($bytes)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }

    /**
     * Create backup using PowerShell compression (fallback method)
     *
     * @param string $backupPath
     * @param string $timestamp
     * @return int
     */
    protected function createBackupWithPowerShell($backupPath, $timestamp)
    {
        $tempDir = $backupPath . '/temp-backup-' . $timestamp;
        $zipFilename = "full-backup-{$timestamp}.zip";
        $zipFilepath = $backupPath . '/' . $zipFilename;

        // Create temp directory structure
        if (!file_exists($tempDir)) {
            mkdir($tempDir, 0755, true);
        }

        $this->line('Creating temporary backup structure...');

        // Copy database backup
        $dbBackups = glob($backupPath . '/backup-*.sql');
        if (!empty($dbBackups)) {
            rsort($dbBackups);
            $latestDbBackup = $dbBackups[0];
            $dbDir = $tempDir . '/database';
            mkdir($dbDir, 0755, true);
            copy($latestDbBackup, $dbDir . '/' . basename($latestDbBackup));
            $this->line('✓ Added database backup');
        }

        // Copy storage files
        $storagePath = storage_path('app/public');
        if (is_dir($storagePath)) {
            $storageDir = $tempDir . '/storage';
            mkdir($storageDir, 0755, true);
            $this->xcopy($storagePath, $storageDir);
            $this->line('✓ Added storage files');
        }

        // Copy .env file
        $envFile = base_path('.env');
        if (file_exists($envFile)) {
            $configDir = $tempDir . '/config';
            mkdir($configDir, 0755, true);
            copy($envFile, $configDir . '/.env');
            $this->line('✓ Added configuration file');
        }

        // Create zip using PowerShell
        $this->info('Compressing files with PowerShell...');
        
        $psCommand = sprintf(
            'Compress-Archive -Path "%s\*" -DestinationPath "%s" -Force',
            $tempDir,
            $zipFilepath
        );

        exec("powershell -Command \"$psCommand\"", $output, $returnVar);

        // Clean up temp directory
        $this->deleteDirectory($tempDir);

        if ($returnVar === 0 && file_exists($zipFilepath)) {
            $size = $this->formatBytes(filesize($zipFilepath));
            
            $this->newLine();
            $this->info('════════════════════════════════════════');
            $this->info('✓ Full backup completed successfully!');
            $this->info('════════════════════════════════════════');
            $this->info("Backup file: {$zipFilename}");
            $this->info("Size: {$size}");
            $this->info("Location: {$zipFilepath}");
            $this->info('════════════════════════════════════════');

            // Clean old backups if requested
            if ($this->option('clean')) {
                $this->cleanOldBackups(dirname($zipFilepath));
            }

            return Command::SUCCESS;
        } else {
            $this->error('Failed to create backup archive!');
            return Command::FAILURE;
        }
    }

    /**
     * Recursively copy directory
     *
     * @param string $src
     * @param string $dst
     * @return void
     */
    protected function xcopy($src, $dst)
    {
        $dir = opendir($src);
        if (!file_exists($dst)) {
            mkdir($dst, 0755, true);
        }

        while (($file = readdir($dir)) !== false) {
            if (($file != '.') && ($file != '..')) {
                if (is_dir($src . '/' . $file)) {
                    $this->xcopy($src . '/' . $file, $dst . '/' . $file);
                } else {
                    copy($src . '/' . $file, $dst . '/' . $file);
                }
            }
        }
        closedir($dir);
    }

    /**
     * Recursively delete directory
     *
     * @param string $dir
     * @return void
     */
    protected function deleteDirectory($dir)
    {
        if (!file_exists($dir)) {
            return;
        }

        $files = array_diff(scandir($dir), ['.', '..']);
        foreach ($files as $file) {
            $path = $dir . '/' . $file;
            if (is_dir($path)) {
                $this->deleteDirectory($path);
            } else {
                unlink($path);
            }
        }
        rmdir($dir);
    }
}
