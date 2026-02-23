<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SolicitudResource extends JsonResource
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
            'direccion' => $this->direccion,
            'fecha_programada' => $this->fecha_programada?->format('d/m/Y H:i'),
            'hora_recogida' => $this->hora_recogida?->format('H:i:s'),
            'hora_itv' => $this->hora_itv?->format('H:i:s'),
            'hora_entrega' => $this->hora_entrega?->format('H:i:s'),
            'notas' => $this->notas,

            'cliente' => [
                'id' => $this->cliente?->id,
                'nombre' => $this->cliente?->nombre,
                'apellidos' => $this->cliente?->apellidos,
                'email' => $this->cliente?->email,
            ],

            'empleado' => $this->empleado ? [
                'id' => $this->empleado->id,
                'nombre' => $this->empleado->nombre,
                'apellidos' => $this->empleado->apellidos,
                'email' => $this->empleado->email,
            ] : null,

            'vehiculo' => $this->vehiculo ? [
                'id' => $this->vehiculo->id,
                'matricula' => $this->vehiculo->matricula,
                'marca' => $this->vehiculo->marca,
                'modelo' => $this->vehiculo->modelo,
            ] : null,

            'estado' => $this->estado ? [
                'id' => $this->estado->id,
                'nombre' => $this->estado->nombre,
            ] : null,

            'resolucion' => $this->resolucion ? [
                'id' => $this->resolucion->id,
                'nombre' => $this->resolucion->nombre,
            ] : null,

            'pago' => $this->pago ? [
                'id' => $this->pago->id,
                'importe' => $this->pago->importe,
                'metodo_pago' => $this->pago->metodoPago ? [
                    'id' => $this->pago->metodoPago->id,
                    'nombre' => $this->pago->metodoPago->nombre,
                ] : null,
                'estado_pago' => $this->pago->estadoPago ? [
                    'id' => $this->pago->estadoPago->id,
                    'nombre' => $this->pago->estadoPago->nombre,
                ] : null,
            ] : null,
        ];
    }
}
