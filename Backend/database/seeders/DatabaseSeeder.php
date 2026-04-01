<?php

namespace Database\Seeders;

use App\Models\Patient;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'Omar Bannour',
            'email' => 'bannouromar54@gmail.com',
            'password' => bcrypt('Admin123!'),
            'role' => 'admin',
            'must_change_password' => false,
        ]);
    }
}
