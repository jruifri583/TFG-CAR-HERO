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
    $vistos = $request->get('vistos', []);

    $getDesde = function($category) use ($vistos) {
        return $vistos[$category] ?? null;
    };

    return response()->json([
        'solicitudes' => \App\Models\Solicitud::visibleFor($user)
            ->whereHas('estado', fn($q) => $q->whereNotIn('slug', ['finalizado', 'cancelado']))
            ->when($getDesde('solicitudes'), fn($q, $d) => $q->where('created_at', '>', $d))
            ->count(),
        'usuarios' => \App\Models\User::when($getDesde('usuarios'), fn($q, $d) => $q->where('created_at', '>', $d))
            ->count(),
        'vehiculos' => \App\Models\Vehiculo::visibleFor($user)
            ->when($getDesde('vehiculos'), fn($q, $d) => $q->where('created_at', '>', $d))
            ->count(),
        'pagos' => \App\Models\Pago::visibleFor($user)
            ->when($getDesde('pagos'), fn($q, $d) => $q->where('created_at', '>', $d))
            ->count(),
        'historial' => \App\Models\Historial::visibleFor($user)->when($getDesde('historial'), fn($q, $d) => $q->where('created_at', '>', $d))->count(),
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
        'has_active_request' => $user->rol->slug === \App\Enums\RolSlug::EMPLEADO->value 
            ? \App\Models\Solicitud::where('user_empleado_id', $user->id)
                ->whereHas('estado', function($q) {
                    $q->whereIn('slug', [
                        \App\Enums\EstadoSlug::EN_RECOGIDA->value,
                        \App\Enums\EstadoSlug::EN_ITV->value,
                        \App\Enums\EstadoSlug::RETORNANDO->value,
                    ]);
                })
                ->whereNull('hora_entrega')
                ->exists()
            : false,
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
    $estadoPendienteId = Estado::where('slug', EstadoSlug::PENDIENTE->value)->value('id');

    $solicitudes = \App\Models\Solicitud::visibleFor($user)
        ->withBaseRelations()
        // Excluir solicitudes que están en 'Nuevas' (pendiente + sin empleado) SOLO para Admin/Empleado
        // para evitar duplicidad, ya que el Cliente no tiene sección de 'Nuevas'.
        ->when($user->rol->slug !== \App\Enums\RolSlug::CLIENTE->value, function($q) use ($estadoPendienteId) {
            $q->where(function($q2) use ($estadoPendienteId) {
                $q2->where('estado_id', '!=', $estadoPendienteId)
                  ->orWhereNotNull('user_empleado_id');
            });
        })
        ->latest('updated_at')
        ->limit(3)
        ->get();
    return SolicitudResource::collection($solicitudes);
}
    
}
