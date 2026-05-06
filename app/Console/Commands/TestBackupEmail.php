<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use App\Mail\BackupNotification;

class TestBackupEmail extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'backup:test-email';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test backup email notification';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('Testing email configuration...');
        $this->newLine();

        // Get email configuration
        $emailTo = env('BACKUP_EMAIL_TO', 'thasneemmohamed802@gmail.com');
        $mailer = env('MAIL_MAILER', 'smtp');
        $host = env('MAIL_HOST', 'not configured');
        $username = env('MAIL_USERNAME', 'not configured');

        $this->info("Mail Configuration:");
        $this->line("  Mailer: {$mailer}");
        $this->line("  Host: {$host}");
        $this->line("  Username: {$username}");
        $this->line("  Send to: {$emailTo}");
        $this->newLine();

        try {
            $this->info('Sending test email...');

            // Create a test backup notification
            $testFilename = 'test-backup-' . date('Y-m-d_His') . '.sql';
            $testFilepath = storage_path('app/backups/test-file.sql');
            $testFilesize = '1.5 MB';

            Mail::to($emailTo)->send(
                new BackupNotification(
                    'Test Email',
                    $testFilename,
                    $testFilepath,
                    $testFilesize,
                    'success',
                    'This is a test email to verify backup notifications are working correctly.'
                )
            );

            $this->newLine();
            $this->info('════════════════════════════════════════');
            $this->info('✓ Email sent successfully!');
            $this->info('════════════════════════════════════════');
            $this->info("Check inbox: {$emailTo}");
            $this->info('Check spam folder if not received within 1-2 minutes');
            $this->info('════════════════════════════════════════');

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->newLine();
            $this->error('════════════════════════════════════════');
            $this->error('✗ Failed to send email!');
            $this->error('════════════════════════════════════════');
            $this->error('Error: ' . $e->getMessage());
            $this->newLine();
            $this->warn('Troubleshooting:');
            $this->line('1. Check your .env file email configuration');
            $this->line('2. For Gmail: Use App Password (not regular password)');
            $this->line('3. Make sure 2-Step Verification is enabled');
            $this->line('4. Check storage/logs/laravel.log for details');
            $this->line('5. Try with Mailtrap.io for testing first');
            $this->newLine();

            return Command::FAILURE;
        }
    }
}
