<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Registro extends Model
{
    protected $table = 'registros_itv';

    protected $fillable = [
        'solicitud_id',
        'fecha_itv',
        'resultado',
        'observaciones',
    ];

    public function solicitud()
    {
        return $this->belongsTo(Solicitud::class);
    }
}
