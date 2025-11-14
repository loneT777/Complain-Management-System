<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApplicationFile extends Model
{
    use HasFactory;

    protected $fillable = [
        'application_id',
        'file_name',
        'extension',
    ];

    /**
     * Get the application that owns the file.
     */
    public function application()
    {
        return $this->belongsTo(ParlimentApplication::class, 'application_id');
    }
}
