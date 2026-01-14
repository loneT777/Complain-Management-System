<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ComplaintAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'complaint_id',
        'assignee_division_id',
        'assignee_id',
        'assigner_id',
        'last_status_id',
        'due_at',
        'remark',
    ];

    protected $casts = [
        'due_at' => 'datetime',
    ];

    protected $with = ['assigneeDivision', 'assigneeUser', 'assignerUser', 'lastStatus', 'complaint'];

    public function complaint()
    {
        return $this->belongsTo(Complaint::class);
    }

    public function assigneeDivision()
    {
        return $this->belongsTo(Division::class, 'assignee_division_id');
    }

    public function assigneeUser()
    {
        return $this->belongsTo(Person::class, 'assignee_id');
    }

    public function assignerUser()
    {
        return $this->belongsTo(Person::class, 'assigner_id');
    }

    public function lastStatus()
    {
        return $this->belongsTo(Status::class, 'last_status_id');
    }

    /**
     * Check if this is the current/latest assignment for its complaint
     */
    public function isCurrent()
    {
        $latestAssignment = ComplaintAssignment::where('complaint_id', $this->complaint_id)
            ->orderByDesc('created_at')
            ->first();

        return $this->id === $latestAssignment?->id;
    }

    /**
     * Check if this assignment has been superseded by a newer one
     */
    public function isReassigned()
    {
        return !$this->isCurrent();
    }

    /**
     * Get the current/latest assignment for a complaint
     */
    public static function getCurrent($complaintId)
    {
        return self::where('complaint_id', $complaintId)
            ->orderByDesc('created_at')
            ->first();
    }

    /**
     * Get how many times a complaint has been reassigned (total assignments - 1)
     */
    public static function getReassignmentCount($complaintId)
    {
        return self::where('complaint_id', $complaintId)->count() - 1;
    }
}
