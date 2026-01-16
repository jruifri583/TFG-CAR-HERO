<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Models\Vehiculo;
use App\Models\Solicitud;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'users';

    // Los campos que se pueden asignar en masa
    protected $fillable = [
        'email',
        'password',
        'nombre',
        'apellidos',
        'nif',
        'telefono',
        'direccion',
        'imagen',
        'rol_id',
        'activo',
    ];

    // Ocultamos datos sensibles al serializar
    protected $hidden = [
        'password',
    ];

    // Tipos de dato (opcional, pero útil)
    protected $casts = [
        'activo' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relaciones

    // Vehículos de este usuario
    public function vehiculos()
    {
        return $this->hasMany(Vehiculo::class, 'usuario_id');
    }

    // Solicitudes donde es cliente
    public function solicitudesComoCliente()
    {
        return $this->hasMany(Solicitud::class, 'cliente_id');
    }

    // Solicitudes donde es empleado
    public function solicitudesComoEmpleado()
    {
        return $this->hasMany(Solicitud::class, 'empleado_id');
    }

    // Rol del usuario
    public function rol()
    {
        return $this->belongsTo(Rol::class, 'rol_id');
    }
}
