<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index(Request $request){
        //Récuperer les notification pour l'utlisateur connecté

        $user= Auth::user();
         // récuperer uniquement les notifications appartement a l'utlisateur actuel

         $query  = Notification::where('user_id' , $user->id);

         // filtrage par type si specifié
         if($request->has('type')){
            $query->where('type', $request->type);
         }

         //filtrage with satuts read/no read

         if($request->has('read')){
            if ($request->read){
                $query->whereNotNull('read_at');
            }
            else{
                $query->whereNull('read_at');
            }

         }
         // show with crtical
         if($request->has('critical')){
            $query->where('is_critical', (bool)$request->critical);
         }

         $notifcations= $query->orderBy('is_critical', 'desc')
              ->orderBy('created_at', 'desc')
              ->paginate(20); // show 20 notification per page

        return response()->json($notifcations);

        }

        // marke a notification as read

        public function markAsRead($id){
            $user = Auth::user();
            $notification= Notification::findOrFail($id);

            // verify if the user has the permission to a notification as read

            if ($notification->user_id !== $user->id) {
                return response()->json(['error' => 'Non autorisé'], 403);
            }
            $notification->read_at= now();
            $notification->save();

            return response()->json(['success'=>true]);



        }

        public function CountNotification(){
            $user= Auth::user();
            $count= Notification::where('user_id' , $user->id)
                ->whereNull('read_at')
                ->count();

                return response()->json($count);
        }


        // get the number of inread notifications

        public function getUnreadCount(){
            $user=Auth::user();
            $count= Notification::where('user_id' , $user->id)
                ->whereNull('read_at')
                ->count();

                return response()->json(['count' , $count]);
        }

        // mark all notification as read
        public function markAllasRead(){
            $user= Auth::user();
            Notification::where('user_id', $user->id)
                ->whereNull('read_at')
                ->update(['read_at'=>now()]);

                return response()->json(['Success'=>true]);
        }

        public function store(Request $request)
        {
            $validate=$request->validate([
            'patient_id' => 'required|exists:patients,id',
            'user_id' => 'required|exists:patients,user_id',
            'type' => 'required|string',
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'due_date' => 'required|date',
            'is_critical' => 'boolean',


            ]);


            $notification = Notification::create($validate);

            return response()->json($notification, 201);
        }
        public function destroy($id){
            $notification= Notification::findOrFail($id);
            $notification->delete();
            return response()->json(null,204);
        }
        }

