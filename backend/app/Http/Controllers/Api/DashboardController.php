<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Resources\SolicitudResource;
use App\Models\Estado;
use App\Enums\EstadoSlug;

class DashboardController extends Controller
{
    public function contadores(Request $request)
{
    /** @var \App\Models\User $user */
    $user = $request->user();
    $desde = $request->get('desde');

    return response()->json([
        'solicitudes' => \App\Models\Solicitud::visibleFor($user)
            ->whereHas('estado', fn($q) => $q->whereNotIn('slug', ['finalizado', 'cancelado']))
            ->count(),
        'usuarios' => \App\Models\User::when($desde, fn($q) => $q->where('created_at', '>', $desde))
            ->count(),
        'vehiculos' => \App\Models\Vehiculo::visibleFor($user)
            ->when($desde, fn($q) => $q->where('created_at', '>', $desde))
            ->count(),
        'pagos' => \App\Models\Pago::visibleFor($user)
            ->when($desde, fn($q) => $q->where('created_at', '>', $desde))
            ->count(),
        'historial' => \App\Models\Historial::visibleFor($user)->when($desde, fn($q) => $q->where('created_at', '>', $desde))->count(),
        'mensajes' => $user->rol->slug === \App\Enums\RolSlug::ADMINISTRADOR->value 
            ? \App\Models\MensajeContacto::whereNull('leido_at')->count()
            : 0,
        'itv_alertas' => $user->rol->slug === \App\Enums\RolSlug::CLIENTE->value 
            ? \App\Models\Vehiculo::where('user_id', $user->id)
                ->whereNotNull('fecha_ultima_itv')
                ->where('fecha_ultima_itv', '>', '1990-01-01')
                ->where('fecha_ultima_itv', '<=', now()->subMonths(11))
                // Solo mostrar si NO tienen una solicitud activa
                ->whereDoesntHave('solicitudes', function($q) {
                    $q->whereHas('estado', function($q2) {
                        $q2->whereNotIn('slug', ['finalizado', 'cancelado']);
                    });
                })
                ->get(['id', 'marca', 'modelo', 'matricula', 'fecha_ultima_itv'])
            : [],
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

public function solicitudesRecientes()
{
    $user = request()->user();
    $estadoPendienteId = Estado::where('slug', EstadoSlug::PENDIENTE->value)->value('id');
    $solicitudes = \App\Models\Solicitud::visibleFor($user)
        ->withBaseRelations()
        ->where('estado_id', $estadoPendienteId)
        ->whereNull('user_empleado_id')
        ->latest()
        ->limit(3)
        ->get();
    return SolicitudResource::collection($solicitudes);
}

    public function solicitudesActualizadas()
{
    $user = request()->user();
    $solicitudes = \App\Models\Solicitud::visibleFor($user)
        ->withBaseRelations()
        ->latest('updated_at')
        ->limit(3)
        ->get();
    return SolicitudResource::collection($solicitudes);
}
    
}
