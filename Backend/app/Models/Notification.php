<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;

class Notification extends Model
{
    use HasFactory,  Notifiable;

    protected $fillable = ['patient_id',
        'user_id',
        'type',
        'title',
        'message',
        'due_date',
        'read_at',
        'is_critical',
        'details'];

        protected $casts = [
            'due_date' => 'datetime',
            'read_at' => 'datetime',
            'is_critical' => 'boolean',
            'details' => 'array'
        ];


        public function patient(){
            return $this->belongsTo(Patient::class);
        }
        public function user(){
            return $this->belongsTo(User::class);
        }


}
