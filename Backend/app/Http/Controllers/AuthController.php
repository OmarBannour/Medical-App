<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;



class AuthController extends Controller
{
    public function login(Request $request)
    {
        // Validate input fields
        $credentials = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if (RateLimiter::tooManyAttempts('login:'.$request->ip(), 5)) {
            return response()->json([
                'message' => 'Too many login attempts. Please try again later.',
            ], 429);
        }

        RateLimiter::hit('login:'.$request->ip());


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

    public function updatePassword(Request $request)
    {
        // Validate input fields
        $request->validate([
            'email' => 'required|email|unique:users,email|max:255',
            'new_password' => [
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
