<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use App\Models\User;
use Carbon\Carbon;

class PasswordResetController extends Controller
{
    /**
     * Send password reset link to user's email
     */
    public function sendResetLinkEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Please provide a valid email address.',
                'errors' => $validator->errors()
            ], 422);
        }

        $email = $request->email;
        
        // Check if user exists (username column stores the email)
        $user = User::where('username', $email)->first();
        
        if (!$user) {
            // For security, don't reveal if email exists or not
            return response()->json([
                'message' => 'Reset Link Sent'
            ], 200);
        }

        // Delete any existing tokens for this email
        DB::table('password_resets')->where('email', $email)->delete();

        // Generate a random token
        $token = Str::random(64);

        // Store the token in database
        DB::table('password_resets')->insert([
            'email' => $email,
            'token' => Hash::make($token),
            'created_at' => Carbon::now()
        ]);

        // Create reset link
        $resetLink = env('FRONTEND_URL', 'http://localhost:3000') . '/reset-password?token=' . $token . '&email=' . urlencode($email);

        try {
            // Send email
            Mail::send('emails.password-reset', [
                'resetLink' => $resetLink,
                'user' => $user
            ], function ($message) use ($email) {
                $message->to($email);
                $message->subject('Password Reset Request');
            });

            return response()->json([
                'message' => 'Password reset link has been sent to your email address.'
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Password reset email failed: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Failed to send reset email. Please contact administrator.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Reset the user's password
     */
    public function reset(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:8|confirmed',
            'token' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors()
            ], 422);
        }

        // Find the password reset record
        $resetRecord = DB::table('password_resets')
            ->where('email', $request->email)
            ->first();

        if (!$resetRecord) {
            return response()->json([
                'message' => 'Invalid or expired reset token. Please request a new password reset link.'
            ], 400);
        }

        // Verify token
        if (!Hash::check($request->token, $resetRecord->token)) {
            return response()->json([
                'message' => 'Invalid reset token. Please request a new password reset link.'
            ], 400);
        }

        // Check if token is expired (24 hours)
        $tokenCreatedAt = Carbon::parse($resetRecord->created_at);
        if ($tokenCreatedAt->diffInHours(Carbon::now()) > 24) {
            // Delete expired token
            DB::table('password_resets')->where('email', $request->email)->delete();
            
            return response()->json([
                'message' => 'Reset token has expired. Please request a new password reset link.'
            ], 400);
        }

        // Find user
        $user = User::where('username', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'User not found.'
            ], 404);
        }

        // Update password
        $user->password = Hash::make($request->password);
        $user->save();

        // Delete the used token
        DB::table('password_resets')->where('email', $request->email)->delete();

        // Optionally, revoke all existing tokens for security
        $user->tokens()->delete();

        return response()->json([
            'message' => 'Your password has been reset successfully. You can now login with your new password.'
        ], 200);
    }
}
