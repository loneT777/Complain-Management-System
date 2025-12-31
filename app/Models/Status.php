<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Status extends Model
{
    use HasFactory;

    protected $table = 'status';
    protected $fillable = ['name', 'code', 'description'];
    
    // Disable timestamps if the status table doesn't have created_at/updated_at columns
    public $timestamps = false;

    /**
     * Get the complaints associated with this status
     */
    public function complaints()
    {
        return $this->hasMany(Complaint::class, 'last_status_id');
    }
}