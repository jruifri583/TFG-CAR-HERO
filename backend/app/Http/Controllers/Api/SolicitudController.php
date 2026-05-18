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
    // Muestra todas las solicitudes
    public function index(Request $request)
{
    $user = $request->user();
    $allowed = ['id', 'fecha_programada', 'estado_id', 'created_at', 'empleado'];
    $sort = in_array($request->get('sort'), $allowed) ? $request->get('sort') : 'created_at';
    $order = $request->get('order', 'desc') === 'asc' ? 'asc' : 'desc';

    $solicitudes = Solicitud::visibleFor($user)
        ->withBaseRelations()
        ->with(['empleado'])
        ->when($request->get('sin_pago'), function ($q) {
            // Si buscamos por sin_pago, permitimos ver las finalizadas
            $q->whereHas('estado', fn($q2) => $q2->where('slug', '!=', 'cancelado'));
        }, function ($q) {
            // Comportamiento por defecto: solo estados activos
            $q->whereHas('estado', fn($q2) => $q2->whereNotIn('slug', ['finalizado', 'cancelado']));
        })
        ->when($request->get('sin_pago'), fn($q) => $q->whereNull('pago_id'))
        ->when($request->get('search'), function ($q, $v) {
            $q->where(function ($q2) use ($v) {
                $q2->where('solicitudes.id', 'like', "%$v%")
                   ->orWhere('fecha_programada', 'like', "%$v%")
                   ->orWhereHas('cliente', fn($q3) => $q3->where('nombre', 'like', "%$v%")
                       ->orWhere('apellidos', 'like', "%$v%"))
                   ->orWhereHas('vehiculo', fn($q3) => $q3->where('matricula', 'like', "%$v%")
                       ->orWhere('marca', 'like', "%$v%"));
            });
        })
        ->when($sort === 'empleado', function ($q) use ($order) {
            $q->leftJoin('users as e_join', 'solicitudes.user_empleado_id', '=', 'e_join.id')
              ->select('solicitudes.*')
              ->orderBy('e_join.nombre', $order);
        }, function ($q) use ($sort, $order) {
            $q->select('solicitudes.*')->orderBy("solicitudes.$sort", $order);
        })
        ->paginate(6);

    return SolicitudResource::collection($solicitudes)->response();
}


    // Obtiene los datos necesarios para la solicitud
    public function meta()
    {
        /** @var User $user */
        $user = Auth::user();

        $empleados = ($user->isAdmin() || $user->isEmployee())
            ? User::empleados()->get(['id', 'nombre', 'apellidos', 'email'])
            : collect();

        return response()->json([
            'user'      => $user,
            'empleados' => $empleados,
            'baseData'  => Solicitud::formDataFor($user),
        ]);
    }


    // Crea una nueva solicitud
    public function store(StoreSolicitudRequest $request)
    {
        $solicitud = Solicitud::create($request->validated());

        return response()->json([
            'message' => 'Solicitud creada con éxito.',
            'solicitud' => $solicitud,
        ], 201);
    }


    // Muestra una solicitud específica
    public function show(Request $request, Solicitud $solicitud)
    {
        $this->authorize('view', $solicitud);
        
        $solicitud->load([
            'vehiculo',
            'cliente',
            'empleado',
            'estado',
            'resolucion',
            'pago.metodoPago',
            'pago.estadoPago',
        ]);

        return new SolicitudResource($solicitud);
    }

    // Actualiza una solicitud
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

    // Cancela una solicitud
    public function cancelar(Solicitud $solicitud)
    {
        $solicitud->load('estado');

        $this->authorize('cancel', $solicitud);

        $estadoCancelado = \App\Models\Estado::where('slug', \App\Enums\EstadoSlug::CANCELADO->value)->firstOrFail();

        $solicitud->estado_id = $estadoCancelado->id;
        $solicitud->save();

        return response()->json([
            'message' => 'Solicitud cancelada correctamente.',
        ]);
    }
}
