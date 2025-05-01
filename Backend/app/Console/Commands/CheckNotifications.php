<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\NotificationService;

class CheckNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notifications:check';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Vérifie et envoie les notifications en attente';

    /**
     * Execute the console command.
     */
    public function handle(NotificationService $notification)
    {
        $count = $notification->sendPendingNotifications();
        $this->info("{$count} notifications ont été traitées.");
        return Command::SUCCESS;


    }
    
}
