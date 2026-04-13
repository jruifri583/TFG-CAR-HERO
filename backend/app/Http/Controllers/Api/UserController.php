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

    // Búsqueda
    $search = request()->query('search');
    $query->when($search, function ($q, $v) {
        $q->where(function ($q2) use ($v) {
            $q2->where('email', 'like', "%$v%")
               ->orWhere('nombre', 'like', "%$v%")
               ->orWhere('telefono', 'like', "%$v%");
        });
    });

    // Ordenación
    $sort = request()->query('sort');
    $order = request()->query('order', 'asc');
    $allowedSorts = ['id','email','nombre','apellidos','telefono','activo','rol_id','created_at'];
    if ($sort && in_array($sort, $allowedSorts)) {
        if ($sort === 'rol_id') {
            $query->join('roles', 'users.rol_id', '=', 'roles.id')
                  ->orderBy('roles.nombre', $order)
                  ->select('users.*');
        } else {
            $query->orderBy($sort, $order);
        }
    }

    $users = $query->paginate(6);

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

    public function updateImagen(\Illuminate\Http\Request $request, User $user)
    {
        $request->validate([
            'imagen' => 'required|image|max:2048',
        ]);

        if ($user->getRawOriginal('imagen') && !filter_var($user->getRawOriginal('imagen'), FILTER_VALIDATE_URL)) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete('avatars/' . $user->getRawOriginal('imagen'));
        }

        $filename = $request->file('imagen')->store('avatars', 'public');
        $user->imagen = basename($filename);
        $user->save();

        return response()->json(['user' => $user->fresh()->load('rol')]);
    }
}
