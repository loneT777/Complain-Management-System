<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class DatabaseBackup extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'backup:database {--clean : Clean old backups}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Backup the database and clean old backups';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('Starting database backup...');

        // Create backup directory if it doesn't exist
        $backupPath = storage_path('app/backups');
        if (!file_exists($backupPath)) {
            mkdir($backupPath, 0755, true);
        }

        // Generate backup filename with timestamp
        $filename = 'backup-' . Carbon::now()->format('Y-m-d_His') . '.sql';
        $filepath = $backupPath . '/' . $filename;

        // Get database configuration
        $dbHost = config('database.connections.mysql.host');
        $dbPort = config('database.connections.mysql.port');
        $dbName = config('database.connections.mysql.database');
        $dbUser = config('database.connections.mysql.username');
        $dbPass = config('database.connections.mysql.password');

        // Try to find mysqldump in common locations
        $mysqldumpPaths = [
            'mysqldump', // In PATH
            'C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe',
            'C:\Program Files\MySQL\MySQL Server 5.7\bin\mysqldump.exe',
            'C:\xampp\mysql\bin\mysqldump.exe',
            'C:\wamp64\bin\mysql\mysql8.0.31\bin\mysqldump.exe',
            'C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysqldump.exe',
        ];

        $mysqldump = null;
        foreach ($mysqldumpPaths as $path) {
            if ($path === 'mysqldump') {
                // Test if in PATH
                exec('where mysqldump 2>nul', $output, $returnVar);
                if ($returnVar === 0 && !empty($output)) {
                    $mysqldump = 'mysqldump';
                    break;
                }
            } elseif (file_exists($path)) {
                $mysqldump = $path;
                break;
            }
        }

        if (!$mysqldump) {
            $this->error('mysqldump not found! Please ensure MySQL is installed.');
            $this->line('');
            $this->line('Common locations checked:');
            foreach ($mysqldumpPaths as $path) {
                $this->line("  - $path");
            }
            $this->line('');
            $this->line('You can add MySQL bin directory to PATH or install XAMPP/Laragon.');
            return Command::FAILURE;
        }

        $this->line("Using: $mysqldump");

        // Create mysqldump command
        $command = sprintf(
            '"%s" --user=%s --password=%s --host=%s --port=%s %s > %s',
            $mysqldump,
            escapeshellarg($dbUser),
            escapeshellarg($dbPass),
            escapeshellarg($dbHost),
            escapeshellarg($dbPort),
            escapeshellarg($dbName),
            escapeshellarg($filepath)
        );

        // Execute backup
        $output = null;
        $returnVar = null;
        exec($command . ' 2>&1', $output, $returnVar);

        if ($returnVar !== 0) {
            $this->error('Database backup failed!');
            if (!empty($output)) {
                $this->line('Error details: ' . implode("\n", $output));
            }
            return Command::FAILURE;
        }

        // Check if file was created and has content
        if (file_exists($filepath) && filesize($filepath) > 0) {
            $size = $this->formatBytes(filesize($filepath));
            $this->info("Database backup completed successfully!");
            $this->info("Backup file: {$filename}");
            $this->info("Size: {$size}");
            $this->info("Location: {$filepath}");

            // Clean old backups if requested
            if ($this->option('clean')) {
                $this->cleanOldBackups($backupPath);
            }

            return Command::SUCCESS;
        } else {
            $this->error('Backup file was not created or is empty!');
            return Command::FAILURE;
        }
    }

    /**
     * Clean old backup files (keep last 30 days)
     *
     * @param string $backupPath
     * @return void
     */
    protected function cleanOldBackups($backupPath)
    {
        $this->info('Cleaning old backups...');

        $files = glob($backupPath . '/backup-*.sql');
        $now = time();
        $daysToKeep = 30;
        $deleted = 0;

        foreach ($files as $file) {
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
}
