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
}
