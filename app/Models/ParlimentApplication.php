<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ParlimentApplication extends Model
{
    use HasFactory;
    
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'applications';

    protected $fillable = [
        'parliament_member_id',
        'countries_visited',
        'nature_of_travel',
        'purpose_of_travel',
        'departure_date',
        'arrival_date',
        'application_type',
        'session_id',
        'organization_id'
    ];

    protected $casts = [
        'departure_date' => 'date',
        'arrival_date' => 'date',
    ];

    /**
     * Get the parliament member that owns the application.
     */
    public function parliamentMember(): BelongsTo
    {
        return $this->belongsTo(ParliamentMember::class, 'parliament_member_id');
    }

    /**
     * Get the statuses associated with the application.
     */
    public function statuses(): BelongsToMany
    {
        return $this->belongsToMany(Status::class, 'application_statuses', 'application_id', 'status_id')
            ->withPivot('session_id', 'remark', 'created_date');
    }

    /**
     * Get the files associated with the application.
     */
    public function files()
    {
        return $this->hasMany(ApplicationFile::class, 'application_id');
    }
}
