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
        $request->validate([
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120', // 5MB max
        ]);

        $file = $request->file('file');
        $mimeType = $file->getMimeType();
        $isImage = str_starts_with($mimeType, 'image/');

        try {
            if ($isImage) {
                $response = Http::timeout(120)
                    ->attach('file', file_get_contents($file->path()), $file->getClientOriginalName())
                    ->post('http://localhost:5000/analyze-image');
            } else {
                $parser = new Parser();
                $text = $parser->parseFile($file->path())->getText();
                $text = substr($text, 0, 30000); // Limit text size

                $response = Http::timeout(60)
                    ->post('http://localhost:5000/analyze', [
                        'text' => $text
                    ]);
            }

            return $response->json();

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            return response()->json([
                'error' => 'Connection timeout',
                'message' => 'The analysis server took too long to respond'
            ], 504);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Processing failed',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}
