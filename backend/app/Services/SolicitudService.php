<?php

namespace App\Services;

use App\Models\Solicitud;
use App\Models\Estado;
use App\Models\User;
use App\Models\Resolucion;
use App\Models\Vehiculo;
use App\Enums\EstadoSlug;
use DomainException;
use Illuminate\Http\Request;

class SolicitudService
{
    protected $historialService;

    public function __construct(HistorialService $historialService)
    {
        $this->historialService = $historialService;
    }

    // FORM DATA 

    protected function baseFormData(): array
    {
        return [
            'estados' => Estado::all(),
            'resoluciones' => Resolucion::all(),
        ];
    }

    public function getCreateFormData(User $user, Request $request): array
    {
        $data = $this->baseFormData();

        $data['empleados'] = $user->isAdmin()
            ? User::empleados()->get()
            : collect();

        $clienteSeleccionadoId =
            $user->isAdmin()
                ? ($request->get('user_cliente_id') ?: old('user_cliente_id'))
                : $user->id;

        $data['vehiculos'] = $clienteSeleccionadoId
            ? Vehiculo::where('user_id', $clienteSeleccionadoId)->get()
            : collect();

        $data['clienteSeleccionadoId'] = $clienteSeleccionadoId;

        return $data;
    }

    // UPDATE 

    public function update(Solicitud $solicitud, array $data): void
    {
        $dataFiltered = collect($data)
            ->except(['user_cliente_id', 'vehiculo_id'])
            ->toArray();

        // Asignación automática
        if (!empty($dataFiltered['user_empleado_id']) && !$solicitud->user_empleado_id) {

            $solicitud->user_empleado_id = $dataFiltered['user_empleado_id'];

            // Una sola query para obtener ambos IDs de estado
            $estados = Estado::whereIn('slug', [
                EstadoSlug::PENDIENTE->value,
                EstadoSlug::ASIGNADO->value,
            ])->pluck('id', 'slug');

            if ($solicitud->estado_id == $estados[EstadoSlug::PENDIENTE->value]) {
                $dataFiltered['estado_id'] = $estados[EstadoSlug::ASIGNADO->value];
            }
        }

        // Cambio manual de estado
        if (isset($dataFiltered['estado_id'])
            && $dataFiltered['estado_id'] != $solicitud->getOriginal('estado_id')) {

            $this->cambiarEstado($solicitud, (int) $dataFiltered['estado_id']);
        }

        $solicitud->fill($dataFiltered);
        $solicitud->save();
        $solicitud->refresh();

        // Actualizar ITV del vehículo
        if ($solicitud->isFinalizado() && $solicitud->vehiculo) {
            $solicitud->vehiculo->update([
                'fecha_ultima_itv' => $solicitud->fecha_programada ?? now(),
            ]);

            $this->historialService->crearDesdeSolicitud($solicitud);
        }
    }

    // CAMBIO DE ESTADO 

    public function cambiarEstado(Solicitud $solicitud, int $nuevoEstadoId): void
    {
        $nuevoEstado = Estado::findOrFail($nuevoEstadoId);

        if ($solicitud->estado_id == $nuevoEstadoId) {
            return;
        }

        $orden = EstadoSlug::orden();

        $posActual = array_search($solicitud->estado?->slug, $orden);
        $posNueva  = array_search($nuevoEstado->slug, $orden);

        if ($posActual === false || $posNueva === false) {
            $solicitud->estado_id = $nuevoEstadoId;
            return;
        }

        if ($nuevoEstado->isAsignado() && !$solicitud->user_empleado_id) {
            throw new DomainException(
                'No se puede cambiar a ASIGNADO sin un empleado asociado.'
            );
        }

        if ($posNueva !== $posActual + 1) {
            $estadoSiguiente = $orden[$posActual + 1] ?? null;

            throw new DomainException(
                "Solo puedes avanzar al siguiente estado '{$estadoSiguiente}'."
            );
        }

        if ($nuevoEstado->isFinalizado() && ! $solicitud->puedeFinalizar()) {
            throw new DomainException(
                'No se puede finalizar la solicitud: requiere resolución válida y pago.'
            );
        }

        $solicitud->estado_id = $nuevoEstadoId;
    }
}
