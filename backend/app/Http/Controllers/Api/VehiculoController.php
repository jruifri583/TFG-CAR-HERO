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


    // Muestra todos los vehículos
    public function index(Request $request)
{
    try {
        $query = Vehiculo::visibleFor($request->user());

        // Búsqueda
    $search = request()->query('search');
    $query->when($search, function ($q, $v) {
        $q->where(function ($q2) use ($v) {
            $q2->where('marca', 'like', "%$v%")
               ->orWhere('modelo', 'like', "%$v%")
               ->orWhere('matricula', 'like', "%$v%");
        });
    });

        // Filtro por user_id
        if ($request->has('user_id')) {
            $query->where('user_id', $request->query('user_id'));
        }

        // Si es cliente → NO paginar
        if ($request->user()->isCustomer()) {
            return VehiculoResource::collection($query->get());
        }

        $sort = $request->query('sort');
        $order = $request->query('order', 'asc');
        $allowedSorts = ['id', 'matricula', 'marca', 'año', 'kilometros'];
        if ($sort && in_array($sort, $allowedSorts)) {
            $query->orderBy($sort, $order);
        }

        $vehiculos = $query->paginate(6);
        return VehiculoResource::collection($vehiculos);
    } catch (\Exception $e) {
        \Log::error("Error en Vehiculos: " . $e->getMessage());
        return response()->json(['error' => $e->getMessage()], 500);
    }
}

    // Crea un nuevo vehículo
    public function store(StoreVehiculoRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('imagen')) {
            $filename = $request->file('imagen')->store('avatars', 'public');
            $data['imagen'] = basename($filename);
        }

        $vehiculo = Vehiculo::create($data);

        return response()->json([
            'message' => 'Vehículo registrado correctamente.',
            'vehiculo' => $vehiculo
        ], 201);
    }

    // Obtiene los datos necesarios para el vehículo
    public function meta()
    {
        /** @var User $user */
        $user = Auth::user();
        $usuarios = $user->isAdmin()
            ? User::clientes()->select('id', 'nombre', 'apellidos', 'email')->get()
            : collect();

        return response()->json([
            'user' => $user,
            'usuarios' => $usuarios,
        ]);
    }

    // Muestra un vehículo específico
    public function show(Vehiculo $vehiculo)
    {
        return response()->json($vehiculo->load('cliente'));
    }

    // Actualiza un vehículo
    public function update(UpdateVehiculoRequest $request, Vehiculo $vehiculo)
    {
        $vehiculo->update($request->validated());
        return response()->json([
            'message' => 'Vehículo actualizado.',
            'vehiculo' => $vehiculo
        ]);
    }

    // Elimina un vehículo
    public function destroy(Vehiculo $vehiculo)
    {
        $vehiculo->delete();
        return response()->json([
            'message' => 'Vehículo eliminado.'
        ]);
    }

    // Actualiza la imagen de un vehículo
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
