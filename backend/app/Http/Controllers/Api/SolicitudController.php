<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Solicitud;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\StoreSolicitudRequest;
use App\Http\Requests\UpdateSolicitudRequest;
use App\Services\EstadoService;
use App\Services\SolicitudService;
use Illuminate\Validation\ValidationException;
use App\Http\Resources\SolicitudResource;

class SolicitudController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Solicitud::class, 'solicitud');
    }


    public function index()
    {
        $user = Auth::user();

        $solicitudes = Solicitud::noFinalizadas()
            ->visibleFor($user)
            ->withBaseRelations()
            ->paginate(5);

        $solicitudesFinalizadas = Solicitud::finalizadas()
            ->visibleFor($user)
            ->withBaseRelations()
            ->paginate(5);

        return response()->json([
            'solicitudes' => SolicitudResource::collection($solicitudes),
            'solicitudesFinalizadas' => SolicitudResource::collection($solicitudesFinalizadas),
        ], 200);
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


    public function show(Solicitud $solicitud)
    {
        $solicitud->loadFull();

        return response()->json($solicitud);
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
