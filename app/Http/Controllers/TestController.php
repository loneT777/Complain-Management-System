<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class TestController extends Controller
{
    public function generateHash()
    {
        return response()->json([
            'password' => 'Admin',
            'hash' => Hash::make('Admin')
        ]);
    }
}
