<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MensajeContacto extends Model
{
    use HasFactory;

    protected $table = 'mensajes_contacto';

    protected $fillable = [
        'nombre',
        'email',
        'mensaje',
        'respuesta',
        'leido_at',
        'respondido_at',
    ];

    protected $casts = [
        'leido_at' => 'datetime',
        'respondido_at' => 'datetime',
    ];
}
