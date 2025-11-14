<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Organization extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'coordinator_name',
        'coordinator_designation',
        'coordinator_phone_number',
        'coordinator_email',
        'parent_id',
        'session_id',
    ];

    protected $casts = [
        'parent_id' => 'integer',
        'session_id' => 'integer',
    ];

    /**
     * Get the parent organization.
     */
    public function parent()
    {
        return $this->belongsTo(Organization::class, 'parent_id');
    }

    /**
     * Get the child organizations.
     */
    public function children()
    {
        return $this->hasMany(Organization::class, 'parent_id');
    }

    /**
     * Get the login session that owns the organization.
     */
    public function session()
    {
        return $this->belongsTo(LoginSession::class, 'session_id');
    }
}