<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use App\Models\LoginSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Controller;
use Carbon\Carbon;

class AuthController extends Controller
{
    /**
     * Login with username and password
     */
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string|min:6',
        ]);

        $user = User::where('username', $request->username)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid username or password'
            ], 401);
        }

        if (!$user->is_approved) {
            return response()->json([
                'message' => 'Your account has not been approved yet'
            ], 403);
        }

        if (!$user->is_active) {
            return response()->json([
                'message' => 'Your account has been deactivated. Please contact administrator.'
            ], 403);
        }

        // End any previous active sessions for this user
        $user->loginSessions()
            ->whereNull('logout_time')
            ->update(['logout_time' => Carbon::now()]);

        // Create a new login session
        $loginSession = LoginSession::create([
            'user_id' => $user->id,
            'login_time' => Carbon::now(),
        ]);

        // Create API token for this session
        $token = $user->createToken('auth_token')->plainTextToken;

        // Load role with permissions
        $user->load('role.permissions');

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'session_id' => $loginSession->id,
            'user' => [
                'id' => $user->id,
                'full_name' => $user->full_name,
                'username' => $user->username,
                'role_id' => $user->role_id,
                'division_id' => $user->division_id,
                'role' => [
                    'id' => $user->role->id,
                    'name' => $user->role->name,
                    'code' => $user->role->code ?? null,
                ],
            ],
            'permissions' => $user->role ? $user->role->permissions->pluck('code')->toArray() : [],
        ], 200);
    }

    /**
     * Logout - record logout time and revoke token
     */
    public function logout(Request $request)
    {
        $user = $request->user();

        // Record logout time in the active session
        if ($user) {
            $activeSession = $user->activeSession();
            if ($activeSession) {
                $activeSession->update(['logout_time' => Carbon::now()]);
            }
        }

        // Revoke current token
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * Get current authenticated user
     */
    public function me(Request $request)
    {
        $user = $request->user();

        // Check if user is still active
        if (!$user->is_active) {
            return response()->json([
                'message' => 'Your account has been deactivated',
                'should_logout' => true
            ], 403);
        }

        $user->load('role.permissions');

        return response()->json([
            'user' => [
                'id' => $user->id,
                'full_name' => $user->full_name,
                'username' => $user->username,
                'email' => $user->email,
                'role_id' => $user->role_id,
                'division_id' => $user->division_id,
                'role' => $user->role ? [
                    'id' => $user->role->id,
                    'name' => $user->role->name,
                    'code' => $user->role->code ?? null,
                ] : null,
            ],
            'permissions' => $user->role ? $user->role->permissions->pluck('code')->toArray() : [],
            'active_session' => $user->activeSession(),
        ]);
    }

    /**
     * Get user login history
     */
    public function loginHistory(Request $request)
    {
        $user = $request->user();

        $sessions = $user->loginSessions()
            ->orderBy('login_time', 'desc')
            ->get()
            ->map(function ($session) {
                return [
                    'id' => $session->id,
                    'login_time' => $session->login_time,
                    'logout_time' => $session->logout_time,
                    'is_active' => $session->isActive(),
                    'duration' => $session->logout_time ?
                        $session->logout_time->diffInSeconds($session->login_time) :
                        now()->diffInSeconds($session->login_time),
                ];
            });

        return response()->json(['login_history' => $sessions]);
    }
}
