<?php

namespace App\Http\Controllers;

use App\Notifications\NewUserCreated;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Patient;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class UserController extends Controller
{
    use AuthorizesRequests;
    /**
     * Display a listing of the resource.
     */
    public function index()

    {
        $this->authorize('view-user');
        $User = User::all();
        return $User;
    }


    public function create()
    {
        $this->authorize('create-user');

        // Validate incoming data
        $validate = request()->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email|max:255',
            'password' => [
                'unique:users,password',
                'required',
                'string',
                'min:12',
                'max:255',
                'regex:/[A-Z]/',
                'regex:/[a-z]/',
                'regex:/[0-9]/',
                'regex:/[!@#$%^&*(),.?":{}|<>]/',
                'not_in:password,12345678,qwerty,admin123',
            ],
            'role' => 'required|string',
        ]);

        try {
            $hasMx = checkdnsrr(explode('@', request()->email)[1], 'MX');
        } catch (\Exception $e) {
            $hasMx = false;
        }
        if (!$hasMx) {
            return back()->withErrors(['email' => 'Invalid email domain.']);
        }

        // Hash the password before saving
        $rawPassword = $validate['password'];
        $validate['password'] = Hash::make($rawPassword);
        $validate['must_change_password'] = true; // Force password change

        // Create user
        $User = User::create($validate);
        $User->save();
        // Generate a unique patient code
        $patientCode = 'PAT-' . strtoupper(Str::random(10));

        // Create the Patient and link it to the newly created user
        $patient = Patient::create([
            'name' => $User->name,
            'email' => $User->email,
            'password' => $User->password,
            'user_id' => $User->id,
            'patient_code' => $patientCode,
        ]);
        $User->notify(new NewUserCreated($User, $rawPassword));

        // Optionally save the patient, but it's not necessary as `create` already does that
        $patient->save();

        // Return response
        return response()->json([
            'message' => 'User created successfully',
            'user' => $User,
        ], 201);
    }


    public function store(Request $request)
    {

    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)

    {
        $this->authorize('view-user');
        $User=User::find($id);
        return $User;
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {

    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $this->authorize('update-user');
        $request= request()->validate([
            "name"=>"sometimes|string|max:255",
            "email"=>"sometimes|email",
            "password"=>"sometimes|string",
            "role"=>"sometimes|string"
             ]);
            $User = User::find($id);
            $User->update($request);
            $User->save();
            return $User;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $this->authorize('delete-user');
        $User = User::find($id);
        $User->delete();
        return response()->json(null, 204);
    }
}
