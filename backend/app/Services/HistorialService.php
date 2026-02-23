<?php

namespace App\Services;

use App\Models\Solicitud;
use App\Models\Historial;
use Carbon\Carbon;

class HistorialService
{
    public function crearDesdeSolicitud(Solicitud $solicitud): void
    {
        Historial::updateOrCreate(
            ['solicitud_id' => $solicitud->id],
            [
                'fecha_itv' => $solicitud->hora_itv ? Carbon::parse($solicitud->hora_itv)->toDateString() : now()->toDateString(),
                'resolucion_id' => $solicitud->resolucion_id,
                'notas'         => $solicitud->notas,
            ]
        );
    }
}