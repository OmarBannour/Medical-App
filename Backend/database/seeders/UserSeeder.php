<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'name' => 'omar',
            'email' => 'bannouromar54@gmail.com',
            'password' => Hash::make('51920204'),
            'must_change_password' => true,  // If needed
            'role' => 'admin',  // Assign appropriate role
        ]);
    }
}
