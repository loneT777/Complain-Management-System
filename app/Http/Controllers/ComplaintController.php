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
            'channel' => 'nullable|string',
            'priority_level' => 'nullable|string',
            'confidentiality_level' => 'nullable|string',
            'complainant_name' => 'nullable|string',
            'complainant_phone' => 'nullable|string',
            'remark' => 'nullable|string',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'exists:categories,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Generate unique reference number
        $referenceNo = 'CMP-' . date('Ymd') . '-' . str_pad(Complaint::count() + 1, 4, '0', STR_PAD_LEFT);

        $complaint = Complaint::create(array_merge($request->except('category_ids'), [
            'reference_no' => $referenceNo,
            'received_at' => now(),
            'complainant_id' => 1 // Default complainant ID for now
        ]));

        // Attach categories if provided
        if ($request->has('category_ids') && is_array($request->category_ids)) {
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
            $complaint = Complaint::with(['categories'])->findOrFail($id);
            return response()->json($complaint);
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

            // Update complaint fields, excluding category_ids which is handled separately
            $complaint->update($request->except(['category_ids', 'complainant_name', 'complainant_phone']));

            // Handle complainant fields separately if provided
            if ($request->has('complainant_name')) {
                $complaint->complainant_name = $request->complainant_name;
            }
            if ($request->has('complainant_phone')) {
                $complaint->complainant_phone = $request->complainant_phone;
            }
            if ($request->has('remark')) {
                $complaint->remark = $request->remark;
            }
            $complaint->save();

            // Sync categories if provided - this will add new ones and remove old ones
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

    /**
     * Get statistics for dashboard
     */
    public function statistics()
    {
        try {
            $totalComplaints = Complaint::count();
            
            // Get status breakdown
            $statusBreakdown = Complaint::with('lastStatus')
                ->get()
                ->groupBy(function($complaint) {
                    return $complaint->lastStatus ? $complaint->lastStatus->name : 'No Status';
                })
                ->map(function($group) {
                    return $group->count();
                });

            // Get priority level breakdown
            $priorityBreakdown = Complaint::selectRaw('priority_level, COUNT(*) as count')
                ->groupBy('priority_level')
                ->get()
                ->pluck('count', 'priority_level');

            // Recent complaints (last 7 days)
            $recentComplaints = Complaint::where('created_at', '>=', now()->subDays(7))->count();

            // Get total by channel
            $channelBreakdown = Complaint::selectRaw('channel, COUNT(*) as count')
                ->groupBy('channel')
                ->get()
                ->pluck('count', 'channel');

            return response()->json([
                'total_complaints' => $totalComplaints,
                'status_breakdown' => $statusBreakdown,
                'priority_breakdown' => $priorityBreakdown,
                'recent_complaints' => $recentComplaints,
                'channel_breakdown' => $channelBreakdown,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}