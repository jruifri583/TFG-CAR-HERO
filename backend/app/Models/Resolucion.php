<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Enums\ResolucionSlug;

class Resolucion extends Model
{
    protected $table = 'resoluciones';

    public $timestamps = false;
    //protected $fillable = ['nombre'];

   
    public function solicitudes(): HasMany
    {
        return $this->hasMany(Solicitud::class, 'resolucion_id');
    }

    
    public function registrosItv(): HasMany
    {
        return $this->hasMany(Historial::class, 'resolucion_id');
    }

    public function isPendiente(): bool
    {
        return $this->estado?->slug === ResolucionSlug::PENDIENTE->value;
    }
}