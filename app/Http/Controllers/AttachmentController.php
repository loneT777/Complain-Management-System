<?php

namespace App\Http\Controllers;

use App\Models\Attachment;
use App\Models\Complaint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AttachmentController extends Controller
{
    /**
     * Display a listing of attachments
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $search = $request->input('search', '');

        $query = Attachment::with(['complaint', 'user']);

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('file_name', 'like', "%{$search}%")
                  ->orWhereHas('complaint', function($cq) use ($search) {
                      $cq->where('reference_no', 'like', "%{$search}%")
                         ->orWhere('title', 'like', "%{$search}%");
                  });
            });
        }

        $attachments = $query->orderBy('uploaded_at', 'desc')->paginate($perPage);

        return response()->json([
            'data' => $attachments->items(),
            'pagination' => [
                'current_page' => $attachments->currentPage(),
                'last_page' => $attachments->lastPage(),
                'per_page' => $attachments->perPage(),
                'total' => $attachments->total(),
            ]
        ]);
    }

    /**
     * Store a newly created attachment
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'complaint_id' => 'required|exists:complaints,id',
                'file' => 'required|file|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png,gif,zip,rar|max:10240',
                'description' => 'nullable|string',
                'user_id' => 'required|exists:users,id'
            ]);

            $file = $request->file('file');
            
            if (!$file) {
                return response()->json([
                    'message' => 'No file uploaded',
                    'error' => 'File is required'
                ], 422);
            }

            $originalName = $file->getClientOriginalName();
            $extension = $file->getClientOriginalExtension();
            
            // Generate unique filename
            $fileName = time() . '_' . Str::slug(pathinfo($originalName, PATHINFO_FILENAME)) . '.' . $extension;
            
            // Ensure directory exists
            $directory = storage_path('app/public/attachments');
            if (!file_exists($directory)) {
                mkdir($directory, 0755, true);
            }
            
            // Store file in storage/app/public/attachments
            $filePath = $file->storeAs('attachments', $fileName, 'public');

            if (!$filePath) {
                return response()->json([
                    'message' => 'Failed to store file',
                    'error' => 'File storage failed'
                ], 500);
            }

            $attachment = Attachment::create([
                'complaint_id' => $request->complaint_id,
                'file_name' => $originalName,
                'file_path' => $filePath,
                'extension' => $extension,
                'description' => $request->description,
                'user_id' => $request->user_id,
                'uploaded_at' => now()
            ]);

            return response()->json([
                'message' => 'Attachment uploaded successfully',
                'data' => $attachment->fresh(['complaint', 'user'])
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Attachment upload error: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            
            return response()->json([
                'message' => 'Failed to upload attachment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified attachment
     */
    public function show($id)
    {
        $attachment = Attachment::with(['complaint', 'user'])->findOrFail($id);
        return response()->json(['data' => $attachment]);
    }

    /**
     * Update the specified attachment
     */
    public function update(Request $request, $id)
    {
        $attachment = Attachment::findOrFail($id);

        try {
            // Check if new file is uploaded
            if ($request->hasFile('file')) {
                $validated = $request->validate([
                    'complaint_id' => 'required|exists:complaints,id',
                    'file' => 'required|file|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png,gif,zip,rar|max:10240',
                    'description' => 'nullable|string',
                    'user_id' => 'required|exists:users,id'
                ]);

                $file = $request->file('file');
                $originalName = $file->getClientOriginalName();
                $extension = $file->getClientOriginalExtension();
                
                // Generate unique filename
                $fileName = time() . '_' . Str::slug(pathinfo($originalName, PATHINFO_FILENAME)) . '.' . $extension;
                
                // Delete old file if exists
                if ($attachment->file_path && Storage::disk('public')->exists($attachment->file_path)) {
                    Storage::disk('public')->delete($attachment->file_path);
                }
                
                // Store new file
                $filePath = $file->storeAs('attachments', $fileName, 'public');

                // Update with new file
                $attachment->update([
                    'complaint_id' => $request->complaint_id,
                    'file_name' => $originalName,
                    'file_path' => $filePath,
                    'extension' => $extension,
                    'description' => $request->description,
                    'user_id' => $request->user_id,
                    'uploaded_at' => now()
                ]);
            } else {
                // Update only metadata
                $request->validate([
                    'complaint_id' => 'sometimes|required|exists:complaints,id',
                    'file_name' => 'sometimes|required|string',
                    'extension' => 'sometimes|required|string',
                    'description' => 'nullable|string',
                    'user_id' => 'sometimes|required|exists:users,id'
                ]);

                $attachment->update($request->only([
                    'complaint_id',
                    'file_name',
                    'extension',
                    'description',
                    'user_id'
                ]));
            }

            return response()->json([
                'message' => 'Attachment updated successfully',
                'data' => $attachment->fresh(['complaint', 'user'])
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Attachment update error: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Failed to update attachment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified attachment
     */
    public function destroy($id)
    {
        $attachment = Attachment::findOrFail($id);

        try {
            // Delete file from storage
            if ($attachment->file_path && Storage::disk('public')->exists($attachment->file_path)) {
                Storage::disk('public')->delete($attachment->file_path);
            }

            $attachment->delete();

            return response()->json([
                'message' => 'Attachment deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete attachment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download attachment
     */
    public function download($id)
    {
        $attachment = Attachment::findOrFail($id);

        if (!$attachment->file_path || !Storage::disk('public')->exists($attachment->file_path)) {
            return response()->json([
                'message' => 'File not found'
            ], 404);
        }

        $filePath = storage_path('app/public/' . $attachment->file_path);
        
        return response()->download($filePath, $attachment->file_name);
    }

    /**
     * Get attachments for a specific complaint
     */
    public function getAttachmentsByComplaint($complaintId)
    {
        $complaint = Complaint::findOrFail($complaintId);
        $attachments = Attachment::with('user')
            ->where('complaint_id', $complaintId)
            ->orderBy('uploaded_at', 'desc')
            ->get();

        return response()->json([
            'data' => $attachments
        ]);
    }
}
