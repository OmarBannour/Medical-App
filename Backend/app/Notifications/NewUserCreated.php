<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewUserCreated extends Notification
{
    use Queueable;
    protected $user;
    protected $rawPassword;

    /**
     * Create a new notification instance.
     */
    public function __construct($user, $rawPassword)
    {
        $this->user = $user;
        $this->rawPassword = $rawPassword;

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
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:4200');
        $resetUrl= "{$frontendUrl}/app-login";
        return (new MailMessage)
        ->subject('Your New Account')
        ->greeting('Hello, ' . $this->user->name)
        ->line('Your account has been created successfully.')
        ->line('Here are your login credentials:')
        ->line('**Email:** ' . $this->user->email)
        ->line('**Password:** ' . $this->rawPassword)
        ->line('For security reasons, please change your password after logging in.')
        ->action('Login Here', url($resetUrl))
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
