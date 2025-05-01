<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MedicalDocumentController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\ResetPasswordController;
use App\Http\Controllers\UserController;
use App\Models\Patient;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PdfController;
use App\Models\Notification;
use App\Http\Controllers\EcgController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::put('/updatePassword', [AuthController::class, 'updatePassword']);
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return response()->json([
        'role' => $request->user()->role,
        'name' => $request->user()->name
    ]);
});

    // medical documents routes
    Route::post('/documents/upload', [MedicalDocumentController::class, 'upload']);
    Route::middleware('auth:sanctum')->get('/documents/{id}/download', [MedicalDocumentController::class, 'download']);
    Route::middleware('auth:sanctum')->get('/documents', [MedicalDocumentController::class, 'index']);
    Route::middleware('auth:sanctum')->get('/documents/EGC/count', [MedicalDocumentController::class, 'EGCCount']);
    Route::middleware('auth:sanctum')->get('/documents/Report/count', [MedicalDocumentController::class, 'ReportCount']);
    Route::middleware('auth:sanctum')->get('/documents/lab_result/count', [MedicalDocumentController::class, 'LabResultCount']);



    //users routes

    Route::middleware('auth:sanctum')->get('/users', [UserController::class, 'index']);
    Route::middleware('auth:sanctum')->post('/users/create', [UserController::class, 'create']);
    Route::middleware('auth:sanctum')->get('/users/{id}', [UserController::class, 'show']);
    Route::middleware('auth:sanctum')->put('/users/{id}/update', [UserController::class, 'update']);
    Route::middleware('auth:sanctum')->delete('/users/{id}/delete', [UserController::class, 'destroy']);

    // Forgot Password Route (Request Reset Link)
Route::post('/forgot-password', [ResetPasswordController::class, 'sendResetLinkEmail']);

// Reset Password Route
Route::post('/reset-password', [ResetPasswordController::class, 'resetPassword']);

Route::get('password/reset/{token}', function ($token) {
    return response()->json([
        'reset_url' => "http://localhost:4200/app-reset-password/$token"
    ]);
})->name('password.reset');

Route::middleware('auth:sanctum')->get('/patients', [PatientController::class, 'index']);
Route::middleware('auth:sanctum')->get('/patient/current', [PatientController::class, 'show']);
Route::middleware('auth:sanctum')->put('/patient/{id}/update', [PatientController::class, 'update']);
Route::middleware('auth:sanctum')->get('/patients/count', [PatientController::class, 'countAll']);



    Route::middleware('auth:sanctum')->get('/notifications', [NotificationController::class, 'index']);
    Route::middleware('auth:sanctum')->post('/notifications/create', [NotificationController::class, 'store']);
    Route::middleware('auth:sanctum')->put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::middleware('auth:sanctum')->get('/notifications/unread-count', [NotificationController::class, 'getUnreadCount']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
    Route::middleware('auth:sanctum')->get('/notifications/count', [NotificationController::class, 'CountNotification']);
    Route::middleware('auth:sanctum')->get('/notifications/appointment-count', [NotificationController::class, 'CountAppointmentNotification']);
    Route::middleware('auth:sanctum')->get('/notifications/today_appointment', [NotificationController::class, 'TodayAppointment']);



Route::middleware('auth:sanctum')->post('/analyze-pdf', [PdfController::class, 'analyzePdf']);


// search routes

Route::middleware('auth:sanctum')->get('/patients/females' , [PatientController::class , 'getfemalePatients']);
Route::middleware('auth:sanctum')->get('/patients/males' , [PatientController::class , 'getmalePatients']);
 // charts Routes
Route::middleware('auth:sanctum')->get('/patients/NumberEvolution', [PatientController::class, 'patientEvolutionMonthly']);
Route::middleware('auth:sanctum')->get('/patients/NumberEvolutionYearly', [PatientController::class, 'patientEvolutionYearly']);
Route::middleware('auth:sanctum')->get('/patients/NumberEvolutionDaily', [PatientController::class, 'patientEvolutionDaily']);
Route::middleware('auth:sanctum')->get('/patients/NumberEvolutionWeekly', [PatientController::class, 'patientEvolutionWeekly']);
Route::middleware('auth:sanctum')->get('/notifications/NumberEvolution', [Notification::class, 'appointmentEvolution']);

//EGC routes







