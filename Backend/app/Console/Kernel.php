<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule)
{
    $schedule->command('notifications:check')
        ->daily()
        ->at('08:00') // Send at 8 AM daily
        ->appendOutputTo(storage_path('logs/notifications.log'));
}
}
