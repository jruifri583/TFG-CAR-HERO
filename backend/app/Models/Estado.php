<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Enums\EstadoSlug;

class Estado extends Model
{
    public $timestamps = false;
    //protected $fillable = ['nombre', 'orden'];


    public function isFinalizado(): bool
    {
        return $this->slug === EstadoSlug::FINALIZADO->value;
    }

    public function isAsignado(): bool
    {
        return $this->slug === EstadoSlug::ASIGNADO->value;
    }

    public function isPendiente(): bool
    {
        return $this->slug === EstadoSlug::PENDIENTE->value;
    }

}
