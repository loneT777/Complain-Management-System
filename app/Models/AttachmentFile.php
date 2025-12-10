<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AttachmentFile extends Model
{
    use HasFactory;

    protected $fillable = [
        'attachment_group_id',
        'file_name',
        'file_path',
        'extension'
    ];

    public function attachmentGroup()
    {
        return $this->belongsTo(AttachmentGroup::class, 'attachment_group_id');
    }
}
