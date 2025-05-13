<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class DoctorController extends Controller
{
    public function index()
    {
        $doctors = User::where('role', 'Admin')->get();
        return response()->json($doctors);
    }
}
