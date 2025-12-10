<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attachment extends Model
{
    use HasFactory;

    protected $table = 'attachments';
    
    public $timestamps = false;

    protected $fillable = [
        'complaint_id',
        'file_name',
        'file_path',
        'extension',
        'description',
        'user_id',
        'uploaded_at'
    ];

    protected $casts = [
        'uploaded_at' => 'datetime'
    ];

    /**
     * Get the complaint associated with the attachment
     */
    public function complaint()
    {
        return $this->belongsTo(Complaint::class);
    }

    /**
     * Get the user who uploaded the attachment
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
