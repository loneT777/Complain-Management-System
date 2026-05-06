<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class BackupNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $backupType;
    public $filename;
    public $filepath;
    public $filesize;
    public $status;
    public $errorMessage;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($backupType, $filename, $filepath, $filesize, $status = 'success', $errorMessage = null)
    {
        $this->backupType = $backupType;
        $this->filename = $filename;
        $this->filepath = $filepath;
        $this->filesize = $filesize;
        $this->status = $status;
        $this->errorMessage = $errorMessage;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        $subject = $this->status === 'success' 
            ? "✓ Backup Successful - {$this->backupType}" 
            : "✗ Backup Failed - {$this->backupType}";

        $mail = $this->subject($subject)
                     ->view('emails.backup-notification');

        // Attach backup file if successful and file exists
        if ($this->status === 'success' && file_exists($this->filepath)) {
            // Check file size - Gmail has 25MB limit, most email providers have 10-25MB
            $maxSize = 20 * 1024 * 1024; // 20MB in bytes
            
            if (filesize($this->filepath) <= $maxSize) {
                $mail->attach($this->filepath, [
                    'as' => $this->filename,
                    'mime' => $this->backupType === 'Database Backup' ? 'application/sql' : 'application/zip',
                ]);
            } else {
                $this->errorMessage = "Note: File too large to attach ({$this->filesize}). File location: {$this->filepath}";
            }
        }

        return $mail;
    }
}
