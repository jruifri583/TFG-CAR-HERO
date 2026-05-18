<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PagoResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'importe' => $this->importe,

            'solicitud' => $this->solicitud?->id,

            'metodo_pago' => [
                'id' => $this->metodoPago?->id,
                'nombre' => $this->metodoPago?->nombre ?? null,
                'slug' => $this->metodoPago?->slug ?? null,
            ],

            'estado_pago' => [
                'id' => $this->estadoPago?->id,
                'nombre' => $this->estadoPago?->nombre ?? null,
                'slug' => $this->estadoPago?->slug ?? null,
            ],
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
