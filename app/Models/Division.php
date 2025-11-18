<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Division extends Model
{
    use HasFactory;

    protected $table = 'divisions';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
        'name',
        'parent_id',
        'location',
        'is_approved',
        'remark',
        'session_id',
        'code',
        'officer_in_charge',
        'contact_no',
    ];

    protected $casts = [
        'parent_id' => 'integer',
        'session_id' => 'integer',
        'is_approved' => 'boolean',
    ];

    /**
     * Get the parent division.
     */
    public function parent()
    {
        return $this->belongsTo(Division::class, 'parent_id');
    }

    /**
     * Get the child divisions.
     */
    public function children()
    {
        return $this->hasMany(Division::class, 'parent_id');
    }

    /**
     * Get the session that owns the division.
     */
    // public function session()
    // {
    //     return $this->belongsTo(LoginSession::class, 'session_id');
    // }
}
