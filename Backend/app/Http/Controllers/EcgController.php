<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Model\MedicalDocumentController;
use Illuminate\Support\Facades\Http;



class EcgController extends Controller
{
    /**
     * Process an ECG image and return prediction
     */
    public function predict(Request $request)
    {
        // Validate the uploaded file
        $request->validate([
            'ecg_image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        try {
            // Store the file temporarily
            $image = $request->file('ecg_image');
            $imagePath = $image->store('private/temp', 'local');
            $fullPath = Storage::path($imagePath);

            // Execute Python script
            $response = Http::attach(
                'file', file_get_contents($fullPath), basename($fullPath)
            )->post('http://127.0.0.1:5001/predict');

            if ($response->failed()) {
                throw new \Exception('Prediction API failed: ' . $response->body());
            }

            $result = $response->json();
            // Clean up temporary file
            Storage::delete($imagePath);

            // Return the prediction results
            return response()->json([
                'interpretation' => $result['interpretation'] ?? null
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

   // save the prediction the the database
   public function summarySave(){

   }
}
