<?php

namespace App\Http\Controllers;

use App\Models\Complaint;
use Illuminate\Http\Request;

class ComplaintController extends Controller
{
    /**
     * Return a paginated list of complaints
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $complaints = Complaint::with(['complainant', 'lastStatus'])->paginate(10);
        return response()->json($complaints);
    }

    /**
     * Store a new complaint
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'reference_no' => 'required|string|unique:complaints',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'complainant_id' => 'required|exists:persons,id',
            'channel' => 'nullable|string',
            'priority_level' => 'nullable|string',
            'confidentiality_level' => 'nullable|string',
        ]);

        $complaint = Complaint::create($validated);

        return response()->json([
            'message' => 'Complaint created successfully',
            'data' => $complaint
        ], 201);
    }

    /**
     * Get a single complaint
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $complaint = Complaint::with(['complainant', 'lastStatus', 'complaintAssignments'])->find($id);

        if (!$complaint) {
            return response()->json(['message' => 'Complaint not found'], 404);
        }

        return response()->json($complaint);
    }

    /**
     * Update a complaint
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $complaint = Complaint::find($id);

        if (!$complaint) {
            return response()->json(['message' => 'Complaint not found'], 404);
        }

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'complainant_id' => 'nullable|exists:persons,id',
            'last_status_id' => 'nullable|exists:status,id',
            'channel' => 'nullable|string',
            'priority_level' => 'nullable|string',
            'confidentiality_level' => 'nullable|string',
            'remark' => 'nullable|string'
        ]);

        $complaint->update($validated);

        return response()->json([
            'message' => 'Complaint updated successfully',
            'data' => $complaint
        ]);
    }

    /**
     * Delete a complaint
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $complaint = Complaint::find($id);

        if (!$complaint) {
            return response()->json(['message' => 'Complaint not found'], 404);
        }

        $complaint->delete();

        return response()->json(['message' => 'Complaint deleted successfully']);
    }
}
