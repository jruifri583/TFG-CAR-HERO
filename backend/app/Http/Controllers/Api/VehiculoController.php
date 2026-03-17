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
use Illuminate\Support\Facades\Storage;

class VehiculoController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Vehiculo::class, 'vehiculo');
    }


    public function index(Request $request)
{
    try {
        $query = Vehiculo::visibleFor($request->user());

        // Filtro por user_id
        if ($request->has('user_id')) {
            $query->where('user_id', $request->query('user_id'));
        }

        $sort = $request->query('sort');
        $order = $request->query('order', 'asc');
        $allowedSorts = ['id', 'matricula', 'marca', 'modelo', 'año'];
        if ($sort && in_array($sort, $allowedSorts)) {
            $query->orderBy($sort, $order);
        }

        $vehiculos = $query->paginate(5);
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

    public function updateImagen(Request $request, Vehiculo $vehiculo)
{
    $request->validate(['imagen' => 'required|image|max:2048']);

    $oldImagen = $vehiculo->getRawOriginal('imagen');
    if ($oldImagen && !str_contains($oldImagen, 'default')) {
        Storage::disk('public')->delete('avatars/' . $oldImagen);
    }

    $filename = $request->file('imagen')->store('avatars', 'public');
    $vehiculo->imagen = basename($filename);
    $vehiculo->save();

    return response()->json(['imagen' => $vehiculo->fresh()->imagen]);
}
}
