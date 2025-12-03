<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Status extends Model
{
    use HasFactory;

    protected $table = 'status';
    protected $fillable = ['name', 'code'];

    public function complaints()
    {
        return $this->hasMany(Complaint::class, 'last_status_id');
    }
}
