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

    protected $casts = [
        'received_at' => 'datetime',
        'due_at' => 'date',
    ];

    // Relationships
    public function complainant()
    {
        return $this->belongsTo(Person::class, 'complainant_id');
    }

    public function lastStatus()
    {
        return $this->belongsTo(Status::class, 'last_status_id');
    }

    public function complaintRequested()
    {
        return $this->belongsTo(Person::class, 'complaint_requested_id');
    }

    public function userReceived()
    {
        return $this->belongsTo(User::class, 'user_received_id');
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'complaint_categories');
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function attachments()
    {
        return $this->hasMany(Attachment::class);
    }

    public function logs()
    {
        return $this->hasMany(ComplaintLog::class);
    }

    // Using assignments() as the method name from main branch
    // but keeping complaintAssignments() as an alias for backward compatibility
    public function assignments()
    {
        return $this->hasMany(ComplaintAssignment::class);
    }

    public function complaintAssignments()
    {
        return $this->assignments();
    }
}