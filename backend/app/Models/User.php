<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Models\Vehiculo;
use App\Models\Solicitud;
use App\Enums\RolSlug;


class User extends Authenticatable
{
    use HasFactory, HasApiTokens, Notifiable;

    protected $table = 'users';
    protected $with = ['rol'];


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

    public function getImagenAttribute($value)
    {
    if (!$value) {
        return 'avatars/default_user.png';
    }

    if (filter_var($value, FILTER_VALIDATE_URL)) {
        return $value;
    }

    return '/storage/avatars/' . $value;
    }

    public function isAdmin(): bool
    {
        return $this->rol?->slug === RolSlug::ADMINISTRADOR->value;
    }

    public function isEmployee(): bool
    {
        return $this->rol?->slug === RolSlug::EMPLEADO->value;
    }

    public function isCustomer(): bool
    {
        return $this->rol?->slug === RolSlug::CLIENTE->value;
    }
    public function scopeClientes($q)
    {
        return $q->whereHas(
            'rol',
            fn($r) =>
            $r->where('slug', RolSlug::CLIENTE)
        );
    }

    public function scopeEmpleados($q)
    {
        return $q->whereHas(
            'rol',
            fn($r) =>
            $r->where('slug', RolSlug::EMPLEADO)
        );
    }
}
