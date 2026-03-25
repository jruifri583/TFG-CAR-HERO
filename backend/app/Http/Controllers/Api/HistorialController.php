<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\StoreHistorialRequest;
use App\Models\Historial;
use App\Models\Solicitud;
use App\Services\HistorialService;
use Illuminate\Support\Facades\Gate;

class HistorialController extends Controller
{
    protected $historialService;

    public function __construct(HistorialService $historialService)
    {
        $this->historialService = $historialService;
        $this->authorizeResource(Historial::class, 'historial');
    }

    /**
     * Listar historiales accesibles para el usuario
     */
    public function index()
{
    $user = Auth::user();

    $query = Historial::visibleFor($user)
        ->with('resolucion:id,nombre')
        ->select('id','solicitud_id','fecha_itv','resolucion_id');

    // ⚡ Ordenación
    $sort = request()->query('sort');
    $order = request()->query('order', 'asc');
    $allowedSorts = ['solicitud_id','fecha_itv','resolucion_id'];

    if ($sort && in_array($sort, $allowedSorts)) {
        if ($sort === 'resolucion_id') {
            // Join para ordenar por el nombre de resolución
            $query->join('resoluciones', 'historiales.resolucion_id', '=', 'resoluciones.id')
                  ->orderBy('resoluciones.nombre', $order)
                  ->select('historiales.*'); // evitar conflicto de columnas
        } else {
            $query->orderBy($sort, $order);
        }
    }

    $historiales = $query->paginate(6);

    return response()->json($historiales);
}

    /**
     * Mostrar un historial específico
     */
    public function show(Historial $historial)
    {
        $this->authorize('view', $historial);

        return response()->json($historial);
    }

    /**
     * Crear un historial desde una solicitud
     */
    public function store(StoreHistorialRequest $request)
    {
        $solicitud = Solicitud::findOrFail($request->solicitud_id);

        $historial = $this->historialService->crearDesdeSolicitud($solicitud);

        return response()->json([
            'message' => 'Historial generado correctamente.',
            'historial' => $historial,
        ], 201);
    }
}
