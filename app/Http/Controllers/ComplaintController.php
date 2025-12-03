<?php

namespace App\Http\Controllers;

use App\Models\Complaint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ComplaintController extends Controller
{
    /**
     * Get all complaints with pagination and search
     */
    public function index(Request $request)
    {
        try {
            $perPage = $request->input('per_page', 10);
            $search = $request->input('search', '');

            $query = Complaint::query();

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('reference_no', 'LIKE', "%{$search}%")
                        ->orWhere('title', 'LIKE', "%{$search}%")
                        ->orWhere('complainant_name', 'LIKE', "%{$search}%")
                        ->orWhere('description', 'LIKE', "%{$search}%");
                });
            }

            $complaints = $query->orderBy('created_at', 'desc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $complaints->items(),
                'pagination' => [
                    'current_page' => $complaints->currentPage(),
                    'last_page' => $complaints->lastPage(),
                    'per_page' => $complaints->perPage(),
                    'total' => $complaints->total(),
                    'from' => $complaints->firstItem(),
                    'to' => $complaints->lastItem()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching complaints',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all complaints without pagination
     */
    public function publicIndex()
    {
        try {
            $complaints = Complaint::orderBy('created_at', 'desc')->get();
            return response()->json([
                'success' => true,
                'data' => $complaints
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching complaints',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a new complaint
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'reference_no' => 'required|string|unique:complaints,reference_no',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'complainant_id' => 'required|integer|exists:persons,id',
            'channel' => 'nullable|string|max:50',
            'priority_level' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $complaint = Complaint::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Complaint created successfully',
                'data' => $complaint
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating complaint',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a single complaint
     */
    public function show($id)
    {
        try {
            $complaint = Complaint::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $complaint
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Complaint not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update a complaint
     */
    public function update(Request $request, $id)
    {
        try {
            $complaint = Complaint::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'reference_no' => 'required|string|unique:complaints,reference_no,' . $id,
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'complainant_id' => 'required|integer|exists:persons,id',
                'channel' => 'nullable|string|max:50',
                'priority_level' => 'nullable|string|max:50'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $complaint->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Complaint updated successfully',
                'data' => $complaint
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating complaint',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a complaint
     */
    public function destroy($id)
    {
        try {
            $complaint = Complaint::findOrFail($id);
            $complaint->delete();

            return response()->json([
                'success' => true,
                'message' => 'Complaint deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting complaint',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
