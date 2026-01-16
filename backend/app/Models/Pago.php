<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pago extends Model
{
    use HasFactory;
    
    protected $table = 'pagos';

    protected $fillable = [
        'solicitud_id',
        'importe',
        'metodo_pago',
        'estado',
    ];

    public function solicitud()
    {
        return $this->belongsTo(Solicitud::class);
    }
}
