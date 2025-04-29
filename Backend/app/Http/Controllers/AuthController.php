<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;



class AuthController extends Controller
{
    public function login(Request $request)
    {
        // Validate input fields
        $credentials = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);
        

        // Find user by email
        $user = User::where('email', $credentials['email'])->first();

        if (!$user) {
            return response()->json(['message' => 'This email is not registered.'], 404);
        }

        // Check if password matches
        if (!Hash::check($credentials['password'], $user->password)) {
            return response()->json(['message' => 'The password is incorrect.'], 401);
        }

        // Check if the user must change their password
        // Only check this if the flag is true and it isn't the first login
        if ($user->must_change_password) {
            return response()->json([
                'message' => 'You need to change your password.',
                'must_change_password' => true,  // Flag indicating password change is required
            ], 200);
        }

        // If no password change is required, create a token
        $token = $user->createToken('AuthToken')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'user' => $user
        ], 200);


    }






    // Register logic

    public function register(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users',
            'password' => 'required|string|min:6',
        ]);

        // If validation passes, proceed with user creation
        $user = User::create([
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'password' => Hash::make($validatedData['password']),
            'role' => 'user', // Default role
        ]);

        // Ensure the user was created before proceeding with the patient creation
        if ($user) {
            // Generate a unique patient code
            $patientCode = 'PAT-' . strtoupper(Str::random(10));

            // Create Patient and link the user_id (the user_id will reference the user's ID)
            $patient = Patient::create([
                'name' => $user->name,
                'email' => $user->email,
                'password' => $user->password,
                'user_id'=>$user->id,
                'patient_code' => $patientCode, // Unique patient code
            ]);

            // Ensure the patient was created successfully
            if ($patient) {
                return response()->json(['message' => 'User and patient created successfully.'], 201);
            } else {
                return response()->json(['message' => 'Error creating patient.'], 500);
            }
        } else {
            return response()->json(['message' => 'Error creating user.'], 500);
        }
    }
    public function updatePassword(Request $request)
    {
        // Validate input fields
        $request->validate([
            'email'=>'required|email',
            'new_password' => 'required|string|min:8',
            'confirm_password' => 'required|string|same:new_password',
        ]);

        // Find user by email
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // Update password
        $user->password = Hash::make($request->new_password);
        $user->must_change_password = false;
        $user->save();

        // Create token for authentication
        $token = $user->createToken('AuthToken')->plainTextToken;

        return response()->json([
            'message' => 'Password updated successfully',
            'token' => $token,
            'user' => $user
        ], 200);
    }
    // Logout method
    public function logout(Request $request)
    {
        // Revoke user's tokens
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ], 200);
    }
}
