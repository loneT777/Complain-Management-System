<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Complaint extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'status_id',
        // Add other fields as per your complaints table schema
    ];

    public function complaintAssignments()
    {
        return $this->hasMany(\App\Models\ComplaintAssignment::class);
    }
}
