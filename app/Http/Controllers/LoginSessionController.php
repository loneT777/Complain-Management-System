<?php

namespace App\Http\Controllers;

use App\Models\LoginSession;
use Illuminate\Http\Request;

class LoginSessionController extends Controller
{
public function index(Request $request)
{
    $query = LoginSession::orderByDesc('id');

    if ($request->has('search') && $request->search != '') {
        $search = $request->search;
        $query->where(function ($q) use ($search) {
            $q->where('ip_address', 'LIKE', "%{$search}%")
              ->orWhere('user_agent', 'LIKE', "%{$search}%")
              ->orWhere('session_id', 'LIKE', "%{$search}%");
        });
    }

    $loginSessions = $query->get();
    return response()->json($loginSessions);
}
}


