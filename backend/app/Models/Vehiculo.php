<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vehiculo extends Model
{
    use HasFactory;

    protected $table = 'vehiculos';

    protected $fillable = ['user_id', 'matricula', 'vin', 'marca', 'modelo', 'año', 'kilometros', 'fecha_ultima_itv'];

    // Relación: Un vehículo pertenece a un usuario (cliente)
    public function cliente()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Relación: Un vehículo puede tener muchas solicitudes de ITV
    public function solicitudes()
    {
        return $this->hasMany(Solicitud::class);
    }


    public function scopeVisibleFor($query, ?User $user)
    {
        if (!$user) {
            return $query->whereRaw('0 = 1');
        }

        if ($user->isAdmin()) {
            return $query;
        }

        return $query->where('user_id', $user->id);
    }
}
