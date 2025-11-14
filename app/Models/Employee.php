<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory;

    // Table name (optional if following Laravel naming convention)
    protected $table = 'employees';

    // Primary key (optional if it's 'id')
    protected $primaryKey = 'id';

    // Disable timestamps since your table doesn't have created_at and updated_at
    public $timestamps = false;

    // Mass assignable fields
    protected $fillable = [
        'title',
        'first_name',
        'last_name',
        'gender',
        'nic_no',
        'passport_no',
        'birthday',
        'phone_no',
        'whatsapp_no',
        'email',
        'organization_id',
        'designation_id',
        'service_id',
        'session_id',
    ];

    /**
     * Relationships
     */

    // Employee belongs to an Organization
    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    // Employee belongs to a Designation
    public function designation()
    {
        return $this->belongsTo(Designation::class);
    }

    // Employee belongs to a Service
    public function services()
    {
        return $this->belongsTo(Services::class);
    }

    // Employee belongs to a LoginSession
    public function session()
    {
        return $this->belongsTo(LoginSession::class, 'session_id');
    }
}