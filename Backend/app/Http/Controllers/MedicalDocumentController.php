<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MedicalDocument;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;



use function storage_path;


class MedicalDocumentController extends Controller
{
    public function upload(Request $request)
    {
        try {
            // Validate the request
            $request->validate([
                'title' => 'required|string|max:255',
                'type' => 'required|string|max:50',
                'file' => 'required|file|mimes:jpg,jpeg,png,pdf,docx,xlsx',
                'user_id' => 'required|exists:users,id'
            ]);

            // Store the file in the private/medical_documents directory
            $file = $request->file('file');
            $path = $file->store('medical_documents', 'public');


            // Log the file path for debugging
            Log::info('File Stored At:', ['path' => $path]);

            // Create the document record
            $document = MedicalDocument::create([
                'title' => $request->input('title'),
                'type' => $request->input('type'),
                'file_path' => $path,
                'user_id' => $request->input('user_id')
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

            // Ensure the document belongs to the authenticated user
            if ($document->user_id !== Auth::id()) {
                return response()->json(['message' => 'Accès interdit'], 403);
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
    public function index()
    {
        try {
            $user = Auth::user(); // Get the authenticated user

            // Check if the user is an admin or a patient
            if ($user->role === 'admin') {
                // If admin, fetch all documents
                $documents = MedicalDocument::all();
            } else {
                // If not admin (patient), fetch documents linked to both user and patient tables
                $documents = MedicalDocument::where('user_id', $user->id)
                    ->orWhereIn('user_id', function ($query) use ($user) {
                        $query->select('user_id')->from('patients')->where('patients.user_id', $user->id);
                    })
                    ->get();
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
}
