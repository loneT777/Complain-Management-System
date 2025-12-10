<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'role_id',
        'username',
        'password',
        'full_name',
        'person_id',
        'division_id',
        'is_approved',
        'session_id',
        'updated_session_id'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'is_approved' => 'boolean',
    ];

    /**
     * Get the role that owns the user
     */
    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Get the person associated with the user
     */
    public function person()
    {
        return $this->belongsTo(Person::class);
    }

    /**
     * Get the division associated with the user
     */
    public function division()
    {
        return $this->belongsTo(Division::class);
    }

    /**
     * Get the attachments uploaded by the user
     */
    public function attachments()
    {
        return $this->hasMany(Attachment::class);
    }
}
