<?php

namespace App\Http\Controllers\Api; 

use App\Http\Controllers\Controller;
use App\Models\Pago;
use App\Http\Requests\StorePagoRequest;
use Illuminate\Http\JsonResponse;
use App\Http\Resources\PagoResource;
use Illuminate\Support\Facades\Auth;

class PagoController extends Controller
{
    /**
     * Listar pagos con relaciones.
     */
    public function index(): JsonResponse
    {
     /** @var User $user */
        $user = Auth::user();
    
    $pagos = Pago::with(['solicitud.cliente', 'metodoPago', 'estadoPago'])
                 ->visibleFor($user)
                 ->paginate(10);

    return response()->json(PagoResource::collection($pagos), 200);
    }

    /**
     * Crear un nuevo pago.
     */
    public function store(StorePagoRequest $request): JsonResponse
    {
        $pago = Pago::create($request->validated());
        
        return response()->json([
            'success' => true,
            'message' => 'Pago registrado correctamente',
            'data'    => $pago->load(['solicitud', 'metodoPago', 'estadoPago'])
        ], 201);
    }

    /**
     * Mostrar un pago específico.
     */
    public function show(Pago $pago): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $pago->load(['solicitud.cliente', 'metodoPago', 'estadoPago'])
        ], 200);
    }

    /**
     * Actualizar un pago.
     */
    public function update(StorePagoRequest $request, Pago $pago): JsonResponse
    {
        $pago->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Pago actualizado correctamente',
            'data'    => $pago
        ], 200);
    }

    /**
     * Eliminar un pago.
     */
    public function destroy(Pago $pago): JsonResponse
    {
        $pago->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pago eliminado correctamente'
        ], 200);
    }
}