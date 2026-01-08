<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Person;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display a listing of users
     */
    public function index()
    {
        $users = User::with(['person', 'role', 'division'])->get();
        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    /**
     * Store a newly created user
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'nullable|email|unique:users,email|max:255',
            'password' => 'required|string|min:8',
            'role_id' => 'required|exists:roles,id',
            'designation' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        // Create new person
        $person = Person::create([
            'full_name' => $validated['full_name'],
            'email' => $validated['email'],
            'nic' => 'U' . substr(time(), -10), // U + 10 digits = 11 chars (fits in 12)
            'is_approved' => true,
            'session_id' => 1,
            'user_id' => 1,
        ]);

        // Generate username
        $baseUsername = $validated['email'] ? explode('@', $validated['email'])[0] : strtolower(str_replace(' ', '_', $validated['full_name']));
        $username = $baseUsername;
        $counter = 1;
        while (User::where('username', $username)->exists()) {
            $username = $baseUsername . $counter;
            $counter++;
        }

        // Create user
        $userData = [
            'person_id' => $person->id,
            'full_name' => $validated['full_name'],
            'username' => $username,
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role_id' => $validated['role_id'],
            'designation' => $validated['designation'] ?? null,
            'division_id' => 1, // Default division
            'is_active' => $validated['is_active'] ?? true,
            'is_approved' => true,
            'session_id' => 1,
            'updated_session_id' => 1,
        ];

        $user = User::create($userData);
        $user->load(['person', 'role', 'division']);

        return response()->json([
            'success' => true,
            'message' => 'User created successfully',
            'data' => $user
        ], 201);
    }

    /**
     * Display the specified user
     */
    public function show($id)
    {
        $user = User::with(['person', 'role', 'division'])->findOrFail($id);
        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }

    /**
     * Update the specified user
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'full_name' => 'sometimes|string|max:255',
            'email' => [
                'sometimes',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id)
            ],
            'password' => 'sometimes|string|min:8',
            'role_id' => 'sometimes|exists:roles,id',
            'designation' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        // Update person if full_name or email changed
        if (isset($validated['full_name']) || isset($validated['email'])) {
            $person = Person::find($user->person_id);
            if ($person) {
                if (isset($validated['full_name'])) {
                    $person->full_name = $validated['full_name'];
                }
                if (isset($validated['email'])) {
                    $person->email = $validated['email'];
                }
                $person->save();
            }
        }

        // Prepare user update data
        $updateData = [];
        if (isset($validated['full_name'])) {
            $updateData['full_name'] = $validated['full_name'];
        }
        if (isset($validated['email'])) {
            $updateData['email'] = $validated['email'];
            $updateData['username'] = explode('@', $validated['email'])[0];
        }
        if (isset($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }
        if (isset($validated['role_id'])) {
            $updateData['role_id'] = $validated['role_id'];
        }
        if (isset($validated['designation'])) {
            $updateData['designation'] = $validated['designation'];
        }
        if (isset($validated['is_active'])) {
            $updateData['is_active'] = $validated['is_active'];
        }

        $user->update($updateData);
        $user->load(['person', 'role', 'division']);

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'data' => $user
        ]);
    }

    /**
     * Remove the specified user
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully'
        ]);
    }
}
