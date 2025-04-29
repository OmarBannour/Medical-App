<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\Patient;
use App\Models\User;
use Carbon\Carbon;

class NotificationService
{
   // create a notification for an upcoming exam

   public function createExamReminder(Patient $patient, $examType, Carbon $examDate, $additionalDetails = []){


    // claculer la date de notification (3j avant l'examen)
    $notificationDate= $examDate->copy()->subDays(3);
    Notification::create([
        'patient_id'=>$patient->id,
        'type'=>'exam',
        'title'=>"Reminder about an :{$examType} exam",
       'message' => "the patient {$patient->name}  should make  {$examType} exam in " . $examDate->format('d/m/Y'),
       'due_date'=>$notificationDate,
       'is_critical'=>false,
       'details'=> array_merge([
        'exam_type'=>$examType,
        'exam_date'=>$examDate->toDateTimeString()
       ], $additionalDetails)
    ]);
   }

   // create a notification about a bilan routine

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
      //verify and send the pending notification

      public function sendPendingNotifications(){

        $pendingNotification = Notification::whereNull('read_at')
           ->whereDate('due_date', '<=' , Carbon::now())
           ->get();

           foreach ($pendingNotification as $notification) {
            // Ici, vous pourriez implémenter l'envoi par email ou SMS
            // Pour l'instant, nous allons juste marquer les notifications comme "à traiter"
            // Cette méthode serait appelée par une tâche planifiée

            $notification->details = array_merge(
                $notification->details ?: [],
                ['notification_sent' => true, 'sent_at' => Carbon::now()->toDateTimeString()]
            );
            $notification->save();
        }

        return $pendingNotification->count();
      }
   }





