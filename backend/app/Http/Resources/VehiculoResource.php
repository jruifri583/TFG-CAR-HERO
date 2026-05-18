<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VehiculoResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'imagen' => $this->imagen,
            'matricula' => $this->matricula,
            'vin' => $this->vin,
            'marca' => $this->marca,
            'modelo' => $this->modelo,
            'año' => $this->año,
            'kilometros' => $this->kilometros,
            'fecha_ultima_itv' => $this->fecha_ultima_itv?->format('Y-m-d'),
            
            'cliente' => [
                'id' => $this->cliente?->id,
                'nombre' => $this->cliente?->nombre,
                'apellidos' => $this->cliente?->apellidos,
                'email' => $this->cliente?->email,
                'imagen' => $this->cliente?->imagen,
            ],
        ];
    }
}
