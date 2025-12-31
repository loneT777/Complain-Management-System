<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class TestController extends Controller
{
    /**
     * Hash a password
     * Usage: GET /api/test/hash-password?password=yourpassword
     */
    public function hashPassword(Request $request)
    {
        $password = $request->input('password', '12345678');
        $hashed = Hash::make($password);
        
        return response()->json([
            'plain_password' => $password,
            'hashed_password' => $hashed,
            'message' => 'Use this hashed value in your database'
        ]);
    }

    /**
     * Check if a password matches a hash
     * Usage: GET /api/test/check-password?password=yourpassword&hash=hashedvalue
     */
    public function checkPassword(Request $request)
    {
        $password = $request->input('password');
        $hash = $request->input('hash');
        
        $matches = Hash::check($password, $hash);
        
        return response()->json([
            'password' => $password,
            'hash' => $hash,
            'matches' => $matches,
            'message' => $matches ? 'Password matches!' : 'Password does not match'
        ]);
    }

    /**
     * Test login with a specific user
     * Usage: GET /api/test/verify-user?username=admin&password=12345678
     */
    public function verifyUser(Request $request)
    {
        $username = $request->input('username', 'admin');
        $password = $request->input('password', '12345678');
        
        $user = User::where('username', $username)->first();
        
        if (!$user) {
            return response()->json([
                'error' => 'User not found',
                'username' => $username
            ], 404);
        }
        
        $passwordMatches = Hash::check($password, $user->password);
        
        return response()->json([
            'username' => $username,
            'password_entered' => $password,
            'user_exists' => true,
            'user_id' => $user->id,
            'full_name' => $user->full_name,
            'stored_hash' => $user->password,
            'password_matches' => $passwordMatches,
            'message' => $passwordMatches 
                ? 'Login credentials are correct!' 
                : 'Password does not match the stored hash'
        ]);
    }

    /**
     * List all users with their usernames
     * Usage: GET /api/test/list-users
     */
    public function listUsers()
    {
        $users = User::select('id', 'username', 'full_name', 'role_id', 'is_approved')
            ->get();
        
        return response()->json([
            'users' => $users,
            'count' => $users->count(),
            'message' => 'All default passwords are: 12345678'
        ]);
    }
}
