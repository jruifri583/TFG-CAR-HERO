<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PagoResource extends JsonResource
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
            'importe' => $this->importe,

            // Relación: Solicitud resumida
            'solicitud' => $this->solicitud?->id,

            // Relación: Método de pago
            'metodo_pago' => [
                'id' => $this->metodoPago?->id,
                'nombre' => $this->metodoPago?->nombre ?? null,
            ],

            // Relación: Estado de pago
            'estado_pago' => [
                'id' => $this->estadoPago?->id,
                'nombre' => $this->estadoPago?->nombre ?? null,
            ],
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
