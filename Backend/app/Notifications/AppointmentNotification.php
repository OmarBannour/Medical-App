<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AppointmentNotification extends Notification
{
    use Queueable;

  protected $notification;
  protected $user;


    public function __construct($notification , $user )
    {
        $this->notification = $notification;
        $this->user = $user;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage

    {


       return (new MailMessage)
    ->subject('Your Upcoming MedCore Appointment Confirmation')
    ->greeting('Dear ' . $this->user->name . ',')
    ->line('We would like to confirm your upcoming appointment with the following details:')
    ->line('')
    ->line('**Appointment Information:**')
    ->line('• **Date and Time:** ' . $this->formatDateTime($this->notification->due_date))
    ->line('• **Appointment Type:** ' . ucfirst($this->notification->type))
    ->line('• **Title:** ' . $this->notification->title)
    ->line('')
    ->line('**Additional Information:**')
    ->line($this->notification->message)
    ->line('')
    ->line('')
    ->line('If you need to reschedule or have any questions regarding your appointment, please contact our office at least 24 hours in advance.')
    ->line('')
    ->salutation('Warm regards,')
    ->line('MedCore Healthcare Team')
    ->line('')
->line('*This is an automated message. Please do not reply directly to this email.*');
}

/**
 * Helper method to properly format the date/time.
 */
private function formatDateTime($dateTime)
{
    // If you have Carbon available (recommended)
    if (class_exists('Carbon\Carbon')) {
        return \Carbon\Carbon::parse($dateTime)->format('l, F j, Y \a\t g:i A');
    }

    // Fallback to basic formatting if Carbon isn't available
    return date('l, F j, Y \a\t g:i A', strtotime($dateTime));
}

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}

