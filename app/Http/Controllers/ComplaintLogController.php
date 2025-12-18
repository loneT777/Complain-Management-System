<?php

namespace App\Http\Controllers;

use App\Models\ComplaintLog;
use Illuminate\Http\Request;

class ComplaintLogController extends Controller
{
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
