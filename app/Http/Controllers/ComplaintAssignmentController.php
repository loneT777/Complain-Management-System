<?php

namespace App\Http\Controllers;

use App\Models\ComplaintAssignment;
use Illuminate\Http\Request;

class ComplaintAssignmentController extends Controller
{
    /**
     * Display a listing of complaint assignments
     */
    public function index(Request $request)
    {
        try {
            $query = ComplaintAssignment::query();

            // Filter by complaint_id if provided
            if ($request->has('complaint_id')) {
                $query->where('complaint_id', $request->input('complaint_id'));
            }

            $assignments = $query->with([
                'complaint',
                'assigneeDivision',
                'assigneeUser',
                'assignerUser'
            ])->get();

            return response()->json($assignments);
        } catch (\Exception $e) {
            \Log::error('Error fetching complaint assignments: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch assignments', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Store a newly created complaint assignment
     */
    public function store(Request $request)
    {
        $request->validate([
            'complaint_id' => 'required|exists:complaints,id',
            'assignee_division_id' => 'nullable|exists:divisions,id',
            'assignee_user_id' => 'nullable|exists:persons,id',
            'due_at' => 'nullable|date',
            'remark' => 'nullable|string',
        ]);

        // Create assignment
        $assignment = ComplaintAssignment::create([
            'complaint_id' => $request->input('complaint_id'),
            'assignee_division_id' => $request->input('assignee_division_id'),
            'assignee_user_id' => $request->input('assignee_user_id'),
            'due_at' => $request->input('due_at'),
            'remark' => $request->input('remark'),
            'assigner_user_id' => 1, // TODO: Replace with auth()->user()->person_id
            'last_status_id' => null, // Set to null for now
        ]);

        // Load relationships for response
        $assignment->load([
            'complaint',
            'assigneeDivision',
            'assigneeUser',
            'assignerUser'
        ]);

        return response()->json($assignment, 201);
    }

    /**
     * Display the specified complaint assignment
     */
    public function show($id)
    {
        $assignment = ComplaintAssignment::with([
            'complaint',
            'assigneeDivision',
            'assigneeUser',
            'assignerUser'
        ])->findOrFail($id);

        return response()->json($assignment);
    }

    /**
     * Update the specified complaint assignment
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'assignee_division_id' => 'nullable|exists:divisions,id',
            'assignee_user_id' => 'nullable|exists:persons,id',
            'due_at' => 'nullable|date',
            'remark' => 'nullable|string',
        ]);

        $assignment = ComplaintAssignment::findOrFail($id);
        $assignment->update($request->only([
            'assignee_division_id',
            'assignee_user_id',
            'due_at',
            'remark'
        ]));

        $assignment->load([
            'complaint',
            'assigneeDivision',
            'assigneeUser',
            'assignerUser'
        ]);

        return response()->json($assignment);
    }

    /**
     * Remove the specified complaint assignment
     */
    public function destroy($id)
    {
        $assignment = ComplaintAssignment::findOrFail($id);
        $assignment->delete();

        return response()->json(['message' => 'Assignment deleted successfully']);
    }
}