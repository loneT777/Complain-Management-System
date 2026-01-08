<?php

namespace App\Traits;

trait HasPermissions
{
    /**
     * Check if user has a specific permission
     */
    public function hasPermission(string $permissionCode): bool
    {
        if (!$this->role) {
            return false;
        }

        // Super admin has all permissions
        if ($this->isSuperAdmin()) {
            return true;
        }

        return $this->role->permissions()
            ->where('code', $permissionCode)
            ->exists();
    }

    /**
     * Check if user has any of the given permissions
     */
    public function hasAnyPermission(array $permissions): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        foreach ($permissions as $permission) {
            if ($this->hasPermission($permission)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if user has all of the given permissions
     */
    public function hasAllPermissions(array $permissions): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        foreach ($permissions as $permission) {
            if (!$this->hasPermission($permission)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get all permissions for the user
     */
    public function getAllPermissions()
    {
        if (!$this->role) {
            return collect([]);
        }

        return $this->role->permissions;
    }

    /**
     * Get all permission codes for the user
     */
    public function getPermissionCodes(): array
    {
        if (!$this->role) {
            return [];
        }

        return $this->role->permissions()->pluck('code')->toArray();
    }
}
