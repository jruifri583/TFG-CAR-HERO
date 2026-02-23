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

        $historiales = Historial::all()->filter(function ($historial) use ($user) {
            return Gate::allows('view', $historial);
        })->values(); 

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
