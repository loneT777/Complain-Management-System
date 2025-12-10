<?php

namespace App\Http\Controllers;

use App\Models\Complaint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ComplaintController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $complaints = Complaint::orderBy('created_at', 'desc')->get();
            return response()->json($complaints);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'channel' => 'nullable|string',
            'priority_level' => 'nullable|string',
            'complainant_name' => 'nullable|string',
            'complainant_phone' => 'nullable|string',
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

        return response()->json($complaint, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        try {
            $complaint = Complaint::findOrFail($id);
            return response()->json($complaint);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $complaint = Complaint::findOrFail($id);

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

        $complaint->update($request->except('category_ids'));

        // Sync categories if provided
        if ($request->has('category_ids') && is_array($request->category_ids)) {
            $complaint->categories()->sync($request->category_ids);
        }

        return response()->json($complaint);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $complaint = Complaint::findOrFail($id);
        $complaint->delete();

        return response()->json(['message' => 'Complaint deleted successfully']);
    }
}
