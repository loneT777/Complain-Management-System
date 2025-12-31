<?php

namespace App\Http\Controllers;

use App\Models\Status;
use App\Models\Complaint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class StatusController extends Controller
{
    /**
     * Display a listing of all statuses.
     */
    public function index()
    {
        try {
            $statuses = Status::all();
            return response()->json($statuses);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Store a newly created status in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:status,name',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $status = Status::create($request->all());

            return response()->json([
                'message' => 'Status created successfully',
                'data' => $status
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified status.
     */
    public function show($id)
    {
        try {
            $status = Status::findOrFail($id);
            return response()->json($status);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Status not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update the specified status in storage.
     */
    public function update(Request $request, $id)
    {
        try {
            $status = Status::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'nullable|string|max:255|unique:status,name,' . $id,
                'description' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $status->update($request->all());

            return response()->json([
                'message' => 'Status updated successfully',
                'data' => $status
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Status not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified status from storage.
     */
    public function destroy($id)
    {
        try {
            $status = Status::findOrFail($id);
            $status->delete();

            return response()->json(['message' => 'Status deleted successfully']);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Status not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update complaint status.
     * 
     * @param Request $request
     * @param int $complaintId
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateComplaintStatus(Request $request, $complaintId)
    {
        $validator = Validator::make($request->all(), [
            'status_id' => 'required|exists:status,id',
            'remark' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $complaint = Complaint::findOrFail($complaintId);
            
            // Update complaint status
            $complaint->last_status_id = $request->status_id;
            
            // Update remark if provided
            if ($request->has('remark')) {
                $complaint->remark = $request->remark;
            }
            
            $complaint->save();

            return response()->json([
                'message' => 'Complaint status updated successfully',
                'data' => $complaint->load('lastStatus')
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Complaint not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update complaint priority level.
     * 
     * @param Request $request
     * @param int $complaintId
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateComplaintPriority(Request $request, $complaintId)
    {
        $validator = Validator::make($request->all(), [
            'priority_level' => 'required|string|in:low,medium,high',
            'remark' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $complaint = Complaint::findOrFail($complaintId);
            
            // Update complaint priority
            $complaint->priority_level = $request->priority_level;
            
            // Update remark if provided
            if ($request->has('remark')) {
                $complaint->remark = $request->remark;
            }
            
            $complaint->save();

            return response()->json([
                'message' => 'Complaint priority updated successfully',
                'data' => $complaint
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Complaint not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update both status and priority level.
     * 
     * @param Request $request
     * @param int $complaintId
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateComplaintStatusAndPriority(Request $request, $complaintId)
    {
        $validator = Validator::make($request->all(), [
            'status_id' => 'nullable|exists:status,id',
            'priority_level' => 'nullable|string|in:low,medium,high',
            'remark' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $complaint = Complaint::findOrFail($complaintId);
            
            // Update status if provided
            if ($request->has('status_id')) {
                $complaint->last_status_id = $request->status_id;
            }
            
            // Update priority if provided
            if ($request->has('priority_level')) {
                $complaint->priority_level = $request->priority_level;
            }
            
            // Update remark if provided
            if ($request->has('remark')) {
                $complaint->remark = $request->remark;
            }
            
            $complaint->save();

            return response()->json([
                'message' => 'Complaint updated successfully',
                'data' => $complaint->load('lastStatus')
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Complaint not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
