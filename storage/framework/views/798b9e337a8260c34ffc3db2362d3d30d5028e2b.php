<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: <?php echo e($status === 'success' ? '#4CAF50' : '#f44336'); ?>;
            color: white;
            padding: 20px;
            border-radius: 5px;
            text-align: center;
        }
        .content {
            background: #f9f9f9;
            padding: 20px;
            margin-top: 20px;
            border-radius: 5px;
            border: 1px solid #ddd;
        }
        .info-row {
            padding: 10px 0;
            border-bottom: 1px solid #ddd;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .label {
            font-weight: bold;
            color: #555;
            display: inline-block;
            width: 150px;
        }
        .value {
            color: #333;
        }
        .success-icon {
            font-size: 48px;
            margin-bottom: 10px;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #777;
            font-size: 12px;
        }
        .error-message {
            background: #fff3cd;
            border: 1px solid #ffc107;
            padding: 10px;
            margin-top: 10px;
            border-radius: 5px;
            color: #856404;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="success-icon"><?php echo e($status === 'success' ? '✓' : '✗'); ?></div>
            <h2><?php echo e($status === 'success' ? 'Backup Completed Successfully' : 'Backup Failed'); ?></h2>
        </div>

        <div class="content">
            <div class="info-row">
                <span class="label">Backup Type:</span>
                <span class="value"><?php echo e($backupType); ?></span>
            </div>
            <div class="info-row">
                <span class="label">Status:</span>
                <span class="value" style="color: <?php echo e($status === 'success' ? '#4CAF50' : '#f44336'); ?>; font-weight: bold;">
                    <?php echo e(strtoupper($status)); ?>

                </span>
            </div>
            <div class="info-row">
                <span class="label">Date & Time:</span>
                <span class="value"><?php echo e(date('F d, Y - h:i:s A')); ?></span>
            </div>
            
            <?php if($status === 'success'): ?>
                <div class="info-row">
                    <span class="label">Filename:</span>
                    <span class="value"><?php echo e($filename); ?></span>
                </div>
                <div class="info-row">
                    <span class="label">File Size:</span>
                    <span class="value"><?php echo e($filesize); ?></span>
                </div>
                <div class="info-row">
                    <span class="label">Location:</span>
                    <span class="value" style="font-size: 11px;"><?php echo e($filepath); ?></span>
                </div>
            <?php endif; ?>

            <?php if($errorMessage): ?>
                <div class="error-message">
                    <strong>Note:</strong> <?php echo e($errorMessage); ?>

                </div>
            <?php endif; ?>
        </div>

        <div class="footer">
            <p><strong>Complaint Management System</strong></p>
            <p>Automated Backup Notification</p>
            <p>This is an automated email. Please do not reply.</p>
        </div>
    </div>
</body>
</html>
<?php /**PATH C:\Users\DELL\Documents\GitHub\Complain-Management-System\resources\views/emails/backup-notification.blade.php ENDPATH**/ ?>