<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\DashboardController;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function contadores(Request $request)
{
    /** @var \App\Models\User $user */
    $user = $request->user();
    $desde = $request->get('desde');

    return response()->json([
        'solicitudes' => \App\Models\Solicitud::visibleFor($user)
            ->when($desde, fn($q) => $q->where('created_at', '>', $desde))
            ->count(),
        'usuarios' => \App\Models\User::when($desde, fn($q) => $q->where('created_at', '>', $desde))
            ->count(),
        'vehiculos' => \App\Models\Vehiculo::visibleFor($user)
            ->when($desde, fn($q) => $q->where('created_at', '>', $desde))
            ->count(),
        'pagos' => \App\Models\Pago::visibleFor($user)
            ->when($desde, fn($q) => $q->where('created_at', '>', $desde))
            ->count(),
        'historial' => \App\Models\Historial::visibleFor($user)
            ->count(), 
    ]);
}

    public function solicitudesPorEstado()
{
    $data = \App\Models\Solicitud::join('estados', 'solicitudes.estado_id', '=', 'estados.id')
        ->selectRaw('estados.nombre as estado, COUNT(*) as total')
        ->groupBy('estados.nombre')
        ->get();

    return response()->json($data);
}

public function solicitudesPorMes()
{
    $data = \App\Models\Solicitud::selectRaw('MONTH(created_at) as mes, COUNT(*) as total')
        ->whereYear('created_at', now()->year)
        ->groupBy('mes')
        ->orderBy('mes')
        ->get();

    return response()->json($data);
}

public function pagosRecientes()
{
    $pagos = \App\Models\Pago::with(['metodoPago'])
        ->latest()
        ->limit(5)
        ->get()
        ->map(fn($pago) => [
            'id'          => $pago->id,
            'importe'     => $pago->importe,
            'solicitud_id' => $pago->solicitud_id,
            'metodo_pago' => $pago->metodoPago?->nombre,
            'created_at'  => $pago->created_at,
        ]);

    return response()->json($pagos);
}

    
}
