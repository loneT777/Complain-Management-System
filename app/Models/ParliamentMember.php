<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ParliamentMember extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'parliament_members';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'code',
        'title',
        'name',
        'job_role',
        'organization_id',
        'designation_id',
        'session_id'  // Added session_id
    ];

    /**
     * Get the organization that the parliament member belongs to.
     */
    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * Get the designation of the parliament member.
     */
    public function designation()
    {
        return $this->belongsTo(Designation::class);
    }
    
    /**
     * Get the login session of the parliament member.
     */
    public function session()
    {
        return $this->belongsTo(LoginSession::class, 'session_id');
    }
}