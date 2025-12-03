<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Complaint extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference_no',
        'title',
        'description',
        'complainant_id',
        'last_status_id',
        'complaint_requested_id',
        'received_at',
        'user_received_id',
        'channel',
        'priority_level',
        'confidentiality_level',
        'due_at',
        'complainant_name',
        'complainant_phone',
        'remark'
    ];

    public function complaintAssignments()
    {
        return $this->hasMany(\App\Models\ComplaintAssignment::class);
    }

    public function complainant()
    {
        return $this->belongsTo(\App\Models\Person::class, 'complainant_id');
    }

    public function lastStatus()
    {
        return $this->belongsTo(\App\Models\Status::class, 'last_status_id');
    }
}
