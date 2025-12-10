<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AttachmentGroup extends Model
{
    use HasFactory;

    protected $fillable = [
        'complaint_id',
        'complaint_log_id',
        'user_id',
        'description',
        'uploaded_at'
    ];

    protected $casts = [
        'uploaded_at' => 'datetime'
    ];

    public function files()
    {
        return $this->hasMany(AttachmentFile::class, 'attachment_group_id');
    }

    public function complaint()
    {
        return $this->belongsTo(Complaint::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
