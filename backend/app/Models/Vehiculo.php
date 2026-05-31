<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vehiculo extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'vehiculos';

    protected $fillable = ['user_id', 'matricula', 'imagen', 'vin', 'marca', 'modelo', 'año', 'kilometros', 'fecha_ultima_itv'];

    protected $casts = [
        'fecha_ultima_itv' => 'date',
        'año' => 'integer',
        'kilometros' => 'integer',
    ];

    // Relación: Un vehículo pertenece a un usuario (cliente)
    public function cliente()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function getImagenAttribute($value)
    {
        $appUrl = rtrim(config('app.url'), '/');
        
        if (!$value) {
            return $appUrl . '/avatars/default_car.png';
        }

        if (filter_var($value, FILTER_VALIDATE_URL)) {
            return $value;
        }

        return $appUrl . '/storage/avatars/' . $value;
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
