<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Smalot\PdfParser\Parser;
use Illuminate\Support\Facades\Http;
use Exception;

class PdfController extends Controller
{
    public function analyzePdf(Request $request)
    {
        // Validate the uploaded file
        $request->validate([
            'file' => 'required|file|mimes:pdf|max:5120', // 5MB max
        ]);

        $file = $request->file('file');

        try {
            // Parse the PDF file to extract text
            $parser = new Parser();
            $pdf = $parser->parseFile($file->path());
            $text = $pdf->getText();

            // Limit text size to prevent request issues
            $text = substr($text, 0, 30000);

            // Send the extracted text to the Flask API for analysis
            $response = Http::timeout(90) // Set a longer timeout
                ->acceptJson()
                ->withHeaders([
                    'Content-Type' => 'application/json',
                ])
                ->post('http://localhost:5000/analyze', [
                    'text' => $text
                ]);

            // Check if the request was successful
            if ($response->successful()) {
                return $response->json();
            } else {
                return response()->json([
                    'error' => 'Analysis service returned an error',
                    'status' => $response->status(),
                    'message' => $response->body()
                ], $response->status());
            }

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'An error occurred while processing the PDF',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}
