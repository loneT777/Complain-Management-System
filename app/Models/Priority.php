<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Priority extends Model
{
    use HasFactory;

    protected $table = 'priorities';
    protected $fillable = ['name', 'level', 'description'];
    public $timestamps = false;

    /**
     * Get the complaints associated with this priority
     */
    public function complaints()
    {
        return $this->hasMany(Complaint::class, 'priority_level', 'level');
    }
}
