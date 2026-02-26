<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use Illuminate\Support\Facades\Hash;
use App\Http\Resources\UserResource;

class UserController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(User::class, 'user');
    }

    /**
     * Listar todos los usuarios
     */
    public function index()
{
    $query = User::with('rol');

    // ⚡ Ordenación
    $sort = request()->query('sort');       // campo a ordenar
    $order = request()->query('order', 'asc'); // asc o desc

    // Solo permitir columnas válidas para seguridad
    $allowedSorts = ['id','email','nombre','apellidos','telefono','activo','rol_id'];
    if ($sort && in_array($sort, $allowedSorts)) {
        // Si se ordena por rol, hacemos join
        if ($sort === 'rol_id') {
            $query = $query->join('roles', 'users.rol_id', '=', 'roles.id')
                           ->orderBy('roles.nombre', $order)
                           ->select('users.*');
        } else {
            $query = $query->orderBy($sort, $order);
        }
    }

    $users = $query->paginate(5);

    return response()->json([
        'data' => UserResource::collection($users)->resolve(),
        'current_page' => $users->currentPage(),
        'last_page' => $users->lastPage(),
        'per_page' => $users->perPage(),
        'total' => $users->total(),
    ], 200);
}

    /**
     * Crear un nuevo usuario
     */
    public function store(StoreUserRequest $request)
    {
        $data = $request->validated();
        $data['password'] = Hash::make($data['password']);
        $data['activo'] = $request->boolean('activo');

        $user = User::create($data);

        return response()->json([
            'message' => 'Usuario creado.',
            'user' => $user
        ], 201);
    }

    /**
     * Mostrar un usuario específico
     */
    public function show(User $user)
    {
        return response()->json($user->load('rol'));
    }

    /**
     * Actualizar un usuario
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        $data = $request->validated();
        $data['activo'] = $request->boolean('activo');

        if ($request->filled('password')) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        return response()->json([
            'message' => 'Usuario actualizado.',
            'user' => $user
        ]);
    }
}
