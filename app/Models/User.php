<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Traits\HasPermissions;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens, HasPermissions;

    protected $fillable = [
        'role_id',
        'username',
        'password',
        'email',
        'designation',
        'full_name',
        'person_id',
        'division_id',
        'is_approved',
        'is_active',
        'session_id',
        'updated_session_id'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'is_approved' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * Get the role that owns the user
     */
    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Get the person associated with the user
     */
    public function person()
    {
        return $this->belongsTo(Person::class);
    }

    /**
     * Get the division associated with the user
     */
    public function division()
    {
        return $this->belongsTo(Division::class);
    }

    /**
     * Get the attachments uploaded by the user
     */
    public function attachments()
    {
        return $this->hasMany(Attachment::class);
    }

    /**
     * Get all login sessions for the user
     */
    public function loginSessions()
    {
        return $this->hasMany(LoginSession::class);
    }

    /**
     * Get the current active login session
     */
    public function activeSession()
    {
        return $this->loginSessions()
            ->whereNull('logout_time')
            ->latest('login_time')
            ->first();
    }

    /**
     * Check if user is a Super Admin
     */
    public function isSuperAdmin(): bool
    {
        return $this->role_id === 1;
    }

    /**
     * Check if user is a Complaint Manager (Role 3)
     */
    public function isComplaintManager(): bool
    {
        return $this->role_id === 3;
    }

    /**
     * Check if user has admin-level access (Super Admin or Complaint Manager)
     */
    public function hasAdminAccess(): bool
    {
        return $this->isSuperAdmin() || $this->isComplaintManager();
    }

    /**
     * Check if user is an Engineer
     */
    public function isEngineer(): bool
    {
        return $this->role_id === 5;
    }

    /**
     * Check if user is a Division Manager
     */
    public function isDivisionManager(): bool
    {
        return $this->role_id === 2;
    }

    /**
     * Check if user is a Complainant (Role 4 - Public User)
     */
    public function isComplainant(): bool
    {
        return $this->role_id === 4;
    }

    /**
     * Check if user has division access
     */
    public function hasDivisionAccess(): bool
    {
        return !empty($this->division_id);
    }

    /**
     * Check if user has a specific permission
     */
    public function hasPermission(string $permissionCode): bool
    {
        if (!$this->role) {
            return false;
        }

        // Super admin and Complaint Manager have all permissions
        if ($this->hasAdminAccess()) {
            return true;
        }

        return $this->role->permissions()
            ->where('code', $permissionCode)
            ->exists();
    }

    /**
     * Check if user can view all complaints
     */
    public function canViewAllComplaints(): bool
    {
        return $this->hasAdminAccess() || $this->hasPermission('complaint.read');
    }

    /**
     * Check if user can view division complaints
     */
    public function canViewDivisionComplaints(): bool
    {
        return $this->hasDivisionAccess() && $this->hasPermission('complaint.read');
    }

    /**
     * Check if user can view own complaints
     */
    public function canViewOwnComplaints(): bool
    {
        return $this->hasPermission('complaint.read');
    }

    /**
     * Get complaint IDs assigned to engineer
     */
    public function getAssignedComplaintIds(): array
    {
        // Get all complaint IDs where this user's person_id is in assignments
        if (!$this->person_id) {
            return [];
        }

        return ComplaintAssignment::where('assignee_id', $this->person_id)
            ->distinct()
            ->pluck('complaint_id')
            ->toArray();
    }

    /**
     * Get accessible complaint IDs for the user based on role
     */
    public function getAccessibleComplaintIds(): array
    {
        // Super admin and Complaint Manager can see all complaints
        if ($this->hasAdminAccess()) {
            return Complaint::pluck('id')->toArray();
        }

        // Engineer: see only assigned complaints
        if ($this->isEngineer()) {
            return $this->getAssignedComplaintIds();
        }

        // Complainant: see only their own complaints
        if ($this->isComplainant()) {
            if ($this->person_id) {
                return Complaint::where('complainant_id', $this->person_id)
                    ->pluck('id')
                    ->toArray();
            }
            return [];
        }

        // Division-based access
        if ($this->hasDivisionAccess()) {
            return Complaint::where('division_id', $this->division_id)->pluck('id')->toArray();
        }

        // User can see complaints they created or are assigned to
        return Complaint::where('created_by', $this->id)
            ->orWhereHas('assignments', function ($query) {
                $query->where('user_id', $this->id);
            })
            ->pluck('id')
            ->toArray();
    }
}
