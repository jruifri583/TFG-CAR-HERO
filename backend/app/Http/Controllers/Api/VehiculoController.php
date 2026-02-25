<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vehiculo;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\StoreVehiculoRequest;
use App\Http\Requests\UpdateVehiculoRequest;
use App\Http\Resources\VehiculoResource;
use Illuminate\Http\Request;

class VehiculoController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Vehiculo::class, 'vehiculo');
    }


    public function index(Request $request)
    {
    try {
        // Usamos el Scope que ya tienes en el modelo para filtrar por seguridad
        // y paginamos los resultados.
        $vehiculos = Vehiculo::visibleFor($request->user())->paginate(5);

        return VehiculoResource::collection($vehiculos);
        
    } catch (\Exception $e) {
        \Log::error("Error en Vehiculos: " . $e->getMessage());
        return response()->json(['error' => $e->getMessage()], 500);
    }
    }

    
    public function store(StoreVehiculoRequest $request)
    {
        $vehiculo = Vehiculo::create($request->validated());
        return response()->json([
            'message' => 'Vehículo registrado correctamente.',
            'vehiculo' => $vehiculo
        ], 201);
    }

   
    public function meta()
    {
        /** @var User $user */
        $user = Auth::user();
        $usuarios = $user->isAdmin() ? User::all() : collect();

        return response()->json([
            'user' => $user,
            'usuarios' => $usuarios,
        ]);
    }

    
    public function show(Vehiculo $vehiculo)
    {
        return response()->json($vehiculo->load('cliente'));
    }

    
    public function update(UpdateVehiculoRequest $request, Vehiculo $vehiculo)
    {
        $vehiculo->update($request->validated());
        return response()->json([
            'message' => 'Vehículo actualizado.',
            'vehiculo' => $vehiculo
        ]);
    }

    
    public function destroy(Vehiculo $vehiculo)
    {
        $vehiculo->delete();
        return response()->json([
            'message' => 'Vehículo eliminado.'
        ]);
    }
}
