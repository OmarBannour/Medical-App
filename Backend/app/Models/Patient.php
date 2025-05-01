<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;
use App\Models\MedicalDocument;

class Patient extends Model
{
    use HasFactory;
    use HasApiTokens;
    protected $fillable = [
        'name',
        'gender',
        'birthday',
        'antecedent',
        'treatment', // Corrected from 'Treatment'
        'country',
        'email',
        'password',
        'patient_code',
        'user_id',



    ];


public function MedicalDocument(){
    return $this->belongsTo(MedicalDocument::class);
}
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($patient) {
            $patient->patient_code='PAT-'. strtoupper(uniqid());

    });
}
}
