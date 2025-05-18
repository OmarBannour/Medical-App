<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\Patient;
use App\Models\User;
use Carbon\Carbon;

class NotificationService
{
   // create a notification for an upcoming exam

   public function createRoutineCheckupReminder(Patient $patient, $frequency = 'annuel', $additionalDetails = []){

    $now = Carbon::now();
    $dueDate=null;
    $title= '';


    switch($frequency){
        case 'monthly':
            $dueDate= $now->copy()->addMonth();   // copy() for  creat a copy of the instance now so the original dosnt get modified
            $title= 'monthly check-up';
            break;
        case 'quarterly':
             $dueDate=$now->copy()->addMonths(3);
             $title= 'quarterly  check-up';
             break;
        case 'semestrly':
            $dueDate= $now->copy()->addMonths(6);
            $title= 'semestrly check-up';
            break;
            case 'annual':
                $dueDate= $now->copy()->addYear();
                $title= 'annual check-up';
                break;
        }

        Notification::create([
            'patient_id' => $patient->id,
            'type' => 'check-up',
            'title' => $title,
            'message' => "the patient {$patient->name}  should make his {$title} before the " . $dueDate->format('d/m/Y'),
            'due_date' => $dueDate,
            'is_critical' => false,
            'details' => array_merge([
                'frequency' => $frequency,
            ], $additionalDetails)
        ]);





    }


   }





