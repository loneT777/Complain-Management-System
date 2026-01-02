<?php

namespace App\Config;

/**
 * Priority Level SLA Configuration
 * Defines the number of days for resolution based on complaint priority level
 */
class PrioritySLA
{
    /**
     * SLA days mapping for each priority level
     * Used to calculate due dates for complaint assignments
     */
    const SLA_DAYS = [
        'Urgent' => 0,    // Same day (0 days added = today)
        'High' => 1,      // 24 hours (1 day)
        'Medium' => 5,    // 3-5 days
        'Low' => 7,       // 1 week
    ];

    /**
     * Get SLA days for a specific priority level
     * 
     * @param string $priority The priority level (e.g., 'High', 'Low')
     * @return int Number of days for resolution
     */
    public static function getDays(string $priority): int
    {
        return self::SLA_DAYS[$priority] ?? 7; // Default to 7 days if priority not found
    }

    /**
     * Get all SLA configurations
     * 
     * @return array Array of priority levels and their SLA days
     */
    public static function all(): array
    {
        return self::SLA_DAYS;
    }
}
