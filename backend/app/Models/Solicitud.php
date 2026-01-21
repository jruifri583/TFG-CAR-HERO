<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Solicitud extends Model
{
    use HasFactory;
    
    protected $table = 'solicitudes';

    protected $fillable = [
        'cliente_id',
        'vehiculo_id',
        'empleado_id',
        'direccion_recogida',
        'latitud',
        'longitud',
        'estado_servicio',
        'resolucion_itv',
        'fecha_programada',
        'hora_recogida',
        'hora_itv',
        'hora_entrega',
        'precio',
        'notas',
    ];

    public function cliente()
    {
        return $this->belongsTo(User::class, 'cliente_id');
    }

    public function empleado()
    {
        return $this->belongsTo(User::class, 'empleado_id');
    }

    public function vehiculo()
    {
        return $this->belongsTo(Vehiculo::class);
    }

    public function registroItv()
    {
        return $this->hasOne(Registro::class);
    }

    public function pago()
    {
        return $this->hasOne(Pago::class);
    }
}

