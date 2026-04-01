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
use Illuminate\Support\Facades\DB;



class AuthController extends Controller
{
    public function login(Request $request)
{
    try {
        $credentials = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        // Rate limiting
        if (RateLimiter::tooManyAttempts('login:'.$request->ip(), 5)) {
            return response()->json([
                'message' => 'Too many login attempts. Please try again later.',
            ], 429);
        }

        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            RateLimiter::hit('login:'.$request->ip());
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        if ($user->must_change_password) {
            return response()->json([
                'message' => 'Password change required',
                'must_change_password' => true,
            ], 200);
        }

        // Create token with 60 minute expiration
        $token = $user->createToken('AuthToken', ['*'], now()->addMinutes(60))->plainTextToken;
        $user->token = $token;
        $user->token_expires_at = now()->addMinutes(60);
        $user->save();

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'token_expires_at' => now()->addMinutes(60)->toDateTimeString(),
            'user' => $user
        ], 200);
    } catch (\Exception $e) {
        Log::error('Login error: ' . $e->getMessage());
        Log::error('Stack trace: ' . $e->getTraceAsString());
        return response()->json([
            'message' => 'Server Error',
            'error' => $e->getMessage()
        ], 500);
    }
}

    public function updatePassword(Request $request)
    {
        // Validate input fields
        $request->validate([
            'email' => 'required|email|max:255',
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
       $token = User::where('token', $request->token)->first();
       $token->token = null;
       $token->save();

        return response()->json([
            'message' => 'Logged out successfully'
        ], 200);
    }
}
