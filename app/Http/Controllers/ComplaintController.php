<?php

namespace App\Http\Controllers;

use App\Models\Complaint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class ComplaintController extends Controller
{
    /**
     * Display a paginated listing of complaints with relationships.
     */
    public function index()
    {
        try {
            $complaints = Complaint::with(['complainant', 'lastStatus'])
                ->orderBy('created_at', 'desc')
                ->paginate(10);
            return response()->json($complaints);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Store a newly created complaint in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'complainant_id' => 'required|exists:persons,id',
            'channel' => 'nullable|string',
            'priority_level' => 'nullable|string',
            'confidentiality_level' => 'nullable|string',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'exists:categories,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Generate unique reference number
        $referenceNo = 'CMP-' . date('Ymd') . '-' . str_pad(Complaint::count() + 1, 4, '0', STR_PAD_LEFT);

        $complaint = Complaint::create(array_merge($request->all(), [
            'reference_no' => $referenceNo,
        ]));

        // Attach categories if provided
        if ($request->has('category_ids')) {
            $complaint->categories()->attach($request->category_ids);
        }

        return response()->json([
            'message' => 'Complaint created successfully',
            'data' => $complaint
        ], 201);
    }

    /**
     * Display the specified complaint with relationships.
     */
    public function show($id)
    {
        try {
            $complaint = Complaint::with(['complainant', 'lastStatus', 'complaintAssignments'])
                ->findOrFail($id);
            return response()->json($complaint);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Complaint not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update the specified complaint in storage.
     */
    public function update(Request $request, $id)
    {
        try {
            $complaint = Complaint::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'title' => 'nullable|string|max:255',
                'description' => 'nullable|string',
                'complainant_id' => 'nullable|exists:persons,id',
                'last_status_id' => 'nullable|exists:status,id',
                'channel' => 'nullable|string',
                'priority_level' => 'nullable|string',
                'confidentiality_level' => 'nullable|string',
                'remark' => 'nullable|string',
                'category_ids' => 'nullable|array',
                'category_ids.*' => 'exists:categories,id',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $complaint->update($request->all());

            // Sync categories if provided
            if ($request->has('category_ids')) {
                $complaint->categories()->sync($request->category_ids);
            }

            return response()->json([
                'message' => 'Complaint updated successfully',
                'data' => $complaint
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Complaint not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified complaint from storage.
     */
    public function destroy($id)
    {
        try {
            $complaint = Complaint::findOrFail($id);
            $complaint->delete();

            return response()->json(['message' => 'Complaint deleted successfully']);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Complaint not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}