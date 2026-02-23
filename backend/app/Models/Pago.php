<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Pago extends Model
{
    use HasFactory;
    protected $table = 'pagos';

    protected $fillable = ['solicitud_id', 'importe', 'metodo_pago_id', 'estado_pago_id'];

    // Relación con Solicitud
    public function solicitud()
    {
        return $this->belongsTo(Solicitud::class);
    }

    // Relación con MetodoPago (La que te está fallando)
    public function metodoPago()
    {
        return $this->belongsTo(MetodoPago::class, 'metodo_pago_id');
    }

    // Relación con EstadoPago (También la necesitas para tu controlador)
    public function estadoPago()
    {
        return $this->belongsTo(EstadoPago::class, 'estado_pago_id');
    }

    // Scope para filtrar la visibilización de los pagos
    public function scopeVisibleFor(Builder $query, User $user): Builder
    {
        // Admin ve todo
        if ($user->isAdmin()) {
            return $query;
        }

        // Empleado solo pagos de sus solicitudes
        if ($user->isEmployee()) {
            return $query->whereHas('solicitud', function ($q) use ($user) {
                $q->where('user_empleado_id', $user->id);
            });
        }

        // Cliente solo sus solicitudes
        if ($user->isCustomer()) {
            return $query->whereHas('solicitud', function ($q) use ($user) {
                $q->where('user_cliente_id', $user->id);
            });
        }

        return $query;
    }
}
