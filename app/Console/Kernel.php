<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        // Database backup - Daily at 2:00 AM
        $schedule->command('backup:database --clean')
            ->dailyAt('02:00')
            ->appendOutputTo(storage_path('logs/backup.log'));

        // Full backup - Weekly on Sunday at 3:00 AM
        $schedule->command('backup:full --clean')
            ->weekly()
            ->sundays()
            ->at('03:00')
            ->appendOutputTo(storage_path('logs/backup.log'));
    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
