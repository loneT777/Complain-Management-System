<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Person extends Model
{
    use HasFactory;

    protected $table = 'persons';

    protected $fillable = [
        'title',
        'full_name',
        'nic',
        'code',
        'office_phone',
        'whatsapp',
        'address',
        'type',
        'designation',
        'remark'
    ];
}
