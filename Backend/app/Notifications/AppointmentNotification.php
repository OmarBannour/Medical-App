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

                    ->line('Good Morning '.$this->user->name.' We want to to inform you that you have an appointment with the next information ' )
                    ->line("The date of the appointment is ".$this->notification->due_date)
                    ->line("The type of the appointment is ".$this->notification->type)
                    ->line("The title of the appointment is ".$this->notification->title)
                    ->line("The message of the appointment is ".$this->notification->message)
                    ->line('Thank you for using our application!');
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
