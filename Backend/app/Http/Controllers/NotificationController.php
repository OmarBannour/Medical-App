<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        //Récuperer les notification pour l'utlisateur connecté

        $user = Auth::user();
        // récuperer uniquement les notifications appartement a l'utlisateur actuel

        $query  = Notification::where('user_id', $user->id);

        // filtrage par type si specifié
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        //filtrage with satuts read/no read

        if ($request->filled('read')) {
            $isRead = filter_var($request->read, FILTER_VALIDATE_BOOLEAN);
            if ($isRead) {
                $query->whereNotNull('read_at');
            } else {
                $query->whereNull('read_at');
            }
        }

        if ($request->filled('critical')) {
            $isCritical = filter_var($request->critical, FILTER_VALIDATE_BOOLEAN);
            $query->where('is_critical', $isCritical);
        }

        $perPage = $request->get('per_page', 20); // Default to 20 if not provided
        $notifications = $query->orderBy('is_critical', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json($notifications, 200);
    }

    // marke a notification as read

    public function markAsRead($id)
    {
        $user = Auth::user();
        $notification = Notification::findOrFail($id);

        // verify if the user has the permission to a notification as read

        if ($notification->user_id !== $user->id) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }
        $notification->read_at = now();
        $notification->save();

        return response()->json(['success' => true]);
    }

    // count the numeber of notification where the type is appointment
    public function countAppointmentNotification()
    {

        $count = Notification::where('type', 'appointment')
            ->whereNull('read_at')
            ->count();

        return response()->json($count);
    }

    //count the number of notification where the type is appointment and for thr today date

    public function TodayAppointment()
    {
        $count = Notification::where('type', 'appointment')
            ->whereDate('due_date', today()->format('Y-m-d'))
            ->whereNull('read_at')
            ->count();
        return response()->json($count);
    }


    public function CountNotification()
    {
        $user = Auth::user();
        $count = Notification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->count();

        return response()->json($count);
    }


    // get the number of inread notifications

    public function getUnreadCount()
    {
        $user = Auth::user();
        $count = Notification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->count();

        return response()->json(['count', $count]);
    }

    // mark all notification as read
    public function markAllasRead()
    {
        $user = Auth::user();
        Notification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['Success' => true]);
    }

    public function store(Request $request)
    {
        $validate = $request->validate([
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
    public function destroy($id)
    {
        $notification = Notification::findOrFail($id);
        $notification->delete();
        return response()->json(null, 204);
    }
// chart data for the appointment evolution
    public function appointmentEvolution()
{
    $data = Notification::selectRaw('MONTH(date) as month, COUNT(*) as count')
        ->groupBy('month')
        ->orderBy('month')
        ->get();

    return response()->json($data);
}
}
