<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VehiculoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  Request  $request
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'matricula' => $this->matricula,
            'vin' => $this->vin,
            'marca' => $this->marca,
            'modelo' => $this->modelo,
            'año' => $this->año,
            'kilometros' => $this->kilometros,
            'fecha_ultima_itv' => $this->fecha_ultima_itv?->format('Y-m-d'),
            
            // Cliente del vehículo
            'cliente' => [
                'id' => $this->cliente?->id,
                'nombre' => $this->cliente?->nombre,
                'apellidos' => $this->cliente?->apellidos,
                'email' => $this->cliente?->email,
            ],
        ];
    }
}
