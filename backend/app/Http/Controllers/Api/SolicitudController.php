<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Solicitud;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Http\Requests\StoreSolicitudRequest;
use App\Http\Requests\UpdateSolicitudRequest;
use App\Services\EstadoService;
use App\Services\SolicitudService;
use Illuminate\Validation\ValidationException;
use App\Http\Resources\SolicitudResource;

class SolicitudController extends Controller
{
    /* public function __construct()
    {
        $this->authorizeResource(Solicitud::class, 'solicitud');
    } */


    public function index(Request $request)
{
    $user = $request->user();
    $allowed = ['fecha_programada', 'estado_id', 'created_at'];
    $sort = in_array($request->get('sort'), $allowed) ? $request->get('sort') : 'created_at';
    $order = $request->get('order', 'desc') === 'asc' ? 'asc' : 'desc';

    $solicitudes = Solicitud::visibleFor($user)
        ->withBaseRelations()
        ->with(['empleado'])
        ->orderBy($sort, $order)
        ->paginate(5);

    return SolicitudResource::collection($solicitudes)->response();
}


    public function meta()
    {
        /** @var User $user */
        $user = Auth::user();

        $empleados = $user->isAdmin() ? User::empleados()->get() : collect();

        return response()->json([
            'user' => $user,
            'empleados' => $empleados,
            'baseData' => Solicitud::formDataFor($user),
        ]);
    }


    public function store(StoreSolicitudRequest $request)
    {
        $solicitud = Solicitud::create($request->validated());

        return response()->json([
            'message' => 'Solicitud creada con éxito.',
            'solicitud' => $solicitud,
        ], 201);
    }


    public function show(Request $request, Solicitud $solicitud)
{
    $this->authorize('view', $solicitud);
    \Log::info('show called', ['id' => $solicitud->id]);
    $solicitud->load([
        'vehiculo',
        'cliente',
        'empleado',
        'estado',
        'resolucion',
        'pago.metodoPago',
        'pago.estadoPago',
    ]);
    return SolicitudResource::make($solicitud)->response();
}

    public function update(
        UpdateSolicitudRequest $request,
        Solicitud $solicitud,
        SolicitudService $service
    ) {
        try {
            $service->update($solicitud, $request->validated());
        } catch (\DomainException $e) {
            throw ValidationException::withMessages([
                'estado_id' => $e->getMessage(),
            ]);
        }

        return response()->json([
            'message' => 'Solicitud actualizada correctamente.',
            'solicitud' => $solicitud,
        ]);
    }
}
