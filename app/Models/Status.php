<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Status extends Model
{
    use HasFactory;

    protected $table = 'statuses';

    protected $fillable = ['name', 'code'];

    public $timestamps = false;

    public function applications()
    {
        return $this->belongsToMany(
            \App\Models\ParlimentApplication::class,
            'application_statuses',
            'status_id',
            'application_id'
        )->withPivot('session_id', 'remark', 'created_date');
    }
}