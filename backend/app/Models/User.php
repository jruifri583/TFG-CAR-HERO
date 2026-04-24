<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Models\Vehiculo;
use App\Models\Solicitud;
use App\Models\Rol;
use App\Models\Direccion;
use App\Enums\RolSlug;


class User extends Authenticatable
{
    use HasFactory, HasApiTokens, Notifiable;

    protected $table = 'users';

    protected $fillable = [
        'email',
        'password',
        'nombre',
        'apellidos',
        'nif',
        'telefono',
        'direccion',
        'ciudad',
        'codigo_postal',
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
        return $this->hasMany(Solicitud::class, 'user_cliente_id');
    }

    // Solicitudes donde es empleado
    public function solicitudesComoEmpleado()
    {
        return $this->hasMany(Solicitud::class, 'user_empleado_id');
    }

    // Direcciones adicionales
    public function direcciones()
    {
        return $this->hasMany(Direccion::class, 'user_id');
    }

    // Rol del usuario
    public function rol()
    {
        return $this->belongsTo(Rol::class, 'rol_id');
    }

    public function getImagenAttribute($value)
    {
        $appUrl = rtrim(config('app.url'), '/');
        
        if (!$value) {
            return $appUrl . '/avatars/default_user.png';
        }

        if (filter_var($value, FILTER_VALIDATE_URL)) {
            return $value;
        }

        return $appUrl . '/storage/avatars/' . $value;
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

    // Usa subquery en lugar de whereHas para mayor eficiencia
    public function scopeClientes($q)
    {
        return $q->whereIn('rol_id', Rol::where('slug', RolSlug::CLIENTE)->select('id'));
    }

    public function scopeEmpleados($q)
    {
        return $q->whereIn('rol_id', Rol::where('slug', RolSlug::EMPLEADO)->select('id'));
    }

    public function scopeFilter($query, $filters)
{
    return $query
        ->when($filters['email'] ?? null, fn($q, $v) =>
            $q->where('email', 'like', "%$v%")
        )
        ->when($filters['nombre'] ?? null, fn($q, $v) =>
            $q->where('nombre', 'like', "%$v%")
        )
        ->when($filters['apellidos'] ?? null, fn($q, $v) =>
            $q->where('apellidos', 'like', "%$v%")
        )
        ->when($filters['telefono'] ?? null, fn($q, $v) =>
            $q->where('telefono', 'like', "%$v%")
        )
        ->when(isset($filters['activo']) && $filters['activo'] !== '', fn($q) =>
            $q->where('activo', $filters['activo'])
        );
}
}
