<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ComplaintLog extends Model
{
    use HasFactory;

    protected $table = 'complaint_logs';

    protected $fillable = [
        'complaint_id',
        'complaint_assignment_id',
        'status_id',
        'assignee_id',
        'action',
        'remark'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    public function complaint()
    {
        return $this->belongsTo(Complaint::class);
    }

    public function assignment()
    {
        return $this->belongsTo(ComplaintAssignment::class, 'complaint_assignment_id');
    }

    public function status()
    {
        return $this->belongsTo(Status::class, 'status_id');
    }

    public function assignee()
    {
        return $this->belongsTo(Person::class, 'assignee_id');
    }
}
