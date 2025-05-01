<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Patient;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;



class PatientController extends Controller
{
    public function index()
    {
        $patients = Patient::all();
        return $patients;
    }

    public function countAll()
    {
        $count = Patient::count();
        return response()->json( $count);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(request $request)
    {
       $validate = request()->validate( [
        "name"=> "required|string|max:255",
        "gender"=> "required|string",
        "birthday" => 'required|date_format:d-m-Y',
        "antecedent"=> "required|text",
        "treatment"=> "required|text"
        ] );
        $patient = Patient::create($validate  );
        return $patient;



    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {

    }

    /**
     * Display the specified resource.
     */
    public function show()
    {
        // Get the authenticated user
        $user = \Illuminate\Support\Facades\Auth::user();

        // Get the patient associated with this user
        $patient = Patient::where('user_id', $user->id)->first();

        if (!$patient) {
            return response()->json(['message' => 'Patient not found'], 404);
        }

        return $patient;
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id){
        $patient=Patient::findOrFail($id);
        $validateData= $request->validate([
            "gender" => "sometimes|string",
            "birthday" => "sometimes|date",
            "country" => "sometimes|string",
        ]);
        $update= $patient->update($validateData);
        return $patient;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Patient $patient)
    {
        $patient -> delete();
        return response( )->noContent();
    }

    // function to get the patients by gender
    public function getfemalePatients(){
        $female=Patient::where('gender' , 'female')->get();
        return response()->json($female);
    }

    public function getmalePatients(){
        $male=Patient::where('gender','male')->get();
        return response()->json($male);
}

public function patientEvolution(){
    $data= Patient::selectRaw('MONTH(created_at) as month, COUNT(*) as count')
    ->groupBy('month')
    ->orderBy('month')
    ->get();

    return response()->json($data);

}
}
