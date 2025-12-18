<?php

namespace App\Http\Controllers;

use App\Models\ComplaintLog;
use Illuminate\Http\Request;

class ComplaintLogController extends Controller
{
    /**
     * Display a listing of complaint logs
     */
    public function index(Request $request)
    {
        try {
            $query = ComplaintLog::query();

            // Filter by complaint_id if provided
            if ($request->has('complaint_id')) {
                $query->where('complaint_id', $request->input('complaint_id'));
            }

            $logs = $query->with([
                'complaint',
                'assignee',
                'status'
            ])->orderBy('created_at', 'desc')->get();

            return response()->json($logs);
        } catch (\Exception $e) {
            \Log::error('Error fetching complaint logs: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch logs', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Get logs for a specific complaint
     */
    public function getByComplaint($complaintId)
    {
        try {
            $logs = ComplaintLog::where('complaint_id', $complaintId)
                ->with(['complaint', 'assignee', 'status'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($logs);
        } catch (\Exception $e) {
            \Log::error('Error fetching complaint logs: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch logs', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Store a newly created complaint log
     */
    public function store(Request $request)
    {
        $request->validate([
            'complaint_id' => 'required|exists:complaints,id',
            'action' => 'required|string',
            'remark' => 'nullable|string',
        ]);

        $log = ComplaintLog::create([
            'complaint_id' => $request->input('complaint_id'),
            'action' => $request->input('action'),
            'remark' => $request->input('remark'),
        ]);

        $log->load(['assignee', 'status', 'complaint']);

        return response()->json($log, 201);
    }

    /**
     * Update the specified complaint log
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'action' => 'required|string',
            'remark' => 'nullable|string',
        ]);

        $log = ComplaintLog::findOrFail($id);

        $log->update([
            'action' => $request->input('action'),
            'remark' => $request->input('remark'),
        ]);

        $log->load(['assignee', 'status', 'complaint']);

        return response()->json($log);
    }

    /**
     * Delete the specified complaint log
     */
    public function destroy($id)
    {
        $log = ComplaintLog::findOrFail($id);
        $log->delete();

        return response()->json(['message' => 'Log deleted successfully']);
    }
}
