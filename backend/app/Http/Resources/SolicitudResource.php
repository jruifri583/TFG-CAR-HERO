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
            'fecha_programada' => $this->fecha_programada?->toISOString(),
            'hora_recogida'    => $this->hora_recogida?->toISOString(),
            'hora_itv'         => $this->hora_itv?->toISOString(),
            'hora_entrega'     => $this->hora_entrega?->toISOString(),
            'notas' => $this->notas,
            'importe_cobro' => $this->importe_cobro,

            'cliente' => [
                'id' => $this->cliente?->id,
                'nombre' => $this->cliente?->nombre,
                'apellidos' => $this->cliente?->apellidos,
                'email' => $this->cliente?->email,
                'ciudad' => $this->cliente?->ciudad,
                'codigo_postal' => $this->cliente?->codigo_postal,
                'imagen'   => $this->cliente?->imagen,
            ],

            'empleado' => $this->empleado ? [
                'id' => $this->empleado->id,
                'nombre' => $this->empleado->nombre,
                'apellidos' => $this->empleado->apellidos,
                'email' => $this->empleado->email,
                'imagen'   => $this->empleado->imagen,
            ] : null,

            'vehiculo' => $this->vehiculo ? [
                'id' => $this->vehiculo->id,
                'matricula' => $this->vehiculo->matricula,
                'marca' => $this->vehiculo->marca,
                'modelo' => $this->vehiculo->modelo,
                'imagen'   => $this->vehiculo->imagen,
            ] : null,

            'estado' => $this->estado ? [
                'id' => $this->estado->id,
                'nombre' => $this->estado->nombre,
                'slug'   => $this->estado->slug,
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
                    'slug' => $this->pago->metodoPago->slug,
                ] : null,
                'estado_pago' => $this->pago->estadoPago ? [
                    'id' => $this->pago->estadoPago->id,
                    'nombre' => $this->pago->estadoPago->nombre,
                    'slug' => $this->pago->estadoPago->slug,
                ] : null,
            ] : null,
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
