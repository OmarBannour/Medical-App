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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('patient_id');
            $table->unsignedBigInteger('user_id')->nullable(); // Médecin/personnel médical
            $table->string('type'); // 'examen', 'bilan', 'alerte', etc.
            $table->string('title');
            $table->text('message');
            $table->dateTime('due_date')->nullable();
            $table->dateTime('read_at')->nullable();
            $table->boolean('is_critical')->default(false);
            $table->json('details')->nullable(); // Pour stocker des informations supplémentaires
            $table->timestamps();

            $table->foreign('patient_id')->references('id')->on('patients');
            $table->foreign('user_id')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
