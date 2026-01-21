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
    public function index(Request $request)
    {
        try {
            $perPage = $request->input('per_page', 'all');
            $search = $request->input('search', '');

            $query = User::with(['person', 'role', 'division']);

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('username', 'LIKE', "%{$search}%")
                        ->orWhere('designation', 'LIKE', "%{$search}%")
                        ->orWhereHas('person', function ($subQ) use ($search) {
                            $subQ->where('full_name', 'LIKE', "%{$search}%")
                                ->orWhere('email', 'LIKE', "%{$search}%")
                                ->orWhere('nic', 'LIKE', "%{$search}%");
                        })
                        ->orWhereHas('role', function ($subQ) use ($search) {
                            $subQ->where('name', 'LIKE', "%{$search}%");
                        })
                        ->orWhereHas('division', function ($subQ) use ($search) {
                            $subQ->where('name', 'LIKE', "%{$search}%");
                        });
                });
            }

            $query->orderBy('id', 'desc');

            if ($perPage === 'all' || $perPage === null) {
                $users = $query->get();
                return response()->json([
                    'success' => true,
                    'data' => $users
                ]);
            }

            $users = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $users->items(),
                'pagination' => [
                    'current_page' => $users->currentPage(),
                    'last_page' => $users->lastPage(),
                    'per_page' => $users->perPage(),
                    'total' => $users->total(),
                    'from' => $users->firstItem(),
                    'to' => $users->lastItem()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching users',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created user
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'username' => 'required|email|unique:users,username|max:255',
            'password' => 'required|string|min:8',
            'role_id' => 'required|exists:roles,id',
            'designation' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        // Create new person
        $person = Person::create([
            'full_name' => $validated['full_name'],
            'email' => $validated['username'],
            'nic' => 'U' . substr(time(), -10),
            'is_approved' => true,
            'session_id' => 1,
            'user_id' => 1,
        ]);

        // Create user
        $userData = [
            'person_id' => $person->id,
            'full_name' => $validated['full_name'],
            'username' => $validated['username'],
            'email' => $validated['username'],
            'password' => Hash::make($validated['password']),
            'role_id' => $validated['role_id'],
            'designation' => $validated['designation'] ?? null,
            'division_id' => 1,
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
            'username' => [
                'sometimes',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id)
            ],
            'password' => 'sometimes|nullable|string|min:8',
            'role_id' => 'sometimes|exists:roles,id',
            'designation' => 'nullable|string|max:255',
            'is_active' => 'sometimes|boolean',
        ]);

        // Update person if full_name or username changed
        if (isset($validated['full_name']) || isset($validated['username'])) {
            $person = Person::find($user->person_id);
            if ($person) {
                if (isset($validated['full_name'])) {
                    $person->full_name = $validated['full_name'];
                }
                if (isset($validated['username'])) {
                    $person->email = $validated['username'];
                }
                $person->save();
            }
        }

        // Prepare user update data
        $updateData = [];
        if (isset($validated['full_name'])) {
            $updateData['full_name'] = $validated['full_name'];
        }
        if (isset($validated['username'])) {
            $updateData['username'] = $validated['username'];
            $updateData['email'] = $validated['username'];
        }
        if (isset($validated['password']) && !empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }
        if (isset($validated['role_id'])) {
            $updateData['role_id'] = $validated['role_id'];
        }
        if (isset($validated['designation'])) {
            $updateData['designation'] = $validated['designation'];
        }
        if (array_key_exists('is_active', $validated)) {
            $updateData['is_active'] = $validated['is_active'];
        }

        if (!empty($updateData)) {
            $updateData['updated_session_id'] = 1;
            $user->update($updateData);
        }
        
        $user->refresh();
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

    /**
     * Change password for the authenticated user
     */
    public function changePassword(Request $request)
    {
        $validated = $request->validate([
            'old_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        // Check if old password is correct
        if (!Hash::check($validated['old_password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'The old password is incorrect'
            ], 422);
        }

        // Check if new password is different from old password
        if (Hash::check($validated['new_password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'New password must be different from the old password'
            ], 422);
        }

        // Update password
        $user->update([
            'password' => Hash::make($validated['new_password']),
            'updated_session_id' => 1,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully'
        ]);
    }
}
