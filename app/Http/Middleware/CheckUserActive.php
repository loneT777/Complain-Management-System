<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckUserActive
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        if ($user && !$user->is_active) {
            // Revoke the token
            $request->user()->currentAccessToken()->delete();
            
            return response()->json([
                'message' => 'Your account has been deactivated. Please contact administrator.',
                'should_logout' => true
            ], 403);
        }

        return $next($request);
    }
}
