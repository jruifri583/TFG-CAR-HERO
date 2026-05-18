<?php

namespace App\Http\Controllers\Api; 

use App\Http\Controllers\Controller;
use App\Models\Pago;
use Illuminate\Http\Request;
use App\Http\Requests\StorePagoRequest;
use Illuminate\Http\JsonResponse;
use App\Http\Resources\PagoResource;
use Illuminate\Support\Facades\Auth;

class PagoController extends Controller
{
    // Lista los pagos con relaciones.
    public function index(Request $request): JsonResponse
{
    $user = Auth::user();

    $allowedSorts = ['created_at', 'importe', 'solicitud_id', 'metodo_pago_id', 'estado_pago_id'];
    $sortField = in_array($request->get('sort'), $allowedSorts) ? $request->get('sort') : 'created_at';
    $sortOrder = $request->get('order', 'desc') === 'asc' ? 'asc' : 'desc';

    $pagos = Pago::with(['solicitud.cliente', 'metodoPago', 'estadoPago'])
                 ->visibleFor($user)
                 ->when($request->get('search'), function ($q, $v) {
    $q->where(function ($q2) use ($v) {
        $q2->where('solicitud_id', 'like', "%$v%")
           ->orWhere('created_at', 'like', "%$v%");
    });
})
                 ->orderBy($sortField, $sortOrder)
                 ->paginate(6);

    return PagoResource::collection($pagos)->response();
}
    // Crea un nuevo pago.
    public function store(StorePagoRequest $request): JsonResponse
    {
        $pago = Pago::create($request->validated());
        
        // Vincular el pago a la solicitud
        $solicitud = \App\Models\Solicitud::find($pago->solicitud_id);
        if ($solicitud) {
            $solicitud->pago_id = $pago->id;
            $solicitud->save();
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Pago registrado correctamente',
            'data'    => $pago->load(['solicitud', 'metodoPago', 'estadoPago'])
        ], 201);
    }

    // Muestra un pago específico.
    public function show(Pago $pago): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $pago->load(['solicitud.cliente', 'metodoPago', 'estadoPago'])
        ], 200);
    }

    // Actualiza un pago.
    public function update(StorePagoRequest $request, Pago $pago): JsonResponse
    {
        $pago->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Pago actualizado correctamente',
            'data'    => $pago
        ], 200);
    }

    // Elimina un pago.
    public function destroy(Pago $pago): JsonResponse
    {
        $pago->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pago eliminado correctamente'
        ], 200);
    }
}