<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LoginSession extends Model
{
    use HasFactory;

    protected $table = 'login_sessions';

    protected $fillable = [
        'user_id',
        'login_time',
        'logout_time',
    ];

    protected $casts = [
        'login_time' => 'datetime',
        'logout_time' => 'datetime',
    ];

    public $timestamps = false;

    /**
     * Get the user that owns the login session
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if the session is active (no logout time)
     */
    public function isActive()
    {
        return is_null($this->logout_time);
    }
}
