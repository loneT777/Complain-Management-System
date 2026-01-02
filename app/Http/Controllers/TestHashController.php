<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class TestHashController extends Controller
{
    /**
     * Hash a password for testing purposes
     * Example: http://localhost:8000/api/test/hash?password=mypassword123
     */
    public function hashPassword(Request $request)
    {
        $password = $request->query('password');

        if (!$password) {
            return response()->json([
                'error' => 'Password query parameter is required',
                'example' => 'GET /api/test/hash?password=mypassword123'
            ], 400);
        }

        $hashed = Hash::make($password);

        return response()->json([
            'original_password' => $password,
            'hashed_password' => $hashed,
            'message' => 'Copy the hashed_password value and paste it into your database user table password field'
        ]);
    }

    /**
     * Verify if a password matches a hash
     * Example: POST /api/test/verify
     * Body: { "password": "mypassword123", "hash": "$2y$10$..." }
     */
    public function verifyPassword(Request $request)
    {
        $request->validate([
            'password' => 'required|string',
            'hash' => 'required|string'
        ]);

        $password = $request->input('password');
        $hash = $request->input('hash');

        $matches = Hash::check($password, $hash);

        return response()->json([
            'password' => $password,
            'hash' => $hash,
            'matches' => $matches,
            'message' => $matches ? 'Password matches the hash!' : 'Password does not match the hash'
        ]);
    }
}
