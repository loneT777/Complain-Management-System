<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Request</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #0b1026 0%, #312e81 45%, #6366f1 100%);
            color: #ffffff;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 30px 40px;
        }
        .content h2 {
            color: #312e81;
            margin-top: 0;
        }
        .content p {
            margin: 15px 0;
        }
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        .reset-button {
            display: inline-block;
            padding: 14px 30px;
            background-color: #6366f1;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            transition: background-color 0.3s ease;
        }
        .reset-button:hover {
            background-color: #4f46e5;
        }
        .alt-link {
            margin-top: 20px;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 6px;
            word-break: break-all;
            font-size: 12px;
            color: #666;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 12px;
        }
        .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 12px 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .warning p {
            margin: 5px 0;
            color: #856404;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Password Reset Request</h1>
        </div>
        
        <div class="content">
            <h2>Hello{{ isset($user) && $user->full_name ? ', ' . $user->full_name : '' }}!</h2>
            
            <p>We received a request to reset the password for your account in the <strong>Leave Management System</strong>.</p>
            
            <p>Click the button below to reset your password:</p>
            
            <div class="button-container">
                <a href="{{ $resetLink }}" class="reset-button">Reset Password</a>
            </div>
            
            <div class="warning">
                <p><strong>⚠️ Important Security Information:</strong></p>
                <p>• This link will expire in <strong>24 hours</strong></p>
                <p>• If you didn't request this reset, please ignore this email</p>
                <p>• Never share this link with anyone</p>
            </div>
            
            <p>If the button above doesn't work, copy and paste this link into your browser:</p>
            
            <div class="alt-link">
                {{ $resetLink }}
            </div>
            
            <p style="margin-top: 30px; color: #666; font-size: 14px;">
                If you did not request a password reset, no further action is required. Your password will remain unchanged.
            </p>
        </div>
        
        <div class="footer">
            <p><strong>Leave Management System</strong></p>
            <p>© PM Office | Sri Lanka</p>
            <p>This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
