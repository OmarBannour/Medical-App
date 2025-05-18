<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MedicalDocument;
use App\Models\Patient;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use function storage_path;


class MedicalDocumentController extends Controller
{
    public function upload(Request $request)
    {
        try {
            // Validate the request
            $request->validate([
                'title' => 'required|string|max:255',
                'summary' => 'nullable|string|max:500',
                'type' => 'required|string|max:50',
                'file' => 'required|file|mimes:jpg,jpeg,png,pdf,docx,xlsx',
                'patient_id' => 'required|exists:patients,id'
            ]);

            // Store the file in the private/medical_documents directory
            $file = $request->file('file');
            $path = $file->store('medical_documents', 'public');


            // Log the file path for debugging
            Log::info('File Stored At:', ['path' => $path]);

            // Create the document record
            $document = MedicalDocument::create([
                'title' => $request->input('title'),
                'summary' => $request->input('summary'),
                'type' => $request->input('type'),
                'file_path' => $path,
                'patient_id' => $request->input('patient_id')
            ]);

            // Log the created document for debugging
            Log::info('Document Created:', $document->toArray());

            return response()->json($document, 201);
        } catch (\Exception $e) {
            // Log the error
            Log::error('File Upload Error:', ['error' => $e->getMessage()]);

            // Return an error response
            return response()->json([
                'message' => 'Une erreur est survenue lors du téléchargement du fichier.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

   public function download($id)
{
    try {
        // Find the document
        $document = MedicalDocument::find($id);

        if (!$document) {
            return response()->json(['message' => 'Document non trouvé'], 404);
        }

        // Get the authenticated user
        $user = Auth::user();

        // Check access permissions based on user role
        if ($user->role === 'admin') {
            // Admins can download any document
        } else {
            // For patients, get their patient ID
            $patient = Patient::where('user_id', $user->id)->first();

            if (!$patient) {
                return response()->json(['message' => 'Profil patient non trouvé'], 404);
            }

            // Ensure the document belongs to the patient
            if ($document->patient_id !== $patient->id) {
                return response()->json(['message' => 'Accès interdit'], 403);
            }
        }

        // Construct the full file path
        $fullPath = storage_path("app/public/{$document->file_path}");
        Log::info('Checking file existence at:', ['path' => $fullPath]);

        // Check if the file exists
        if (!file_exists($fullPath)) {
            Log::error('File not found:', ['file_path' => $fullPath]);
            return response()->json(['message' => 'Fichier non trouvé'], 404);
        }

        // Return the file for download
        return response()->download($fullPath);
    } catch (\Exception $e) {
        Log::error('File Download Error:', ['error' => $e->getMessage()]);
        return response()->json([
            'message' => 'Une erreur est survenue lors du téléchargement du fichier.',
            'error' => $e->getMessage()
        ], 500);
    }
}
  public function index(Request $request)
{
    try {
        $user = Auth::user(); // Get the authenticated user
        $perPage = $request->input('per_page', 10); // Default 10 items per page

        // Check if the user is an admin or a patient
        if ($user->role === 'admin') {
            // If admin, fetch all documents with pagination
            $documents = MedicalDocument::all();
        } else {
            // Get the patient ID from the patient record
            $patient = Patient::where('user_id', $user->id)->first();

            if (!$patient) {
                return response()->json([
                    'message' => 'Patient profile not found for this user.'
                ], 404);
            }

            // Fetch documents linked to the patient's ID with pagination
            $documents = MedicalDocument::where('patient_id', $patient->id)
                         ->paginate($perPage);
        }

        return response()->json($documents);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Une erreur est survenue lors de la récupération des documents.',
            'error' => $e->getMessage()
        ], 500);
    }
}
    // count the number of documents where the type is "EGC"
    public function EGCCount()
    {
        try {
            $user = Auth::user(); // Get the authenticated user

            // Check if the user is an admin or a patient
            if ($user->role === 'admin') {
                // If admin, fetch all documents
                $count = MedicalDocument::where('type', 'EGC')->count();
            } else {
                return response()->json(['message' => 'Accès interdit'], 403);
            }

            return response()->json($count);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Une erreur est survenue lors de la récupération du nombre de documents.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function ReportCount()
    {
        try {
            $user = Auth::user(); // Get the authenticated user

            // Check if the user is an admin or a patient
            if ($user->role === 'admin') {
                // If admin, fetch all documents
                $count = MedicalDocument::where('type', 'Report')->count();
            } else {
                return response()->json(['message' => 'Accès interdit'], 403);
            }

            return response()->json($count);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Une erreur est survenue lors de la récupération du nombre de documents.',
                'error' => $e->getMessage()
            ], 500);
        }
}
public function LabResultCount()
{
    try {
        $user = Auth::user(); // Get the authenticated user

        // Check if the user is an admin or a patient
        if ($user->role === 'admin') {
            // If admin, fetch all documents
            $count = MedicalDocument::where('type', 'Lab Result')->count();
        } else {
            return response()->json(['message' => 'Accès interdit'], 403);
        }

        return response()->json($count);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Une erreur est survenue lors de la récupération du nombre de documents.',
            'error' => $e->getMessage()
        ], 500);
    }
}

    public function destroy($id)
    {
        try {
            // Find the document
            $document = MedicalDocument::find($id);

            if (!$document) {
                return response()->json(['message' => 'Document non trouvé'], 404);
            }

            // Ensure the document belongs to the authenticated user
            if ($document->user_id !== Auth::id()) {
                return response()->json(['message' => 'Accès interdit'], 403);
            }

            // Delete the file from storage
            $filePath = storage_path("app/public/{$document->file_path}");
            if (file_exists($filePath)) {
                unlink($filePath);
            }

            // Delete the document record
            $document->delete();

            return response()->json(['message' => 'Document supprimé avec succès']);
        } catch (\Exception $e) {
            Log::error('File Deletion Error:', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Une erreur est survenue lors de la suppression du fichier.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    //see the content of the medical recored

 public function getContent($id)
 {
    $document=MedicalDocument::findOrFail($id);
    $path=storage_path("app/public/{$document->file_path}");
    if (!file_exists($path)){
        return response()->json(['message'=>'Fichier non trouvé'],404);
    }
    $mime=mime_content_type($path);
    $content=file_get_contents($path);
   return response()->json([
    'content' => base64_encode($content),
        'mime_type' => $mime,
        'file_name' => $document->file_name

   ]);







 }
 // function to filter the documents by type
 public function filterReport()
 {
  $documents=MedicalDocument::where('type','Report')->get();
  return $documents;

 }
 public function filterEGC(){
    $documents=MedicalDocument::where('type','EGC')->get();
    return $documents;
 }
 public function filterLabResult(){
    $documents=MedicalDocument::where('type','Lab Result')->get();
    return $documents;
 }

 // function to filter the documents by date
public function DocumentsByweek()
{
    $documents=MedicalDocument::whereBetween('created_at', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()])->get();
    return response()->json($documents);
}
public function DocumentsByMonth()
{
    $documents=MedicalDocument::whereMonth('created_at', Carbon::now()->month)->get();
    return response()->json($documents);
}
public function DocumentsByYear()
{
    $documents=MedicalDocument::whereYear('created_at', Carbon::now()->year)->get();
    return response()->json($documents);
}

//Show Document Summary to a patient
public function ShowDocumentSummary($patient_id) {
    $summary = MedicalDocument::where('patient_id', $patient_id)
                              ->select('summary', 'created_at')
                              ->get();

    return $summary;
}
}
