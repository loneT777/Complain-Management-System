<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Complaint extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference_no',
        'title',
        'description',
        'complainant_id',
        'last_status_id',
        'complaint_requested_id',
        'received_at',
        'user_received_id',
        'channel',
        'priority_level',
        'confidentiality_level',
        'due_at',
        'complainant_name',
        'complainant_phone',
        'remark'
    ];

    /**
     * Get the messages for this complaint
     */
    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    /**
     * Get the person who made the complaint
     */
    public function complainant()
    {
        return $this->belongsTo(Person::class, 'complainant_id');
    }
    
    /**
     * Get the categories for this complaint
     */
    public function categories()
    {
        return $this->belongsToMany(Category::class, 'complaint_categories');
    }

    /**
     * Get the attachments for this complaint
     */
    public function attachments()
    {
        return $this->hasMany(Attachment::class);
    }
}
