<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Patient;

class MedicalDocument extends Model
{
    use HasFactory;
    protected $fillable = ['title', 'file_path', 'type', 'user_id','summary'];

    public function patient(){
        return $this->belongsTo(Patient::class);
    }
}
