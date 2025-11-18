<?php

namespace App\Http\Controllers;

use App\Models\Division;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DivisionController extends Controller
{
    /**
     * Get all divisions with pagination
     */
    public function index(Request $request)
    {
        try {
            $perPage = $request->input('per_page', 10);
            $search = $request->input('search', '');

            $query = Division::query();

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%{$search}%")
                        ->orWhere('code', 'LIKE', "%{$search}%")
                        ->orWhere('location', 'LIKE', "%{$search}%")
                        ->orWhere('officer_in_charge', 'LIKE', "%{$search}%");
                });
            }

            $divisions = $query->orderBy('id', 'desc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $divisions->items(),
                'pagination' => [
                    'current_page' => $divisions->currentPage(),
                    'last_page' => $divisions->lastPage(),
                    'per_page' => $divisions->perPage(),
                    'total' => $divisions->total(),
                    'from' => $divisions->firstItem(),
                    'to' => $divisions->lastItem()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching divisions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all divisions without pagination (for dropdowns/public access)
     */
    public function publicIndex()
    {
        try {
            $divisions = Division::all();
            return response()->json([
                'success' => true,
                'data' => $divisions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching divisions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created division
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:divisions,name',
            'code' => 'required|string|max:50|unique:divisions,code',
            'location' => 'required|string|max:255',
            'officer_in_charge' => 'required|string|max:255',
            'contact_no' => 'required|string|max:20',
            'parent_id' => 'nullable|integer|exists:divisions,id',
            'is_approved' => 'nullable|boolean',
            'remark' => 'nullable|string',
            'session_id' => 'nullable|integer',
        ], [
            'name.required' => 'Division name is required',
            'name.unique' => 'Division name already exists',
            'code.required' => 'Division code is required',
            'code.unique' => 'Division code already exists',
            'location.required' => 'Location is required',
            'officer_in_charge.required' => 'Officer in charge is required',
            'contact_no.required' => 'Contact number is required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $division = Division::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Division created successfully',
                'data' => $division
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating division',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a single division
     */
    public function show($id)
    {
        try {
            $division = Division::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $division
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Division not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update a division
     */
    public function update(Request $request, $id)
    {
        try {
            $division = Division::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:divisions,name,' . $id,
                'code' => 'required|string|max:50|unique:divisions,code,' . $id,
                'location' => 'required|string|max:255',
                'officer_in_charge' => 'required|string|max:255',
                'contact_no' => 'required|string|max:20',
                'parent_id' => 'nullable|integer|exists:divisions,id',
                'is_approved' => 'nullable|boolean',
                'remark' => 'nullable|string',
                'session_id' => 'nullable|integer',
            ], [
                'name.required' => 'Division name is required',
                'name.unique' => 'Division name already exists',
                'code.required' => 'Division code is required',
                'code.unique' => 'Division code already exists',
                'location.required' => 'Location is required',
                'officer_in_charge.required' => 'Officer in charge is required',
                'contact_no.required' => 'Contact number is required',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $division->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Division updated successfully',
                'data' => $division
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating division',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a division
     */
    public function destroy($id)
    {
        try {
            $division = Division::findOrFail($id);
            $division->delete();

            return response()->json([
                'success' => true,
                'message' => 'Division deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting division',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
