<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up(): void
    {
        Schema::table('medical_documents', function (Blueprint $table) {
            // 1. Drop the existing foreign key constraint
            $table->dropForeign(['user_id']);

            // 2. Drop the old column
            $table->dropColumn('user_id');

            // 3. Add the new column with the correct foreign key
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('medical_documents', function (Blueprint $table) {
            // 1. Drop the new foreign key constraint
            $table->dropForeign(['patient_id']);

            // 2. Drop the new column
            $table->dropColumn('patient_id');

            // 3. Add back the original column with its foreign key
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
        });
    }
};
