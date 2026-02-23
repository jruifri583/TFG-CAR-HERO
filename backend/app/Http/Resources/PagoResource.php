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
            'solicitud' => [
                'id' => $this->solicitud?->id,
                'user_cliente_id' => $this->solicitud?->cliente?->nombre ?? null,
                'fecha_programada' => $this->fecha_programada?->format('d/m/Y H:i'),
            ],

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
        ];
    }
}
