<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vehiculo extends Model
{
    use HasFactory;

    protected $table = 'vehiculos';
    
    protected $fillable = [
        'usuario_id',
        'imagen',
        'matricula',
        'vin',
        'marca',
        'modelo',
        'antiguedad',
        'kilometros',
        'fecha_ultima_itv'
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class);
    }
}
